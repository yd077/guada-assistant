import { createClient } from "@supabase/supabase-js";

const url = process.env.PROJECT_SUPABASE_URL;
const serviceRoleKey = process.env.PROJECT_SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  throw new Error(
    "Variables serveur Supabase manquantes : PROJECT_SUPABASE_URL et PROJECT_SUPABASE_SERVICE_ROLE_KEY",
  );
}

/**
 * Client Supabase ADMIN — bypasse la RLS.
 * À utiliser UNIQUEMENT côté serveur (server functions, server routes).
 * NE JAMAIS importer dans du code client.
 */
export const supabaseAdmin = createClient(url, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
