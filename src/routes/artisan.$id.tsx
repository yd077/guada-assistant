import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";
import { getArtisanById } from "@/data/artisans";
import {
  MapPin,
  Star,
  ShieldCheck,
  Calendar,
  Award,
  MessageCircle,
  ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/artisan/$id")({
  loader: ({ params }) => {
    const artisan = getArtisanById(params.id);
    if (!artisan) throw notFound();
    return { artisan };
  },
  head: ({ loaderData }) => {
    const a = loaderData?.artisan;
    if (!a) return { meta: [{ title: "Artisan introuvable — BTP Guada" }] };
    return {
      meta: [
        { title: `${a.name} — ${a.specialty} à ${a.location} · BTP Guada` },
        { name: "description", content: a.bio },
        { property: "og:title", content: `${a.name} — ${a.specialty}` },
        { property: "og:description", content: a.bio },
        { property: "og:image", content: a.cover },
        { name: "twitter:image", content: a.cover },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
      <h1 className="font-serif text-3xl">Artisan introuvable</h1>
      <Link to="/recherche" className="text-emerald underline">
        Retour à l'annuaire
      </Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <p className="text-muted-foreground">Erreur : {error.message}</p>
    </div>
  ),
  component: ArtisanPage,
});

function ArtisanPage() {
  const { artisan } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* HERO */}
      <section className="relative h-[60vh] min-h-[420px] overflow-hidden">
        <img
          src={artisan.cover}
          alt={`Réalisations de ${artisan.name}`}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/60 to-midnight/30" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-6 pb-12 text-white">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-end">
            <img
              src={artisan.avatar}
              alt={artisan.name}
              className="h-28 w-28 rounded-2xl border-4 border-white/90 object-cover shadow-elegant"
            />
            <div className="flex-1">
              {artisan.verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald/90 px-3 py-1 text-xs font-medium backdrop-blur">
                  <ShieldCheck className="h-3 w-3" /> Artisan vérifié
                </span>
              )}
              <h1 className="mt-3 font-serif text-4xl md:text-6xl">{artisan.name}</h1>
              <p className="mt-2 text-lg text-white/85">
                {artisan.specialty} · <MapPin className="inline h-4 w-4" /> {artisan.location}
              </p>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/85">
                <span className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-accent text-accent" />
                  <strong className="text-white">{artisan.rating.toFixed(1)}</strong> ·{" "}
                  {artisan.reviewsCount} avis
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-accent" />
                  {artisan.yearsExperience} ans d'expérience
                </span>
              </div>
            </div>
            <Link
              to="/contact-artisan/$id"
              params={{ id: artisan.id }}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-medium text-accent-foreground shadow-glow transition hover:scale-105"
            >
              <MessageCircle className="h-4 w-4" /> Contacter
            </Link>
          </div>
        </div>
      </section>

      <main className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-[1fr_320px]">
        <div className="space-y-16">
          <Reveal>
            <h2 className="font-serif text-3xl">À propos</h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{artisan.bio}</p>
          </Reveal>

          <Reveal>
            <h2 className="font-serif text-3xl">Réalisations</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {artisan.portfolio.map((p) => (
                <figure
                  key={p.title}
                  className="group overflow-hidden rounded-2xl shadow-card"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={p.src}
                      alt={p.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                  </div>
                  <figcaption className="bg-card p-4 text-sm font-medium">{p.title}</figcaption>
                </figure>
              ))}
            </div>
          </Reveal>

          <Reveal>
            <h2 className="font-serif text-3xl">Avis clients</h2>
            <div className="mt-6 space-y-4">
              {artisan.reviews.map((r) => (
                <div
                  key={r.author + r.date}
                  className="rounded-2xl border border-border bg-card p-6 shadow-card"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{r.author}</p>
                    <div className="flex">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                      ))}
                    </div>
                  </div>
                  <p className="mt-2 text-muted-foreground">{r.comment}</p>
                  <p className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">
                    {r.date}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <div className="flex items-center gap-2 text-emerald">
              <Award className="h-5 w-5" />
              <h3 className="font-serif text-xl text-foreground">Certifications</h3>
            </div>
            <ul className="mt-4 space-y-3">
              {artisan.certifications.map((c) => (
                <li key={c} className="flex items-start gap-2 text-sm">
                  <ShieldCheck className="mt-0.5 h-4 w-4 flex-none text-emerald" />
                  {c}
                </li>
              ))}
            </ul>
            <Link
              to="/contact-artisan/$id"
              params={{ id: artisan.id }}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald px-4 py-3 text-sm font-medium text-emerald-foreground transition hover:bg-emerald/90"
            >
              Demander un devis <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </aside>
      </main>

      <Footer />
    </div>
  );
}
