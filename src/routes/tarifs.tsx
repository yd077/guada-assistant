import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";
import { Check, ArrowRight, Coins, Crown, Star, Loader2 } from "lucide-react";
import {
  fetchCreditPacks,
  fetchSubscriptionPlans,
  pricePerCredit,
  type CreditPack,
  type SubscriptionPlanRow,
} from "@/services/credits";

export const Route = createFileRoute("/tarifs")({
  head: () => ({
    meta: [
      { title: "Tarifs — BTP Guada" },
      {
        name: "description",
        content:
          "100% gratuit pour les clients. Pour les artisans : packs de crédits dès 50€ et abonnements Premium 29€ / Élite 49€.",
      },
      { property: "og:title", content: "Tarifs — BTP Guada" },
      {
        property: "og:description",
        content: "Packs de crédits + abonnements transparents. Sans engagement.",
      },
    ],
  }),
  component: PricingPage,
});

const LEAD_COSTS = [
  { label: "Dépannage / urgence (<2k€)", credits: 8 },
  { label: "Chantier moyen (2k–15k€)", credits: 20 },
  { label: "Gros chantier (>15k€)", credits: 50 },
  { label: "Marché pro — agence / syndic", credits: 70 },
];

function PricingPage() {
  const [packs, setPacks] = useState<CreditPack[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlanRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [p, s] = await Promise.all([fetchCreditPacks(), fetchSubscriptionPlans()]);
        setPacks(p);
        setPlans(s);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-6 py-32">
        {/* Hero */}
        <Reveal>
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald">
              Tarifs simples & transparents
            </span>
            <h1 className="mt-3 font-serif text-4xl leading-tight md:text-6xl">
              Sans frais cachés
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              <strong>100% gratuit pour les clients.</strong> Pour les artisans : achetez des
              crédits à la demande ou prenez un abonnement pour la priorité.
            </p>
          </div>
        </Reveal>

        {/* Côté client */}
        <Reveal>
          <section className="mt-16 overflow-hidden rounded-3xl border border-emerald/30 bg-gradient-to-br from-emerald/8 via-card to-card p-8 shadow-card md:p-10">
            <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald">
                  Particuliers, entreprises, agences, syndics
                </span>
                <h2 className="mt-3 font-serif text-3xl">Côté client : 0 €, toujours.</h2>
                <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                  Soumission illimitée, jusqu'à 3 devis par demande, accès aux profils,
                  notes & photos. Aucune commission sur les travaux.
                </p>
              </div>
              <Link
                to="/projet"
                className="inline-flex items-center gap-2 rounded-full bg-emerald px-5 py-3 text-sm font-semibold text-emerald-foreground shadow-glow transition hover:scale-[1.03]"
              >
                Soumettre un projet <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        </Reveal>

        {loading ? (
          <div className="mt-16 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-emerald" />
          </div>
        ) : (
          <>
            {/* Packs de crédits */}
            <Reveal>
              <div className="mt-20 text-center">
                <span className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald">
                  Côté artisan · Option 1
                </span>
                <h2 className="mt-3 font-serif text-3xl md:text-4xl">
                  Packs de crédits
                </h2>
                <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">
                  Payez à l'usage. Chaque demande consomme 8 à 70 crédits selon sa taille.
                  Idéal pour démarrer ou compléter un abonnement.
                </p>
              </div>
            </Reveal>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {packs.map((pack, i) => (
                <Reveal key={pack.id} delay={i * 80}>
                  <article
                    className={`relative h-full overflow-hidden rounded-3xl border p-8 shadow-sm transition hover:-translate-y-1 ${
                      pack.highlight
                        ? "border-emerald bg-gradient-to-br from-emerald to-emerald/85 text-emerald-foreground shadow-glow"
                        : "border-border bg-card"
                    }`}
                  >
                    {pack.highlight && (
                      <span className="absolute right-6 top-6 rounded-full bg-white/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider">
                        Meilleur ratio
                      </span>
                    )}
                    <div className="flex items-center gap-2">
                      <Coins className="h-5 w-5" />
                      <h3 className="font-serif text-2xl">{pack.name}</h3>
                    </div>
                    <p
                      className={`mt-2 text-sm ${
                        pack.highlight ? "opacity-85" : "text-muted-foreground"
                      }`}
                    >
                      {pack.description}
                    </p>
                    <div className="mt-6 flex items-baseline gap-1">
                      <span className="font-serif text-5xl">
                        {pack.price_eur.toLocaleString("fr-FR")} €
                      </span>
                    </div>
                    <p
                      className={`mt-1 text-xs ${
                        pack.highlight ? "opacity-80" : "text-muted-foreground"
                      }`}
                    >
                      {pack.credits} crédits ·{" "}
                      {pricePerCredit(pack).toFixed(2).replace(".", ",")} € / crédit
                    </p>
                    <ul className="mt-6 space-y-3 text-sm">
                      <li className="flex items-start gap-2">
                        <Check
                          className={`mt-0.5 h-4 w-4 flex-none ${
                            pack.highlight ? "text-white" : "text-emerald"
                          }`}
                        />
                        <span>Crédits sans expiration</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check
                          className={`mt-0.5 h-4 w-4 flex-none ${
                            pack.highlight ? "text-white" : "text-emerald"
                          }`}
                        />
                        <span>Facture automatique</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check
                          className={`mt-0.5 h-4 w-4 flex-none ${
                            pack.highlight ? "text-white" : "text-emerald"
                          }`}
                        />
                        <span>Remboursement si lead invalide</span>
                      </li>
                    </ul>
                    <Link
                      to="/dashboard"
                      className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${
                        pack.highlight
                          ? "bg-white text-emerald hover:bg-white/90"
                          : "bg-foreground text-background hover:opacity-90"
                      }`}
                    >
                      Acheter ce pack <ArrowRight className="h-4 w-4" />
                    </Link>
                  </article>
                </Reveal>
              ))}
            </div>

            {/* Coût par lead */}
            <Reveal>
              <div className="mt-10 rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h3 className="font-serif text-lg">Combien coûte un lead ?</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Le tarif s'ajuste automatiquement selon la taille du chantier et le profil
                  du client.
                </p>
                <div className="mt-4 grid gap-3 md:grid-cols-4">
                  {LEAD_COSTS.map((c) => (
                    <div
                      key={c.label}
                      className="flex flex-col rounded-xl border border-border bg-background p-3"
                    >
                      <span className="text-xs text-muted-foreground">{c.label}</span>
                      <span className="mt-1 font-serif text-2xl text-emerald">
                        {c.credits} <span className="text-sm">cr.</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* Abonnements */}
            <Reveal>
              <div className="mt-24 text-center">
                <span className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald">
                  Côté artisan · Option 2
                </span>
                <h2 className="mt-3 font-serif text-3xl md:text-4xl">
                  Abonnements priorité
                </h2>
                <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">
                  Voyez les leads <strong>avant les autres</strong> et élargissez votre
                  rayon d'intervention.
                </p>
              </div>
            </Reveal>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {plans.map((plan, i) => (
                <Reveal key={plan.tier} delay={i * 80}>
                  <article
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
                      <h3 className="font-serif text-2xl">{plan.name}</h3>
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
                        className={`text-sm ${
                          plan.highlight ? "opacity-80" : "text-muted-foreground"
                        }`}
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
                          Rayon d'intervention :{" "}
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
                            ? "Accès immédiat aux nouveaux leads (T+0)"
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
                    <Link
                      to="/abonnements"
                      className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${
                        plan.highlight
                          ? "bg-white text-emerald hover:bg-white/90"
                          : "bg-foreground text-background hover:opacity-90"
                      }`}
                    >
                      Choisir {plan.name} <ArrowRight className="h-4 w-4" />
                    </Link>
                  </article>
                </Reveal>
              ))}
            </div>
          </>
        )}

        <Reveal>
          <div className="mt-20 rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
            <h3 className="font-serif text-2xl">Une question sur les tarifs ?</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
              Notre équipe répond sous 24h.
            </p>
            <Link
              to="/contact"
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium hover:bg-muted"
            >
              Nous contacter <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </main>
      <Footer />
    </div>
  );
}
