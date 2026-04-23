import { Link } from "@tanstack/react-router";
import { MapPin, Star, ShieldCheck } from "lucide-react";
import type { Artisan } from "@/data/artisans";

export function ArtisanCard({ artisan }: { artisan: Artisan }) {
  return (
    <Link
      to="/artisan/$id"
      params={{ id: artisan.id }}
      className="group block overflow-hidden rounded-2xl bg-card shadow-card transition-all hover:-translate-y-1 hover:shadow-elegant"
    >
      <div className="relative h-52 overflow-hidden">
        <img
          src={artisan.cover}
          alt={`Réalisation de ${artisan.name}`}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-midnight/70 via-midnight/10 to-transparent" />
        {artisan.verified && (
          <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-emerald/90 px-2.5 py-1 text-[11px] font-medium text-emerald-foreground backdrop-blur">
            <ShieldCheck className="h-3 w-3" /> Vérifié
          </span>
        )}
        <div className="absolute inset-x-4 bottom-4 flex items-end gap-3">
          <img
            src={artisan.avatar}
            alt={artisan.name}
            className="h-12 w-12 rounded-full border-2 border-white/80 object-cover shadow-lg"
          />
          <div className="text-white">
            <p className="font-serif text-lg leading-tight">{artisan.name}</p>
            <p className="text-xs text-white/80">{artisan.specialty}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between p-5">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 text-emerald" />
          {artisan.location}
        </div>
        <div className="flex items-center gap-1 text-sm">
          <Star className="h-4 w-4 fill-accent text-accent" />
          <span className="font-semibold text-foreground">{artisan.rating.toFixed(1)}</span>
          <span className="text-muted-foreground">({artisan.reviewsCount})</span>
        </div>
      </div>
    </Link>
  );
}
