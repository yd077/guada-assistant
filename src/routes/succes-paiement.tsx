import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";
import { CheckCircle2, ArrowRight, Wallet, Crown } from "lucide-react";

export const Route = createFileRoute("/succes-paiement")({
  validateSearch: (s: Record<string, unknown>) => ({
    session_id: typeof s.session_id === "string" ? s.session_id : undefined,
    kind: s.kind === "subscription" ? "subscription" : "credits",
  }),
  head: () => ({
    meta: [
      { title: "Paiement confirmé — BTP Guada" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SuccessPage,
});

function SuccessPage() {
  const { kind } = Route.useSearch();
  const isSub = kind === "subscription";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-32">
        <Reveal>
          <div className="rounded-3xl border border-emerald/30 bg-gradient-to-br from-emerald/8 via-card to-card p-12 text-center shadow-card">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald text-emerald-foreground shadow-glow">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h1 className="font-serif text-4xl">
              {isSub ? "Abonnement activé !" : "Paiement confirmé !"}
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              {isSub ? (
                <>
                  Votre abonnement est actif. Vous bénéficiez désormais d'un accès
                  prioritaire aux nouveaux leads et d'un rayon d'intervention élargi.
                </>
              ) : (
                <>
                  Vos crédits ont été ajoutés à votre wallet. Vous pouvez dès à présent
                  débloquer de nouveaux leads.
                </>
              )}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald px-5 py-3 text-sm font-semibold text-emerald-foreground shadow-glow transition hover:scale-[1.03]"
              >
                {isSub ? <Crown className="h-4 w-4" /> : <Wallet className="h-4 w-4" />}
                Aller au dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/tarifs"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-5 py-3 text-sm font-medium hover:bg-muted"
              >
                Voir les autres formules
              </Link>
            </div>

            <p className="mt-8 text-xs text-muted-foreground">
              Une facture vous sera envoyée par email automatiquement. Si vous ne la
              recevez pas sous 10 minutes,{" "}
              <Link to="/contact" className="text-emerald hover:underline">
                contactez-nous
              </Link>
              .
            </p>
          </div>
        </Reveal>
      </main>
      <Footer />
    </div>
  );
}
