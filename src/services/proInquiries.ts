import { supabase } from "@/integrations/supabase/client";

export type ProInquiryInput = {
  company_name: string;
  contact_name: string;
  email: string;
  phone?: string;
  client_type: "agence" | "syndic" | "autre";
  managed_units?: number | null;
  recurring_specialties?: string[];
  desired_sla?: string;
  message?: string;
};

export async function createProInquiry(
  input: ProInquiryInput,
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.from("pro_inquiries").insert(input);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
