import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";
import {
  ArrowRight,
  Target,
  Shield,
  Zap,
  Users,
  TrendingUp,
  MapPin,
  Building2,
} from "lucide-react";

export const Route = createFileRoute("/a-propos")({
  head: () => ({
    meta: [
      { title: "À propos — BTP Guada, la marketplace BTP de Guadeloupe" },
      {
        name: "description",
        content:
          "BTP Guada connecte les particuliers, entreprises et agences aux meilleurs artisans BTP de Guadeloupe : leads vérifiés, paiement à l'usage, mise en relation < 24h.",
      },
      { property: "og:title", content: "À propos — BTP Guada" },
      {
        property: "og:description",
        content: "La marketplace de référence pour les chantiers BTP en Guadeloupe.",
      },
    ],
  }),
  component: AboutPage,
});

const STATS = [
  { v: "971", label: "Pensé pour la Guadeloupe" },
  { v: "<24h", label: "Mise en relation client/artisan" },
  { v: "3", label: "Devis max par demande" },
  { v: "100%", label: "Gratuit côté client" },
];

const PILLARS = [
  {
    icon: Target,
    title: "Lead-Flash",
    desc: "Les artisans reçoivent les nouvelles demandes en temps réel, avec une priorité temporelle selon leur abonnement (immédiat, 15 min, 30 min).",
  },
  {
    icon: Shield,
    title: "Confiance vérifiée",
    desc: "Kbis et assurance décennale obligatoires. Chaque lead client est validé par OTP email avant d'être diffusé.",
  },
  {
    icon: Zap,
    title: "Pas de commission",
    desc: "Les artisans paient à l'usage (8 à 70 crédits par lead). Aucun pourcentage prélevé sur les chantiers signés.",
  },
  {
    icon: MapPin,
    title: "Géo-précis",
    desc: "Filtrage par rayon (5, 25 km ou toute la Guadeloupe) — l'artisan ne voit que les chantiers réellement à sa portée.",
  },
];

const SEGMENTS = [
  {
    icon: Users,
    title: "Particuliers",
    desc: "Soumettez votre projet en 4 étapes, recevez 3 devis sous 48h. Comparez profils, photos et avis avant de choisir.",
    cta: { label: "Soumettre un projet", to: "/projet" as const },
  },
  {
    icon: Building2,
    title: "Entreprises, agences & syndics",
    desc: "Référence interne, SLA, multi-lots, facturation centralisée : un compte pro pour gérer tout votre patrimoine.",
    cta: { label: "Compte pro / agence", to: "/contact-pro" as const },
  },
  {
    icon: TrendingUp,
    title: "Artisans BTP",
    desc: "Wallet de crédits, abonnements priorité, dashboard géolocalisé. Développez votre carnet de commandes en pilote.",
    cta: { label: "Devenir partenaire", to: "/auth" as const },
  },
];

function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-6 py-32">
        {/* Hero */}
        <Reveal>
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald">
              Notre mission
            </span>
            <h1 className="mt-3 font-serif text-4xl leading-tight md:text-6xl">
              Le BTP guadeloupéen<br />
              <span className="italic text-emerald">enfin connecté.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              BTP Guada est la marketplace 100 % locale qui met en relation
              les particuliers, entreprises, agences et syndics avec les meilleurs
              artisans du bâtiment en Guadeloupe.
            </p>
          </div>
        </Reveal>

        {/* Stats */}
        <Reveal>
          <div className="mt-16 grid gap-6 rounded-3xl border border-border bg-card p-8 md:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-serif text-4xl text-emerald">{s.v}</p>
                <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Notre vision */}
        <Reveal>
          <section className="mt-24 grid gap-12 md:grid-cols-2 md:items-center">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald">
                Notre constat
              </span>
              <h2 className="mt-3 font-serif text-3xl md:text-4xl">
                Trouver un bon artisan ne devrait pas être un parcours du combattant.
              </h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Bouche-à-oreille incertain, devis qui n'arrivent jamais, prix opaques :
                l'expérience client dans le BTP guadeloupéen mérite mieux. Et côté
                artisan, perdre des heures à courir après des leads non qualifiés n'est
                plus tenable.
              </p>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                BTP Guada apporte une solution simple : <strong>vérifier les pros</strong>,{" "}
                <strong>qualifier les demandes</strong>, et garantir une mise en relation
                rapide.
              </p>
            </div>
            <div className="rounded-3xl border border-emerald/30 bg-gradient-to-br from-emerald/10 to-card p-8 shadow-card">
              <p className="font-serif text-2xl italic">
                « Le bon artisan, au bon endroit, au bon moment. »
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                Notre promesse repose sur trois piliers : <strong>vérification</strong>,{" "}
                <strong>vitesse</strong>, et <strong>transparence</strong>.
              </p>
            </div>
          </section>
        </Reveal>

        {/* Piliers produit */}
        <Reveal>
          <div className="mt-24 text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald">
              Comment ça marche
            </span>
            <h2 className="mt-3 font-serif text-3xl md:text-4xl">
              4 piliers pour un BTP plus efficace
            </h2>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {PILLARS.map((p, i) => {
            const Icon = p.icon;
            return (
              <Reveal key={p.title} delay={i * 80}>
                <article className="h-full rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-elegant">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald/10 text-emerald">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 font-serif text-xl">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {p.desc}
                  </p>
                </article>
              </Reveal>
            );
          })}
        </div>

        {/* Segments */}
        <Reveal>
          <div className="mt-24 text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald">
              Pour qui ?
            </span>
            <h2 className="mt-3 font-serif text-3xl md:text-4xl">
              Une plateforme, trois publics
            </h2>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {SEGMENTS.map((s, i) => {
            const Icon = s.icon;
            return (
              <Reveal key={s.title} delay={i * 80}>
                <article className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald/10 text-emerald">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 font-serif text-xl">{s.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {s.desc}
                  </p>
                  <Link
                    to={s.cta.to}
                    className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-emerald hover:underline"
                  >
                    {s.cta.label} <ArrowRight className="h-4 w-4" />
                  </Link>
                </article>
              </Reveal>
            );
          })}
        </div>

        {/* CTA final */}
        <Reveal>
          <div className="mt-24 overflow-hidden rounded-3xl bg-gradient-to-br from-emerald via-emerald to-emerald/80 p-12 text-center text-emerald-foreground shadow-glow">
            <h3 className="font-serif text-3xl md:text-4xl">
              Prêt à démarrer votre projet ?
            </h3>
            <p className="mx-auto mt-3 max-w-xl opacity-90">
              Soumettez votre demande en 4 étapes, ou inscrivez-vous comme artisan
              partenaire. C'est gratuit pour les clients.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/projet"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-emerald transition hover:scale-[1.03]"
              >
                Soumettre un projet <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur hover:bg-white/20"
              >
                Devenir artisan partenaire
              </Link>
            </div>
          </div>
        </Reveal>
      </main>
      <Footer />
    </div>
  );
}
