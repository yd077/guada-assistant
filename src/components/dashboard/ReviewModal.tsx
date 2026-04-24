import { useState } from "react";
import { Star, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { submitReview } from "@/services/reviews";

type Props = {
  artisanId: string;
  artisanName: string;
  open: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
};

export function ReviewModal({ artisanId, artisanName, open, onClose, onSubmitted }: Props) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const r = await submitReview({ artisanId, rating, comment });
    setBusy(false);
    if (!r.ok) {
      toast.error(r.error ?? "Envoi impossible");
      return;
    }
    toast.success("Merci pour votre avis !");
    onSubmitted?.();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
          aria-label="Fermer"
        >
          <X className="h-5 w-5" />
        </button>
        <h2 className="font-serif text-2xl">Donnez votre avis</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Sur le travail réalisé par <strong>{artisanName}</strong>.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-5">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Note
            </label>
            <div className="mt-2 flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className="p-1"
                  aria-label={`${n} étoile${n > 1 ? "s" : ""}`}
                >
                  <Star
                    className={`h-7 w-7 transition ${
                      n <= rating
                        ? "fill-accent text-accent"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Commentaire (optionnel)
            </label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Qualité du travail, respect des délais, communication…"
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-emerald"
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald px-5 py-3 text-sm font-medium text-emerald-foreground disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Star className="h-4 w-4" />}
            Publier l'avis
          </button>
        </form>
      </div>
    </div>
  );
}
