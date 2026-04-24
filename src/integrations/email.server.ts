/**
 * Helpers email serveur (Resend).
 * Si RESEND_API_KEY n'est pas configuré, les envois sont loggés mais ne bloquent pas.
 */

const FROM_EMAIL = process.env.NOTIFICATIONS_FROM_EMAIL ?? "BTP Guada <onboarding@resend.dev>";

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY absent — email non envoyé :", opts.subject, "→", opts.to);
    return { ok: false, error: "missing_resend_key" };
  }

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [opts.to],
        subject: opts.subject,
        html: opts.html,
        text: opts.text,
      }),
    });
    if (!r.ok) {
      const body = await r.text();
      console.error("[email] Resend error", r.status, body);
      return { ok: false, error: `resend_${r.status}` };
    }
    return { ok: true };
  } catch (e) {
    console.error("[email] fetch error", e);
    return { ok: false, error: (e as Error).message };
  }
}

/** Template OTP projet. */
export function renderOtpEmail(code: string, projectLocation: string) {
  return {
    subject: `BTP Guada — Code de vérification : ${code}`,
    html: `
      <div style="font-family:system-ui,-apple-system,sans-serif;max-width:520px;margin:0 auto;padding:24px">
        <h1 style="font-family:Georgia,serif;color:#0f172a;font-size:22px;margin:0 0 16px">
          Confirmez votre demande
        </h1>
        <p style="color:#475569;font-size:14px;line-height:1.6">
          Pour valider votre projet à <strong>${projectLocation}</strong>, saisissez ce code dans BTP Guada :
        </p>
        <div style="margin:24px 0;padding:20px;background:#ecfdf5;border:1px solid #10b981;border-radius:12px;text-align:center">
          <span style="font-size:36px;font-weight:700;letter-spacing:8px;color:#047857;font-family:monospace">${code}</span>
        </div>
        <p style="color:#94a3b8;font-size:12px">Code valable 15 minutes. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
      </div>
    `,
    text: `Code de vérification BTP Guada : ${code} (valable 15 min).`,
  };
}

/** Template notification artisan : nouveau lead matchant. */
export function renderNewLeadEmail(opts: {
  artisanName: string;
  specialty: string;
  location: string;
  budget: string | null;
  urgency: string;
  creditsCost: number;
  dashboardUrl: string;
}) {
  const urgencyBadge =
    opts.urgency === "sos"
      ? "🚨 SOS"
      : opts.urgency === "urgent"
        ? "⚡ Urgent"
        : "Standard";
  return {
    subject: `⚡ Nouveau lead ${opts.specialty} à ${opts.location}`,
    html: `
      <div style="font-family:system-ui,-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:24px">
        <h1 style="font-family:Georgia,serif;color:#0f172a;font-size:22px;margin:0 0 8px">
          Nouveau lead disponible
        </h1>
        <p style="color:#475569;font-size:14px;margin:0 0 20px">Bonjour ${opts.artisanName},</p>
        <div style="padding:18px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px">
          <p style="margin:0 0 8px;font-size:13px;color:#10b981;text-transform:uppercase;letter-spacing:1px;font-weight:600">${opts.specialty}</p>
          <p style="margin:0;font-family:Georgia,serif;font-size:18px">${opts.location}</p>
          <p style="margin:8px 0 0;font-size:12px;color:#64748b">
            ${urgencyBadge}${opts.budget ? ` · Budget ${opts.budget}` : ""} · ${opts.creditsCost} crédits pour débloquer
          </p>
        </div>
        <p style="color:#475569;font-size:14px;line-height:1.6;margin:20px 0">
          Soyez le premier à contacter ce client : la place est limitée à 3 artisans.
        </p>
        <a href="${opts.dashboardUrl}" style="display:inline-block;padding:12px 24px;background:#10b981;color:#fff;border-radius:999px;text-decoration:none;font-weight:600;font-size:14px">
          Voir le lead →
        </a>
        <p style="color:#94a3b8;font-size:11px;margin-top:24px">
          Vous recevez cet email car vous êtes inscrit·e sur BTP Guada. <a href="${opts.dashboardUrl}" style="color:#94a3b8">Préférences</a>.
        </p>
      </div>
    `,
    text: `Nouveau lead ${opts.specialty} à ${opts.location} (${opts.creditsCost} crédits). ${opts.dashboardUrl}`,
  };
}
