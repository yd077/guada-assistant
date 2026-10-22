import { createMiddleware } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../supabase/types';
import { backendFetch } from './fetch';

export const requireSupabaseAuth = createMiddleware({ type: 'function' }).server(async ({ next }) => {
  const url = process.env['PROJECT_SUPABASE_URL'];
  const key = process.env['PROJECT_SUPABASE_PUBLISHABLE_KEY'];
  if (!url || !key) throw new Error('Configuration du projet indisponible.');
  const header = getRequest().headers.get('authorization');
  if (!header?.startsWith('Bearer ')) throw new Error('Veuillez vous reconnecter.');
  const token = header.slice(7);
  if (token.split('.').length !== 3) throw new Error('Session invalide.');
  const supabase = createClient<Database>(url, key, {
    global: { fetch: backendFetch(key), headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.auth.getClaims(token);
  if (error || !data?.claims?.sub) throw new Error('Session expirée. Veuillez vous reconnecter.');
  return next({ context: { supabase, userId: data.claims.sub, claims: data.claims } });
});