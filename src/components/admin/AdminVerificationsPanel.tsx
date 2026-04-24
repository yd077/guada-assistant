import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Loader2,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  ExternalLink,
  RefreshCcw,
  Check,
  X,
} from "lucide-react";
import {
  adminApproveVerification,
  adminRejectVerification,
  getDocSignedUrl,
} from "@/services/documents";

type ArtisanRow = {
  id: string;
  user_id: string;
  name: string;
  specialty: string;
  location: string;
  kbis_url: string | null;
  insurance_url: string | null;
  verification_status: "pending" | "verified" | "rejected";
  verification_note: string | null;
  created_at: string;
};

export function AdminVerificationsPanel() {
  const [rows, setRows] = useState<ArtisanRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "verified" | "rejected" | "all">(
    "pending",
  );

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase
      .from("artisans")
      .select(
        "id, user_id, name, specialty, location, kbis_url, insurance_url, verification_status, verification_note, created_at",
      )
      .order("created_at", { ascending: false });

    if (filter !== "all") q = q.eq("verification_status", filter);

    const { data } = await q;
    setRows((data ?? []) as ArtisanRow[]);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const openDoc = async (path: string) => {
    const url = await getDocSignedUrl(path);
    if (!url) return toast.error("Lien indisponible");
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const approve = async (id: string) => {
    const r = await adminApproveVerification(id);
    if (!r.ok) return toast.error(r.error ?? "Échec");
    toast.success("Artisan vérifié");
    load();
  };

  const reject = async (id: string) => {
    const note = window.prompt("Motif du refus ?", "Document illisible");
    if (!note) return;
    const r = await adminRejectVerification(id, note);
    if (!r.ok) return toast.error(r.error ?? "Échec");
    toast.success("Refus enregistré");
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {(
            [
              { v: "pending", label: "En attente" },
              { v: "verified", label: "Vérifiés" },
              { v: "rejected", label: "Refusés" },
              { v: "all", label: "Tous" },
            ] as { v: typeof filter; label: string }[]
          ).map((f) => (
            <button
              key={f.v}
              onClick={() => setFilter(f.v)}
              className={`rounded-full border px-3 py-1.5 text-xs ${
                filter === f.v
                  ? "border-emerald bg-emerald/10 text-emerald"
                  : "border-border hover:bg-muted"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs hover:bg-muted"
        >
          <RefreshCcw className="h-3 w-3" /> Actualiser
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-emerald" />
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          Aucun artisan dans cette catégorie.
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <article
              key={r.id}
              className="rounded-2xl border border-border bg-card p-5 shadow-card"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{r.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.specialty} · {r.location}
                  </p>
                </div>
                <StatusBadge status={r.verification_status} />
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <DocLink
                  label="Kbis"
                  path={r.kbis_url}
                  onOpen={() => r.kbis_url && openDoc(r.kbis_url)}
                />
                <DocLink
                  label="Assurance décennale"
                  path={r.insurance_url}
                  onOpen={() => r.insurance_url && openDoc(r.insurance_url)}
                />
              </div>

              {r.verification_note && (
                <p className="mt-3 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                  Note : {r.verification_note}
                </p>
              )}

              <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
                <button
                  onClick={() => reject(r.id)}
                  disabled={!r.kbis_url && !r.insurance_url}
                  className="inline-flex items-center gap-1 rounded-full border border-destructive/40 px-3 py-1 text-xs text-destructive hover:bg-destructive/10 disabled:opacity-40"
                >
                  <X className="h-3 w-3" /> Refuser
                </button>
                <button
                  onClick={() => approve(r.id)}
                  disabled={!r.kbis_url || !r.insurance_url}
                  className="inline-flex items-center gap-1 rounded-full bg-emerald px-3 py-1 text-xs font-semibold text-emerald-foreground hover:bg-emerald/90 disabled:opacity-40"
                >
                  <Check className="h-3 w-3" /> Approuver
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function DocLink({
  label,
  path,
  onOpen,
}: {
  label: string;
  path: string | null;
  onOpen: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-sm">
      <span className="font-medium">{label}</span>
      {path ? (
        <button
          onClick={onOpen}
          className="inline-flex items-center gap-1 text-emerald hover:underline"
        >
          <ExternalLink className="h-3 w-3" /> Ouvrir
        </button>
      ) : (
        <span className="text-xs text-muted-foreground">Non fourni</span>
      )}
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: "pending" | "verified" | "rejected";
}) {
  const map = {
    pending: {
      label: "En attente",
      cls: "bg-amber-100 text-amber-800",
      icon: <ShieldAlert className="h-3 w-3" />,
    },
    verified: {
      label: "Vérifié",
      cls: "bg-emerald/10 text-emerald",
      icon: <ShieldCheck className="h-3 w-3" />,
    },
    rejected: {
      label: "Refusé",
      cls: "bg-destructive/10 text-destructive",
      icon: <ShieldX className="h-3 w-3" />,
    },
  } as const;
  const s = map[status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${s.cls}`}
    >
      {s.icon} {s.label}
    </span>
  );
}
