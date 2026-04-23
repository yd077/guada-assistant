import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import type { Artisan } from "@/data/artisans";
import { useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";
import { getArtisanById } from "@/data/artisans";
import { Send, MapPin, Star } from "lucide-react";

export const Route = createFileRoute("/contact-artisan/$id")({
  loader: ({ params }): { artisan: Artisan } => {
    const artisan = getArtisanById(params.id);
    if (!artisan) throw notFound();
    return { artisan };
  },
  head: ({ loaderData }) => {
    const a = loaderData?.artisan;
    return {
      meta: [
        {
          title: a
            ? `Contacter ${a.name} — BTP Guada`
            : "Contacter un artisan — BTP Guada",
        },
        {
          name: "description",
          content: a
            ? `Demandez un devis gratuit à ${a.name}, ${a.specialty} à ${a.location}.`
            : "Demandez un devis gratuit à un artisan vérifié.",
        },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center">
      <Link to="/recherche" className="text-emerald underline">
        Retour à l'annuaire
      </Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="flex min-h-screen items-center justify-center p-6">
      <p>{error.message}</p>
    </div>
  ),
  component: ContactArtisanPage,
});

function ContactArtisanPage() {
  const { artisan } = Route.useLoaderData() as { artisan: Artisan };
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => navigate({ to: "/succes" }), 700);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto grid max-w-6xl gap-10 px-6 py-32 lg:grid-cols-[1fr_360px]">
        <Reveal>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald">
            Devis personnalisé
          </span>
          <h1 className="mt-2 font-serif text-4xl md:text-5xl">
            Contacter <span className="italic text-emerald">{artisan.name}</span>
          </h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Présentez votre projet en quelques mots. {artisan.name.split(" ")[0]} vous répondra
            sous 48h en moyenne.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-10 space-y-5 rounded-2xl border border-border bg-card p-8 shadow-card"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Nom complet" name="name" required />
              <Field label="Téléphone" name="phone" type="tel" required />
            </div>
            <Field label="Email" name="email" type="email" required />
            <Field label="Commune du chantier" name="city" required />
            <div>
              <label className="mb-1.5 block text-sm font-medium">Description du projet</label>
              <textarea
                required
                rows={6}
                name="message"
                placeholder="Type de travaux, surface, délais souhaités…"
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-emerald"
              />
            </div>
            <button
              disabled={submitting}
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald px-6 py-3.5 font-medium text-emerald-foreground transition hover:bg-emerald/90 disabled:opacity-60"
            >
              <Send className="h-4 w-4" /> {submitting ? "Envoi…" : "Envoyer ma demande"}
            </button>
            <p className="text-center text-xs text-muted-foreground">
              Service gratuit · Vos données restent confidentielles.
            </p>
          </form>
        </Reveal>

        <aside>
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
            <img src={artisan.cover} alt="" className="h-32 w-full object-cover" />
            <div className="-mt-8 flex flex-col items-center px-6 pb-6 text-center">
              <img
                src={artisan.avatar}
                alt={artisan.name}
                className="h-20 w-20 rounded-full border-4 border-card object-cover shadow-card"
              />
              <p className="mt-3 font-serif text-xl">{artisan.name}</p>
              <p className="text-sm text-muted-foreground">{artisan.specialty}</p>
              <div className="mt-3 flex items-center gap-1 text-sm">
                <Star className="h-4 w-4 fill-accent text-accent" />
                <span className="font-semibold">{artisan.rating.toFixed(1)}</span>
                <span className="text-muted-foreground">({artisan.reviewsCount} avis)</span>
              </div>
              <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" /> {artisan.location}
              </p>
            </div>
          </div>
        </aside>
      </main>
      <Footer />
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-emerald"
      />
    </div>
  );
}
