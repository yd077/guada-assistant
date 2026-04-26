import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ArtisanCard } from "@/components/site/ArtisanCard";
import { Reveal } from "@/components/site/Reveal";
import { type Artisan } from "@/data/artisans";
import { SPECIALTIES_LIST } from "@/data/specialties";
import { COMMUNES_LIST, COMMUNE_BY_NAME } from "@/data/communes";
import { listArtisans } from "@/services/artisans";
import { haversineKm } from "@/services/geocoding";
import { Search, SlidersHorizontal, Star, Loader2, MapPin } from "lucide-react";
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
          "Parcourez notre annuaire d'artisans BTP vérifiés en Guadeloupe. Filtrez par spécialité, commune, distance et notation.",
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
  const [maxDistance, setMaxDistance] = useState(0); // 0 = pas de filtre distance
  const [results, setResults] = useState<Artisan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listArtisans({
      specialty: specialty || undefined,
      // si on filtre par distance depuis une commune, on relâche le filtre commune stricte
      location: maxDistance > 0 ? undefined : location || undefined,
      minRating: minRating || undefined,
    })
      .then((data) => {
        if (!cancelled) setResults(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [specialty, location, minRating, maxDistance]);

  // Filtrage par distance côté client (Haversine)
  const filtered = useMemo(() => {
    if (!maxDistance || !location) return results;
    const center = COMMUNE_BY_NAME[location];
    if (!center) return results;
    return results
      .map((a) => {
        const lat = a.baseLat ?? COMMUNE_BY_NAME[a.location]?.lat ?? null;
        const lng = a.baseLng ?? COMMUNE_BY_NAME[a.location]?.lng ?? null;
        if (lat == null || lng == null) return null;
        const distance = haversineKm(center.lat, center.lng, lat, lng);
        // Si l'artisan a un rayon défini, on respecte aussi sa zone d'intervention
        const artisanRadius = a.radiusKm ?? 100;
        if (distance > maxDistance && distance > artisanRadius) return null;
        return { artisan: a, distance };
      })
      .filter((x): x is { artisan: Artisan; distance: number } => x !== null)
      .sort((x, y) => x.distance - y.distance)
      .map((x) => x.artisan);
  }, [results, maxDistance, location]);

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
                {loading
                  ? "Recherche…"
                  : `${filtered.length} artisan${filtered.length > 1 ? "s" : ""} d'exception`}
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
                    {SPECIALTIES_LIST.map((s) => (
                      <option key={s.slug} value={s.name}>
                        {s.name}
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
                    {COMMUNES_LIST.map((c) => (
                      <option key={c.slug} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 flex items-center justify-between text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Distance max
                    </span>
                    <span className="text-foreground">
                      {maxDistance ? `${maxDistance} km` : "Tous"}
                    </span>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={maxDistance}
                    onChange={(e) => setMaxDistance(parseInt(e.target.value, 10))}
                    disabled={!location}
                    className="w-full accent-emerald disabled:opacity-40"
                  />
                  {!location && (
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Sélectionnez une commune pour activer ce filtre.
                    </p>
                  )}
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
                    setMaxDistance(0);
                  }}
                  className="w-full rounded-lg border border-border py-2 text-sm text-muted-foreground hover:bg-muted"
                >
                  Réinitialiser
                </button>
              </div>
            </div>
          </aside>

          <div>
            {loading ? (
              <div className="flex items-center justify-center rounded-2xl border border-dashed border-border p-16">
                <Loader2 className="h-8 w-8 animate-spin text-emerald" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-12 text-center">
                <Search className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-4 font-serif text-2xl">Notre annuaire arrive bientôt</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Aucun artisan ne correspond à vos critères pour le moment. En attendant, soumettez directement votre projet — nous trouvons les bons artisans pour vous.
                </p>
                <a
                  href="/projet"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald px-5 py-2.5 text-sm font-semibold text-emerald-foreground shadow-glow hover:opacity-90"
                >
                  Soumettre mon projet
                </a>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {filtered.map((a, i) => (
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
