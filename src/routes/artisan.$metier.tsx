import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { findSpecialtyBySlug, SPECIALTIES_LIST } from "@/data/specialties";
import { COMMUNES_LIST } from "@/data/communes";
import { listArtisans } from "@/services/artisans";
import { ArtisanCard } from "@/components/site/ArtisanCard";
import { ChevronRight, MapPin } from "lucide-react";

export const Route = createFileRoute("/artisan/$metier")({
  loader: async ({ params }) => {
    const specialty = findSpecialtyBySlug(params.metier);
    if (!specialty) throw notFound();
    const artisans = await listArtisans({ specialty: specialty.name });
    return { specialty, artisans };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [] };
    const { specialty } = loaderData;
    const title = `${specialty.singular} en Guadeloupe — Devis gratuit | BTP Guada`;
    const description = `Trouvez le meilleur ${specialty.singular.toLowerCase()} en Guadeloupe. ${specialty.description} Devis gratuit sous 48h.`;
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
        <p className="mt-4 text-muted-foreground">
          Ce corps de métier n'est pas encore référencé sur la plateforme.
        </p>
        <Link to="/metiers" className="mt-6 inline-block rounded-full bg-emerald px-6 py-3 text-sm text-emerald-foreground">
          Voir tous les métiers
        </Link>
      </main>
      <Footer />
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-32 text-center">
        <h1 className="font-serif text-4xl">Erreur de chargement</h1>
        <p className="mt-4 text-muted-foreground">{error.message}</p>
      </main>
      <Footer />
    </div>
  ),
  component: MetierPage,
});

function MetierPage() {
  const { specialty, artisans } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-28">
        <section className="border-b border-border bg-soft py-12">
          <div className="mx-auto max-w-7xl px-6">
            <nav className="mb-3 text-xs text-muted-foreground">
              <Link to="/" className="hover:text-foreground">Accueil</Link>
              <ChevronRight className="mx-1 inline h-3 w-3" />
              <Link to="/metiers" className="hover:text-foreground">Métiers</Link>
              <ChevronRight className="mx-1 inline h-3 w-3" />
              <span className="text-foreground">{specialty.singular}</span>
            </nav>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald">
              {specialty.name}
            </span>
            <h1 className="mt-2 font-serif text-4xl md:text-5xl">
              {specialty.singular} en Guadeloupe
            </h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">{specialty.description}</p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-12">
          <h2 className="mb-6 font-serif text-2xl">
            {artisans.length} {specialty.singular.toLowerCase()}
            {artisans.length > 1 ? "s" : ""} disponible{artisans.length > 1 ? "s" : ""}
          </h2>
          {artisans.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
              Aucun {specialty.singular.toLowerCase()} référencé pour le moment.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {artisans.map((a) => (
                <ArtisanCard key={a.id} artisan={a} />
              ))}
            </div>
          )}
        </section>

        <section className="border-t border-border bg-soft py-12">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="mb-6 font-serif text-2xl">
              {specialty.singular} par commune
            </h2>
            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {COMMUNES_LIST.map((c) => (
                <Link
                  key={c.slug}
                  to="/artisan/$metier/$commune"
                  params={{ metier: specialty.slug, commune: c.slug }}
                  className="group flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm transition-colors hover:border-emerald hover:bg-emerald/5"
                >
                  <MapPin className="h-3.5 w-3.5 text-emerald" />
                  <span className="group-hover:text-emerald">
                    {specialty.singular} à {c.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
