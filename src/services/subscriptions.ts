import { supabase } from "@/integrations/supabase/client";

export type SubscriptionTier = "free" | "premium" | "elite";

export type ArtisanSubscription = {
  artisan_id: string;
  tier: SubscriptionTier;
  starts_at: string;
  ends_at: string | null;
  stripe_subscription_id?: string | null;
  current_period_end?: string | null;
  cancel_at_period_end?: boolean | null;
};

export const TIER_LABEL: Record<SubscriptionTier, string> = {
  free: "Standard",
  premium: "Premium",
  elite: "Élite",
};

/** Délai d'accès aux leads par tier (minutes). Aligné sur le dossier business. */
export const TIER_DELAY_MIN: Record<SubscriptionTier, number> = {
  elite: 0,
  premium: 15,
  free: 30,
};

/** Rayon d'intervention par tier (km, null = toute la Guadeloupe). */
export const TIER_RADIUS_KM: Record<SubscriptionTier, number | null> = {
  free: 5,
  premium: 25,
  elite: null,
};

/** Prix mensuel par tier (€). */
export const TIER_PRICE_EUR: Record<SubscriptionTier, number> = {
  free: 0,
  premium: 29,
  elite: 49,
};

export async function fetchSubscription(
  artisanId: string,
): Promise<ArtisanSubscription | null> {
  const { data } = await supabase
    .from("artisan_subscriptions")
    .select(
      "artisan_id, tier, starts_at, ends_at, stripe_subscription_id, current_period_end, cancel_at_period_end",
    )
    .eq("artisan_id", artisanId)
    .maybeSingle();
  return (data as ArtisanSubscription | null) ?? null;
}

/** Minutes restantes avant qu'un lead devienne accessible. */
export function minutesUntilAvailable(availableAtIso: string): number {
  const t = new Date(availableAtIso).getTime();
  return Math.max(0, Math.round((t - Date.now()) / 60000));
}

/** Heures restantes avant échéance 24h (peut être négatif). */
export function hoursUntilDeadline(deadlineIso: string): number {
  const t = new Date(deadlineIso).getTime();
  return Math.round((t - Date.now()) / 3600000);
}
