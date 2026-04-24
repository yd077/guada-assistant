import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { HeroSlideshow } from "@/components/site/HeroSlideshow";
import { CountUp } from "@/components/site/CountUp";
import { Reveal } from "@/components/site/Reveal";
import { ArtisanCard } from "@/components/site/ArtisanCard";
import { ARTISANS, SPECIALTIES, COMMUNES } from "@/data/artisans";
import {
  Search,
  MapPin,
  ShieldCheck,
  ClipboardList,
  Handshake,
  Hammer,
  Zap,
  Wrench,
  PaintBucket,
  Trees,
  Sofa,
  Home as HomeIcon,
  ChevronRight,
  Sparkles,
} from "lucide-react";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BTP Guada — L'excellence du chantier en Guadeloupe" },
      {
        name: "description",
        content:
          "Plateforme premium d'artisans BTP vérifiés en Guadeloupe. Maçonnerie, électricité, plomberie, peinture, paysagisme. Devis gratuits sous 48h.",
      },
      { property: "og:title", content: "BTP Guada — L'excellence du chantier en Guadeloupe" },
      {
        property: "og:description",
        content:
          "Trouvez l'artisan d'exception qui réalisera votre projet. Sélection rigoureuse, expertise locale.",
      },
      { property: "og:image", content: HERO_IMAGE },
      { name: "twitter:image", content: HERO_IMAGE },
    ],
  }),
  component: HomePage,
});

const TRADES = [
  { icon: Hammer, name: "Maçonnerie", count: 142 },
  { icon: Zap, name: "Électricité", count: 98 },
  { icon: Wrench, name: "Plomberie", count: 87 },
  { icon: PaintBucket, name: "Peinture", count: 64 },
  { icon: Trees, name: "Paysagisme", count: 53 },
  { icon: Sofa, name: "Architecture d'intérieur", count: 31 },
  { icon: HomeIcon, name: "Couverture", count: 42 },
  { icon: Sparkles, name: "Rénovation", count: 76 },
];

