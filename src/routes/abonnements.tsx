import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchSubscription,
  TIER_LABEL,
  TIER_DELAY_MIN,
  type SubscriptionTier,
  type ArtisanSubscription,
} from "@/services/subscriptions";
import { Crown, Star, Check, Loader2, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/abonnements")({
  head: () => ({
    meta: [
      { title: "Abonnements artisan — BTP Guada" },
      {
        name: "description",
        content:
          "Choisissez votre formule artisan : Standard, Premium ou Élite. Accès prioritaire aux leads en Guadeloupe.",
      },
      { property: "og:title", content: "Abonnements artisan — BTP Guada" },
      {
        property: "og:description",
        content: "Standard, Premium ou Élite : priorité sur les leads BTP en Guadeloupe.",
      },
    ],
  }),
  component: SubscriptionsPage,
});

type Plan = {
  tier: SubscriptionTier;
  name: string;
  badge?: string;
  price: string;
  period?: string;
  desc: string;
  features: string[];
  highlight?: boolean;
  icon?: React.ReactNode;
};

const PLANS: Plan[] = [
  {
    tier: "free",
    name: "Standard",
    price: "0 €",
    period: "/ mois",
    desc: "Pour démarrer et tester la plateforme.",
    features: [
      `Accès aux leads après ${TIER_DELAY_MIN.free} min`,
      "3 artisans max par lead",
      "Tarif au lead à l'unité",
      "Support par email",
    ],
  },
  {
    tier: "premium",
    name: "Premium",
    badge: "Populaire",
    price: "39 €",
    period: "/ mois HT",
    desc: "Voyez les leads avant la majorité du marché.",
    features: [
      `Accès prioritaire après ${TIER_DELAY_MIN.premium} min`,
      "Badge « Premium » sur la fiche",
      "Mise en avant dans la recherche",
      "Support prioritaire",
    ],
    highlight: true,
    icon: <Star className="h-4 w-4" />,
  },
  {
    tier: "elite",
    name: "Élite",
    price: "129 €",
    period: "/ mois HT",
    desc: "Accès immédiat — bâtissez votre carnet.",
    features: [
      "Accès immédiat aux leads (T+0)",
      "Badge « Élite » exclusif",
      "Top des résultats de recherche",
      "Account manager dédié",
    ],
    icon: <Crown className="h-4 w-4" />,
  },
];

function SubscriptionsPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [artisanId, setArtisanId] = useState<string | null>(null);
  const [sub, setSub] = useState<ArtisanSubscription | null>(null);
  const [busy, setBusy] = useState<SubscriptionTier | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      setFetching(false);
      return;
    }
    (async () => {
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
    setBusy(tier);
    // Pas de Stripe pour l'instant : on enregistre directement le tier.
    // (Le checkout sera branché plus tard.)
    const { error } = await supabase
      .from("artisan_subscriptions")
      .upsert({
        artisan_id: artisanId,
        tier,
        starts_at: new Date().toISOString(),
        ends_at: tier === "free" ? null : null,
      });
    setBusy(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Vous êtes désormais ${TIER_LABEL[tier]}.`);
    setSub({
      artisan_id: artisanId,
      tier,
      starts_at: new Date().toISOString(),
      ends_at: null,
    });
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
              Plus votre tier est élevé, plus tôt vous voyez les nouveaux leads.
              Sans engagement de durée.
            </p>
          </div>
        </Reveal>

        {sub && (
          <Reveal>
            <div className="mx-auto mt-8 inline-flex items-center gap-2 rounded-full border border-emerald/30 bg-emerald/10 px-4 py-2 text-sm text-emerald">
              <Check className="h-4 w-4" /> Votre abonnement actuel :{" "}
              <strong>{TIER_LABEL[sub.tier]}</strong>
            </div>
          </Reveal>
        )}

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {PLANS.map((plan, i) => {
            const isCurrent = sub?.tier === plan.tier;
            return (
              <Reveal key={plan.tier} delay={i * 80}>
                <div
                  className={`relative h-full overflow-hidden rounded-3xl border p-8 shadow-sm transition hover:-translate-y-1 ${
                    plan.highlight
                      ? "border-emerald bg-gradient-to-br from-emerald to-emerald/85 text-emerald-foreground shadow-glow"
                      : "border-border bg-card"
                  }`}
                >
                  {plan.badge && (
                    <span className="absolute right-6 top-6 rounded-full bg-white/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider">
                      {plan.badge}
                    </span>
                  )}
                  <div className="flex items-center gap-2">
                    {plan.icon}
                    <h2 className="font-serif text-2xl">{plan.name}</h2>
                  </div>
                  <p
                    className={`mt-2 text-sm ${
                      plan.highlight ? "opacity-85" : "text-muted-foreground"
                    }`}
                  >
                    {plan.desc}
                  </p>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="font-serif text-5xl">{plan.price}</span>
                    {plan.period && (
                      <span
                        className={`text-sm ${
                          plan.highlight ? "opacity-80" : "text-muted-foreground"
                        }`}
                      >
                        {plan.period}
                      </span>
                    )}
                  </div>
                  <ul className="mt-6 space-y-3 text-sm">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check
                          className={`mt-0.5 h-4 w-4 flex-none ${
                            plan.highlight ? "text-white" : "text-emerald"
                          }`}
                        />
                        <span>{f}</span>
                      </li>
                    ))}
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
                        Choisir {plan.name} <ArrowRight className="h-4 w-4" />
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
            Le paiement sécurisé sera bientôt activé. En attendant, votre changement
            de tier est appliqué manuellement par notre équipe.
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
