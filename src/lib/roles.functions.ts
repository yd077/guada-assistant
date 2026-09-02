import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type AppRoleName = "client" | "artisan" | "admin";

const PRIORITY: Record<AppRoleName, number> = {
  client: 1,
  artisan: 2,
  admin: 3,
};

/**
 * Retourne le rôle le plus élevé de l'utilisateur connecté.
 * Lecture côté serveur (service role) pour ne pas dépendre des policies RLS
 * de lecture sur user_roles.
 */
export const getMyRole = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data, error } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);

    if (error || !data || data.length === 0) return { role: null as AppRoleName | null };

    const roles = data
      .map((r) => r.role as AppRoleName)
      .filter((r): r is AppRoleName => !!r && r in PRIORITY);

    if (roles.length === 0) return { role: null as AppRoleName | null };

    roles.sort((a, b) => PRIORITY[b] - PRIORITY[a]);
    return { role: roles[0] as AppRoleName | null };
  });
