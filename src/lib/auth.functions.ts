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
const ADMIN_EMAILS = ["contact@devis-connect.fr"];

export const signUpWithoutEmailConfirmation = createServerFn({ method: "POST" })
  .inputValidator((data) => signUpInput.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
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

    const userId = created?.user?.id;

    // Rôle choisi à l'inscription (le trigger par défaut ne pose que "client")
    if (userId && data.role === "artisan") {
      await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: userId, role: "artisan" }, { onConflict: "user_id,role" });
    }

    // Attribution automatique du rôle admin pour les emails autorisés
    if (userId && ADMIN_EMAILS.includes(data.email.trim().toLowerCase())) {
      await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });
    }

    return { ok: true as const, role: data.role };
  });


