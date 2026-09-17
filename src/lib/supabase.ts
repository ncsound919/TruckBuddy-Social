import { createClient } from '@supabase/supabase-js';

/**
 * Truck Buddy social backend client.
 *
 * All three Truck Buddy surfaces (cab app, web portal, this social app) share
 * one Supabase project and one `auth.users.id` identity. Config is injected at
 * build time by Vite from `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`
 * (the anon/publishable key is public by design — RLS is the security boundary).
 */
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(url && anonKey);

if (!isSupabaseConfigured) {
  console.warn(
    '[truck-buddy] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set. ' +
      'Live social features are disabled and the app falls back to seed data.',
  );
}

export const supabase = createClient(url ?? 'http://localhost:54321', anonKey ?? 'public-anon-key', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export async function currentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
}
