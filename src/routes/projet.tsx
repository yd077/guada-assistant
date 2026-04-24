import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";
import { SPECIALTIES, COMMUNES } from "@/data/artisans";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, CheckCircle2, ClipboardList } from "lucide-react";

export const Route = createFileRoute("/projet")({
  head: () => ({
    meta: [
      { title: "Soumettre un projet BTP — BTP Guada" },
      {
        name: "description",
        content:
          "Décrivez votre projet en 3 étapes et recevez plusieurs devis d'artisans vérifiés en Guadeloupe.",
      },
      { property: "og:title", content: "Soumettre un projet — BTP Guada" },
      {
        property: "og:description",
        content: "3 étapes pour recevoir des devis d'artisans BTP vérifiés en Guadeloupe.",
      },
    ],
  }),
  component: ProjectPage,
});

const STEPS = ["Type de projet", "Détails", "Coordonnées"] as const;

function ProjectPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    specialty: "",
    location: "",
    surface: "",
    budget: "",
    timing: "",
    description: "",
    name: "",
    email: "",
    phone: "",
  });
  const update = (k: keyof typeof data) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setData((d) => ({ ...d, [k]: e.target.value }));

  const [submitting, setSubmitting] = useState(false);
  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("projects").insert({
      client_id: user?.id ?? null,
      specialty: data.specialty,
      location: data.location,
      surface: data.surface || null,
      budget: data.budget || null,
      deadline: data.timing || null,
      description: data.description,
      contact_name: data.name,
      contact_email: data.email,
      contact_phone: data.phone,
    });

    if (error) {
      console.error("[projects insert]", error);
      toast.error("Impossible d'envoyer le projet. Réessayez.");
      setSubmitting(false);
      return;
    }

    navigate({ to: "/succes" });
  };

  const canNext =
    (step === 0 && data.specialty && data.location) ||
    (step === 1 && data.description) ||
    step === 2;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-4xl px-6 pb-24 pt-32">
        <Reveal>
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald">
            <ClipboardList className="h-4 w-4" /> Décrivez votre projet
          </span>
          <h1 className="mt-3 font-serif text-4xl md:text-5xl">
            Recevez des devis <span className="italic text-emerald">en 48h</span>
          </h1>
        </Reveal>

        {/* Stepper */}
        <div className="mt-10 flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-1 items-center gap-2">
              <div
                className={`flex h-9 w-9 flex-none items-center justify-center rounded-full text-sm font-semibold transition ${
                  i <= step
                    ? "bg-emerald text-emerald-foreground shadow-glow"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {i < step ? <CheckCircle2 className="h-5 w-5" /> : i + 1}
              </div>
              <span
                className={`hidden text-sm sm:inline ${
                  i === step ? "font-semibold" : "text-muted-foreground"
                }`}
              >
                {s}
              </span>
              {i < STEPS.length - 1 && (
                <div
                  className={`h-px flex-1 ${i < step ? "bg-emerald" : "bg-border"}`}
                />
              )}
            </div>
          ))}
        </div>

        <form
          onSubmit={submit}
          className="mt-10 rounded-3xl border border-border bg-card p-8 shadow-card md:p-12"
        >
          {step === 0 && (
            <div className="space-y-6 animate-fade-in-up">
              <h2 className="font-serif text-2xl">Quel type de chantier ?</h2>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Corps de métier</label>
                <select
                  value={data.specialty}
                  onChange={update("specialty")}
                  className="w-full rounded-lg border border-input bg-background px-3 py-3 text-sm"
                >
                  <option value="">Choisir…</option>
                  {SPECIALTIES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Commune</label>
                <select
                  value={data.location}
                  onChange={update("location")}
                  className="w-full rounded-lg border border-input bg-background px-3 py-3 text-sm"
                >
                  <option value="">Choisir…</option>
                  {COMMUNES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6 animate-fade-in-up">
              <h2 className="font-serif text-2xl">Détails du projet</h2>
              <div className="grid gap-5 md:grid-cols-3">
                <Input label="Surface (m²)" value={data.surface} onChange={update("surface")} />
                <Input
                  label="Budget approximatif"
                  placeholder="ex. 15 000 €"
                  value={data.budget}
                  onChange={update("budget")}
                />
                <Input
                  label="Délai souhaité"
                  placeholder="ex. avant l'été"
                  value={data.timing}
                  onChange={update("timing")}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Description (matériaux, contraintes, attentes…)
                </label>
                <textarea
                  rows={6}
                  value={data.description}
                  onChange={update("description")}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-emerald"
                  placeholder="Décrivez votre projet en quelques phrases."
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-in-up">
              <h2 className="font-serif text-2xl">Vos coordonnées</h2>
              <Input label="Nom complet" required value={data.name} onChange={update("name")} />
              <div className="grid gap-5 md:grid-cols-2">
                <Input
                  label="Email"
                  type="email"
                  required
                  value={data.email}
                  onChange={update("email")}
                />
                <Input
                  label="Téléphone"
                  type="tel"
                  required
                  value={data.phone}
                  onChange={update("phone")}
                />
              </div>
            </div>
          )}

          <div className="mt-10 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={prev}
              disabled={step === 0}
              className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm text-muted-foreground hover:text-foreground disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" /> Retour
            </button>
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={next}
                disabled={!canNext}
                className="inline-flex items-center gap-2 rounded-full bg-emerald px-6 py-3 text-sm font-medium text-emerald-foreground transition hover:bg-emerald/90 disabled:opacity-50"
              >
                Continuer <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground shadow-glow transition hover:scale-105 disabled:opacity-60"
              >
                {submitting ? "Envoi…" : "Envoyer mon projet"} <CheckCircle2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}

function Input({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      <input
        {...props}
        className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-emerald"
      />
    </div>
  );
}
