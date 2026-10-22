import { createClient } from '@supabase/supabase-js';
import type { Database } from '../supabase/types';
import { backendFetch } from './fetch';

function createProjectAdmin() {
  const url = process.env['PROJECT_SUPABASE_URL'];
  const key = process.env['PROJECT_SUPABASE_SERVICE_ROLE_KEY'];
  if (!url || !key) throw new Error('Configuration serveur du projet indisponible.');
  return createClient<Database>(url, key, {
    global: { fetch: backendFetch(key) },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const supabaseAdmin = new Proxy({} as ReturnType<typeof createProjectAdmin>, {
  get(_, prop) {
    return Reflect.get(createProjectAdmin(), prop);
  },
});