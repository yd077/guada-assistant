import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Briefcase, Wrench, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Mon espace — BTP Guada" },
      {
        name: "description",
        content: "Gérez vos projets, vos demandes de devis et votre profil.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user, role, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate({ to: "/auth", search: { redirect: "/dashboard" } });
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-emerald" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-5xl px-6 py-32">
        <Reveal>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald">
            Mon espace
          </span>
          <h1 className="mt-2 font-serif text-4xl md:text-5xl">
            Bonjour
            {user.user_metadata?.full_name
              ? `, ${(user.user_metadata.full_name as string).split(" ")[0]}`
              : ""}{" "}
            👋
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Votre tableau de bord arrive très bientôt. Vous pourrez y suivre vos projets,
            consulter vos demandes de devis et gérer votre profil.
          </p>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <Card icon={<Briefcase />} title="Mes projets" desc="Suivez vos demandes envoyées." />
            <Card icon={<Wrench />} title="Mes devis" desc="Réponses des artisans." />
            <Card
              icon={<ShieldCheck />}
              title={`Rôle : ${role ?? "—"}`}
              desc="Votre profil sur la plateforme."
            />
          </div>

          <div className="mt-10 flex gap-3">
            <Link
              to="/recherche"
              className="rounded-full bg-emerald px-6 py-3 text-sm font-medium text-emerald-foreground shadow-glow"
            >
              Trouver un artisan
            </Link>
            <Link
              to="/projet"
              className="rounded-full border border-border bg-card px-6 py-3 text-sm font-medium hover:bg-muted"
            >
              Soumettre un projet
            </Link>
          </div>
        </Reveal>
      </main>
      <Footer />
    </div>
  );
}

function Card({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald/10 text-emerald">
        {icon}
      </div>
      <p className="mt-4 font-serif text-lg">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}
