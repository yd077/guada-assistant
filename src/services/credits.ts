import { supabase } from "@/integrations/supabase/client";

export type CreditPack = {
  id: string;
  name: string;
  credits: number;
  price_eur: number;
  highlight: boolean;
  description: string | null;
  sort_order: number;
  active: boolean;
};

export type SubscriptionPlanRow = {
  tier: "free" | "premium" | "elite";
  name: string;
  price_eur: number;
  radius_km: number | null;
  delay_minutes: number;
  description: string | null;
  highlight: boolean;
  active: boolean;
};

export async function fetchCreditPacks(): Promise<CreditPack[]> {
  const { data, error } = await supabase
    .from("credit_packs")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as CreditPack[];
}

export async function fetchSubscriptionPlans(): Promise<SubscriptionPlanRow[]> {
  const { data, error } = await supabase
    .from("subscription_plans")
    .select("*")
    .eq("active", true)
    .order("price_eur", { ascending: true });
  if (error) throw error;
  return (data ?? []) as SubscriptionPlanRow[];
}

/** € par crédit (pour afficher l'économie sur les gros packs). */
export function pricePerCredit(pack: CreditPack): number {
  return pack.price_eur / pack.credits;
}
