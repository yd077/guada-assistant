import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { findSpecialtyBySlug } from "@/data/specialties";
import { findCommuneBySlug } from "@/data/communes";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Phone, Zap, Clock, ShieldCheck, Loader2 } from "lucide-react";

export const Route = createFileRoute("/sos/$metier/$commune")({
  loader: ({ params }) => {
    const specialty = findSpecialtyBySlug(params.metier);
    const commune = findCommuneBySlug(params.commune);
    if (!specialty || !commune) throw notFound();
    return { specialty, commune };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [] };
    const { specialty, commune } = loaderData;
    const title = `SOS ${specialty.name} ${commune.name} — Intervention < 2h`;
    const description = `Urgence ${specialty.singular.toLowerCase()} à ${commune.name} ? Artisan disponible 24/7, intervention en moins de 2h.`;
    const ld = {
      "@context": "https://schema.org",
      "@type": "EmergencyService",
      name: `SOS ${specialty.name} ${commune.name}`,
      areaServed: {
        "@type": "City",
        name: commune.name,
        geo: { "@type": "GeoCoordinates", latitude: commune.lat, longitude: commune.lng },
      },
      serviceType: specialty.name,
      hoursAvailable: "Mo-Su 00:00-23:59",
    };
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
      scripts: [{ type: "application/ld+json", children: JSON.stringify(ld) }],
    };
  },
  component: SosCommunePage,
});

function SosCommunePage() {
  const { specialty, commune } = Route.useLoaderData();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", phone: "" });
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      toast.error("Nom et téléphone requis.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("projects").insert({
      client_type: "particulier",
      specialty: specialty.name,
      location: commune.name,
      description: `🚨 URGENCE SOS ${specialty.name} à ${commune.name}.`,
      contact_name: form.name,
      contact_email: "sos@btpguada.fr",
      contact_phone: form.phone,
      urgency_level: "sos",
      email_verified: true,
      project_lat: commune.lat,
      project_lng: commune.lng,
    });
    setBusy(false);
    if (error) {
      toast.error("Envoi impossible — appelez le numéro.");
      return;
    }
    toast.success("Demande envoyée — un artisan va vous rappeler.");
    navigate({ to: "/succes" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-4xl px-6 pb-20 pt-32">
        <div className="rounded-3xl border border-destructive/30 bg-gradient-to-br from-destructive/10 via-card to-card p-8 shadow-card md:p-12">
          <span className="inline-flex items-center gap-2 rounded-full bg-destructive px-3 py-1 text-xs font-semibold uppercase tracking-wider text-destructive-foreground">
            <Zap className="h-3 w-3" /> Urgence à {commune.name}
          </span>
          <h1 className="mt-4 font-serif text-4xl md:text-5xl">
            SOS {specialty.name} <span className="italic text-emerald">{commune.name}</span>
          </h1>
          <p className="mt-3 text-base text-muted-foreground">
            {specialty.singular} disponible 24/7 à {commune.name}. Intervention en moins
            de 2h.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <a
              href="tel:+590590000000"
              className="flex flex-col items-center justify-center rounded-2xl bg-destructive px-6 py-8 text-destructive-foreground shadow-glow transition hover:scale-[1.02]"
            >
              <Phone className="h-8 w-8" />
              <span className="mt-2 text-xs uppercase tracking-wider opacity-80">
                Appel direct
              </span>
              <span className="font-serif text-3xl">0590 00 00 00</span>
            </a>

            <form
              onSubmit={submit}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <p className="text-sm font-semibold">Demande de rappel</p>
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
                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald px-5 py-3 text-sm font-semibold text-emerald-foreground disabled:opacity-50"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                  Être rappelé
                </button>
              </div>
            </form>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3 text-sm">
            <Bullet icon={<Clock className="h-4 w-4" />} text="Intervention < 2h" />
            <Bullet icon={<ShieldCheck className="h-4 w-4" />} text="Vérifiés (Kbis + déc.)" />
            <Bullet icon={<Zap className="h-4 w-4" />} text="Devis express gratuit" />
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3 text-sm">
          <Link
            to="/sos/$metier"
            params={{ metier: specialty.slug }}
            className="text-emerald hover:underline"
          >
            ← Toutes les urgences {specialty.name} en Guadeloupe
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Bullet({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald/10 text-emerald">
        {icon}
      </span>
      {text}
    </div>
  );
}
