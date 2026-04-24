import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { CheckCircle2, ChevronRight, Mail, Loader2, RefreshCcw } from "lucide-react";
import {
  verifyProjectOtp,
  sendProjectOtp,
  notifyArtisansOfNewLead,
} from "@/services/projet.functions";

export const Route = createFileRoute("/succes")({
  validateSearch: (s: Record<string, unknown>) => ({
    token: typeof s.token === "string" ? s.token : undefined,
    email: typeof s.email === "string" ? s.email : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Demande envoyée — BTP Guada" },
      {
        name: "description",
        content:
          "Votre demande a bien été transmise. Validez votre email pour la rendre visible aux artisans.",
      },
    ],
  }),
  component: SuccessPage,
});

function SuccessPage() {
  const { token, email } = Route.useSearch();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);
  const [verified, setVerified] = useState(false);
  const verifyFn = useServerFn(verifyProjectOtp);
  const resendFn = useServerFn(sendProjectOtp);
  const notifyFn = useServerFn(notifyArtisansOfNewLead);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!/^\d{6}$/.test(code)) {
      toast.error("Saisissez les 6 chiffres reçus par email.");
      return;
    }
    setBusy(true);
    try {
      const r = await verifyFn({ data: { token, code } });
      if (r.ok) {
        setVerified(true);
        toast.success("Email vérifié, votre demande est diffusée.");
        // Notifier les artisans matchant
        try {
          // On a besoin du projectId : on le récupère via une query côté client
          const { supabase } = await import("@/integrations/supabase/client");
          const { data: p } = await supabase
            .from("projects")
            .select("id")
            .eq("contact_email", email ?? "")
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          if (p?.id) await notifyFn({ data: { projectId: p.id } });
        } catch {
          /* non bloquant */
        }
      } else {
        const msg =
          r.reason === "expired"
            ? "Code expiré. Demandez-en un nouveau."
            : r.reason === "wrong_code"
              ? "Code incorrect."
              : r.reason === "too_many_attempts"
                ? "Trop de tentatives. Demandez un nouveau code."
                : "Vérification impossible.";
        toast.error(msg);
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    if (!token) return;
    setResending(true);
    try {
      await resendFn({ data: { token } });
      toast.success("Nouveau code envoyé.");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setResending(false);
    }
  };

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

          {verified ? (
            <>
              <p className="mt-4 text-lg text-muted-foreground">
                Votre projet est désormais visible par nos artisans qualifiés. Vous
                recevrez les premiers devis sous 48h.
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
            </>
          ) : token ? (
            <>
              <p className="mt-4 text-muted-foreground">
                Pour valider votre demande, saisissez le code à 6 chiffres envoyé à{" "}
                <strong className="text-foreground">{email ?? "votre email"}</strong>.
              </p>
              <form
                onSubmit={submit}
                className="mt-8 rounded-2xl border border-emerald/30 bg-emerald/5 p-6"
              >
                <div className="flex justify-center">
                  <Mail className="h-6 w-6 text-emerald" />
                </div>
                <input
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="••••••"
                  className="mt-4 w-full rounded-xl border-2 border-border bg-background px-4 py-3 text-center font-mono text-3xl tracking-[0.6em] outline-none focus:border-emerald"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={busy || code.length !== 6}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald px-6 py-3 text-sm font-semibold text-emerald-foreground shadow-glow transition hover:scale-[1.02] disabled:opacity-50"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Valider mon email"}
                </button>
                <button
                  type="button"
                  onClick={resend}
                  disabled={resending}
                  className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  {resending ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <RefreshCcw className="h-3 w-3" />
                  )}
                  Renvoyer un code
                </button>
              </form>
              <p className="mt-4 text-xs text-muted-foreground">
                Vous ne recevez rien ? Vérifiez vos spams ou{" "}
                <Link to="/contact" className="text-emerald hover:underline">
                  contactez-nous
                </Link>
                .
              </p>
            </>
          ) : (
            <>
              <p className="mt-4 text-lg text-muted-foreground">
                Merci ! Votre projet a bien été transmis. Les artisans qualifiés vous
                répondront sous 48h par email.
              </p>
              <div className="mt-10 flex flex-wrap justify-center gap-3">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 rounded-full bg-emerald px-6 py-3 text-sm font-medium text-emerald-foreground hover:bg-emerald/90"
                >
                  Retour à l'accueil
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
