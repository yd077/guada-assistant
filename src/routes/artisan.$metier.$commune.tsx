import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { RelatedLinks } from "@/components/site/RelatedLinks";
import { findSpecialtyBySlug } from "@/data/specialties";
import { findCommuneBySlug, COMMUNES_LIST } from "@/data/communes";
import { listArtisans } from "@/services/artisans";
import { ArtisanCard } from "@/components/site/ArtisanCard";
import { ChevronRight, MapPin, ShieldCheck, Star } from "lucide-react";

export const Route = createFileRoute("/artisan/$metier/$commune")({
  loader: async ({ params }) => {
    const specialty = findSpecialtyBySlug(params.metier);
    const commune = findCommuneBySlug(params.commune);
    if (!specialty || !commune) throw notFound();
    const artisans = await listArtisans({
      specialty: specialty.name,
      location: commune.name,
    });
    return { specialty, commune, artisans };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [] };
    const { specialty, commune, artisans } = loaderData;
    const title = `${specialty.singular} à ${commune.name} — Devis gratuit | BTP Guada`;
    const description = `Trouvez un ${specialty.singular.toLowerCase()} de confiance à ${commune.name} (Guadeloupe). ${artisans.length} professionnel${artisans.length > 1 ? "s vérifiés" : " vérifié"}, devis gratuit sous 48h.`;

    // JSON-LD LocalBusiness pour chaque artisan + BreadcrumbList
    const localBusinessLd = artisans.map((a) => ({
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: a.name,
      description: a.bio,
      address: {
        "@type": "PostalAddress",
        addressLocality: a.location,
        addressRegion: "Guadeloupe",
        addressCountry: "FR",
      },
      aggregateRating: a.reviewsCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: a.rating,
            reviewCount: a.reviewsCount,
          }
        : undefined,
      areaServed: commune.name,
      knowsAbout: specialty.name,
    }));

    const breadcrumbLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Accueil", item: "/" },
        { "@type": "ListItem", position: 2, name: "Métiers", item: "/metiers" },
        {
          "@type": "ListItem",
          position: 3,
          name: specialty.singular,
          item: `/artisan/${specialty.slug}`,
        },
        {
          "@type": "ListItem",
          position: 4,
          name: commune.name,
          item: `/artisan/${specialty.slug}/${commune.slug}`,
        },
      ],
    };

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(breadcrumbLd),
        },
        ...localBusinessLd.map((ld) => ({
          type: "application/ld+json",
          children: JSON.stringify(ld),
        })),
      ],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-32 text-center">
        <h1 className="font-serif text-4xl">Page introuvable</h1>
        <p className="mt-4 text-muted-foreground">
          Cette combinaison métier / commune n'est pas reconnue.
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
  component: MetierCommunePage,
});

function MetierCommunePage() {
  const { specialty, commune, artisans } = Route.useLoaderData();

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
              <Link to="/artisan/$metier" params={{ metier: specialty.slug }} className="hover:text-foreground">
                {specialty.singular}
              </Link>
              <ChevronRight className="mx-1 inline h-3 w-3" />
              <span className="text-foreground">{commune.name}</span>
            </nav>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-emerald">
              <MapPin className="h-3 w-3" /> {commune.name}, Guadeloupe
            </span>
            <h1 className="mt-2 font-serif text-4xl md:text-5xl">
              {specialty.singular} à {commune.name}
            </h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Vous recherchez un <strong>{specialty.singular.toLowerCase()}</strong> à{" "}
              <strong>{commune.name}</strong> ?{" "}
              {artisans.length > 0
                ? `Découvrez nos ${artisans.length} professionnel${artisans.length > 1 ? "s vérifiés" : " vérifié"} qui interviennent dans votre commune.`
                : `Soumettez votre projet et recevez des devis gratuits d'artisans qualifiés intervenant dans votre commune.`}
              {" "}{specialty.description}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/projet"
                className="rounded-full bg-emerald px-6 py-3 text-sm font-medium text-emerald-foreground hover:opacity-90"
              >
                Demander un devis gratuit
              </Link>
              <Link
                to="/artisan/$metier"
                params={{ metier: specialty.slug }}
                className="rounded-full border border-border px-6 py-3 text-sm hover:bg-muted"
              >
                Voir tous les {specialty.singular.toLowerCase()}s
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-12">
          {artisans.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center">
              <ShieldCheck className="mx-auto h-10 w-10 text-emerald" />
              <p className="mt-4 font-serif text-2xl">
                Aucun {specialty.singular.toLowerCase()} référencé à {commune.name} pour le moment
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                Soumettez votre projet : nous vous mettrons en relation avec des artisans
                vérifiés intervenant dans votre commune.
              </p>
              <Link
                to="/projet"
                className="mt-6 inline-block rounded-full bg-emerald px-6 py-3 text-sm text-emerald-foreground"
              >
                Soumettre mon projet
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(artisans as import("@/data/artisans").Artisan[]).map((a) => (
                <ArtisanCard key={a.id} artisan={a} />
              ))}
            </div>
          )}
        </section>

        <section className="mx-auto max-w-7xl px-6">
          <RelatedLinks
            mode="communes-around"
            specialty={specialty}
            commune={commune}
          />
          <RelatedLinks
            mode="specialties-here"
            specialty={specialty}
            commune={commune}
          />
        </section>
      </main>
      <Footer />
    </div>
  );
}
