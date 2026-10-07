import { supabase } from './supabase';

/**
 * fetch() for this app's own /api routes. Adds the signed-in user's Supabase
 * access token; the server rejects unauthenticated AI calls.
 */
export async function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const headers = new Headers(init.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(input, { ...init, headers });
}
