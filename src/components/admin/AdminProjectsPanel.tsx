import { useState } from "react";
import { toast } from "sonner";
import { Mail, Phone, MapPin } from "lucide-react";
import { type AdminProject, updateProjectStatus } from "@/services/admin";

const STATUS_LABEL: Record<AdminProject["status"], string> = {
  open: "Ouvert",
  in_review: "En cours",
  closed: "Clôturé",
};

const STATUS_TONE: Record<AdminProject["status"], string> = {
  open: "bg-blue-50 text-blue-700",
  in_review: "bg-amber-50 text-amber-700",
  closed: "bg-muted text-muted-foreground",
};

export function AdminProjectsPanel({
  projects,
  onChange,
}: {
  projects: AdminProject[];
  onChange: () => void;
}) {
  const [busyId, setBusyId] = useState<string | null>(null);

  async function setStatus(id: string, status: AdminProject["status"]) {
    setBusyId(id);
    try {
      await updateProjectStatus(id, status);
      toast.success("Statut mis à jour");
      onChange();
    } catch (e) {
      toast.error("Erreur : " + (e as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  if (projects.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-12 text-center text-sm text-muted-foreground">
        Aucun projet pour le moment.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {projects.map((p) => (
        <div
          key={p.id}
          className="rounded-2xl border border-border bg-card p-4 shadow-sm"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold">{p.specialty}</h3>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${STATUS_TONE[p.status]}`}
                >
                  {STATUS_LABEL[p.status]}
                </span>
                {p.budget && (
                  <span className="text-xs text-muted-foreground">
                    Budget : {p.budget}
                  </span>
                )}
              </div>
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" /> {p.location} •{" "}
                {new Date(p.created_at).toLocaleDateString("fr-FR")}
              </p>
              <p className="mt-2 line-clamp-2 text-sm text-foreground/80">
                {p.description}
              </p>
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{p.contact_name}</span>
                <a href={`mailto:${p.contact_email}`} className="inline-flex items-center gap-1 hover:text-emerald">
                  <Mail className="h-3 w-3" /> {p.contact_email}
                </a>
                <a href={`tel:${p.contact_phone}`} className="inline-flex items-center gap-1 hover:text-emerald">
                  <Phone className="h-3 w-3" /> {p.contact_phone}
                </a>
              </div>
            </div>
            <select
              value={p.status}
              disabled={busyId === p.id}
              onChange={(e) => setStatus(p.id, e.target.value as AdminProject["status"])}
              className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs disabled:opacity-50"
            >
              <option value="open">Ouvert</option>
              <option value="in_review">En cours</option>
              <option value="closed">Clôturé</option>
            </select>
          </div>
        </div>
      ))}
    </div>
  );
}
