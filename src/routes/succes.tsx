import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { CheckCircle2, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/succes")({
  validateSearch: (s: Record<string, unknown>): { token?: string; email?: string } => ({
    token: typeof s.token === "string" ? s.token : undefined,
    email: typeof s.email === "string" ? s.email : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Demande envoyée — BTP Guada" },
      {
        name: "description",
        content:
          "Votre demande a bien été transmise. Vous recevrez les premiers devis sous 48h.",
      },
    ],
  }),
  component: SuccessPage,
});

function SuccessPage() {
  const { email } = Route.useSearch();
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex flex-1 items-center justify-center px-6 pt-28">
        <div className="w-full max-w-xl text-center animate-fade-in-up">
          <div className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald text-emerald-foreground shadow-glow">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h1 className="mt-8 font-serif text-4xl md:text-5xl">
            Demande <span className="italic text-emerald">envoyée</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Merci ! Votre projet est désormais visible par nos artisans qualifiés.
            {email ? (
              <>
                {" "}Vous serez recontacté·e à{" "}
                <strong className="text-foreground">{email}</strong> sous 48h.
              </>
            ) : (
              <> Vous recevrez les premiers devis sous 48h.</>
            )}
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full bg-emerald px-6 py-3 text-sm font-medium text-emerald-foreground hover:bg-emerald/90"
            >
              Retour à l'accueil
            </Link>
            <Link
              to="/recherche"
              className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium hover:bg-muted"
            >
              Parcourir les artisans <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
