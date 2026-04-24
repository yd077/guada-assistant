import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Coins, Check, X, ArrowRight } from "lucide-react";
import { fetchCreditPacks, pricePerCredit, type CreditPack } from "@/services/credits";
import { createPackCheckoutSession } from "@/services/stripe.functions";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function RechargeWalletModal({ open, onClose }: Props) {
  const [packs, setPacks] = useState<CreditPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const checkoutFn = useServerFn(createPackCheckoutSession);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetchCreditPacks()
      .then(setPacks)
      .catch((e) => toast.error(e.message ?? "Erreur de chargement"))
      .finally(() => setLoading(false));
  }, [open]);

  if (!open) return null;

  const buy = async (pack: CreditPack) => {
    setBusy(pack.id);
    try {
      const r = await checkoutFn({ data: { packId: pack.id } });
      if (r.url) window.location.href = r.url;
    } catch (e) {
      toast.error(
        (e as Error).message ??
          "Le paiement en ligne n'est pas encore activé. Contactez l'administrateur.",
      );
    } finally {
      setBusy(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm md:items-center"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-border bg-background shadow-elegant"
      >
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-4 top-4 z-10 rounded-full bg-background/80 p-2 text-muted-foreground hover:bg-muted"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="border-b border-border bg-gradient-to-br from-emerald/8 via-card to-card p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald text-emerald-foreground shadow-glow">
              <Coins className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-serif text-2xl">Recharger mon wallet</h2>
              <p className="text-sm text-muted-foreground">
                Achetez un pack de crédits pour débloquer des leads.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-emerald" />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {packs.map((pack) => (
                <article
                  key={pack.id}
                  className={`relative flex flex-col rounded-2xl border p-5 transition ${
                    pack.highlight
                      ? "border-emerald bg-gradient-to-br from-emerald/8 to-card shadow-card"
                      : "border-border bg-card"
                  }`}
                >
                  {pack.highlight && (
                    <span className="absolute right-4 top-4 rounded-full bg-emerald px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-foreground">
                      Top
                    </span>
                  )}
                  <h3 className="font-serif text-lg">{pack.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="font-serif text-3xl text-emerald">
                      {pack.price_eur.toLocaleString("fr-FR")} €
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {pack.credits} crédits ·{" "}
                    {pricePerCredit(pack).toFixed(2).replace(".", ",")} €/cr.
                  </p>
                  <ul className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                    <li className="flex items-start gap-1.5">
                      <Check className="mt-0.5 h-3 w-3 flex-none text-emerald" />
                      Crédits sans expiration
                    </li>
                    <li className="flex items-start gap-1.5">
                      <Check className="mt-0.5 h-3 w-3 flex-none text-emerald" />
                      Facture automatique
                    </li>
                    <li className="flex items-start gap-1.5">
                      <Check className="mt-0.5 h-3 w-3 flex-none text-emerald" />
                      Remboursement si lead invalide
                    </li>
                  </ul>
                  <button
                    onClick={() => buy(pack)}
                    disabled={busy !== null}
                    className="mt-5 inline-flex items-center justify-center gap-1 rounded-full bg-emerald px-4 py-2.5 text-xs font-semibold text-emerald-foreground shadow-glow transition hover:scale-[1.03] disabled:opacity-60"
                  >
                    {busy === pack.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <>
                        Acheter <ArrowRight className="h-3 w-3" />
                      </>
                    )}
                  </button>
                </article>
              ))}
            </div>
          )}

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Paiement sécurisé par Stripe · Vos crédits sont créditées immédiatement après
            confirmation.
          </p>
        </div>
      </div>
    </div>
  );
}
