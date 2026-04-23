import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ArtisanCard } from "@/components/site/ArtisanCard";
import { Reveal } from "@/components/site/Reveal";
import { ARTISANS, SPECIALTIES, COMMUNES } from "@/data/artisans";
import { Search, SlidersHorizontal, Star } from "lucide-react";
import { z } from "zod";

const searchSchema = z.object({
  specialty: z.string().optional(),
  location: z.string().optional(),
});

export const Route = createFileRoute("/recherche")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Trouver un artisan en Guadeloupe — BTP Guada" },
      {
        name: "description",
        content:
          "Parcourez notre annuaire d'artisans BTP vérifiés en Guadeloupe. Filtrez par spécialité, commune et notation.",
      },
      { property: "og:title", content: "Trouver un artisan — BTP Guada" },
      {
        property: "og:description",
        content: "Annuaire des artisans BTP de Guadeloupe, vérifiés et notés.",
      },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const initial = Route.useSearch();
  const [specialty, setSpecialty] = useState(initial.specialty ?? "");
  const [location, setLocation] = useState(initial.location ?? "");
  const [minRating, setMinRating] = useState(0);

  const results = useMemo(() => {
    return ARTISANS.filter(
      (a) =>
        (!specialty || a.specialty === specialty) &&
        (!location || a.location === location) &&
        a.rating >= minRating,
    );
  }, [specialty, location, minRating]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-28">
        <section className="border-b border-border bg-soft py-12">
          <div className="mx-auto max-w-7xl px-6">
            <Reveal>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald">
                Annuaire
              </span>
              <h1 className="mt-2 font-serif text-4xl md:text-5xl">
                {results.length} artisan{results.length > 1 ? "s" : ""} d'exception
              </h1>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                Tous nos partenaires sont vérifiés, assurés et évalués par leurs clients.
              </p>
            </Reveal>
          </div>
        </section>

        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 lg:grid-cols-[280px_1fr]">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
                <SlidersHorizontal className="h-4 w-4 text-emerald" /> Filtres
              </div>

              <div className="space-y-5">
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Spécialité
                  </label>
                  <select
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
                  >
                    <option value="">Toutes</option>
                    {SPECIALTIES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Commune
                  </label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
                  >
                    <option value="">Toute la Guadeloupe</option>
                    {COMMUNES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 flex items-center justify-between text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Note minimale
                    <span className="flex items-center gap-1 text-foreground">
                      <Star className="h-3 w-3 fill-accent text-accent" /> {minRating.toFixed(1)}
                    </span>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={5}
                    step={0.5}
                    value={minRating}
                    onChange={(e) => setMinRating(parseFloat(e.target.value))}
                    className="w-full accent-emerald"
                  />
                </div>

                <button
                  onClick={() => {
                    setSpecialty("");
                    setLocation("");
                    setMinRating(0);
                  }}
                  className="w-full rounded-lg border border-border py-2 text-sm text-muted-foreground hover:bg-muted"
                >
                  Réinitialiser
                </button>
              </div>
            </div>
          </aside>

          <div>
            {results.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-12 text-center">
                <Search className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-4 font-serif text-2xl">Aucun artisan ne correspond</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Élargissez vos critères pour découvrir d'autres profils.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {results.map((a, i) => (
                  <Reveal key={a.id} delay={i * 0.04}>
                    <ArtisanCard artisan={a} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
