import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const signUpInput = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(6).max(72),
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(6).max(30),
  role: z.enum(["client", "artisan"]),
});

/**
 * Confirmation email désactivée : le compte est créé côté serveur avec
 * l'email déjà confirmé, afin que l'utilisateur soit connecté immédiatement
 * et redirigé vers l'étape suivante (dashboard).
 */
export const signUpWithoutEmailConfirmation = createServerFn({ method: "POST" })
  .inputValidator((data) => signUpInput.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        full_name: data.fullName,
        phone: data.phone,
        role: data.role,
      },
    });

    if (error) {
      const already =
        error.status === 422 ||
        /already|exist|registered/i.test(error.message ?? "");
      return {
        ok: false as const,
        code: already ? ("already_registered" as const) : ("error" as const),
        message: error.message,
      };
    }

    return { ok: true as const };
  });
