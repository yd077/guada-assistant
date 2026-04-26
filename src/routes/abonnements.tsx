import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import {
  fetchSubscription,
  TIER_LABEL,
  type SubscriptionTier,
  type ArtisanSubscription,
} from "@/services/subscriptions";
import {
  fetchSubscriptionPlans,
  type SubscriptionPlanRow,
} from "@/services/credits";
import {
  createSubscriptionCheckoutSession,
  cancelMySubscription,
} from "@/services/stripe.functions";
import { Crown, Star, Check, Loader2, ArrowRight, X } from "lucide-react";

export const Route = createFileRoute("/abonnements")({
  validateSearch: (s: Record<string, unknown>): { cancelled?: boolean } => ({
    cancelled: s.cancelled === "1" ? true : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Abonnements artisan — BTP Guada" },
      {
        name: "description",
        content:
          "Standard 0€ (5 km) · Premium 29€/mois (25 km) · Élite 49€/mois (toute la Guadeloupe). Sans engagement.",
      },
      { property: "og:title", content: "Abonnements artisan — BTP Guada" },
    ],
  }),
  component: SubscriptionsPage,
});

function SubscriptionsPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [artisanId, setArtisanId] = useState<string | null>(null);
  const [sub, setSub] = useState<ArtisanSubscription | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlanRow[]>([]);
  const [busy, setBusy] = useState<SubscriptionTier | "cancel" | null>(null);
  const [fetching, setFetching] = useState(true);

  const checkoutFn = useServerFn(createSubscriptionCheckoutSession);
  const cancelFn = useServerFn(cancelMySubscription);

  useEffect(() => {
    if (search.cancelled) toast.info("Paiement annulé. Vous pouvez réessayer quand vous voulez.");
  }, [search.cancelled]);

  useEffect(() => {
    if (loading) return;
    (async () => {
      const p = await fetchSubscriptionPlans();
      setPlans(p);
      if (!isAuthenticated) {
        setFetching(false);
        return;
      }
      const { data } = await supabase
        .from("artisans")
        .select("id")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (data) {
        setArtisanId(data.id);
        const s = await fetchSubscription(data.id);
        setSub(s);
      }
      setFetching(false);
    })();
  }, [loading, isAuthenticated, user]);

  const subscribe = async (tier: SubscriptionTier) => {
    if (!isAuthenticated) {
      navigate({ to: "/auth", search: { redirect: "/abonnements" } });
      return;
    }
    if (!artisanId) {
      toast.error("Créez d'abord votre fiche artisan.");
      navigate({ to: "/dashboard" });
      return;
    }

    // Free : on enregistre directement (pas de paiement)
    if (tier === "free") {
      setBusy(tier);
      const { error } = await supabase.from("artisan_subscriptions").upsert({
        artisan_id: artisanId,
        tier: "free",
        starts_at: new Date().toISOString(),
        ends_at: null,
      });
      setBusy(null);
      if (error) return toast.error(error.message);
      toast.success("Vous êtes désormais en plan Standard.");
      setSub({ artisan_id: artisanId, tier: "free", starts_at: new Date().toISOString(), ends_at: null });
      return;
    }

    // Premium / Élite : Stripe Checkout
    setBusy(tier);
    try {
      const r = await checkoutFn({ data: { tier } });
      if (r.url) window.location.href = r.url;
    } catch (e) {
      toast.error(
        (e as Error).message ??
          "Le paiement n'est pas encore activé. Contactez l'administrateur.",
      );
    } finally {
      setBusy(null);
    }
  };

  const cancel = async () => {
    if (!window.confirm("Annuler votre abonnement à la fin de la période en cours ?")) return;
    setBusy("cancel");
    try {
      await cancelFn({});
      toast.success("Annulation enregistrée. Vous gardez l'accès jusqu'à la fin du mois.");
      if (artisanId) setSub(await fetchSubscription(artisanId));
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-6 py-32">
        <Reveal>
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald">
              Espace artisan
            </span>
            <h1 className="mt-3 font-serif text-4xl leading-tight md:text-6xl">
              Choisissez votre niveau d'accès
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Plus votre tier est élevé, plus tôt vous voyez les nouveaux leads et plus
              loin vous pouvez intervenir. Sans engagement de durée.
            </p>
          </div>
        </Reveal>

        {sub && (
          <Reveal>
            <div className="mx-auto mt-8 flex flex-wrap items-center justify-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald/30 bg-emerald/10 px-4 py-2 text-sm text-emerald">
                <Check className="h-4 w-4" /> Votre abonnement actuel :{" "}
                <strong>{TIER_LABEL[sub.tier]}</strong>
                {sub.cancel_at_period_end && (
                  <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">(annulation programmée)</span>
                )}
              </div>
              {sub.tier !== "free" && sub.stripe_subscription_id && !sub.cancel_at_period_end && (
                <button
                  onClick={cancel}
                  disabled={busy === "cancel"}
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1.5 text-xs hover:bg-muted disabled:opacity-50"
                >
                  {busy === "cancel" ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <X className="h-3 w-3" />
                  )}
                  Annuler à fin de période
                </button>
              )}
            </div>
          </Reveal>
        )}

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {plans.map((plan, i) => {
            const isCurrent = sub?.tier === plan.tier;
            return (
              <Reveal key={plan.tier} delay={i * 0.08}>
                <div
                  className={`relative h-full overflow-hidden rounded-3xl border p-8 shadow-sm transition hover:-translate-y-1 ${
                    plan.highlight
                      ? "border-emerald bg-gradient-to-br from-emerald to-emerald/85 text-emerald-foreground shadow-glow"
                      : "border-border bg-card"
                  }`}
                >
                  {plan.highlight && (
                    <span className="absolute right-6 top-6 rounded-full bg-white/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider">
                      Populaire
                    </span>
                  )}
                  <div className="flex items-center gap-2">
                    {plan.tier === "elite" && <Crown className="h-5 w-5" />}
                    {plan.tier === "premium" && <Star className="h-5 w-5" />}
                    <h2 className="font-serif text-2xl">{plan.name}</h2>
                  </div>
                  <p
                    className={`mt-2 text-sm ${
                      plan.highlight ? "opacity-85" : "text-muted-foreground"
                    }`}
                  >
                    {plan.description}
                  </p>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="font-serif text-5xl">
                      {plan.price_eur === 0
                        ? "0 €"
                        : `${plan.price_eur.toLocaleString("fr-FR")} €`}
                    </span>
                    <span
                      className={`text-sm ${plan.highlight ? "opacity-80" : "text-muted-foreground"}`}
                    >
                      / mois
                    </span>
                  </div>
                  <ul className="mt-6 space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <Check
                        className={`mt-0.5 h-4 w-4 flex-none ${
                          plan.highlight ? "text-white" : "text-emerald"
                        }`}
                      />
                      <span>
                        Rayon :{" "}
                        <strong>
                          {plan.radius_km === null
                            ? "toute la Guadeloupe"
                            : `${plan.radius_km} km`}
                        </strong>
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check
                        className={`mt-0.5 h-4 w-4 flex-none ${
                          plan.highlight ? "text-white" : "text-emerald"
                        }`}
                      />
                      <span>
                        {plan.delay_minutes === 0
                          ? "Accès immédiat (T+0)"
                          : `Accès aux leads après ${plan.delay_minutes} min`}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check
                        className={`mt-0.5 h-4 w-4 flex-none ${
                          plan.highlight ? "text-white" : "text-emerald"
                        }`}
                      />
                      <span>Notifications email à chaque lead matchant</span>
                    </li>
                    {plan.tier !== "free" && (
                      <li className="flex items-start gap-2">
                        <Check
                          className={`mt-0.5 h-4 w-4 flex-none ${
                            plan.highlight ? "text-white" : "text-emerald"
                          }`}
                        />
                        <span>Badge « {plan.name} » sur votre fiche</span>
                      </li>
                    )}
                  </ul>
                  <button
                    type="button"
                    disabled={isCurrent || busy === plan.tier || fetching}
                    onClick={() => subscribe(plan.tier)}
                    className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition disabled:opacity-60 ${
                      plan.highlight
                        ? "bg-white text-emerald hover:bg-white/90"
                        : "bg-foreground text-background hover:opacity-90"
                    }`}
                  >
                    {busy === plan.tier ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isCurrent ? (
                      "Plan actuel"
                    ) : (
                      <>
                        {plan.tier === "free" ? "Choisir" : "Passer à"} {plan.name}{" "}
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal>
          <div className="mt-16 rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground shadow-sm">
            Paiement sécurisé par Stripe. Annulation à tout moment depuis cette page.
            <Link
              to="/contact"
              className="ml-2 inline-flex items-center gap-1 text-emerald hover:underline"
            >
              Une question ? <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </Reveal>
      </main>
      <Footer />
    </div>
  );
}
