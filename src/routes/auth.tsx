import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Mail, Lock, User, Phone, ArrowRight, Loader2 } from "lucide-react";

const searchSchema = z.object({
  redirect: z.string().optional(),
  mode: z.enum(["signin", "signup"]).optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Connexion / Inscription — BTP Guada" },
      {
        name: "description",
        content:
          "Connectez-vous ou créez un compte pour gérer vos projets et demandes de devis sur BTP Guada.",
      },
    ],
  }),
  component: AuthPage,
});

const signInSchema = z.object({
  email: z.string().trim().email("Email invalide").max(255),
  password: z.string().min(6, "6 caractères minimum").max(72),
});

const signUpSchema = z.object({
  fullName: z.string().trim().min(2, "Nom requis").max(100),
  phone: z
    .string()
    .trim()
    .min(8, "Téléphone invalide")
    .max(20)
    .regex(/^[0-9+\s().-]+$/, "Format invalide"),
  email: z.string().trim().email("Email invalide").max(255),
  password: z.string().min(6, "6 caractères minimum").max(72),
  role: z.enum(["client", "artisan"]),
});

function AuthPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<"signin" | "signup">(search.mode ?? "signin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate({ to: search.redirect ?? "/" });
    }
  }, [authLoading, isAuthenticated, navigate, search.redirect]);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    const fd = new FormData(e.currentTarget);
    const parsed = signInSchema.safeParse({
      email: fd.get("email"),
      password: fd.get("password"),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setLoading(false);
    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "Email ou mot de passe incorrect."
          : error.message,
      );
      return;
    }
    navigate({ to: search.redirect ?? "/" });
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    const fd = new FormData(e.currentTarget);
    const parsed = signUpSchema.safeParse({
      fullName: fd.get("fullName"),
      phone: fd.get("phone"),
      email: fd.get("email"),
      password: fd.get("password"),
      role: fd.get("role"),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: parsed.data.fullName,
          phone: parsed.data.phone,
          role: parsed.data.role,
        },
      },
    });
    setLoading(false);
    if (error) {
      setError(
        error.message === "User already registered"
          ? "Un compte existe déjà avec cet email. Connectez-vous."
          : error.message,
      );
      return;
    }
    setInfo(
      "Compte créé. Si la confirmation email est activée, vérifiez votre boîte. Sinon vous êtes déjà connecté·e.",
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto flex max-w-md flex-col px-6 py-32">
        <Reveal>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald">
            Espace personnel
          </span>
          <h1 className="mt-2 font-serif text-4xl">
            {tab === "signin" ? "Connexion" : "Créer un compte"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {tab === "signin"
              ? "Accédez à votre tableau de bord et suivez vos projets."
              : "Rejoignez la communauté BTP Guada en quelques secondes."}
          </p>

          <div className="mt-8 grid grid-cols-2 gap-1 rounded-full border border-border bg-card p-1 text-sm">
            <button
              type="button"
              onClick={() => setTab("signin")}
              className={`rounded-full px-4 py-2 font-medium transition ${
                tab === "signin"
                  ? "bg-emerald text-emerald-foreground shadow-glow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Connexion
            </button>
            <button
              type="button"
              onClick={() => setTab("signup")}
              className={`rounded-full px-4 py-2 font-medium transition ${
                tab === "signup"
                  ? "bg-emerald text-emerald-foreground shadow-glow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Inscription
            </button>
          </div>

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

          {tab === "signin" ? (
            <form
              onSubmit={handleSignIn}
              className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-7 shadow-card"
            >
              <Field icon={<Mail className="h-4 w-4" />} label="Email" name="email" type="email" />
              <Field
                icon={<Lock className="h-4 w-4" />}
                label="Mot de passe"
                name="password"
                type="password"
              />
              <SubmitBtn loading={loading}>Se connecter</SubmitBtn>
            </form>
          ) : (
            <form
              onSubmit={handleSignUp}
              className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-7 shadow-card"
            >
              <Field
                icon={<User className="h-4 w-4" />}
                label="Nom complet"
                name="fullName"
              />
              <Field
                icon={<Phone className="h-4 w-4" />}
                label="Téléphone"
                name="phone"
                type="tel"
              />
              <Field
                icon={<Mail className="h-4 w-4" />}
                label="Email"
                name="email"
                type="email"
              />
              <Field
                icon={<Lock className="h-4 w-4" />}
                label="Mot de passe"
                name="password"
                type="password"
                hint="6 caractères minimum"
              />
              <div>
                <label className="mb-1.5 block text-sm font-medium">Je suis…</label>
                <div className="grid grid-cols-2 gap-2">
                  <RoleRadio value="client" label="Client" defaultChecked />
                  <RoleRadio value="artisan" label="Artisan" />
                </div>
              </div>
              <SubmitBtn loading={loading}>Créer mon compte</SubmitBtn>
              <p className="text-center text-xs text-muted-foreground">
                En vous inscrivant, vous acceptez nos conditions générales d'utilisation.
              </p>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link to="/" className="text-emerald hover:underline">
              ← Retour à l'accueil
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
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  name: string;
  type?: string;
  hint?: string;
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
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function RoleRadio({
  value,
  label,
  defaultChecked,
}: {
  value: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-input bg-background px-3 py-2.5 text-sm font-medium hover:border-emerald has-[:checked]:border-emerald has-[:checked]:bg-emerald/10 has-[:checked]:text-emerald">
      <input
        type="radio"
        name="role"
        value={value}
        defaultChecked={defaultChecked}
        className="sr-only"
      />
      {label}
    </label>
  );
}

function SubmitBtn({
  loading,
  children,
}: {
  loading: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald px-6 py-3 font-medium text-emerald-foreground transition hover:bg-emerald/90 disabled:opacity-60"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <ArrowRight className="h-4 w-4" />
      )}
      {children}
    </button>
  );
}
