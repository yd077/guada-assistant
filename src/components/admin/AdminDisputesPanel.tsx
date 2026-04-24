import { useEffect, useState, useCallback } from "react";
import { Loader2, RefreshCcw, Check, X, AlertOctagon } from "lucide-react";
import { toast } from "sonner";
import {
  fetchAllDisputes,
  adminApproveDispute,
  adminRejectDispute,
  DISPUTE_REASON_LABEL,
  type AdminDisputeRow,
  type DisputeStatus,
} from "@/services/disputes";

export function AdminDisputesPanel() {
  const [rows, setRows] = useState<AdminDisputeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<DisputeStatus | "all">("pending");

  const load = useCallback(async () => {
    setLoading(true);
    const all = await fetchAllDisputes();
    setRows(filter === "all" ? all : all.filter((r) => r.status === filter));
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const approve = async (id: string) => {
    const note = window.prompt("Note (optionnel)", "Lead invalide confirmé") ?? undefined;
    const r = await adminApproveDispute(id, note);
    if (!r.ok) return toast.error("Échec");
    toast.success(`Approuvé — +${r.refunded} crédits remboursés`);
    load();
  };

  const reject = async (id: string) => {
    const note = window.prompt("Motif du refus ?", "Lead jugé valide") ?? undefined;
    const r = await adminRejectDispute(id, note);
    if (!r.ok) return toast.error("Échec");
    toast.success("Réclamation refusée");
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {(
            [
              { v: "pending", label: "En attente" },
              { v: "approved", label: "Approuvées" },
              { v: "rejected", label: "Refusées" },
              { v: "all", label: "Toutes" },
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
          Aucune réclamation.
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((d) => {
            const u = d.lead_unlocks;
            const p = u?.projects;
            return (
              <article
                key={d.id}
                className="rounded-2xl border border-border bg-card p-5 shadow-card"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-2 font-semibold">
                      <AlertOctagon className="h-4 w-4 text-amber-600" />
                      {d.artisans?.name ?? "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Motif : <strong>{DISPUTE_REASON_LABEL[d.reason]}</strong>
                    </p>
                  </div>
                  <StatusPill status={d.status} />
                </div>

                {p && (
                  <div className="mt-3 rounded-lg bg-muted/40 p-3 text-sm">
                    <p>
                      <strong>Lead :</strong> {p.contact_name} · {p.specialty} ·{" "}
                      {p.location}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {p.contact_email} · {p.contact_phone}
                    </p>
                    {u && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Débloqué le {new Date(u.unlocked_at).toLocaleDateString("fr-FR")}{" "}
                        · {u.credits_spent} crédits
                      </p>
                    )}
                  </div>
                )}

                {d.description && (
                  <p className="mt-3 whitespace-pre-line text-sm">{d.description}</p>
                )}

                {d.resolved_note && (
                  <p className="mt-2 text-xs italic text-muted-foreground">
                    Décision : {d.resolved_note}
                  </p>
                )}

                {d.status === "pending" && (
                  <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
                    <button
                      onClick={() => reject(d.id)}
                      className="inline-flex items-center gap-1 rounded-full border border-destructive/40 px-3 py-1 text-xs text-destructive hover:bg-destructive/10"
                    >
                      <X className="h-3 w-3" /> Refuser
                    </button>
                    <button
                      onClick={() => approve(d.id)}
                      className="inline-flex items-center gap-1 rounded-full bg-emerald px-3 py-1 text-xs font-semibold text-emerald-foreground hover:bg-emerald/90"
                    >
                      <Check className="h-3 w-3" /> Approuver & rembourser
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: DisputeStatus }) {
  const map = {
    pending: { label: "En attente", cls: "bg-amber-100 text-amber-800" },
    approved: { label: "Approuvée", cls: "bg-emerald/10 text-emerald" },
    rejected: { label: "Refusée", cls: "bg-destructive/10 text-destructive" },
  } as const;
  const s = map[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${s.cls}`}
    >
      {s.label}
    </span>
  );
}
