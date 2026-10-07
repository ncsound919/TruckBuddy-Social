import express from 'express';
import chatRouter from './routes/chat';
import advisorRouter from './routes/advisor';
import auditRouter from './routes/audit';
import dispatcherRouter from './routes/dispatcher';
import { protectedApi, type RateLimitOptions, type TokenVerifier } from './guard';

export interface ApiAppOptions {
  verifier?: TokenVerifier | null;
  rate?: RateLimitOptions;
}

export function createApiApp(options: ApiAppOptions = {}): express.Express {
  const app = express();

  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  app.use('/api/gemini', ...protectedApi(options));
  app.use('/api/gemini', chatRouter);
  app.use('/api/gemini', advisorRouter);
  app.use('/api/gemini', auditRouter);
  app.use('/api/gemini', dispatcherRouter);

  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (err?.type === 'entity.too.large') {
      return res.status(413).json({ error: { message: 'Request body too large', code: 'PAYLOAD_TOO_LARGE' } });
    }
    console.error('Server Error:', err);
    res.status(err.status || 500).json({
      error: {
        message: err.message || 'Internal Server Error',
        code: err.code || 'INTERNAL_ERROR',
      },
    });
  });

  return app;
}
