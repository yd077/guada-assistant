import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Lock, ArrowRight, Loader2, KeyRound } from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Réinitialiser mon mot de passe — BTP Guada" },
      {
        name: "description",
        content:
          "Réinitialisez le mot de passe de votre compte BTP Guada en toute sécurité.",
      },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  // Mode "recovery" quand l'utilisateur revient depuis le lien email.
  const [mode, setMode] = useState<"request" | "update">("request");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash.includes("type=recovery")) setMode("update");
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setMode("update");
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim();
    if (!email) return setError("Email requis");
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) return setError(error.message);
    setInfo(
      "Si un compte existe pour cet email, un lien de réinitialisation vous a été envoyé (l'envoi email sera activé prochainement).",
    );
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password") ?? "");
    const confirm = String(fd.get("confirm") ?? "");
    if (password.length < 6) return setError("6 caractères minimum");
    if (password !== confirm) return setError("Les mots de passe ne correspondent pas");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return setError(error.message);
    setInfo("Mot de passe mis à jour. Redirection…");
    setTimeout(() => navigate({ to: "/" }), 1200);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto flex max-w-md flex-col px-6 py-32">
        <Reveal>
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald">
            <KeyRound className="h-4 w-4" /> Sécurité
          </span>
          <h1 className="mt-2 font-serif text-4xl">
            {mode === "request" ? "Mot de passe oublié" : "Nouveau mot de passe"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "request"
              ? "Entrez votre email : nous vous enverrons un lien de réinitialisation."
              : "Choisissez un nouveau mot de passe pour votre compte."}
          </p>

          {error && (
            <div className="mt-6 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}
          {info && (
            <div className="mt-6 rounded-lg border border-emerald/40 bg-emerald/10 px-4 py-3 text-sm text-emerald">
              {info}
            </div>
          )}

          {mode === "request" ? (
            <form
              onSubmit={handleRequest}
              className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-7 shadow-card"
            >
              <Field icon={<Mail className="h-4 w-4" />} label="Email" name="email" type="email" />
              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald px-6 py-3 font-medium text-emerald-foreground transition hover:bg-emerald/90 disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                Envoyer le lien
              </button>
              <p className="text-center text-xs text-muted-foreground">
                L'envoi email sera activé dès la configuration du serveur SMTP.
              </p>
            </form>
          ) : (
            <form
              onSubmit={handleUpdate}
              className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-7 shadow-card"
            >
              <Field
                icon={<Lock className="h-4 w-4" />}
                label="Nouveau mot de passe"
                name="password"
                type="password"
              />
              <Field
                icon={<Lock className="h-4 w-4" />}
                label="Confirmer le mot de passe"
                name="confirm"
                type="password"
              />
              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald px-6 py-3 font-medium text-emerald-foreground transition hover:bg-emerald/90 disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                Mettre à jour
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link to="/auth" className="text-emerald hover:underline">
              ← Retour à la connexion
            </Link>
          </p>
        </Reveal>
      </main>
      <Footer />
    </div>
  );
}

function Field({
  icon,
  label,
  name,
  type = "text",
}: {
  icon: React.ReactNode;
  label: string;
  name: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
          {icon}
        </span>
        <input
          name={name}
          type={type}
          required
          className="w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-3 text-sm outline-none focus:border-emerald"
        />
      </div>
    </div>
  );
}
