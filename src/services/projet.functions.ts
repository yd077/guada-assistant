import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { sendEmail, renderOtpEmail, renderNewLeadEmail } from "@/integrations/email.server";

/** Génère un code 6 chiffres et l'envoie par email au client. */
export const sendProjectOtp = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      token: z.string().min(8),
    }),
  )
  .handler(async ({ data }) => {
    const { data: project } = await supabaseAdmin
      .from("projects")
      .select("id, contact_email, location, email_verified")
      .eq("email_verification_token", data.token)
      .maybeSingle();
    if (!project) return { ok: false, reason: "invalid_token" };
    if (project.email_verified) return { ok: true, alreadyVerified: true };

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    await supabaseAdmin
      .from("projects")
      .update({
        email_otp_code: code,
        email_otp_expires_at: expiresAt,
        email_otp_attempts: 0,
      })
      .eq("id", project.id);

    const tpl = renderOtpEmail(code, project.location ?? "votre projet");
    const r = await sendEmail({ to: project.contact_email, ...tpl });

    await supabaseAdmin.from("notification_log").insert({
      project_id: project.id,
      kind: "otp",
      status: r.ok ? "sent" : "failed",
      error: r.error ?? null,
    });

    return { ok: true, sent: r.ok };
  });

/** Vérifie un code OTP. */
export const verifyProjectOtp = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      token: z.string().min(8),
      code: z.string().regex(/^\d{6}$/, "Code à 6 chiffres"),
    }),
  )
  .handler(async ({ data }) => {
    const { data: result, error } = await supabaseAdmin.rpc("verify_project_otp", {
      _token: data.token,
      _code: data.code,
    });
    if (error) return { ok: false, reason: "rpc_error" as const };
    const row = Array.isArray(result) ? result[0] : result;
    return {
      ok: Boolean(row?.ok),
      reason: (row?.reason ?? "unknown") as string,
    };
  });

/**
 * Notifie par email les artisans dont la spécialité + zone matchent un nouveau projet.
 * Appelé après création d'un projet vérifié.
 */
export const notifyArtisansOfNewLead = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      projectId: z.string().uuid(),
    }),
  )
  .handler(async ({ data }) => {
    const { data: project } = await supabaseAdmin
      .from("projects")
      .select(
        "id, specialty, location, budget, urgency_level, lead_price_credits, project_lat, project_lng",
      )
      .eq("id", data.projectId)
      .maybeSingle();
    if (!project) return { ok: false, reason: "project_not_found" };

    // Artisans actifs, mêmes spé, qui ont opt-in
    const { data: artisans } = await supabaseAdmin
      .from("artisans")
      .select(
        "id, email, first_name, last_name, base_lat, base_lng, radius_km, specialties, notify_new_leads",
      )
      .contains("specialties", [project.specialty])
      .eq("notify_new_leads", true)
      .limit(50);

    if (!artisans || artisans.length === 0) {
      return { ok: true, sent: 0 };
    }

    let sent = 0;
    for (const a of artisans) {
      // Filtrage géo si on a les coords
      if (
        a.base_lat != null &&
        a.base_lng != null &&
        a.radius_km != null &&
        project.project_lat != null &&
        project.project_lng != null
      ) {
        const d = haversineKm(a.base_lat, a.base_lng, project.project_lat, project.project_lng);
        if (d > a.radius_km) continue;
      }
      if (!a.email) continue;

      const tpl = renderNewLeadEmail({
        artisanName: a.first_name ?? "",
        specialty: project.specialty,
        location: project.location,
        budget: project.budget ?? null,
        urgency: project.urgency_level ?? "normal",
        creditsCost: project.lead_price_credits ?? 8,
        dashboardUrl: "https://btp-guada.lovable.app/dashboard",
      });
      const r = await sendEmail({ to: a.email, ...tpl });

      await supabaseAdmin.from("notification_log").insert({
        artisan_id: a.id,
        project_id: project.id,
        kind: "new_lead",
        status: r.ok ? "sent" : "failed",
        error: r.error ?? null,
      });
      if (r.ok) sent++;
    }

    return { ok: true, sent };
  });

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
