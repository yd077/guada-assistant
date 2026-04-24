import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";
import { SPECIALTIES_LIST } from "@/data/specialties";
import { Phone, Zap, Clock, ShieldCheck, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/sos")({
  head: () => ({
    meta: [
      { title: "SOS BTP Guadeloupe — Urgence 24/7 plombier, électricien, serrurier" },
      {
        name: "description",
        content:
          "Urgence BTP en Guadeloupe ? Plombier, électricien, serrurier… intervention en moins de 2h, 7j/7. Artisans vérifiés Kbis + décennale.",
      },
      { property: "og:title", content: "SOS BTP Guadeloupe — Urgence 24/7" },
      {
        property: "og:description",
        content: "Intervention urgente plombier, électricien, serrurier… partout en Guadeloupe.",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "EmergencyService",
          name: "SOS BTP Guadeloupe",
          areaServed: { "@type": "AdministrativeArea", name: "Guadeloupe" },
          hoursAvailable: "Mo-Su 00:00-23:59",
          telephone: "+590590000000",
          url: "/sos",
        }),
      },
    ],
  }),
  component: SosHubPage,
});

const URGENT_METIERS = [
  "plomberie",
  "electricite",
  "serrurerie",
  "couverture",
  "climatisation",
  "multi-services",
];

function SosHubPage() {
  const urgents = URGENT_METIERS.map((slug) =>
    SPECIALTIES_LIST.find((s) => s.slug === slug),
  ).filter(Boolean) as typeof SPECIALTIES_LIST;
  const others = SPECIALTIES_LIST.filter((s) => !URGENT_METIERS.includes(s.slug));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-6 pb-20 pt-32">
        <Reveal>
          <div className="rounded-3xl border border-destructive/30 bg-gradient-to-br from-destructive/10 via-card to-card p-8 text-center shadow-card md:p-14">
            <span className="inline-flex items-center gap-2 rounded-full bg-destructive px-3 py-1 text-xs font-semibold uppercase tracking-wider text-destructive-foreground">
              <Zap className="h-3 w-3" /> Urgence 24/7
            </span>
            <h1 className="mt-4 font-serif text-4xl leading-tight md:text-6xl">
              SOS BTP <span className="italic text-emerald">Guadeloupe</span>
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground md:text-lg">
              Une fuite, une panne, une porte claquée ? Intervention en moins de
              2h, partout en Guadeloupe.
            </p>

            <a
              href="tel:+590590000000"
              className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-destructive px-8 py-6 text-destructive-foreground shadow-glow transition hover:scale-[1.02]"
            >
              <Phone className="h-7 w-7" />
              <div className="text-left">
                <div className="text-xs uppercase tracking-wider opacity-80">
                  Appel direct
                </div>
                <div className="font-serif text-2xl md:text-4xl">
                  0590 00 00 00
                </div>
              </div>
            </a>

            <div className="mx-auto mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
              <Promise icon={<Clock className="h-4 w-4" />} text="Intervention < 2h" />
              <Promise icon={<ShieldCheck className="h-4 w-4" />} text="Artisans vérifiés" />
              <Promise icon={<Zap className="h-4 w-4" />} text="Devis express gratuit" />
            </div>
          </div>
        </Reveal>

        <Reveal>
          <section className="mt-16">
            <h2 className="font-serif text-3xl">Métiers d'urgence</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Cliquez votre besoin pour obtenir un rappel immédiat.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {urgents.map((s) => (
                <Link
                  key={s.slug}
                  to="/sos/$metier"
                  params={{ metier: s.slug }}
                  className="group flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-card transition hover:-translate-y-1 hover:border-destructive"
                >
                  <div>
                    <p className="font-serif text-xl">SOS {s.singular}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {s.description.slice(0, 70)}…
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-destructive transition group-hover:translate-x-1" />
                </Link>
              ))}
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="mt-16">
            <h2 className="font-serif text-2xl">Autres métiers</h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {others.map((s) => (
                <Link
                  key={s.slug}
                  to="/sos/$metier"
                  params={{ metier: s.slug }}
                  className="rounded-full border border-border bg-card px-4 py-2 text-sm transition hover:border-destructive hover:bg-destructive/5"
                >
                  SOS {s.name}
                </Link>
              ))}
            </div>
          </section>
        </Reveal>
      </main>
      <Footer />
    </div>
  );
}

function Promise({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald/10 text-emerald">
        {icon}
      </span>
      {text}
    </div>
  );
}
