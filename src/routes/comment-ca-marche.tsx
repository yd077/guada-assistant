import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";
import { Search, MessageSquare, Handshake, Star, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/comment-ca-marche")({
  head: () => ({
    meta: [
      { title: "Comment ça marche — BTP Guada" },
      { name: "description", content: "4 étapes simples pour trouver un artisan BTP vérifié en Guadeloupe : décrivez, comparez, choisissez, évaluez." },
      { property: "og:title", content: "Comment ça marche — BTP Guada" },
      { property: "og:description", content: "Trouvez un artisan BTP en 4 étapes : projet, devis, choix, avis." },
    ],
  }),
  component: HowItWorksPage,
});

const STEPS = [
  {
    icon: MessageSquare,
    label: "Décrivez votre projet",
    text: "Renseignez la spécialité, la commune et les détails de votre besoin. 2 minutes suffisent.",
  },
  {
    icon: Search,
    label: "Recevez jusqu'à 3 devis",
    text: "Nos artisans qualifiés étudient votre demande et vous répondent sous 48h en moyenne.",
  },
  {
    icon: Handshake,
    label: "Choisissez votre artisan",
    text: "Comparez les profils, les portfolios et les avis. Échangez directement, sans intermédiaire.",
  },
  {
    icon: Star,
    label: "Évaluez la prestation",
    text: "Une fois les travaux réalisés, partagez votre expérience pour aider la communauté.",
  },
];

function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-5xl px-6 py-32">
        <Reveal>
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald">
            Mode d'emploi
          </span>
          <h1 className="mt-3 font-serif text-4xl leading-tight md:text-6xl">
            Comment ça marche
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Trouver un artisan de confiance en Guadeloupe n'a jamais été aussi simple.
            Suivez ces 4 étapes — gratuites et sans engagement.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {STEPS.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08}>
              <div className="group relative h-full overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-elegant">
                <span className="absolute right-6 top-6 font-serif text-6xl font-light text-emerald/10">
                  0{i + 1}
                </span>
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald/10 text-emerald">
                  <s.icon className="h-5 w-5" />
                </span>
                <h2 className="mt-5 font-serif text-2xl">{s.label}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {[
              { v: "100%", l: "Gratuit pour les clients" },
              { v: "48h", l: "Délai moyen de réponse" },
              { v: "Vérifié", l: "Tous nos artisans contrôlés" },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
                <p className="font-serif text-3xl text-emerald">{s.v}</p>
                <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{s.l}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal>
          <div className="mt-16 rounded-3xl bg-gradient-to-br from-emerald via-emerald to-emerald/70 p-10 text-emerald-foreground shadow-glow md:p-14">
            <h2 className="font-serif text-3xl md:text-4xl">Démarrez votre projet maintenant</h2>
            <p className="mt-3 max-w-xl text-sm opacity-90">
              Décrivez votre besoin en quelques clics et recevez des propositions d'artisans qualifiés.
            </p>
            <Link
              to="/projet"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-emerald hover:bg-white/90"
            >
              Soumettre mon projet <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </main>
      <Footer />
    </div>
  );
}
