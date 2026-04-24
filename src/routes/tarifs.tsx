import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";
import { Check, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/tarifs")({
  head: () => ({
    meta: [
      { title: "Tarifs — BTP Guada" },
      { name: "description", content: "BTP Guada est gratuit pour les clients. Découvrez nos formules pour les artisans : essai gratuit, plan Pro et Premium." },
      { property: "og:title", content: "Tarifs — BTP Guada" },
      { property: "og:description", content: "100% gratuit pour les clients. Plans abordables pour les artisans." },
    ],
  }),
  component: PricingPage,
});

const PLANS = [
  {
    name: "Client",
    price: "Gratuit",
    desc: "Pour les particuliers et professionnels qui cherchent un artisan.",
    features: [
      "Soumission de projets illimitée",
      "Jusqu'à 3 devis par demande",
      "Accès complet aux profils & avis",
      "Pas de commission sur les travaux",
    ],
    cta: { label: "Soumettre un projet", to: "/projet" as const },
    highlight: false,
  },
  {
    name: "Artisan Découverte",
    price: "0 €",
    period: "/ 30 jours",
    desc: "Testez la plateforme sans engagement.",
    features: [
      "Fiche professionnelle complète",
      "5 demandes de devis par mois",
      "Portfolio jusqu'à 6 photos",
      "Support par email",
    ],
    cta: { label: "Devenir artisan", to: "/auth" as const },
    highlight: false,
  },
  {
    name: "Artisan Pro",
    price: "39 €",
    period: "/ mois HT",
    desc: "Pour développer durablement votre activité.",
    features: [
      "Demandes de devis illimitées",
      "Portfolio illimité + vidéos",
      "Mise en avant dans les résultats",
      "Badge « Vérifié Pro »",
      "Support prioritaire",
    ],
    cta: { label: "Choisir Pro", to: "/auth" as const },
    highlight: true,
  },
];

function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-6 py-32">
        <Reveal>
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald">
              Tarifs simples & transparents
            </span>
            <h1 className="mt-3 font-serif text-4xl leading-tight md:text-6xl">
              Sans frais cachés
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              100% gratuit pour les clients. Pour les artisans, des formules claires sans engagement de durée.
            </p>
          </div>
        </Reveal>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {PLANS.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 80}>
              <div
                className={`relative h-full overflow-hidden rounded-3xl border p-8 shadow-sm transition hover:-translate-y-1 ${
                  plan.highlight
                    ? "border-emerald bg-gradient-to-br from-emerald to-emerald/85 text-emerald-foreground shadow-glow"
                    : "border-border bg-card"
                }`}
              >
                {plan.highlight && (
                  <span className="absolute right-6 top-6 rounded-full bg-white/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider">
                    Recommandé
                  </span>
                )}
                <h2 className={`font-serif text-2xl ${plan.highlight ? "" : ""}`}>{plan.name}</h2>
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
                      className={`text-sm ${plan.highlight ? "opacity-80" : "text-muted-foreground"}`}
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
                <Link
                  to={plan.cta.to}
                  className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${
                    plan.highlight
                      ? "bg-white text-emerald hover:bg-white/90"
                      : "bg-foreground text-background hover:opacity-90"
                  }`}
                >
                  {plan.cta.label} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="mt-16 rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
            <h3 className="font-serif text-2xl">Une question sur les tarifs ?</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
              Notre équipe répond à toutes vos questions sous 24h.
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
