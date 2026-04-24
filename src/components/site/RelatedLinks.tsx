import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { COMMUNES_LIST, type Commune } from "@/data/communes";
import { SPECIALTIES_LIST, type Specialty } from "@/data/specialties";
import { haversineKm } from "@/services/geocoding";

type Props =
  | { mode: "communes-around"; specialty: Specialty; commune: Commune }
  | { mode: "specialties-here"; specialty: Specialty; commune: Commune }
  | { mode: "communes-for-specialty"; specialty: Specialty };

export function RelatedLinks(props: Props) {
  if (props.mode === "communes-for-specialty") {
    return (
      <section className="mt-16 rounded-3xl border border-border bg-card p-6 md:p-10">
        <h2 className="font-serif text-2xl">
          {props.specialty.singular}s par commune
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Trouvez un {props.specialty.singular.toLowerCase()} dans toute la
          Guadeloupe.
        </p>
        <div className="mt-5 grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {COMMUNES_LIST.map((c) => (
            <Link
              key={c.slug}
              to="/artisan/$metier/$commune"
              params={{ metier: props.specialty.slug, commune: c.slug }}
              className="group inline-flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-sm transition hover:border-emerald hover:bg-emerald/5"
            >
              <span>
                {props.specialty.singular} {c.name}
              </span>
              <ArrowRight className="h-3.5 w-3.5 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
            </Link>
          ))}
        </div>
      </section>
    );
  }

  if (props.mode === "communes-around") {
    const others = COMMUNES_LIST.filter((c) => c.slug !== props.commune.slug)
      .map((c) => ({
        commune: c,
        distance: haversineKm(
          props.commune.lat,
          props.commune.lng,
          c.lat,
          c.lng,
        ),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 8);
    return (
      <section className="mt-16 rounded-3xl border border-border bg-card p-6 md:p-10">
        <h2 className="font-serif text-2xl">Communes voisines</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Élargissez votre recherche autour de {props.commune.name}.
        </p>
        <div className="mt-5 grid gap-2 sm:grid-cols-2 md:grid-cols-4">
          {others.map(({ commune, distance }) => (
            <Link
              key={commune.slug}
              to="/artisan/$metier/$commune"
              params={{ metier: props.specialty.slug, commune: commune.slug }}
              className="group inline-flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-sm transition hover:border-emerald hover:bg-emerald/5"
            >
              <span>
                {props.specialty.singular} {commune.name}
              </span>
              <span className="text-[10px] text-muted-foreground">
                ~{Math.round(distance)} km
              </span>
            </Link>
          ))}
        </div>
      </section>
    );
  }

  // specialties-here
  const others = SPECIALTIES_LIST.filter((s) => s.slug !== props.specialty.slug);
  return (
    <section className="mt-16 rounded-3xl border border-border bg-card p-6 md:p-10">
      <h2 className="font-serif text-2xl">
        Autres métiers à {props.commune.name}
      </h2>
      <div className="mt-5 grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {others.map((s) => (
          <Link
            key={s.slug}
            to="/artisan/$metier/$commune"
            params={{ metier: s.slug, commune: props.commune.slug }}
            className="group inline-flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-sm transition hover:border-emerald hover:bg-emerald/5"
          >
            <span>
              {s.singular} {props.commune.name}
            </span>
            <ArrowRight className="h-3.5 w-3.5 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
          </Link>
        ))}
      </div>
    </section>
  );
}
