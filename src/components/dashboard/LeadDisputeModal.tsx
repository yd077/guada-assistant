import { useState } from "react";
import { X, AlertOctagon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  createDispute,
  DISPUTE_REASON_LABEL,
  type DisputeReason,
} from "@/services/disputes";

type Props = {
  open: boolean;
  unlockId: string;
  artisanId: string;
  onClose: () => void;
  onSubmitted: () => void;
};

export function LeadDisputeModal({
  open,
  unlockId,
  artisanId,
  onClose,
  onSubmitted,
}: Props) {
  const [reason, setReason] = useState<DisputeReason>("wrong_number");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const submit = async () => {
    setBusy(true);
    const r = await createDispute({ unlockId, artisanId, reason, description });
    setBusy(false);
    if (!r.ok) {
      toast.error(r.error ?? "Envoi impossible");
      return;
    }
    toast.success("Réclamation envoyée — réponse sous 24h");
    onSubmitted();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-card">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <AlertOctagon className="h-5 w-5 text-amber-600" />
            <h3 className="font-serif text-xl">Signaler ce lead</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-muted"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Si le lead est invalide, vous serez remboursé après vérification (≤ 24h).
        </p>

        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Motif</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as DisputeReason)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
            >
              {(Object.keys(DISPUTE_REASON_LABEL) as DisputeReason[]).map((r) => (
                <option key={r} value={r}>
                  {DISPUTE_REASON_LABEL[r]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Détails (optionnel)
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Précisez ce qui s'est passé (date d'appel, réponse reçue…)"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-full border border-border px-4 py-2 text-sm hover:bg-muted"
          >
            Annuler
          </button>
          <button
            onClick={submit}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-full bg-emerald px-5 py-2 text-sm font-semibold text-emerald-foreground disabled:opacity-50"
          >
            {busy && <Loader2 className="h-3 w-3 animate-spin" />}
            Envoyer la réclamation
          </button>
        </div>
      </div>
    </div>
  );
}
