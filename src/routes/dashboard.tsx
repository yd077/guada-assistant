import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";
import { useAuth } from "@/hooks/useAuth";
import { ClientDashboard } from "@/components/dashboard/ClientDashboard";
import { ArtisanDashboard } from "@/components/dashboard/ArtisanDashboard";
import { Loader2, ShieldCheck } from "lucide-react";

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

  const firstName =
    (user.user_metadata?.full_name as string | undefined)?.split(" ")[0] ?? "";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-6 py-32">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald">
                Mon espace
              </span>
              <h1 className="mt-2 font-serif text-4xl md:text-5xl">
                Bonjour{firstName && `, ${firstName}`} 👋
              </h1>
            </div>
            {role && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald/10 px-3 py-1.5 text-xs font-medium text-emerald">
                <ShieldCheck className="h-3.5 w-3.5" />
                {role === "artisan" ? "Espace Artisan" : role === "admin" ? "Admin" : "Client"}
              </span>
            )}
          </div>
        </Reveal>

        <div className="mt-12">
          {role === "artisan" ? (
            <ArtisanDashboard userId={user.id} />
          ) : (
            <ClientDashboard userId={user.id} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
