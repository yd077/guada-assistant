import { supabase } from "@/integrations/supabase/client";

export type DisputeReason =
  | "wrong_number"
  | "not_reachable"
  | "not_owner"
  | "out_of_zone"
  | "other";

export type DisputeStatus = "pending" | "approved" | "rejected";

export const DISPUTE_REASON_LABEL: Record<DisputeReason, string> = {
  wrong_number: "Numéro erroné",
  not_reachable: "Injoignable (3+ tentatives)",
  not_owner: "Pas le propriétaire / décideur",
  out_of_zone: "Hors zone d'intervention",
  other: "Autre",
};

export type LeadDispute = {
  id: string;
  unlock_id: string;
  artisan_id: string;
  reason: DisputeReason;
  description: string | null;
  status: DisputeStatus;
  resolved_at: string | null;
  resolved_note: string | null;
  created_at: string;
};

export type AdminDisputeRow = LeadDispute & {
  artisans: { name: string } | null;
  lead_unlocks:
    | {
        credits_spent: number;
        unlocked_at: string;
        projects: {
          contact_name: string;
          contact_email: string;
          contact_phone: string;
          specialty: string;
          location: string;
        } | null;
      }
    | null;
};

export async function createDispute(input: {
  unlockId: string;
  artisanId: string;
  reason: DisputeReason;
  description?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.from("lead_disputes").insert({
    unlock_id: input.unlockId,
    artisan_id: input.artisanId,
    reason: input.reason,
    description: input.description ?? null,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function fetchMyDisputes(artisanId: string): Promise<LeadDispute[]> {
  const { data, error } = await supabase
    .from("lead_disputes")
    .select("*")
    .eq("artisan_id", artisanId)
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []) as LeadDispute[];
}

export async function fetchAllDisputes(): Promise<AdminDisputeRow[]> {
  const { data, error } = await supabase
    .from("lead_disputes")
    .select(
      `*, artisans(name),
       lead_unlocks(credits_spent, unlocked_at,
         projects(contact_name, contact_email, contact_phone, specialty, location))`,
    )
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []) as unknown as AdminDisputeRow[];
}

export async function adminApproveDispute(
  disputeId: string,
  note?: string,
): Promise<{ ok: boolean; refunded?: number; error?: string }> {
  const { data, error } = await supabase.rpc("admin_approve_dispute", {
    p_dispute_id: disputeId,
    p_note: note ?? null,
  });
  if (error) return { ok: false, error: error.message };
  return data as { ok: boolean; refunded?: number };
}

export async function adminRejectDispute(
  disputeId: string,
  note?: string,
): Promise<{ ok: boolean; error?: string }> {
  const { data, error } = await supabase.rpc("admin_reject_dispute", {
    p_dispute_id: disputeId,
    p_note: note ?? null,
  });
  if (error) return { ok: false, error: error.message };
  return data as { ok: boolean };
}
