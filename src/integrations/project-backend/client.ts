import { createClient } from '@supabase/supabase-js';
import type { Database } from '../supabase/types';
import { backendFetch } from './fetch';
import { projectBackendPublicConfig } from './public-config';

function createProjectClient() {
  const url = import.meta.env.VITE_PROJECT_BACKEND_URL || projectBackendPublicConfig.url;
  const key = import.meta.env.VITE_PROJECT_BACKEND_PUBLIC_KEY || projectBackendPublicConfig.publishableKey;
  if (!url || !key) throw new Error('Configuration du projet indisponible.');
  return createClient<Database>(url, key, {
    global: { fetch: backendFetch(key) },
    auth: { persistSession: true, autoRefreshToken: true },
  });
}

let client: ReturnType<typeof createProjectClient> | undefined;
export const supabase = new Proxy({} as ReturnType<typeof createProjectClient>, {
  get(_, prop) {
    client ??= createProjectClient();
    return Reflect.get(client, prop);
  },
});