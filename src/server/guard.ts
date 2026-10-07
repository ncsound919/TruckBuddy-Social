import type { NextFunction, Request, RequestHandler, Response } from 'express';

export interface GuardUser {
  id: string;
  email: string | null;
}

export type TokenVerifier = (token: string) => Promise<GuardUser | null>;

export interface RateLimitOptions {
  windowMs?: number;
  max?: number;
  now?: () => number;
}

export function createSupabaseVerifier(
  cfg: { url: string; anonKey: string },
  fetchImpl: typeof fetch = fetch,
): TokenVerifier {
  const base = cfg.url.replace(/\/+$/, '');
  const cache = new Map<string, { user: GuardUser; expires: number }>();
  return async (token) => {
    const now = Date.now();
    const hit = cache.get(token);
    if (hit && hit.expires > now) return hit.user;
    if (hit) cache.delete(token);

    const res = await fetchImpl(`${base}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: cfg.anonKey },
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { id?: string; email?: string | null };
    if (!body?.id) return null;

    const user = { id: body.id, email: body.email ?? null };
    if (cache.size >= 1000) {
      const oldest = cache.keys().next().value;
      if (oldest !== undefined) cache.delete(oldest);
    }
    cache.set(token, { user, expires: now + 30_000 });
    return user;
  };
}

export function createRateLimiter(opts: RateLimitOptions = {}): RequestHandler {
  const windowMs = opts.windowMs ?? 60_000;
  const max = opts.max ?? 20;
  const now = opts.now ?? Date.now;
  const hits = new Map<string, { count: number; resetAt: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    const user = res.locals.user as GuardUser | undefined;
    const key = user ? `u:${user.id}` : `ip:${req.ip ?? 'unknown'}`;
    const t = now();

    if (hits.size > 5000) {
      for (const [k, v] of hits) if (v.resetAt <= t) hits.delete(k);
    }

    const entry = hits.get(key);
    if (!entry || entry.resetAt <= t) {
      hits.set(key, { count: 1, resetAt: t + windowMs });
      return next();
    }
    entry.count += 1;
    if (entry.count > max) {
      res.setHeader('Retry-After', String(Math.ceil((entry.resetAt - t) / 1000)));
      return res.status(429).json({ error: { message: 'Too many requests', code: 'RATE_LIMITED' } });
    }
    next();
  };
}

export function createAuthGuard(verifier: TokenVerifier | null): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!verifier) {
      return res.status(503).json({
        error: { message: 'Server auth is not configured', code: 'AUTH_NOT_CONFIGURED' },
      });
    }
    const m = /^Bearer\s+(.+)$/i.exec(req.headers.authorization ?? '');
    if (!m) return res.status(401).json({ error: { message: 'Sign in required', code: 'UNAUTHENTICATED' } });

    let user: GuardUser | null;
    try {
      user = await verifier(m[1].trim());
    } catch {
      return res.status(503).json({ error: { message: 'Auth provider unavailable', code: 'AUTH_UNAVAILABLE' } });
    }
    if (!user) return res.status(401).json({ error: { message: 'Invalid or expired session', code: 'INVALID_TOKEN' } });

    res.locals.user = user;
    next();
  };
}

export function verifierFromEnv(env: NodeJS.ProcessEnv = process.env): TokenVerifier | null {
  const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const anonKey = env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;
  return url && anonKey ? createSupabaseVerifier({ url, anonKey }) : null;
}

export function protectedApi(
  opts: { verifier?: TokenVerifier | null; rate?: RateLimitOptions } = {},
): RequestHandler[] {
  const verifier = opts.verifier === undefined ? verifierFromEnv() : opts.verifier;
  return [createAuthGuard(verifier), createRateLimiter(opts.rate)];
}
