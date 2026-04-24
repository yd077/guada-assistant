import { useState } from "react";
import { Check, X, Trash2, ShieldCheck, Clock, Ban, Search } from "lucide-react";
import { toast } from "sonner";
import {
  type AdminArtisan,
  updateArtisanStatus,
  deleteArtisan,
} from "@/services/admin";

type Props = {
  artisans: AdminArtisan[];
  onChange: () => void;
};

const STATUS_TABS: { value: "pending" | "verified" | "rejected" | "all"; label: string }[] = [
  { value: "pending", label: "En attente" },
  { value: "verified", label: "Vérifiés" },
  { value: "rejected", label: "Rejetés" },
  { value: "all", label: "Tous" },
];

export function AdminArtisansPanel({ artisans, onChange }: Props) {
  const [tab, setTab] = useState<"pending" | "verified" | "rejected" | "all">("pending");
  const [q, setQ] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = artisans.filter((a) => {
    if (tab !== "all" && a.status !== tab) return false;
    if (!q) return true;
    const needle = q.toLowerCase();
    return (
      a.name.toLowerCase().includes(needle) ||
      a.specialty.toLowerCase().includes(needle) ||
      a.location.toLowerCase().includes(needle)
    );
  });

  const counts = {
    pending: artisans.filter((a) => a.status === "pending").length,
    verified: artisans.filter((a) => a.status === "verified").length,
    rejected: artisans.filter((a) => a.status === "rejected").length,
    all: artisans.length,
  };

  async function handleStatus(id: string, status: "verified" | "rejected" | "pending") {
    setBusyId(id);
    try {
      await updateArtisanStatus(id, status);
      toast.success(
        status === "verified"
          ? "Artisan validé"
          : status === "rejected"
            ? "Artisan rejeté"
            : "Remis en attente",
      );
      onChange();
    } catch (e) {
      toast.error("Erreur : " + (e as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer définitivement cet artisan ?")) return;
    setBusyId(id);
    try {
      await deleteArtisan(id);
      toast.success("Artisan supprimé");
      onChange();
    } catch (e) {
      toast.error("Erreur : " + (e as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex flex-col gap-4 border-b border-border p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-1">
          {STATUS_TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                tab === t.value
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:bg-muted/70"
              }`}
            >
              {t.label}
              <span className="ml-1.5 opacity-70">({counts[t.value]})</span>
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher…"
            className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="px-4 py-12 text-center text-sm text-muted-foreground">
          Aucun artisan dans cette catégorie.
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {filtered.map((a) => (
            <li key={a.id} className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:gap-4">
              <img
                src={
                  a.avatar_url ||
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80"
                }
                alt={a.name}
                className="h-12 w-12 rounded-full object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{a.name}</p>
                  <StatusBadge status={a.status} />
                </div>
                <p className="truncate text-sm text-muted-foreground">
                  {a.specialty} • {a.location} • {a.experience_years ?? 0} ans
                </p>
                {a.bio && (
                  <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{a.bio}</p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {a.status !== "verified" && (
                  <button
                    disabled={busyId === a.id}
                    onClick={() => handleStatus(a.id, "verified")}
                    className="inline-flex items-center gap-1 rounded-lg bg-emerald px-3 py-1.5 text-xs font-medium text-emerald-foreground hover:opacity-90 disabled:opacity-50"
                  >
                    <Check className="h-3.5 w-3.5" /> Valider
                  </button>
                )}
                {a.status !== "rejected" && (
                  <button
                    disabled={busyId === a.id}
                    onClick={() => handleStatus(a.id, "rejected")}
                    className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-50"
                  >
                    <X className="h-3.5 w-3.5" /> Rejeter
                  </button>
                )}
                {a.status !== "pending" && (
                  <button
                    disabled={busyId === a.id}
                    onClick={() => handleStatus(a.id, "pending")}
                    className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-50"
                  >
                    <Clock className="h-3.5 w-3.5" /> En attente
                  </button>
                )}
                <button
                  disabled={busyId === a.id}
                  onClick={() => handleDelete(a.id)}
                  className="inline-flex items-center gap-1 rounded-lg border border-destructive/30 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: AdminArtisan["status"] }) {
  if (status === "verified")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald">
        <ShieldCheck className="h-3 w-3" /> Vérifié
      </span>
    );
  if (status === "rejected")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-destructive">
        <Ban className="h-3 w-3" /> Rejeté
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-700">
      <Clock className="h-3 w-3" /> En attente
    </span>
  );
}
