import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, RefreshCcw } from "lucide-react";

type Rule = {
  id: string;
  specialty: string | null;
  client_type: string | null;
  urgency_level: "normal" | "urgent" | "sos" | null;
  min_budget_eur: number;
  max_budget_eur: number | null;
  credits_cost: number;
  label: string | null;
};

const EMPTY: Omit<Rule, "id"> = {
  specialty: null,
  client_type: null,
  urgency_level: null,
  min_budget_eur: 0,
  max_budget_eur: null,
  credits_cost: 8,
  label: null,
};

export function AdminPricingRulesPanel() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<typeof EMPTY>(EMPTY);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("lead_pricing_rules")
      .select("*")
      .order("credits_cost", { ascending: true });
    setRules((data ?? []) as Rule[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const create = async () => {
    setBusy(true);
    const { error } = await supabase.from("lead_pricing_rules").insert({
      ...draft,
      specialty: draft.specialty || null,
      client_type: draft.client_type || null,
      urgency_level: draft.urgency_level || null,
      label: draft.label || null,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Règle ajoutée");
    setDraft(EMPTY);
    load();
  };

  const remove = async (id: string) => {
    if (!window.confirm("Supprimer cette règle ?")) return;
    const { error } = await supabase.from("lead_pricing_rules").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Supprimé");
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-xl">Grille tarifaire</h3>
        <button
          onClick={load}
          className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs hover:bg-muted"
        >
          <RefreshCcw className="h-3 w-3" /> Actualiser
        </button>
      </div>

      {/* Création */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
        <p className="mb-3 text-sm font-semibold">Ajouter une règle</p>
        <div className="grid gap-2 md:grid-cols-7">
          <input
            placeholder="Métier (ou vide)"
            value={draft.specialty ?? ""}
            onChange={(e) =>
              setDraft({ ...draft, specialty: e.target.value || null })
            }
            className="rounded-lg border border-input bg-background px-2 py-2 text-sm"
          />
          <select
            value={draft.client_type ?? ""}
            onChange={(e) =>
              setDraft({ ...draft, client_type: e.target.value || null })
            }
            className="rounded-lg border border-input bg-background px-2 py-2 text-sm"
          >
            <option value="">— tout —</option>
            <option value="particulier">particulier</option>
            <option value="entreprise">entreprise</option>
            <option value="agence">agence</option>
            <option value="syndic">syndic</option>
          </select>
          <select
            value={draft.urgency_level ?? ""}
            onChange={(e) =>
              setDraft({
                ...draft,
                urgency_level: (e.target.value || null) as Rule["urgency_level"],
              })
            }
            className="rounded-lg border border-input bg-background px-2 py-2 text-sm"
          >
            <option value="">— tout —</option>
            <option value="normal">normal</option>
            <option value="urgent">urgent</option>
            <option value="sos">sos</option>
          </select>
          <input
            type="number"
            placeholder="Min €"
            value={draft.min_budget_eur}
            onChange={(e) =>
              setDraft({ ...draft, min_budget_eur: Number(e.target.value) || 0 })
            }
            className="rounded-lg border border-input bg-background px-2 py-2 text-sm"
          />
          <input
            type="number"
            placeholder="Max € (∅)"
            value={draft.max_budget_eur ?? ""}
            onChange={(e) =>
              setDraft({
                ...draft,
                max_budget_eur: e.target.value ? Number(e.target.value) : null,
              })
            }
            className="rounded-lg border border-input bg-background px-2 py-2 text-sm"
          />
          <input
            type="number"
            placeholder="Crédits"
            value={draft.credits_cost}
            onChange={(e) =>
              setDraft({ ...draft, credits_cost: Number(e.target.value) || 0 })
            }
            className="rounded-lg border border-input bg-background px-2 py-2 text-sm"
          />
          <button
            onClick={create}
            disabled={busy}
            className="inline-flex items-center justify-center gap-1 rounded-full bg-emerald px-3 py-2 text-xs font-semibold text-emerald-foreground disabled:opacity-50"
          >
            <Plus className="h-3 w-3" /> Ajouter
          </button>
        </div>
        <input
          placeholder="Libellé (optionnel)"
          value={draft.label ?? ""}
          onChange={(e) => setDraft({ ...draft, label: e.target.value || null })}
          className="mt-2 w-full rounded-lg border border-input bg-background px-2 py-2 text-sm"
        />
        <p className="mt-2 text-xs text-muted-foreground">
          Modificateurs auto : agence/syndic = ×1.30 ; urgent = ×1.5 ; sos = ×2.
        </p>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-emerald" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left">Métier</th>
                <th className="px-3 py-2 text-left">Profil</th>
                <th className="px-3 py-2 text-left">Urgence</th>
                <th className="px-3 py-2 text-right">Min €</th>
                <th className="px-3 py-2 text-right">Max €</th>
                <th className="px-3 py-2 text-right">Crédits</th>
                <th className="px-3 py-2 text-left">Libellé</th>
                <th className="px-3 py-2 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {rules.map((r) => (
                <tr key={r.id}>
                  <td className="px-3 py-2">{r.specialty ?? <em>tous</em>}</td>
                  <td className="px-3 py-2">{r.client_type ?? <em>tous</em>}</td>
                  <td className="px-3 py-2">{r.urgency_level ?? <em>toutes</em>}</td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {r.min_budget_eur}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {r.max_budget_eur ?? "∞"}
                  </td>
                  <td className="px-3 py-2 text-right font-semibold text-emerald tabular-nums">
                    {r.credits_cost}
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">
                    {r.label ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => remove(r.id)}
                      className="rounded-full p-1 text-destructive hover:bg-destructive/10"
                      aria-label="Supprimer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
