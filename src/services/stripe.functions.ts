import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getRequest } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  getStripeKeys,
  createCreditPackCheckout,
  createSubscriptionCheckout,
  cancelSubscriptionAtPeriodEnd,
} from "@/integrations/stripe.server";

function originFromRequest(): string {
  try {
    const r = getRequest();
    const url = new URL(r.url);
    return `${url.protocol}//${url.host}`;
  } catch {
    return "https://btp-guada.lovable.app";
  }
}

/** Crée une session Checkout Stripe pour un pack de crédits. */
export const createPackCheckoutSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      packId: z.string().min(1),
    }),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;

    // 1. L'artisan correspondant à l'utilisateur
    const { data: artisan } = await supabaseAdmin
      .from("artisans")
      .select("id, email, first_name, last_name")
      .eq("user_id", userId)
      .maybeSingle();
    if (!artisan) throw new Error("Aucune fiche artisan associée à ce compte.");

    // 2. Le pack
    const { data: pack } = await supabaseAdmin
      .from("credit_packs")
      .select("*")
      .eq("id", data.packId)
      .eq("active", true)
      .maybeSingle();
    if (!pack) throw new Error("Pack introuvable.");

    // 3. Stripe configuré ?
    const keys = await getStripeKeys();
    if (!keys) {
      throw new Error(
        "Le paiement en ligne n'est pas encore activé. Contactez l'administrateur.",
      );
    }

    const origin = originFromRequest();
    const session = await createCreditPackCheckout({
      secretKey: keys.secretKey,
      packId: pack.id,
      packName: pack.name,
      packCredits: pack.credits,
      amountEur: Number(pack.price_eur),
      artisanId: artisan.id,
      successUrl: `${origin}/succes-paiement?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/dashboard?payment=cancelled`,
      customerEmail: artisan.email ?? undefined,
    });

    // 4. Trace pour idempotence
    await supabaseAdmin.from("stripe_checkout_sessions").insert({
      id: session.id,
      artisan_id: artisan.id,
      kind: "credits",
      pack_id: pack.id,
      credits_to_grant: pack.credits,
      amount_eur: pack.price_eur,
      status: "pending",
      mode: keys.mode,
    });

    return { url: session.url, sessionId: session.id };
  });

/** Crée une session Checkout Stripe pour un abonnement mensuel. */
export const createSubscriptionCheckoutSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      tier: z.enum(["premium", "elite"]),
    }),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;

    const { data: artisan } = await supabaseAdmin
      .from("artisans")
      .select("id, email")
      .eq("user_id", userId)
      .maybeSingle();
    if (!artisan) throw new Error("Aucune fiche artisan associée à ce compte.");

    const { data: plan } = await supabaseAdmin
      .from("subscription_plans")
      .select("*")
      .eq("tier", data.tier)
      .maybeSingle();
    if (!plan) throw new Error("Plan introuvable.");

    const keys = await getStripeKeys();
    if (!keys) {
      throw new Error(
        "Le paiement en ligne n'est pas encore activé. Contactez l'administrateur.",
      );
    }

    const origin = originFromRequest();
    const session = await createSubscriptionCheckout({
      secretKey: keys.secretKey,
      tier: data.tier,
      tierName: plan.name,
      monthlyPriceEur: Number(plan.price_eur),
      artisanId: artisan.id,
      successUrl: `${origin}/succes-paiement?session_id={CHECKOUT_SESSION_ID}&kind=subscription`,
      cancelUrl: `${origin}/abonnements?cancelled=1`,
      customerEmail: artisan.email ?? undefined,
    });

    await supabaseAdmin.from("stripe_checkout_sessions").insert({
      id: session.id,
      artisan_id: artisan.id,
      kind: "subscription",
      tier: data.tier,
      amount_eur: plan.price_eur,
      status: "pending",
      mode: keys.mode,
    });

    return { url: session.url, sessionId: session.id };
  });

/** Annule l'abonnement Stripe à la fin de la période courante. */
export const cancelMySubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;

    const { data: artisan } = await supabaseAdmin
      .from("artisans")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    if (!artisan) throw new Error("Aucune fiche artisan.");

    const { data: sub } = await supabaseAdmin
      .from("artisan_subscriptions")
      .select("stripe_subscription_id")
      .eq("artisan_id", artisan.id)
      .maybeSingle();
    if (!sub?.stripe_subscription_id) {
      throw new Error("Aucun abonnement Stripe actif à annuler.");
    }

    const keys = await getStripeKeys();
    if (!keys) throw new Error("Stripe non configuré.");

    await cancelSubscriptionAtPeriodEnd(keys.secretKey, sub.stripe_subscription_id);
    await supabaseAdmin
      .from("artisan_subscriptions")
      .update({ cancel_at_period_end: true })
      .eq("artisan_id", artisan.id);

    return { ok: true };
  });
