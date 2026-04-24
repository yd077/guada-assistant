import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Wallet,
  Zap,
  Loader2,
  Lock,
  Unlock,
  MapPin,
  Calendar,
  Euro,
  Phone,
  Mail,
  Clock,
  TrendingUp,
  TrendingDown,
  RefreshCcw,
  Check,
  X,
  AlertOctagon,
  Users,
} from "lucide-react";
import { LeadDisputeModal } from "./LeadDisputeModal";
import { Reveal } from "@/components/site/Reveal";
import {
  fetchWallet,
  fetchTransactions,
  fetchAvailableLeads,
  fetchMyUnlocks,
  unlockLead,
  updateUnlockStatus,
  type WalletState,
  type CreditTransaction,
  type AvailableLead,
  type LeadUnlock,
} from "@/services/wallet";
import {
  fetchSubscription,
  hoursUntilDeadline,
  TIER_LABEL,
  type SubscriptionTier,
} from "@/services/subscriptions";

type Props = {
  artisanId: string;
  specialty: string;
  baseLat: number | null;
  baseLng: number | null;
  radiusKm: number | null;
};

type Tab = "leads" | "mine" | "history";

export function ArtisanWalletPanel({
  artisanId,
  specialty,
  baseLat,
  baseLng,
  radiusKm,
}: Props) {
  const [wallet, setWallet] = useState<WalletState>({ balance: 0, updatedAt: null });
  const [leads, setLeads] = useState<AvailableLead[]>([]);
  const [unlocks, setUnlocks] = useState<LeadUnlock[]>([]);
  const [history, setHistory] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("leads");
  const [unlockingId, setUnlockingId] = useState<string | null>(null);
  const [tier, setTier] = useState<SubscriptionTier>("free");

  const refresh = useCallback(async () => {
    const [w, l, u, h, sub] = await Promise.all([
      fetchWallet(artisanId),
      fetchAvailableLeads({
        specialty,
        baseLat,
        baseLng,
        radiusKm,
        excludeUnlockedFor: artisanId,
      }),
      fetchMyUnlocks(artisanId),
      fetchTransactions(artisanId),
      fetchSubscription(artisanId),
    ]);
    setWallet(w);
    setLeads(l);
    setUnlocks(u);
    setHistory(h);
    if (sub?.tier) setTier(sub.tier);
    setLoading(false);
  }, [artisanId, specialty, baseLat, baseLng, radiusKm]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Realtime : Lead-Flash sur nouveaux projets dans la spécialité
  useEffect(() => {
    const channel = supabase
      .channel(`leads-${artisanId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "projects", filter: `specialty=eq.${specialty}` },
        (payload) => {
          const p = payload.new as { id: string; location: string };
          const tierBadge =
            tier === "elite"
              ? "👑 Élite — accès immédiat"
              : tier === "premium"
                ? "⭐ Premium — accès dans 15 min"
                : "Standard — accès dans 30 min";
          toast.success(
            `⚡ Lead-Flash ${specialty} à ${p.location}`,
            {
              description: tierBadge,
              duration: tier === "elite" ? 12000 : 8000,
              action: {
                label: "Voir",
                onClick: () => {
                  setTab("leads");
                  refresh();
                },
              },
            },
          );
          refresh();
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "artisan_wallets", filter: `artisan_id=eq.${artisanId}` },
        (payload) => {
          const row = payload.new as { credits_balance: number; updated_at: string };
          setWallet({ balance: row.credits_balance, updatedAt: row.updated_at });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [artisanId, specialty, refresh, tier]);

  const handleUnlock = async (lead: AvailableLead) => {
    if (wallet.balance < lead.lead_price_credits) {
      toast.error(
        `Solde insuffisant : il vous faut ${lead.lead_price_credits} crédits (vous en avez ${wallet.balance}).`,
      );
      return;
    }
    setUnlockingId(lead.id);
    const r = await unlockLead(lead.id);
    setUnlockingId(null);
    if (!r.ok) {
      if (r.error === "insufficient_credits") {
        toast.error(`Solde insuffisant. Requis : ${r.required}, dispo : ${r.balance}.`);
      } else {
        toast.error("Impossible de débloquer ce lead.");
      }
      return;
    }
    toast.success(`Lead débloqué (-${r.spent} crédits). Coordonnées disponibles.`);
    setTab("mine");
    refresh();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-5 w-5 animate-spin text-emerald" />
      </div>
    );
  }

  return (
    <Reveal>
      <div className="space-y-6">
        {/* Header wallet */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-gradient-to-br from-emerald/5 via-card to-card p-6 shadow-card">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald/10 text-emerald">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Solde wallet
              </p>
              <p className="font-serif text-3xl font-semibold tabular-nums">
                {wallet.balance}{" "}
                <span className="text-base font-normal text-muted-foreground">crédits</span>
              </p>
              <span
                className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                  tier === "elite"
                    ? "bg-amber-100 text-amber-800"
                    : tier === "premium"
                      ? "bg-emerald/10 text-emerald"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {tier === "elite" && "👑 "}
                {tier === "premium" && "⭐ "}
                Abonnement {TIER_LABEL[tier]}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button
              disabled
              title="Bientôt disponible (paiement Stripe)"
              className="inline-flex cursor-not-allowed items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm font-medium text-muted-foreground"
            >
              <Zap className="h-4 w-4" /> Recharger
            </button>
            <span className="text-[11px] text-muted-foreground">
              Recharge en ligne bientôt activée
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-border">
          {(
            [
              { v: "leads", label: `Leads disponibles (${leads.length})` },
              { v: "mine", label: `Mes leads (${unlocks.length})` },
              { v: "history", label: `Historique (${history.length})` },
            ] as { v: Tab; label: string }[]
          ).map((t) => (
            <button
              key={t.v}
              onClick={() => setTab(t.v)}
              className={`-mb-px border-b-2 px-4 py-3 text-sm font-medium transition ${
                tab === t.v
                  ? "border-emerald text-emerald"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {tab === "leads" && (
          <LeadsList
            leads={leads}
            balance={wallet.balance}
            unlockingId={unlockingId}
            onUnlock={handleUnlock}
          />
        )}
        {tab === "mine" && <UnlocksList unlocks={unlocks} artisanId={artisanId} onChange={refresh} />}
        {tab === "history" && <HistoryList history={history} />}
      </div>
    </Reveal>
  );
}

/* ─────────────── Leads disponibles ─────────────── */
function LeadsList({
  leads,
  balance,
  unlockingId,
  onUnlock,
}: {
  leads: AvailableLead[];
  balance: number;
  unlockingId: string | null;
  onUnlock: (l: AvailableLead) => void;
}) {
  if (leads.length === 0) {
    return (
      <EmptyState
        icon={<Zap className="h-6 w-6 text-muted-foreground" />}
        title="Aucun lead disponible"
        description="Vous serez notifié dès qu'un nouveau chantier matchera votre spécialité et votre zone."
      />
    );
  }
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {leads.map((l) => {
        const canAfford = balance >= l.lead_price_credits;
        return (
          <article
            key={l.id}
            className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-card"
          >
              <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald">
                  {l.specialty}
                </p>
                <h3 className="mt-1 font-serif text-lg">{l.location}</h3>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                <Lock className="h-3 w-3" /> {l.lead_price_credits} cr.
              </span>
            </div>

            <div className="flex flex-wrap gap-2 text-[11px]">
              {l.urgency_level === "sos" && (
                <span className="rounded-full bg-destructive px-2 py-0.5 font-semibold text-destructive-foreground">
                  🚨 SOS
                </span>
              )}
              {l.urgency_level === "urgent" && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-800">
                  ⚡ Urgent
                </span>
              )}
              {l.remaining_slots != null && l.remaining_slots <= 2 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald/10 px-2 py-0.5 font-semibold text-emerald">
                  <Users className="h-3 w-3" /> Plus que {l.remaining_slots} place
                  {l.remaining_slots > 1 ? "s" : ""}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {l.budget && (
                <span className="flex items-center gap-1">
                  <Euro className="h-3 w-3" /> {l.budget}
                </span>
              )}
              {l.surface && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {l.surface} m²
                </span>
              )}
              {l.deadline && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> {l.deadline}
                </span>
              )}
              {l.distance_km != null && (
                <span className="flex items-center gap-1 text-emerald">
                  ≈ {Math.round(l.distance_km)} km
                </span>
              )}
            </div>

            <p className="line-clamp-3 text-sm text-muted-foreground">
              {l.description_preview ?? "—"}
            </p>

            <div className="mt-auto flex items-center justify-between gap-3 pt-2">
              <span className="text-[11px] text-muted-foreground">
                {new Date(l.created_at).toLocaleString("fr-FR")}
              </span>
              <button
                onClick={() => onUnlock(l)}
                disabled={!canAfford || unlockingId === l.id}
                className="inline-flex items-center gap-2 rounded-full bg-emerald px-4 py-2 text-xs font-semibold text-emerald-foreground shadow-glow transition hover:scale-105 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
              >
                {unlockingId === l.id ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Unlock className="h-3 w-3" />
                )}
                Débloquer ({l.lead_price_credits} cr.)
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}

/* ─────────────── Mes leads débloqués ─────────────── */
function UnlocksList({
  unlocks,
  onChange,
}: {
  unlocks: LeadUnlock[];
  onChange: () => void;
}) {
  if (unlocks.length === 0) {
    return (
      <EmptyState
        icon={<Unlock className="h-6 w-6 text-muted-foreground" />}
        title="Aucun lead débloqué"
        description="Débloquez un lead depuis l'onglet 'Leads disponibles' pour voir ses coordonnées."
      />
    );
  }
  return (
    <div className="space-y-3">
      {unlocks.map((u) => (
        <UnlockCard key={u.id} unlock={u} onChange={onChange} />
      ))}
    </div>
  );
}

function UnlockCard({ unlock, onChange }: { unlock: LeadUnlock; onChange: () => void }) {
  const p = unlock.project;
  const setStatus = async (s: "contacted" | "won" | "lost") => {
    const { error } = await updateUnlockStatus(unlock.id, s);
    if (error) toast.error("Mise à jour impossible");
    else {
      toast.success("Statut mis à jour");
      onChange();
    }
  };

  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald">
            {p?.specialty}
          </p>
          <h3 className="mt-1 font-serif text-lg">
            {p?.contact_name} · {p?.location}
          </h3>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <a
              href={`mailto:${p?.contact_email}`}
              className="flex items-center gap-1 text-foreground hover:text-emerald"
            >
              <Mail className="h-3.5 w-3.5" /> {p?.contact_email}
            </a>
            <a
              href={`tel:${p?.contact_phone}`}
              className="flex items-center gap-1 text-foreground hover:text-emerald"
            >
              <Phone className="h-3.5 w-3.5" /> {p?.contact_phone}
            </a>
          </div>
        </div>
        <UnlockStatusBadge status={unlock.status} />
      </div>

      {p?.description && (
        <p className="mt-3 whitespace-pre-line text-sm text-muted-foreground">
          {p.description}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
        <span>
          Débloqué le {new Date(unlock.unlocked_at).toLocaleDateString("fr-FR")} ·{" "}
          {unlock.credits_spent} crédits
        </span>
        <div className="ml-auto flex flex-wrap gap-2">
          {unlock.status !== "contacted" && unlock.status !== "won" && unlock.status !== "lost" && (
            <button
              onClick={() => setStatus("contacted")}
              className="rounded-full border border-border px-3 py-1 hover:bg-muted"
            >
              Marquer contacté
            </button>
          )}
          {unlock.status !== "won" && (
            <button
              onClick={() => setStatus("won")}
              className="inline-flex items-center gap-1 rounded-full bg-emerald px-3 py-1 text-emerald-foreground"
            >
              <Check className="h-3 w-3" /> Signé
            </button>
          )}
          {unlock.status !== "lost" && (
            <button
              onClick={() => setStatus("lost")}
              className="inline-flex items-center gap-1 rounded-full border border-destructive/40 px-3 py-1 text-destructive hover:bg-destructive/10"
            >
              <X className="h-3 w-3" /> Perdu
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function UnlockStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    new: "bg-muted text-muted-foreground",
    contacted: "bg-blue-50 text-blue-700",
    won: "bg-emerald/10 text-emerald",
    lost: "bg-destructive/10 text-destructive",
  };
  const labels: Record<string, string> = {
    new: "Nouveau",
    contacted: "Contacté",
    won: "Signé",
    lost: "Perdu",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
        map[status] ?? "bg-muted text-muted-foreground"
      }`}
    >
      {labels[status] ?? status}
    </span>
  );
}

/* ─────────────── Historique transactions ─────────────── */
function HistoryList({ history }: { history: CreditTransaction[] }) {
  if (history.length === 0) {
    return (
      <EmptyState
        icon={<Clock className="h-6 w-6 text-muted-foreground" />}
        title="Aucune transaction"
        description="Vos achats de crédits et déblocages de leads s'afficheront ici."
      />
    );
  }
  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-4 py-3 text-left">Date</th>
            <th className="px-4 py-3 text-left">Type</th>
            <th className="px-4 py-3 text-left">Note</th>
            <th className="px-4 py-3 text-right">Montant</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-card">
          {history.map((t) => (
            <tr key={t.id}>
              <td className="px-4 py-3 text-muted-foreground">
                {new Date(t.created_at).toLocaleDateString("fr-FR")}
              </td>
              <td className="px-4 py-3">{txLabel(t.type)}</td>
              <td className="px-4 py-3 text-muted-foreground">{t.note ?? "—"}</td>
              <td
                className={`px-4 py-3 text-right font-semibold tabular-nums ${
                  t.amount >= 0 ? "text-emerald" : "text-destructive"
                }`}
              >
                <span className="inline-flex items-center gap-1">
                  {t.amount >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {t.amount > 0 ? "+" : ""}
                  {t.amount}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function txLabel(type: string) {
  switch (type) {
    case "purchase":
      return "Achat de crédits";
    case "lead_unlock":
      return "Déblocage lead";
    case "refund":
      return "Remboursement";
    case "bonus":
      return "Bonus";
    case "admin_adjust":
      return "Ajustement admin";
    default:
      return type;
  }
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border p-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        {icon}
      </div>
      <div>
        <p className="font-medium">{title}</p>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
