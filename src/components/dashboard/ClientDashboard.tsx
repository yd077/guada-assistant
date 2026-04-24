import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Loader2,
  Briefcase,
  MessageCircle,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Check,
  Clock,
  Star,
  Users,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Reveal } from "@/components/site/Reveal";
import {
  fetchClientProjectsWithUnlocks,
  clientMarkContacted,
  type ClientProjectWithUnlocks,
} from "@/services/clientProjects";
import { ReviewModal } from "./ReviewModal";

type QuoteRequest = {
  id: string;
  message: string;
  city: string;
  status: string;
  created_at: string;
  artisans: { name: string; specialty: string } | null;
};

export function ClientDashboard({ userId }: { userId: string }) {
  const [projects, setProjects] = useState<ClientProjectWithUnlocks[]>([]);
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState<{ id: string; name: string } | null>(
    null,
  );

  const refresh = async () => {
    const [p, q] = await Promise.all([
      fetchClientProjectsWithUnlocks(userId),
      supabase
        .from("quote_requests")
        .select(
          "id, message, city, status, created_at, artisans:artisan_id(name, specialty)",
        )
        .eq("client_id", userId)
        .order("created_at", { ascending: false }),
    ]);
    setProjects(p);
    setQuotes((q.data ?? []) as unknown as QuoteRequest[]);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-emerald" />
      </div>
    );
  }

  const handleMarkContacted = async (unlockId: string) => {
    const r = await clientMarkContacted(unlockId);
    if (!r.ok) {
      toast.error(r.error ?? "Action impossible");
      return;
    }
    toast.success("Contact confirmé. Merci !");
    refresh();
  };

  return (
    <div className="space-y-12">
      {/* Mes projets enrichis */}
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
          <div className="mt-4 space-y-4">
            {projects.map((p) => {
              const remaining = Math.max(
                0,
                (p.max_unlocks ?? 3) - p.unlocks.length,
              );
              return (
                <article
                  key={p.id}
                  className="overflow-hidden rounded-2xl border border-border bg-card shadow-card"
                >
                  <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border/60 p-5">
                    <div>
                      <p className="font-semibold">{p.specialty}</p>
                      <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" /> {p.location}
                      </p>
                      <p className="mt-2 line-clamp-2 max-w-2xl text-sm text-muted-foreground">
                        {p.description}
                      </p>
                      <p className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />{" "}
                        {new Date(p.created_at).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <StatusPill status={p.status} />
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald/10 px-3 py-1 text-xs font-medium text-emerald">
                        <Users className="h-3 w-3" />
                        {p.unlocks.length}/{p.max_unlocks ?? 3} artisans
                      </span>
                      {p.urgency_level === "sos" && (
                        <span className="inline-flex items-center rounded-full bg-destructive px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-destructive-foreground">
                          SOS
                        </span>
                      )}
                    </div>
                  </header>

                  {/* Liste des artisans qui ont débloqué */}
                  <div className="p-5">
                    {p.unlocks.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        En attente d'artisans intéressés. Vous serez recontacté
                        sous 24h.
                      </p>
                    ) : (
                      <>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Artisans en contact
                        </p>
                        <div className="mt-3 space-y-3">
                          {p.unlocks.map((u) => (
                            <div
                              key={u.id}
                              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-background p-3"
                            >
                              <div className="flex items-center gap-3">
                                <img
                                  src={
                                    u.artisans?.avatar_url ??
                                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
                                  }
                                  alt={u.artisans?.name ?? "Artisan"}
                                  className="h-10 w-10 rounded-full object-cover"
                                />
                                <div>
                                  <p className="text-sm font-semibold">
                                    {u.artisans?.id ? (
                                      <Link
                                        to="/artisan/$id"
                                        params={{ id: u.artisans.id }}
                                        className="hover:text-emerald"
                                      >
                                        {u.artisans.name}
                                      </Link>
                                    ) : (
                                      (u.artisans?.name ?? "Artisan")
                                    )}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {u.artisans?.specialty} ·{" "}
                                    {u.artisans?.location}
                                    {u.artisans?.rating ? (
                                      <span className="ml-2 inline-flex items-center gap-0.5">
                                        <Star className="h-3 w-3 fill-accent text-accent" />
                                        {Number(u.artisans.rating).toFixed(1)}
                                      </span>
                                    ) : null}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {u.first_contact_at ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald/10 px-2.5 py-1 text-xs text-emerald">
                                    <Check className="h-3 w-3" /> Contacté
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-1 text-xs text-accent">
                                    <Clock className="h-3 w-3" /> Sous 24h
                                  </span>
                                )}
                                {!u.first_contact_at && (
                                  <button
                                    onClick={() => handleMarkContacted(u.id)}
                                    className="rounded-full border border-border px-3 py-1 text-xs font-medium hover:bg-muted"
                                  >
                                    J'ai été contacté
                                  </button>
                                )}
                                {u.status === "won" && u.artisans && (
                                  <button
                                    onClick={() =>
                                      setReviewing({
                                        id: u.artisans!.id,
                                        name: u.artisans!.name,
                                      })
                                    }
                                    className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground hover:opacity-90"
                                  >
                                    <Star className="h-3 w-3" /> Donner mon avis
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {remaining > 0 && p.status === "open" && (
                          <p className="mt-3 text-xs text-muted-foreground">
                            Encore {remaining} place
                            {remaining > 1 ? "s" : ""} possible
                            {remaining > 1 ? "s" : ""} pour d'autres artisans.
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </Reveal>

      {/* Mes demandes de devis directes */}
      <Reveal>
        <h2 className="font-serif text-2xl">
          Mes demandes de devis ({quotes.length})
        </h2>
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

      {reviewing && (
        <ReviewModal
          open
          artisanId={reviewing.id}
          artisanName={reviewing.name}
          onClose={() => setReviewing(null)}
          onSubmitted={refresh}
        />
      )}
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
    <span
      className={`flex-none rounded-full px-3 py-1 text-xs font-medium ${s.cls}`}
    >
      {s.label}
    </span>
  );
}
