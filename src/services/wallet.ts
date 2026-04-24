import { supabase } from "@/integrations/supabase/client";
import { haversineKm } from "@/services/geocoding";

export type WalletState = {
  balance: number;
  updatedAt: string | null;
};

export type CreditTxType =
  | "purchase"
  | "lead_unlock"
  | "refund"
  | "bonus"
  | "admin_adjust";

export type CreditTransaction = {
  id: string;
  type: CreditTxType;
  amount: number;
  reference_id: string | null;
  note: string | null;
  created_at: string;
};

export type AvailableLead = {
  id: string;
  specialty: string;
  location: string;
  surface: string | null;
  budget: string | null;
  deadline: string | null;
  description_preview: string | null;
  lead_price_credits: number;
  project_lat: number | null;
  project_lng: number | null;
  created_at: string;
  distance_km?: number | null;
};

export type LeadUnlock = {
  id: string;
  project_id: string;
  credits_spent: number;
  status: "new" | "contacted" | "won" | "lost";
  unlocked_at: string;
  project?: {
    specialty: string;
    location: string;
    description: string;
    contact_name: string;
    contact_email: string;
    contact_phone: string;
    budget: string | null;
    surface: string | null;
    deadline: string | null;
  } | null;
};

/** Solde du wallet pour un artisan donné. */
export async function fetchWallet(artisanId: string): Promise<WalletState> {
  const { data, error } = await supabase
    .from("artisan_wallets")
    .select("credits_balance, updated_at")
    .eq("artisan_id", artisanId)
    .maybeSingle();

  if (error || !data) return { balance: 0, updatedAt: null };
  return { balance: data.credits_balance ?? 0, updatedAt: data.updated_at };
}

/** Historique des transactions (50 dernières). */
export async function fetchTransactions(artisanId: string): Promise<CreditTransaction[]> {
  const { data, error } = await supabase
    .from("credit_transactions")
    .select("id, type, amount, reference_id, note, created_at")
    .eq("artisan_id", artisanId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return [];
  return (data ?? []) as CreditTransaction[];
}

/** Leads disponibles matchant la spécialité de l'artisan + filtrés par rayon. */
export async function fetchAvailableLeads(opts: {
  specialty: string;
  baseLat: number | null;
  baseLng: number | null;
  radiusKm: number | null;
  excludeUnlockedFor?: string; // artisan_id pour exclure ses propres unlocks
}): Promise<AvailableLead[]> {
  const { data, error } = await supabase
    .from("available_leads")
    .select("*")
    .eq("specialty", opts.specialty)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("[fetchAvailableLeads]", error);
    return [];
  }

  let leads = (data ?? []) as AvailableLead[];

  // Exclure ceux déjà débloqués
  if (opts.excludeUnlockedFor) {
    const { data: unlocked } = await supabase
      .from("lead_unlocks")
      .select("project_id")
      .eq("artisan_id", opts.excludeUnlockedFor);
    const ids = new Set((unlocked ?? []).map((u) => u.project_id));
    leads = leads.filter((l) => !ids.has(l.id));
  }

  // Calcul distance si géoloc dispo
  if (opts.baseLat != null && opts.baseLng != null) {
    leads = leads
      .map((l) => ({
        ...l,
        distance_km:
          l.project_lat != null && l.project_lng != null
            ? distanceKm(opts.baseLat!, opts.baseLng!, l.project_lat, l.project_lng)
            : null,
      }))
      .filter((l) => {
        if (opts.radiusKm == null) return true;
        if (l.distance_km == null) return true; // garder ceux sans coord (legacy)
        return l.distance_km <= opts.radiusKm;
      })
      .sort((a, b) => (a.distance_km ?? 9999) - (b.distance_km ?? 9999));
  }

  return leads;
}

/** Débloque un lead (transaction atomique côté DB). */
export async function unlockLead(projectId: string): Promise<{
  ok: boolean;
  error?: string;
  required?: number;
  balance?: number;
  spent?: number;
}> {
  const { data, error } = await supabase.rpc("unlock_lead", { p_project_id: projectId });
  if (error) {
    console.error("[unlockLead]", error);
    return { ok: false, error: error.message };
  }
  return data as { ok: boolean; error?: string; balance?: number; spent?: number };
}

/** Liste des unlocks d'un artisan, avec coordonnées des leads. */
export async function fetchMyUnlocks(artisanId: string): Promise<LeadUnlock[]> {
  const { data, error } = await supabase
    .from("lead_unlocks")
    .select(
      `id, project_id, credits_spent, status, unlocked_at,
       project:projects(specialty, location, description, contact_name, contact_email, contact_phone, budget, surface, deadline)`,
    )
    .eq("artisan_id", artisanId)
    .order("unlocked_at", { ascending: false });
  if (error) {
    console.error("[fetchMyUnlocks]", error);
    return [];
  }
  return (data ?? []) as unknown as LeadUnlock[];
}

/** Met à jour le statut d'un unlock (contacted/won/lost). */
export async function updateUnlockStatus(
  unlockId: string,
  status: "new" | "contacted" | "won" | "lost",
) {
  const { error } = await supabase
    .from("lead_unlocks")
    .update({ status })
    .eq("id", unlockId);
  return { error };
}

/** Ajustement admin du wallet. */
export async function adminAdjustWallet(
  artisanId: string,
  amount: number,
  note: string,
  type: CreditTxType = "admin_adjust",
) {
  const { data, error } = await supabase.rpc("admin_adjust_wallet", {
    p_artisan_id: artisanId,
    p_amount: amount,
    p_type: type,
    p_note: note,
  });
  if (error) return { ok: false, error: error.message };
  return data as { ok: boolean; balance?: number };
}

/** Remboursement admin d'un unlock. */
export async function adminRefundUnlock(unlockId: string, note?: string) {
  const { data, error } = await supabase.rpc("admin_refund_unlock", {
    p_unlock_id: unlockId,
    p_note: note ?? null,
  });
  if (error) return { ok: false, error: error.message };
  return data as { ok: boolean; refunded?: number };
}
