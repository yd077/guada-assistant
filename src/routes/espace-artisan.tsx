import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";
import { useAuth } from "@/hooks/useAuth";
import { ArtisanDashboard } from "@/components/dashboard/ArtisanDashboard";
import { Loader2, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/espace-artisan")({
  head: () => ({
    meta: [
      { title: "Espace Artisan — Devis Connect" },
      {
        name: "description",
        content:
          "Gérez votre fiche artisan, vos crédits, vos documents et vos demandes de devis.",
      },
      { property: "og:title", content: "Espace Artisan — Devis Connect" },
      {
        property: "og:description",
        content: "Pilotez votre activité artisan sur Devis Connect.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EspaceArtisanPage,
});

function EspaceArtisanPage() {
  const { user, role, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      navigate({ to: "/auth", search: { redirect: "/espace-artisan" } });
      return;
    }
    if (role === "client") {
      navigate({ to: "/espace-client", replace: true });
    }
  }, [loading, isAuthenticated, role, navigate]);

  if (loading || !user || role === "client") {
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
      <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-28 sm:px-6 md:pb-32 md:pt-36">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald">
                Espace Artisan
              </span>
              <h1 className="mt-2 font-serif text-3xl sm:text-4xl md:text-5xl">
                Bonjour{firstName && `, ${firstName}`} 👋
              </h1>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald/10 px-3 py-1.5 text-xs font-medium text-emerald">
              <ShieldCheck className="h-3.5 w-3.5" />
              Compte professionnel
            </span>
          </div>
        </Reveal>

        <div className="mt-10 md:mt-12">
          <ArtisanDashboard userId={user.id} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
