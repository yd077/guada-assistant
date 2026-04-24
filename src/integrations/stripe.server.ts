import { supabaseAdmin } from "@/integrations/supabase/client.server";

type StripeKeys = {
  secretKey: string;
  webhookSecret: string | null;
  mode: "test" | "live";
};

/** Récupère les clés Stripe depuis payment_settings (admin). */
export async function getStripeKeys(): Promise<StripeKeys | null> {
  const { data, error } = await supabaseAdmin
    .from("payment_settings")
    .select("*")
    .eq("provider", "stripe")
    .maybeSingle();
  if (error || !data || !data.enabled) return null;
  const mode = (data.mode as "test" | "live") ?? "test";
  const secretKey = mode === "live" ? data.live_secret_key : data.test_secret_key;
  const webhookSecret = mode === "live" ? data.live_webhook_secret : data.test_webhook_secret;
  if (!secretKey) return null;
  return { secretKey, webhookSecret, mode };
}

/** Helper minimaliste pour appeler l'API Stripe (sans la lib lourde). */
async function stripeFetch<T>(
  secretKey: string,
  path: string,
  body?: Record<string, string>,
  method: "GET" | "POST" | "DELETE" = "POST",
): Promise<T> {
  const init: RequestInit = {
    method,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };
  if (body) {
    init.body = new URLSearchParams(body).toString();
  }
  const r = await fetch(`https://api.stripe.com/v1${path}`, init);
  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`Stripe API ${r.status} : ${txt}`);
  }
  return r.json() as Promise<T>;
}

export type StripeSession = {
  id: string;
  url: string;
  payment_status: string;
  customer?: string;
  subscription?: string;
  metadata?: Record<string, string>;
  amount_total?: number;
};

/** Crée une session Checkout pour un pack de crédits (paiement unique). */
export async function createCreditPackCheckout(opts: {
  secretKey: string;
  packId: string;
  packName: string;
  packCredits: number;
  amountEur: number;
  artisanId: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
}): Promise<StripeSession> {
  const body: Record<string, string> = {
    mode: "payment",
    "line_items[0][price_data][currency]": "eur",
    "line_items[0][price_data][product_data][name]": `Pack ${opts.packName} — ${opts.packCredits} crédits`,
    "line_items[0][price_data][unit_amount]": Math.round(opts.amountEur * 100).toString(),
    "line_items[0][quantity]": "1",
    success_url: opts.successUrl,
    cancel_url: opts.cancelUrl,
    "metadata[kind]": "credits",
    "metadata[artisan_id]": opts.artisanId,
    "metadata[pack_id]": opts.packId,
    "metadata[credits]": opts.packCredits.toString(),
  };
  if (opts.customerEmail) body.customer_email = opts.customerEmail;
  return stripeFetch<StripeSession>(opts.secretKey, "/checkout/sessions", body);
}

/** Crée une session Checkout pour un abonnement mensuel (Premium / Élite). */
export async function createSubscriptionCheckout(opts: {
  secretKey: string;
  tier: "premium" | "elite";
  tierName: string;
  monthlyPriceEur: number;
  artisanId: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
}): Promise<StripeSession> {
  const body: Record<string, string> = {
    mode: "subscription",
    "line_items[0][price_data][currency]": "eur",
    "line_items[0][price_data][unit_amount]": Math.round(opts.monthlyPriceEur * 100).toString(),
    "line_items[0][price_data][recurring][interval]": "month",
    "line_items[0][price_data][product_data][name]": `Abonnement ${opts.tierName} — BTP Guada`,
    "line_items[0][quantity]": "1",
    success_url: opts.successUrl,
    cancel_url: opts.cancelUrl,
    "metadata[kind]": "subscription",
    "metadata[artisan_id]": opts.artisanId,
    "metadata[tier]": opts.tier,
    "subscription_data[metadata][artisan_id]": opts.artisanId,
    "subscription_data[metadata][tier]": opts.tier,
  };
  if (opts.customerEmail) body.customer_email = opts.customerEmail;
  return stripeFetch<StripeSession>(opts.secretKey, "/checkout/sessions", body);
}

/** Annule un abonnement à la fin de la période. */
export async function cancelSubscriptionAtPeriodEnd(
  secretKey: string,
  subscriptionId: string,
): Promise<{ id: string; cancel_at_period_end: boolean }> {
  return stripeFetch(secretKey, `/subscriptions/${subscriptionId}`, {
    cancel_at_period_end: "true",
  });
}

/** Vérifie la signature d'un webhook Stripe (HMAC-SHA256). */
export async function verifyStripeSignature(
  payload: string,
  signatureHeader: string | null,
  secret: string,
  toleranceSec = 300,
): Promise<boolean> {
  if (!signatureHeader) return false;
  // Format : t=timestamp,v1=signature[,v1=...]
  const parts = signatureHeader.split(",").reduce<Record<string, string[]>>((acc, p) => {
    const [k, v] = p.split("=");
    if (k && v) {
      acc[k] = acc[k] ?? [];
      acc[k].push(v);
    }
    return acc;
  }, {});
  const timestamp = parts.t?.[0];
  const signatures = parts.v1 ?? [];
  if (!timestamp || signatures.length === 0) return false;

  // Tolérance temporelle anti-replay
  const ts = Number(timestamp);
  if (Number.isNaN(ts) || Math.abs(Date.now() / 1000 - ts) > toleranceSec) return false;

  const signed = `${timestamp}.${payload}`;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sigBytes = await crypto.subtle.sign("HMAC", key, enc.encode(signed));
  const expected = Array.from(new Uint8Array(sigBytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Comparaison constante pour éviter les timing attacks
  return signatures.some((s) => safeEqual(s, expected));
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}
