import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { Loader2, ShieldAlert, RefreshCw } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";
import { useAuth } from "@/hooks/useAuth";
import { AdminStats } from "@/components/admin/AdminStats";
import { AdminArtisansPanel } from "@/components/admin/AdminArtisansPanel";
import { AdminProjectsPanel } from "@/components/admin/AdminProjectsPanel";
import { AdminQuoteRequestsPanel } from "@/components/admin/AdminQuoteRequestsPanel";
import { AdminWalletsPanel } from "@/components/admin/AdminWalletsPanel";
import { AdminPaymentsPanel } from "@/components/admin/AdminPaymentsPanel";
import {
  fetchAdminStats,
  fetchAllArtisans,
  fetchAllProjects,
  fetchAllQuoteRequests,
  type AdminStats as Stats,
  type AdminArtisan,
  type AdminProject,
  type AdminQuoteRequest,
} from "@/services/admin";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — BTP Guada" },
      { name: "description", content: "Panel d'administration BTP Guada." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminPage,
});

type Tab = "artisans" | "projects" | "quotes" | "wallets" | "payments";

function AdminPage() {
  const { user, role, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("artisans");
  const [stats, setStats] = useState<Stats | null>(null);
  const [artisans, setArtisans] = useState<AdminArtisan[]>([]);
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [quotes, setQuotes] = useState<AdminQuoteRequest[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAll = useCallback(async () => {
    setRefreshing(true);
    try {
      const [s, a, p, q] = await Promise.all([
        fetchAdminStats(),
        fetchAllArtisans(),
        fetchAllProjects(),
        fetchAllQuoteRequests(),
      ]);
      setStats(s);
      setArtisans(a);
      setProjects(p);
      setQuotes(q);
    } finally {
      setDataLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      navigate({ to: "/auth", search: { redirect: "/admin" } });
      return;
    }
    if (role && role === "admin") loadAll();
  }, [loading, isAuthenticated, role, navigate, loadAll]);

  if (loading || (isAuthenticated && role === null)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-emerald" />
      </div>
    );
  }

  if (role !== "admin") {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-2xl px-6 py-32">
          <div className="rounded-2xl border border-border bg-card p-10 text-center shadow-sm">
            <ShieldAlert className="mx-auto h-10 w-10 text-destructive" />
            <h1 className="mt-4 font-serif text-3xl">Accès refusé</h1>
            <p className="mt-2 text-muted-foreground">
              Cette zone est réservée aux administrateurs.
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              Connecté en tant que {user?.email} ({role ?? "aucun rôle"})
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-6 py-32">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald">
                Administration
              </span>
              <h1 className="mt-2 font-serif text-4xl md:text-5xl">Panel admin</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Validez les artisans, supervisez les projets et les demandes de devis.
              </p>
            </div>
            <button
              onClick={loadAll}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Actualiser
            </button>
          </div>
        </Reveal>

        <div className="mt-8 space-y-6">
          {dataLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-emerald" />
            </div>
          ) : (
            <>
              {stats && <AdminStats stats={stats} />}

              <div className="flex flex-wrap gap-2 border-b border-border">
                {(
                  [
                    { value: "artisans", label: `Artisans (${artisans.length})` },
                    { value: "projects", label: `Projets (${projects.length})` },
                    { value: "quotes", label: `Devis (${quotes.length})` },
                    { value: "wallets", label: "Wallets & leads" },
                    { value: "payments", label: "Paiements" },
                  ] as { value: Tab; label: string }[]
                ).map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTab(t.value)}
                    className={`-mb-px border-b-2 px-4 py-3 text-sm font-medium transition ${
                      tab === t.value
                        ? "border-emerald text-emerald"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {tab === "artisans" && (
                <AdminArtisansPanel artisans={artisans} onChange={loadAll} />
              )}
              {tab === "projects" && (
                <AdminProjectsPanel projects={projects} onChange={loadAll} />
              )}
              {tab === "quotes" && <AdminQuoteRequestsPanel requests={quotes} />}
              {tab === "wallets" && <AdminWalletsPanel />}
              {tab === "payments" && <AdminPaymentsPanel />}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
