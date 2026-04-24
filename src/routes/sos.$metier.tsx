import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { findSpecialtyBySlug, SPECIALTIES_LIST } from "@/data/specialties";
import { COMMUNES_LIST } from "@/data/communes";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Phone, Zap, Clock, ShieldCheck, ChevronRight, Loader2 } from "lucide-react";

export const Route = createFileRoute("/sos/$metier")({
  loader: ({ params }) => {
    const specialty = findSpecialtyBySlug(params.metier);
    if (!specialty) throw notFound();
    return { specialty };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [] };
    const { specialty } = loaderData;
    const title = `SOS ${specialty.name} Guadeloupe — Intervention rapide 24/7`;
    const description = `Urgence ${specialty.singular.toLowerCase()} en Guadeloupe ? Intervention en moins de 2h, 7j/7. Devis express gratuit, artisans vérifiés.`;
    const ld = {
      "@context": "https://schema.org",
      "@type": "EmergencyService",
      name: `SOS ${specialty.name} Guadeloupe`,
      areaServed: { "@type": "AdministrativeArea", name: "Guadeloupe" },
      serviceType: specialty.name,
      hoursAvailable: "Mo-Su 00:00-23:59",
      url: `/sos/${specialty.slug}`,
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
          children: JSON.stringify(ld),
        },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-32 text-center">
        <h1 className="font-serif text-4xl">Service introuvable</h1>
      </main>
      <Footer />
    </div>
  ),
  component: SosPage,
});

function SosPage() {
  const { specialty } = Route.useLoaderData();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", phone: "", commune: "" });
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.commune) {
      toast.error("Renseignez nom, téléphone et commune.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("projects").insert({
      client_type: "particulier",
      specialty: specialty.name,
      location: form.commune,
      description: `🚨 URGENCE SOS ${specialty.name}. Rappel immédiat demandé.`,
      contact_name: form.name,
      contact_email: "sos@btpguada.fr",
      contact_phone: form.phone,
      urgency_level: "sos",
      email_verified: true,
    });
    setBusy(false);
    if (error) {
      console.error(error);
      toast.error("Envoi impossible — appelez le numéro ci-dessous.");
      return;
    }
    toast.success("Demande envoyée — un artisan va vous rappeler.");
    navigate({ to: "/succes" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-5xl px-6 pb-20 pt-32">
        <div className="rounded-3xl border border-destructive/30 bg-gradient-to-br from-destructive/10 via-card to-card p-8 md:p-12 shadow-card">
          <span className="inline-flex items-center gap-2 rounded-full bg-destructive px-3 py-1 text-xs font-semibold uppercase tracking-wider text-destructive-foreground">
            <Zap className="h-3 w-3" /> Urgence 24/7
          </span>
          <h1 className="mt-4 font-serif text-4xl md:text-6xl">
            SOS {specialty.name} <span className="italic text-emerald">Guadeloupe</span>
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground md:text-lg">
            Intervention en moins de 2h, 7j/7, partout en Guadeloupe. Artisans
            vérifiés (Kbis + assurance décennale).
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-[2fr_3fr]">
            <a
              href="tel:+590590000000"
              className="flex flex-col items-center justify-center rounded-2xl bg-destructive px-6 py-8 text-destructive-foreground shadow-glow transition hover:scale-[1.02]"
            >
              <Phone className="h-8 w-8" />
              <span className="mt-2 text-xs uppercase tracking-wider opacity-80">
                Appel direct
              </span>
              <span className="font-serif text-3xl md:text-4xl">0590 00 00 00</span>
            </a>

            <form
              onSubmit={submit}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <p className="text-sm font-semibold">Ou demandez un rappel</p>
              <div className="mt-3 grid gap-3">
                <input
                  placeholder="Nom"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
                />
                <input
                  type="tel"
                  placeholder="Téléphone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
                />
                <select
                  value={form.commune}
                  onChange={(e) => setForm({ ...form, commune: e.target.value })}
                  className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
                >
                  <option value="">Commune…</option>
                  {COMMUNES_LIST.map((c) => (
                    <option key={c.slug} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald px-5 py-3 text-sm font-semibold text-emerald-foreground disabled:opacity-50"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                  Être rappelé maintenant
                </button>
              </div>
            </form>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Promise icon={<Clock className="h-4 w-4" />} text="Intervention < 2h" />
            <Promise icon={<ShieldCheck className="h-4 w-4" />} text="Artisans vérifiés" />
            <Promise icon={<Zap className="h-4 w-4" />} text="Devis express gratuit" />
          </div>
        </div>

        {/* Maillage SOS par commune */}
        <section className="mt-16">
          <h2 className="font-serif text-2xl">
            SOS {specialty.singular} dans toutes les communes
          </h2>
          <div className="mt-5 grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {COMMUNES_LIST.map((c) => (
              <Link
                key={c.slug}
                to="/sos/$metier/$commune"
                params={{ metier: specialty.slug, commune: c.slug }}
                className="group inline-flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-sm transition hover:border-destructive hover:bg-destructive/5"
              >
                <span>
                  SOS {specialty.singular} {c.name}
                </span>
                <ChevronRight className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" />
              </Link>
            ))}
          </div>
        </section>

        {/* Liens autres SOS */}
        <section className="mt-16">
          <h2 className="font-serif text-2xl">Autres urgences BTP</h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {SPECIALTIES_LIST.filter((s) => s.slug !== specialty.slug)
              .slice(0, 8)
              .map((s) => (
                <Link
                  key={s.slug}
                  to="/sos/$metier"
                  params={{ metier: s.slug }}
                  className="rounded-full border border-border bg-card px-4 py-2 text-sm transition hover:border-destructive hover:bg-destructive/5"
                >
                  SOS {s.name}
                </Link>
              ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function Promise({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald/10 text-emerald">
        {icon}
      </span>
      {text}
    </div>
  );
}
