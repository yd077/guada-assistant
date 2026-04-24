import { supabase } from "@/integrations/supabase/client";

export type DocKind = "kbis" | "insurance";

export async function uploadArtisanDoc(
  userId: string,
  artisanId: string,
  kind: DocKind,
  file: File,
): Promise<{ ok: boolean; path?: string; error?: string }> {
  const ext = file.name.split(".").pop() ?? "pdf";
  const path = `${userId}/${kind}-${Date.now()}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from("artisan-docs")
    .upload(path, file, {
      contentType: file.type,
      upsert: true,
    });

  if (upErr) return { ok: false, error: upErr.message };

  const update: Record<string, unknown> = {
    verification_status: "pending",
  };
  if (kind === "kbis") update.kbis_url = path;
  if (kind === "insurance") update.insurance_url = path;

  const { error: dbErr } = await supabase
    .from("artisans")
    .update(update)
    .eq("id", artisanId);

  if (dbErr) return { ok: false, error: dbErr.message };
  return { ok: true, path };
}

export async function getDocSignedUrl(path: string): Promise<string | null> {
  const { data } = await supabase.storage
    .from("artisan-docs")
    .createSignedUrl(path, 60 * 10); // 10 min
  return data?.signedUrl ?? null;
}

export async function adminApproveVerification(
  artisanId: string,
  note?: string,
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase
    .from("artisans")
    .update({
      verification_status: "verified",
      kbis_verified_at: new Date().toISOString(),
      insurance_verified_at: new Date().toISOString(),
      verification_note: note ?? null,
      status: "verified",
    })
    .eq("id", artisanId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function adminRejectVerification(
  artisanId: string,
  note: string,
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase
    .from("artisans")
    .update({
      verification_status: "rejected",
      verification_note: note,
    })
    .eq("id", artisanId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
