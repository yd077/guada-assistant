import { createMiddleware } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Middleware exigeant un utilisateur authentifié.
 * Fournit dans context : `supabase` (client RLS scopé à l'utilisateur), `userId`, `claims`.
 */
export const requireSupabaseAuth = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const authHeader = getRequestHeader("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Error("Non authentifié : token manquant");
    }
    const token = authHeader.slice("Bearer ".length);

    const url = process.env.PROJECT_SUPABASE_URL;
    const anonKey = process.env.PROJECT_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !anonKey) {
      throw new Error("Configuration Supabase serveur manquante");
    }

    const supabase = createClient(url, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      throw new Error("Non authentifié : session invalide");
    }

    return next({
      context: {
        supabase,
        userId: data.user.id,
        claims: data.user,
      },
    });
  },
);
