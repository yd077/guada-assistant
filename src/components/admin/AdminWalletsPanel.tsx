import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Wallet, Plus, Minus, RefreshCcw, AlertCircle } from "lucide-react";
import {
  adminAdjustWallet,
  adminRefundUnlock,
  type CreditTxType,
} from "@/services/wallet";

type WalletRow = {
  artisan_id: string;
  credits_balance: number;
  updated_at: string;
  artisans: {
    name: string;
    specialty: string;
    location: string;
    status: string;
  } | null;
};

type UnlockRow = {
  id: string;
  artisan_id: string;
  project_id: string;
  credits_spent: number;
  status: string;
  unlocked_at: string;
  artisans: { name: string } | null;
  projects: { contact_name: string; specialty: string; location: string } | null;
};

export function AdminWalletsPanel() {
  const [wallets, setWallets] = useState<WalletRow[]>([]);
  const [unlocks, setUnlocks] = useState<UnlockRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"wallets" | "unlocks">("wallets");

  const load = useCallback(async () => {
    setLoading(true);
    const [w, u] = await Promise.all([
      supabase
        .from("artisan_wallets")
        .select("artisan_id, credits_balance, updated_at, artisans(name, specialty, location, status)")
        .order("credits_balance", { ascending: false }),
      supabase
        .from("lead_unlocks")
        .select(
          "id, artisan_id, project_id, credits_spent, status, unlocked_at, artisans(name), projects(contact_name, specialty, location)",
        )
        .order("unlocked_at", { ascending: false })
        .limit(100),
    ]);
    setWallets((w.data ?? []) as unknown as WalletRow[]);
    setUnlocks((u.data ?? []) as unknown as UnlockRow[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-emerald" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2 border-b border-border">
          <button
            onClick={() => setTab("wallets")}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${
              tab === "wallets"
                ? "border-emerald text-emerald"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Wallets ({wallets.length})
          </button>
          <button
            onClick={() => setTab("unlocks")}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${
              tab === "unlocks"
                ? "border-emerald text-emerald"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Unlocks récents ({unlocks.length})
          </button>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-muted"
        >
          <RefreshCcw className="h-3 w-3" /> Actualiser
        </button>
      </div>

      {tab === "wallets" && <WalletsTable wallets={wallets} onChange={load} />}
      {tab === "unlocks" && <UnlocksTable unlocks={unlocks} onChange={load} />}
    </div>
  );
}

function WalletsTable({
  wallets,
  onChange,
}: {
  wallets: WalletRow[];
  onChange: () => void;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [type, setType] = useState<CreditTxType>("admin_adjust");
  const [busy, setBusy] = useState(false);

  const submit = async (artisanId: string) => {
    const n = parseInt(amount, 10);
    if (Number.isNaN(n) || n === 0) {
      toast.error("Montant invalide");
      return;
    }
    setBusy(true);
    const r = await adminAdjustWallet(artisanId, n, note || "(sans motif)", type);
    setBusy(false);
    if (!r.ok) {
      toast.error("Échec de l'ajustement");
      return;
    }
    toast.success(`Wallet mis à jour (nouveau solde : ${r.balance})`);
    setEditing(null);
    setAmount("");
    setNote("");
    onChange();
  };

  if (wallets.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        Aucun wallet pour l'instant.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-4 py-3 text-left">Artisan</th>
            <th className="px-4 py-3 text-left">Spécialité</th>
            <th className="px-4 py-3 text-right">Solde</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-card">
          {wallets.map((w) => (
            <FragmentRow
              key={w.artisan_id}
              wallet={w}
              isEditing={editing === w.artisan_id}
              onToggle={() =>
                setEditing((e) => (e === w.artisan_id ? null : w.artisan_id))
              }
              amount={amount}
              setAmount={setAmount}
              note={note}
              setNote={setNote}
              type={type}
              setType={setType}
              busy={busy}
              onSubmit={() => submit(w.artisan_id)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UnlocksTable({
  unlocks,
  onChange,
}: {
  unlocks: UnlockRow[];
  onChange: () => void;
}) {
  const refund = async (id: string) => {
    const note = window.prompt("Motif du remboursement ?", "Lead invalide");
    if (note === null) return;
    const r = await adminRefundUnlock(id, note);
    if (!r.ok) {
      toast.error("Remboursement échoué");
      return;
    }
    toast.success(`Remboursé (+${r.refunded} crédits)`);
    onChange();
  };

  if (unlocks.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        Aucun unlock récent.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <table className="w-full min-w-[760px] text-sm">
        <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-4 py-3 text-left">Date</th>
            <th className="px-4 py-3 text-left">Artisan</th>
            <th className="px-4 py-3 text-left">Lead</th>
            <th className="px-4 py-3 text-right">Crédits</th>
            <th className="px-4 py-3 text-left">Statut</th>
            <th className="px-4 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-card">
          {unlocks.map((u) => (
            <tr key={u.id}>
              <td className="px-4 py-3 text-xs text-muted-foreground">
                {new Date(u.unlocked_at).toLocaleString("fr-FR")}
              </td>
              <td className="px-4 py-3">{u.artisans?.name ?? "—"}</td>
              <td className="px-4 py-3">
                <p className="font-medium">{u.projects?.contact_name ?? "—"}</p>
                <p className="text-xs text-muted-foreground">
                  {u.projects?.specialty} · {u.projects?.location}
                </p>
              </td>
              <td className="px-4 py-3 text-right font-semibold tabular-nums">
                {u.credits_spent}
              </td>
              <td className="px-4 py-3">
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{u.status}</span>
              </td>
              <td className="px-4 py-3 text-right">
                {u.status !== "lost" ? (
                  <button
                    onClick={() => refund(u.id)}
                    className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100"
                  >
                    <AlertCircle className="h-3 w-3" /> Rembourser
                  </button>
                ) : (
                  <span className="text-xs text-muted-foreground">Remboursé</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FragmentRow({
  wallet,
  isEditing,
  onToggle,
  amount,
  setAmount,
  note,
  setNote,
  type,
  setType,
  busy,
  onSubmit,
}: {
  wallet: WalletRow;
  isEditing: boolean;
  onToggle: () => void;
  amount: string;
  setAmount: (v: string) => void;
  note: string;
  setNote: (v: string) => void;
  type: CreditTxType;
  setType: (v: CreditTxType) => void;
  busy: boolean;
  onSubmit: () => void;
}) {
  return (
    <>
      <tr>
        <td className="px-4 py-3">
          <p className="font-medium">{wallet.artisans?.name ?? "—"}</p>
          <p className="text-xs text-muted-foreground">{wallet.artisans?.location}</p>
        </td>
        <td className="px-4 py-3 text-muted-foreground">
          {wallet.artisans?.specialty ?? "—"}
        </td>
        <td className="px-4 py-3 text-right">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald/10 px-3 py-1 font-semibold text-emerald tabular-nums">
            <Wallet className="h-3 w-3" /> {wallet.credits_balance}
          </span>
        </td>
        <td className="px-4 py-3 text-right">
          <button
            onClick={onToggle}
            className="rounded-full border border-border px-3 py-1 text-xs hover:bg-muted"
          >
            {isEditing ? "Fermer" : "Ajuster"}
          </button>
        </td>
      </tr>
      {isEditing && (
        <tr className="bg-muted/30">
          <td colSpan={4} className="px-4 py-4">
            <div className="grid gap-3 md:grid-cols-[120px_140px_1fr_auto]">
              <input
                type="number"
                placeholder="Montant ±"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
              <select
                value={type}
                onChange={(e) => setType(e.target.value as CreditTxType)}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="admin_adjust">Ajustement</option>
                <option value="bonus">Bonus</option>
                <option value="refund">Remboursement</option>
              </select>
              <input
                type="text"
                placeholder="Motif (visible dans l'historique)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
              <button
                onClick={onSubmit}
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-full bg-emerald px-4 py-2 text-sm font-semibold text-emerald-foreground disabled:opacity-50"
              >
                {Number(amount) >= 0 ? (
                  <Plus className="h-3 w-3" />
                ) : (
                  <Minus className="h-3 w-3" />
                )}
                Appliquer
              </button>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
