import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, XCircle, ArrowRight } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/verifier-email/$token")({
  head: () => ({
    meta: [
      { title: "Vérification de votre email — BTP Guada" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const { token } = Route.useParams();
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.rpc("verify_project_email", { _token: token });
      if (cancelled) return;
      if (error || !data || !Array.isArray(data) || data.length === 0 || !data[0].ok) {
        setState("error");
        return;
      }
      setEmail(data[0].contact_email);
      setState("ok");
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-2xl px-6 py-32">
        <div className="rounded-3xl border border-border bg-card p-10 text-center shadow-card">
          {state === "loading" && (
            <>
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-emerald" />
              <h1 className="mt-6 font-serif text-3xl">Vérification…</h1>
              <p className="mt-2 text-muted-foreground">Un instant, on confirme votre email.</p>
            </>
          )}
          {state === "ok" && (
            <>
              <CheckCircle2 className="mx-auto h-14 w-14 text-emerald" />
              <h1 className="mt-6 font-serif text-3xl">Email confirmé ✓</h1>
              <p className="mt-3 text-muted-foreground">
                Merci ! Votre demande {email && <span className="font-medium">({email})</span>}{" "}
                est maintenant validée et visible par les artisans qualifiés.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Vous recevrez les premiers retours sous 48h.
              </p>
              <Link
                to="/"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-emerald px-6 py-3 text-sm font-medium text-emerald-foreground shadow-glow transition hover:scale-105"
              >
                Retour à l'accueil <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          )}
          {state === "error" && (
            <>
              <XCircle className="mx-auto h-14 w-14 text-destructive" />
              <h1 className="mt-6 font-serif text-3xl">Lien invalide ou expiré</h1>
              <p className="mt-3 text-muted-foreground">
                Ce lien de vérification n'est plus valable. Soumettez à nouveau votre projet
                pour recevoir un nouveau lien.
              </p>
              <Link
                to="/projet"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-emerald px-6 py-3 text-sm font-medium text-emerald-foreground shadow-glow transition hover:scale-105"
              >
                Soumettre un projet <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
