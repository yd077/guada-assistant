import { supabase } from "@/integrations/supabase/client";

export type PaymentSettings = {
  id: string;
  provider: "stripe";
  mode: "test" | "live";
  test_publishable_key: string | null;
  test_secret_key: string | null;
  test_webhook_secret: string | null;
  live_publishable_key: string | null;
  live_secret_key: string | null;
  live_webhook_secret: string | null;
  enabled: boolean;
  updated_at: string;
};

export async function fetchPaymentSettings(): Promise<PaymentSettings | null> {
  const { data, error } = await supabase
    .from("payment_settings")
    .select("*")
    .eq("provider", "stripe")
    .maybeSingle();
  if (error) throw error;
  return (data as PaymentSettings) ?? null;
}

export async function updatePaymentSettings(
  patch: Partial<Omit<PaymentSettings, "id" | "provider" | "updated_at">>,
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("payment_settings")
    .update({
      ...patch,
      updated_at: new Date().toISOString(),
      updated_by: user?.id ?? null,
    })
    .eq("provider", "stripe");
  if (error) throw error;
}
