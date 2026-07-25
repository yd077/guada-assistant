import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Confirmation email désactivée : après une inscription, on marque l'email
 * comme confirmé afin que l'utilisateur accède directement à son dashboard.
 * Sécurité : ne confirme qu'un compte non confirmé créé il y a moins de 5 min.
 */
export const autoConfirmNewSignup = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ email: z.string().email() }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: list, error } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    if (error) return { confirmed: false };

    const target = list.users.find(
      (u) => u.email?.toLowerCase() === data.email.toLowerCase(),
    );
    if (!target) return { confirmed: false };
    if (target.email_confirmed_at) return { confirmed: true };

    const createdAt = new Date(target.created_at).getTime();
    if (Date.now() - createdAt > 5 * 60 * 1000) return { confirmed: false };

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      target.id,
      { email_confirm: true },
    );
    return { confirmed: !updateError };
  });
