import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { SPECIALTIES_LIST } from "@/data/specialties";
import { COMMUNES_LIST } from "@/data/communes";
import { Hammer, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/metiers")({
  head: () => ({
    meta: [
      { title: "Tous les métiers du BTP en Guadeloupe — BTP Guada" },
      {
        name: "description",
        content:
          "Découvrez tous les corps de métier du BTP et services à domicile disponibles en Guadeloupe. Trouvez l'artisan qu'il vous faut près de chez vous.",
      },
      { property: "og:title", content: "Tous les métiers du BTP en Guadeloupe" },
      {
        property: "og:description",
        content:
          "Annuaire des artisans BTP par métier et par commune en Guadeloupe.",
      },
    ],
  }),
  component: MetiersIndex,
});

function MetiersIndex() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-28">
        <section className="border-b border-border bg-soft py-12">
          <div className="mx-auto max-w-7xl px-6">
            <nav className="mb-3 text-xs text-muted-foreground">
              <Link to="/" className="hover:text-foreground">Accueil</Link>
              <ChevronRight className="mx-1 inline h-3 w-3" />
              <span className="text-foreground">Métiers</span>
            </nav>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald">
              Annuaire par métier
            </span>
            <h1 className="mt-2 font-serif text-4xl md:text-5xl">
              Tous les métiers du BTP en Guadeloupe
            </h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              {SPECIALTIES_LIST.length} corps de métier référencés sur l'ensemble
              des {COMMUNES_LIST.length} communes de l'archipel.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SPECIALTIES_LIST.map((s) => (
              <Link
                key={s.slug}
                to="/artisan/$metier"
                params={{ metier: s.slug }}
                className="group flex items-start gap-3 rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-emerald hover:shadow-card"
              >
                <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-emerald/10 text-emerald">
                  <Hammer className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-serif text-lg leading-tight group-hover:text-emerald">
                    {s.singular}
                  </h2>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {s.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
