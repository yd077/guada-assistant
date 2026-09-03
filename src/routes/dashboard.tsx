import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Mon espace — Devis Connect" },
      {
        name: "description",
        content: "Accédez à votre espace personnel Devis Connect.",
      },
    ],
  }),
  component: DashboardPage,
});

/** Aiguillage : redirige vers l'espace correspondant au rôle. */
function DashboardPage() {
  const { role, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [roleTimedOut, setRoleTimedOut] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setRoleTimedOut(true), 2000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      navigate({ to: "/auth", search: { redirect: "/dashboard" } });
      return;
    }
    if (role === null && !roleTimedOut) return; // rôle en cours de résolution
    navigate({
      to: role === "artisan" ? "/espace-artisan" : "/espace-client",
      replace: true,
    });
  }, [loading, isAuthenticated, role, roleTimedOut, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-emerald" />
    </div>
  );
}
