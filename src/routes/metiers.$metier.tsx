import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { findSpecialtyBySlug } from "@/data/specialties";
import { COMMUNES_LIST } from "@/data/communes";
import { ChevronRight, MapPin, Zap } from "lucide-react";

export const Route = createFileRoute("/metiers/$metier")({
  loader: ({ params }) => {
    const specialty = findSpecialtyBySlug(params.metier);
    if (!specialty) throw notFound();
    return { specialty };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [] };
    const { specialty } = loaderData;
    const title = `${specialty.singular} en Guadeloupe — Toutes les communes | BTP Guada`;
    const description = `Trouvez un ${specialty.singular.toLowerCase()} dans les 32 communes de Guadeloupe. ${specialty.description}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-32 text-center">
        <h1 className="font-serif text-4xl">Métier introuvable</h1>
      </main>
      <Footer />
    </div>
  ),
  component: HubMetier,
});

function HubMetier() {
  const { specialty } = Route.useLoaderData();
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-6 pb-20 pt-32">
        <nav className="text-xs text-muted-foreground">
          <Link to="/" className="hover:text-emerald">Accueil</Link>
          <span className="mx-1">/</span>
          <Link to="/metiers" className="hover:text-emerald">Métiers</Link>
          <span className="mx-1">/</span>
          <span>{specialty.singular}</span>
        </nav>

        <div className="mt-4 rounded-3xl border border-border bg-gradient-to-br from-emerald/5 via-card to-card p-8 shadow-card md:p-12">
          <h1 className="font-serif text-4xl md:text-5xl">
            {specialty.singular} en{" "}
            <span className="italic text-emerald">Guadeloupe</span>
          </h1>
          <p className="mt-3 max-w-3xl text-base text-muted-foreground">
            {specialty.description}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/artisan/$metier"
              params={{ metier: specialty.slug }}
              className="inline-flex items-center gap-2 rounded-full bg-emerald px-5 py-3 text-sm font-semibold text-emerald-foreground"
            >
              Voir les {specialty.singular.toLowerCase()}s vérifiés{" "}
              <ChevronRight className="h-4 w-4" />
            </Link>
            <Link
              to="/sos/$metier"
              params={{ metier: specialty.slug }}
              className="inline-flex items-center gap-2 rounded-full border border-destructive/40 px-5 py-3 text-sm font-semibold text-destructive hover:bg-destructive/5"
            >
              <Zap className="h-4 w-4" /> Urgence {specialty.name}
            </Link>
          </div>
        </div>

        <section className="mt-12">
          <h2 className="font-serif text-2xl">
            Trouvez un {specialty.singular.toLowerCase()} par commune
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Les 32 communes de Guadeloupe couvertes par notre réseau d'artisans.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {COMMUNES_LIST.map((c) => (
              <Link
                key={c.slug}
                to="/artisan/$metier/$commune"
                params={{ metier: specialty.slug, commune: c.slug }}
                className="group flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 text-sm transition hover:border-emerald hover:bg-emerald/5"
              >
                <span className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground group-hover:text-emerald" />
                  {specialty.singular} {c.name}
                </span>
                <ChevronRight className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" />
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
