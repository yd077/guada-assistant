import { supabase } from "@/integrations/supabase/client";

export async function submitReview(input: {
  artisanId: string;
  rating: number;
  comment?: string;
}): Promise<{ ok: boolean; error?: string; review_id?: string }> {
  const { data, error } = await supabase.rpc("submit_review", {
    p_artisan_id: input.artisanId,
    p_rating: input.rating,
    p_comment: input.comment ?? null,
  });
  if (error) return { ok: false, error: error.message };
  return data as { ok: boolean; error?: string; review_id?: string };
}

export async function fetchReviewableArtisans(clientId: string): Promise<
  Array<{ artisan_id: string; artisan_name: string; project_id: string }>
> {
  const { data } = await supabase
    .from("lead_unlocks")
    .select(
      `artisan_id, project_id, artisans:artisan_id(name), projects:project_id(client_id)`,
    );
  if (!data) return [];
  return (data as unknown as Array<{
    artisan_id: string;
    project_id: string;
    artisans: { name: string } | null;
    projects: { client_id: string } | null;
  }>)
    .filter((r) => r.projects?.client_id === clientId)
    .map((r) => ({
      artisan_id: r.artisan_id,
      artisan_name: r.artisans?.name ?? "Artisan",
      project_id: r.project_id,
    }));
}
