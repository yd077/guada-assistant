import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Reveal } from "@/components/site/Reveal";
import { Link } from "@tanstack/react-router";
import { Loader2, Briefcase, MessageCircle, MapPin, Calendar } from "lucide-react";

type Project = {
  id: string;
  specialty: string;
  location: string;
  description: string;
  status: string;
  created_at: string;
};

type QuoteRequest = {
  id: string;
  message: string;
  city: string;
  status: string;
  created_at: string;
  artisans: { name: string; specialty: string } | null;
};

export function ClientDashboard({ userId }: { userId: string }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      supabase
        .from("projects")
        .select("id, specialty, location, description, status, created_at")
        .eq("client_id", userId)
        .order("created_at", { ascending: false }),
      supabase
        .from("quote_requests")
        .select(
          "id, message, city, status, created_at, artisans:artisan_id(name, specialty)",
        )
        .eq("client_id", userId)
        .order("created_at", { ascending: false }),
    ]).then(([p, q]) => {
      if (cancelled) return;
      setProjects((p.data ?? []) as Project[]);
      setQuotes((q.data ?? []) as unknown as QuoteRequest[]);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-emerald" />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Mes projets */}
      <Reveal>
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl">Mes projets ({projects.length})</h2>
          <Link
            to="/projet"
            className="rounded-full bg-emerald px-4 py-2 text-sm font-medium text-emerald-foreground"
          >
            Nouveau projet
          </Link>
        </div>
        {projects.length === 0 ? (
          <EmptyState
            icon={<Briefcase />}
            title="Aucun projet pour le moment"
            cta={{ to: "/projet", label: "Soumettre un projet" }}
          />
        ) : (
          <div className="mt-4 grid gap-3">
            {projects.map((p) => (
              <article
                key={p.id}
                className="rounded-2xl border border-border bg-card p-5 shadow-card"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">{p.specialty}</p>
                    <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" /> {p.location}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {p.description}
                    </p>
                  </div>
                  <StatusPill status={p.status} />
                </div>
                <p className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />{" "}
                  {new Date(p.created_at).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </article>
            ))}
          </div>
        )}
      </Reveal>

      {/* Mes demandes de devis */}
      <Reveal>
        <h2 className="font-serif text-2xl">Mes demandes de devis ({quotes.length})</h2>
        {quotes.length === 0 ? (
          <EmptyState
            icon={<MessageCircle />}
            title="Aucune demande envoyée"
            cta={{ to: "/recherche", label: "Trouver un artisan" }}
          />
        ) : (
          <div className="mt-4 grid gap-3">
            {quotes.map((q) => (
              <article
                key={q.id}
                className="rounded-2xl border border-border bg-card p-5 shadow-card"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">
                      {q.artisans?.name ?? "Artisan"}
                      {q.artisans?.specialty && (
                        <span className="ml-2 text-sm font-normal text-muted-foreground">
                          · {q.artisans.specialty}
                        </span>
                      )}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" /> {q.city}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {q.message}
                    </p>
                  </div>
                  <StatusPill status={q.status} />
                </div>
              </article>
            ))}
          </div>
        )}
      </Reveal>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  cta,
}: {
  icon: React.ReactNode;
  title: string;
  cta: { to: string; label: string };
}) {
  return (
    <div className="mt-4 rounded-2xl border border-dashed border-border p-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        {icon}
      </div>
      <p className="mt-3 font-serif text-lg">{title}</p>
      <Link
        to={cta.to as "/projet"}
        className="mt-4 inline-block text-sm font-medium text-emerald underline"
      >
        {cta.label}
      </Link>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    open: { label: "Ouvert", cls: "bg-emerald/10 text-emerald" },
    in_review: { label: "En étude", cls: "bg-accent/10 text-accent" },
    closed: { label: "Clos", cls: "bg-muted text-muted-foreground" },
    pending: { label: "En attente", cls: "bg-accent/10 text-accent" },
    read: { label: "Lu", cls: "bg-muted text-muted-foreground" },
    responded: { label: "Répondu", cls: "bg-emerald/10 text-emerald" },
  };
  const s = map[status] ?? { label: status, cls: "bg-muted text-muted-foreground" };
  return (
    <span className={`flex-none rounded-full px-3 py-1 text-xs font-medium ${s.cls}`}>
      {s.label}
    </span>
  );
}
