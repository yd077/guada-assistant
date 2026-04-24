import { Link } from "@tanstack/react-router";
import { Check, Circle, ArrowRight, Sparkles } from "lucide-react";

type StepStatus = "done" | "todo";

type Step = {
  key: string;
  label: string;
  status: StepStatus;
  cta?: string;
};

type Props = {
  hasProfile: boolean;
  hasZone: boolean;
  hasDocs: boolean;
  isVerified: boolean;
  hasTierChoice: boolean;
};

export function ArtisanOnboardingChecklist({
  hasProfile,
  hasZone,
  hasDocs,
  isVerified,
  hasTierChoice,
}: Props) {
  const steps: Step[] = [
    {
      key: "profile",
      label: "Compléter ma fiche (nom, métier, bio)",
      status: hasProfile ? "done" : "todo",
    },
    {
      key: "zone",
      label: "Définir ma zone d'intervention",
      status: hasZone ? "done" : "todo",
    },
    {
      key: "docs",
      label: "Téléverser Kbis + assurance décennale",
      status: hasDocs ? "done" : "todo",
    },
    {
      key: "verify",
      label: "Validation par notre équipe",
      status: isVerified ? "done" : "todo",
    },
    {
      key: "tier",
      label: "Choisir mon abonnement (Standard/Premium/Élite)",
      status: hasTierChoice ? "done" : "todo",
    },
  ];

  const done = steps.filter((s) => s.status === "done").length;
  const total = steps.length;
  const progress = Math.round((done / total) * 100);

  if (done === total) {
    return (
      <div className="rounded-2xl border border-emerald/30 bg-emerald/5 p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald text-emerald-foreground">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <p className="font-serif text-lg">Profil complet — vous êtes prêt !</p>
            <p className="text-xs text-muted-foreground">
              Vous pouvez débloquer des leads et recevoir des demandes.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/5 via-card to-card p-6 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">
            Activation du compte
          </p>
          <h3 className="mt-1 font-serif text-2xl">
            Encore {total - done} étape{total - done > 1 ? "s" : ""} pour activer
            votre compte
          </h3>
        </div>
        <div className="text-right">
          <p className="font-serif text-3xl text-emerald">{progress}%</p>
          <p className="text-xs text-muted-foreground">
            {done}/{total} étapes
          </p>
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-emerald transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <ul className="mt-5 space-y-2">
        {steps.map((s) => (
          <li
            key={s.key}
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
              s.status === "done"
                ? "border-emerald/30 bg-emerald/5"
                : "border-border bg-background"
            }`}
          >
            {s.status === "done" ? (
              <Check className="h-5 w-5 flex-none text-emerald" />
            ) : (
              <Circle className="h-5 w-5 flex-none text-muted-foreground" />
            )}
            <span
              className={`flex-1 text-sm ${
                s.status === "done"
                  ? "text-muted-foreground line-through"
                  : "font-medium"
              }`}
            >
              {s.label}
            </span>
            {s.key === "tier" && s.status === "todo" && (
              <Link
                to="/abonnements"
                className="inline-flex items-center gap-1 rounded-full bg-emerald px-3 py-1 text-xs font-semibold text-emerald-foreground hover:bg-emerald/90"
              >
                Choisir <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