function HomePage() {
  const [specialty, setSpecialty] = useState("");
  const [location, setLocation] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const search: Record<string, string> = {};
    if (specialty) search.specialty = specialty;
    if (location) search.location = location;
    navigate({ to: "/recherche", search: search as never });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header transparent />

      {/* HERO */}
      <section className="relative isolate flex min-h-[100svh] items-center justify-center overflow-hidden pt-32 pb-20 text-white">
        <HeroSlideshow />
        {/* Centered contrast veil for text legibility */}
        <div
          className="pointer-events-none absolute inset-0 z-[1]"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(ellipse 60% 55% at 50% 45%, rgba(15,23,42,0.55) 0%, rgba(15,23,42,0.25) 55%, transparent 80%)",
          }}
        />
        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
          <span
            className="inline-flex animate-fade-in-up items-center gap-2 rounded-full border border-white/20 bg-white/[0.07] px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-white/95 backdrop-blur-md"
            style={{ animationDelay: "0.1s" }}
          >
            <Sparkles className="h-3.5 w-3.5 text-accent" /> Artisans vérifiés · 100% Guadeloupe
          </span>
          <h1
            className="mt-7 animate-fade-in-up font-serif text-5xl font-medium leading-[1.05] text-balance text-white md:text-7xl lg:text-[5.5rem]"
            style={{ animationDelay: "0.2s", textShadow: "0 2px 24px rgba(0,0,0,0.45)" }}
          >
            L'excellence du chantier{" "}
            <span className="italic text-accent">en Guadeloupe</span>
          </h1>
          <p
            className="mx-auto mt-6 max-w-2xl animate-fade-in-up text-lg leading-relaxed text-white/90 md:text-xl"
            style={{ animationDelay: "0.35s", textShadow: "0 1px 12px rgba(0,0,0,0.5)" }}
          >
            La plateforme qui réunit les artisans BTP les plus exigeants de l'archipel.
            Trouvez la main d'œuvre qu'il vous faut, du devis à la livraison.
          </p>

          {/* Search */}
          <form
            onSubmit={handleSearch}
            className="mx-auto mt-10 flex max-w-3xl animate-fade-in-up flex-col gap-2 rounded-2xl border border-white/40 bg-white/95 p-2 shadow-elegant backdrop-blur-xl md:flex-row"
            style={{ animationDelay: "0.5s" }}
          >
            <div className="flex flex-1 items-center gap-2 border-b border-border md:border-b-0 md:border-r">
              <Search className="ml-3 h-5 w-5 text-emerald" />
              <select
                name="specialty"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full border-0 bg-transparent px-2 py-3.5 text-foreground outline-none"
              >
                <option value="">Quel corps de métier ?</option>
                {SPECIALTIES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-1 items-center gap-2">
              <MapPin className="ml-3 h-5 w-5 text-emerald" />
              <select
                name="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full border-0 bg-transparent px-2 py-3.5 text-foreground outline-none"
              >
                <option value="">Toute la Guadeloupe</option>
                {COMMUNES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald px-6 py-3.5 font-medium text-emerald-foreground transition hover:bg-emerald/90"
            >
              <Search className="h-4 w-4" /> Rechercher
            </button>
          </form>

          <div
            className="mt-8 flex animate-fade-in-up flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/85"
            style={{ animationDelay: "0.65s", textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}
          >
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-accent" /> Décennale vérifiée
            </span>
            <span className="hidden h-3 w-px bg-white/30 sm:block" />
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-accent" /> RGE & Qualibat
            </span>
            <span className="hidden h-3 w-px bg-white/30 sm:block" />
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-accent" /> Devis gratuit sous 48h
            </span>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-24 left-1/2 z-10 hidden -translate-x-1/2 animate-fade-in-up md:block" style={{ animationDelay: "0.9s" }}>
          <div className="flex h-10 w-6 items-start justify-center rounded-full border border-white/40 p-1.5">
            <span className="block h-2 w-1 animate-bounce rounded-full bg-white/80" />
          </div>
        </div>
      </section>

      {/* KPI BAND */}
      <section className="bg-midnight py-20 text-midnight-foreground">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-12 px-6 md:grid-cols-4">
          {[
            { end: 480, suffix: "+", label: "Artisans vérifiés" },
            { end: 2300, suffix: "+", label: "Chantiers réalisés" },
            { end: 32, label: "Communes couvertes" },
            { end: 98, suffix: "%", label: "Clients satisfaits" },
          ].map((stat) => (
            <Reveal key={stat.label} className="text-center">
              <CountUp end={stat.end} suffix={stat.suffix ?? ""} />
              <p className="mt-2 text-sm uppercase tracking-[0.18em] text-white/60">
                {stat.label}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* TRADES */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald">
              Corps de métier
            </span>
            <h2 className="mt-3 font-serif text-4xl md:text-5xl text-balance">
              Tout le savoir-faire BTP de l'archipel,{" "}
              <span className="italic text-emerald">réuni</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              De la fondation à la finition, trouvez les artisans certifiés pour chaque étape de
              votre projet.
            </p>
          </Reveal>

          <div className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-4">
            {TRADES.map((t, i) => (
              <Reveal key={t.name} delay={i * 0.04}>
                <Link
                  to="/recherche"
                  search={{ specialty: t.name } as never}
                  className="group flex h-full flex-col items-start gap-4 rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:-translate-y-1 hover:border-emerald/40 hover:shadow-elegant"
                >
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald/10 text-emerald transition-colors group-hover:bg-emerald group-hover:text-emerald-foreground">
                    <t.icon className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="font-serif text-xl text-foreground">{t.name}</p>
                    <p className="text-sm text-muted-foreground">{t.count} artisans</p>
                  </div>
                  <span className="mt-auto inline-flex items-center text-xs font-medium text-emerald opacity-0 transition-opacity group-hover:opacity-100">
                    Explorer <ChevronRight className="h-3 w-3" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-soft py-24">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald">
              Comment ça marche
            </span>
            <h2 className="mt-3 font-serif text-4xl md:text-5xl text-balance">
              Trois étapes pour <span className="italic text-emerald">démarrer</span>
            </h2>
          </Reveal>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              {
                icon: ClipboardList,
                title: "Décrivez votre projet",
                text: "Quelques minutes suffisent pour exposer vos besoins, vos contraintes et vos délais.",
              },
              {
                icon: Handshake,
                title: "Recevez des devis",
                text: "Les artisans vérifiés vous contactent avec leurs propositions sous 48h en moyenne.",
              },
              {
                icon: ShieldCheck,
                title: "Lancez les travaux sereinement",
                text: "Suivi du chantier, garanties, et avis vérifiés à la livraison.",
              },
            ].map((step, i) => (
              <Reveal key={step.title} delay={i * 0.1}>
                <div className="relative h-full rounded-3xl bg-card p-8 shadow-card">
                  <span className="absolute -top-6 left-8 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-emerald text-emerald-foreground shadow-glow">
                    <step.icon className="h-6 w-6" />
                  </span>
                  <span className="font-display text-6xl text-emerald/15">0{i + 1}</span>
                  <h3 className="mt-2 font-serif text-2xl">{step.title}</h3>
                  <p className="mt-2 text-muted-foreground">{step.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED ARTISANS */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-xl">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald">
                Artisans à la une
              </span>
              <h2 className="mt-3 font-serif text-4xl md:text-5xl text-balance">
                Des talents <span className="italic text-emerald">d'exception</span>
              </h2>
            </div>
            <Link
              to="/recherche"
              className="inline-flex items-center gap-1 text-sm font-medium text-emerald hover:gap-2 transition-all"
            >
              Voir tous les artisans <ChevronRight className="h-4 w-4" />
            </Link>
          </Reveal>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ARTISANS.map((a, i) => (
              <Reveal key={a.id} delay={i * 0.05}>
                <ArtisanCard artisan={a} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* DUAL CTA */}
      <section className="px-6 pb-24">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2">
          <Reveal>
            <div
              className="group relative overflow-hidden rounded-3xl bg-emerald p-10 text-emerald-foreground shadow-elegant"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 100% 0%, color-mix(in oklab, white 18%, transparent), transparent 60%)",
              }}
            >
              <h3 className="font-serif text-3xl md:text-4xl">Un projet en tête ?</h3>
              <p className="mt-3 max-w-md text-emerald-foreground/80">
                Décrivez votre chantier et recevez gratuitement plusieurs devis d'artisans vérifiés.
              </p>
              <Link
                to="/projet"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-emerald transition group-hover:gap-3"
              >
                Soumettre mon projet <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="group relative overflow-hidden rounded-3xl border border-border bg-card p-10 shadow-card">
              <h3 className="font-serif text-3xl md:text-4xl">Vous êtes artisan ?</h3>
              <p className="mt-3 max-w-md text-muted-foreground">
                Rejoignez le réseau d'excellence BTP Guada et accédez à des chantiers qualifiés
                partout en Guadeloupe.
              </p>
              <Link
                to="/auth"
                className="mt-8 inline-flex items-center gap-2 rounded-full border border-emerald px-6 py-3 text-sm font-medium text-emerald transition group-hover:bg-emerald group-hover:text-emerald-foreground group-hover:gap-3"
              >
                Devenir partenaire <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}
