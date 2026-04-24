import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";
import { SPECIALTIES, COMMUNES } from "@/data/artisans";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  User,
  Building2,
  Briefcase,
  Home,
} from "lucide-react";

export const Route = createFileRoute("/projet")({
  head: () => ({
    meta: [
      { title: "Soumettre un projet BTP — BTP Guada" },
      {
        name: "description",
        content:
          "Décrivez votre projet en 4 étapes et recevez plusieurs devis d'artisans vérifiés en Guadeloupe.",
      },
      { property: "og:title", content: "Soumettre un projet — BTP Guada" },
      {
        property: "og:description",
        content: "4 étapes pour recevoir des devis d'artisans BTP vérifiés en Guadeloupe.",
      },
    ],
  }),
  component: ProjectPage,
});

const STEPS = ["Profil", "Type de projet", "Détails", "Coordonnées"] as const;

type ClientType = "particulier" | "entreprise" | "agence" | "syndic";

const PROFILES: {
  value: ClientType;
  title: string;
  desc: string;
  icon: typeof User;
}[] = [
  {
    value: "particulier",
    title: "Particulier",
    desc: "Je suis propriétaire ou occupant pour un projet personnel.",
    icon: User,
  },
  {
    value: "entreprise",
    title: "Entreprise",
    desc: "Je représente une société (commerce, hôtel, bureau…).",
    icon: Building2,
  },
  {
    value: "agence",
    title: "Agence immobilière",
    desc: "Je gère un bien pour le compte d'un client.",
    icon: Briefcase,
  },
  {
    value: "syndic",
    title: "Syndic / copropriété",
    desc: "Je gère une copropriété ou un parc immobilier.",
    icon: Home,
  },
];

function ProjectPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    client_type: "" as ClientType | "",
    company_name: "",
    internal_ref: "",
    managed_units: "",
    desired_sla: "",
    urgency_level: "normal" as "normal" | "urgent" | "sos",
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

  const update =
    (k: keyof typeof data) =>
    (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ) =>
      setData((d) => ({ ...d, [k]: e.target.value }));

  const isPro = data.client_type && data.client_type !== "particulier";

  const [submitting, setSubmitting] = useState(false);
  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Géocodage commune (silencieux)
    let project_lat: number | null = null;
    let project_lng: number | null = null;
    try {
      const { geocodeAddress } = await import("@/services/geocoding");
      const r = await geocodeAddress(data.location);
      if (r) {
        project_lat = r.lat;
        project_lng = r.lng;
      }
    } catch {
      // pas bloquant
    }

    // Token de vérification email (lien magique)
    const email_verification_token =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID().replace(/-/g, "") +
          Math.random().toString(36).slice(2, 10)
        : Math.random().toString(36).slice(2) + Date.now().toString(36);

    const basePayload = {
      client_id: user?.id ?? null,
      client_type: data.client_type || "particulier",
      company_name: isPro ? data.company_name || null : null,
      internal_ref: isPro ? data.internal_ref || null : null,
      managed_units: isPro && data.managed_units ? Number(data.managed_units) : null,
      desired_sla: isPro ? data.desired_sla || null : null,
      urgency_level: data.urgency_level,
      specialty: data.specialty,
      location: data.location,
      surface: data.surface || null,
      budget: data.budget || null,
      deadline: data.timing || null,
      description: data.description,
      contact_name: data.name,
      contact_email: data.email,
      contact_phone: data.phone,
      email_verified: false,
      email_verification_token,
      email_verification_sent_at: new Date().toISOString(),
    };

    let { error } = await supabase
      .from("projects")
      .insert({ ...basePayload, project_lat, project_lng });

    // Fallback si colonnes geo absentes
    if (error && /project_lat|project_lng/.test(error.message)) {
      const r = await supabase.from("projects").insert(basePayload);
      error = r.error;
    }

    // Fallback si colonnes email_verified absentes (migration non encore appliquée)
    if (
      error &&
      /email_verified|email_verification/.test(error.message)
    ) {
      const noEmail = { ...basePayload };
      delete (noEmail as Record<string, unknown>).email_verified;
      delete (noEmail as Record<string, unknown>).email_verification_token;
      delete (noEmail as Record<string, unknown>).email_verification_sent_at;
      const r = await supabase.from("projects").insert(noEmail);
      error = r.error;
    }

    // Fallback si colonnes urgency/managed/sla absentes
    if (
      error &&
      /urgency_level|managed_units|desired_sla/.test(error.message)
    ) {
      const noUrgency: Record<string, unknown> = { ...basePayload };
      delete noUrgency.urgency_level;
      delete noUrgency.managed_units;
      delete noUrgency.desired_sla;
      const r = await supabase.from("projects").insert(noUrgency);
      error = r.error;
    }

    // Fallback si colonnes multi-profils absentes
    if (
      error &&
      /client_type|internal_ref|company_name|phone_verified/.test(error.message)
    ) {
      const legacy = {
        client_id: basePayload.client_id,
        specialty: basePayload.specialty,
        location: basePayload.location,
        surface: basePayload.surface,
        budget: basePayload.budget,
        deadline: basePayload.deadline,
        description: basePayload.description,
        contact_name: basePayload.contact_name,
        contact_email: basePayload.contact_email,
        contact_phone: basePayload.contact_phone,
      };
      const r = await supabase.from("projects").insert(legacy);
      error = r.error;
    }

    if (error) {
      console.error("[projects insert]", error);
      toast.error("Impossible d'envoyer le projet. Réessayez.");
      setSubmitting(false);
      return;
    }

    navigate({ to: "/succes" });
  };

  const canNext =
    (step === 0 && data.client_type) ||
    (step === 1 && data.specialty && data.location) ||
    (step === 2 && data.description) ||
    step === 3;

  return (
    <div className="min-h-screen bg-background pb-32 md:pb-0">
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
          className="mt-10 rounded-3xl border border-border bg-card p-6 shadow-card md:p-12"
        >
          {/* Étape 0 — Profil */}
          {step === 0 && (
            <div className="space-y-6 animate-fade-in-up">
              <h2 className="font-serif text-2xl">Vous êtes…</h2>
              <p className="text-sm text-muted-foreground">
                Sélectionnez le profil qui vous correspond pour adapter votre demande.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {PROFILES.map((p) => {
                  const Icon = p.icon;
                  const active = data.client_type === p.value;
                  return (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setData((d) => ({ ...d, client_type: p.value }))}
                      className={`group flex items-start gap-3 rounded-2xl border p-4 text-left transition ${
                        active
                          ? "border-emerald bg-emerald/5 shadow-glow"
                          : "border-border bg-card hover:border-emerald/50 hover:bg-emerald/5"
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 flex-none items-center justify-center rounded-xl transition ${
                          active
                            ? "bg-emerald text-emerald-foreground"
                            : "bg-muted text-foreground group-hover:bg-emerald/10 group-hover:text-emerald"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{p.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{p.desc}</p>
                      </div>
                      {active && (
                        <CheckCircle2 className="h-5 w-5 flex-none text-emerald" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Étape 1 — Type de chantier */}
          {step === 1 && (
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

          {/* Étape 2 — Détails */}
          {step === 2 && (
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

          {/* Étape 3 — Coordonnées */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in-up">
              <h2 className="font-serif text-2xl">Vos coordonnées</h2>

              {isPro && (
                <div className="grid gap-5 rounded-2xl border border-emerald/30 bg-emerald/5 p-4 md:grid-cols-2">
                  <Input
                    label={
                      data.client_type === "syndic"
                        ? "Nom du syndic / copropriété"
                        : data.client_type === "agence"
                          ? "Nom de l'agence"
                          : "Raison sociale"
                    }
                    required
                    value={data.company_name}
                    onChange={update("company_name")}
                  />
                  <Input
                    label="Référence interne (optionnel)"
                    placeholder="ex. DOSS-2025-042"
                    value={data.internal_ref}
                    onChange={update("internal_ref")}
                  />
                </div>
              )}

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

          {/* Boutons desktop */}
          <div className="mt-10 hidden items-center justify-between gap-4 md:flex">
            <NavButtons
              step={step}
              total={STEPS.length}
              canNext={!!canNext}
              submitting={submitting}
              onPrev={prev}
              onNext={next}
            />
          </div>

          {/* Boutons sticky mobile (dans le form pour que submit fonctionne) */}
          <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 px-4 py-3 backdrop-blur md:hidden">
            <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
              <NavButtons
                step={step}
                total={STEPS.length}
                canNext={!!canNext}
                submitting={submitting}
                onPrev={prev}
                onNext={next}
                compact
              />
            </div>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}

function NavButtons({
  step,
  total,
  canNext,
  submitting,
  onPrev,
  onNext,
  compact,
}: {
  step: number;
  total: number;
  canNext: boolean;
  submitting: boolean;
  onPrev: () => void;
  onNext: () => void;
  compact?: boolean;
}) {
  return (
    <>
      <button
        type="button"
        onClick={onPrev}
        disabled={step === 0}
        className={`inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm text-muted-foreground hover:text-foreground disabled:opacity-40 ${
          compact ? "" : ""
        }`}
      >
        <ArrowLeft className="h-4 w-4" /> Retour
      </button>
      {step < total - 1 ? (
        <button
          type="button"
          onClick={onNext}
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
    </>
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
