import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getStripeKeys, verifyStripeSignature } from "@/integrations/stripe.server";

/**
 * Webhook public Stripe : crédite le wallet et met à jour les abonnements.
 * URL à configurer dans Stripe : {origin}/api/public/stripe-webhook
 */
export const Route = createFileRoute("/api/public/stripe-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const payload = await request.text();
        const signature = request.headers.get("stripe-signature");

        const keys = await getStripeKeys();
        if (!keys) {
          return new Response("Stripe disabled", { status: 503 });
        }
        if (!keys.webhookSecret) {
          console.error("[stripe-webhook] webhook secret missing");
          return new Response("Webhook secret missing", { status: 503 });
        }

        const valid = await verifyStripeSignature(payload, signature, keys.webhookSecret);
        if (!valid) {
          console.warn("[stripe-webhook] invalid signature");
          return new Response("Invalid signature", { status: 401 });
        }

        let event: { type: string; data: { object: Record<string, unknown> } };
        try {
          event = JSON.parse(payload);
        } catch {
          return new Response("Bad JSON", { status: 400 });
        }

        try {
          await handleEvent(event);
        } catch (e) {
          console.error("[stripe-webhook] handler error", e);
          return new Response("Handler error", { status: 500 });
        }

        return new Response("ok", { status: 200 });
      },
    },
  },
});

async function handleEvent(event: { type: string; data: { object: Record<string, unknown> } }) {
  const obj = event.data.object;

  switch (event.type) {
    case "checkout.session.completed": {
      const sessionId = obj.id as string;
      const metadata = (obj.metadata ?? {}) as Record<string, string>;
      const artisanId = metadata.artisan_id;
      if (!artisanId) {
        console.warn("[stripe-webhook] no artisan_id in metadata", sessionId);
        return;
      }

      // Idempotence : ne re-traite pas une session complétée
      const { data: existing } = await supabaseAdmin
        .from("stripe_checkout_sessions")
        .select("status")
        .eq("id", sessionId)
        .maybeSingle();
      if (existing?.status === "completed") return;

      if (metadata.kind === "credits") {
        const credits = Number(metadata.credits ?? 0);
        if (credits > 0) {
          await supabaseAdmin.rpc("admin_adjust_wallet", {
            p_artisan_id: artisanId,
            p_amount: credits,
            p_type: "purchase",
            p_note: `Pack ${metadata.pack_id} — Stripe ${sessionId}`,
          });
        }
      } else if (metadata.kind === "subscription") {
        const tier = metadata.tier as "premium" | "elite";
        const subscriptionId = obj.subscription as string | undefined;
        const customerId = obj.customer as string | undefined;
        await supabaseAdmin.from("artisan_subscriptions").upsert({
          artisan_id: artisanId,
          tier,
          starts_at: new Date().toISOString(),
          ends_at: null,
          stripe_subscription_id: subscriptionId ?? null,
          stripe_customer_id: customerId ?? null,
          cancel_at_period_end: false,
        });
      }

      await supabaseAdmin
        .from("stripe_checkout_sessions")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("id", sessionId);
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subId = obj.id as string;
      const status = obj.status as string;
      const cancelAtEnd = Boolean(obj.cancel_at_period_end);
      const periodEnd = obj.current_period_end as number | undefined;
      const metadata = (obj.metadata ?? {}) as Record<string, string>;
      const artisanId = metadata.artisan_id;

      const updates: Record<string, unknown> = {
        cancel_at_period_end: cancelAtEnd,
        current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      };

      // Si annulé, on rétrograde au tier free à la fin de période
      if (status === "canceled" || event.type === "customer.subscription.deleted") {
        updates.tier = "free";
        updates.stripe_subscription_id = null;
      }

      if (artisanId) {
        await supabaseAdmin
          .from("artisan_subscriptions")
          .update(updates)
          .eq("artisan_id", artisanId);
      } else {
        await supabaseAdmin
          .from("artisan_subscriptions")
          .update(updates)
          .eq("stripe_subscription_id", subId);
      }
      break;
    }

    default:
      // Ignoré silencieusement
      break;
  }
}
