import { supabase } from "@/integrations/supabase/client";

export type ClientProject = {
  id: string;
  specialty: string;
  location: string;
  description: string;
  status: string;
  created_at: string;
  max_unlocks: number | null;
  urgency_level: string | null;
};

export type ClientUnlock = {
  id: string;
  project_id: string;
  status: "new" | "contacted" | "won" | "lost";
  unlocked_at: string;
  first_contact_at: string | null;
  artisans: {
    id: string;
    name: string;
    specialty: string;
    location: string;
    avatar_url: string | null;
    rating: number | null;
    reviews_count: number | null;
  } | null;
};

export type ClientProjectWithUnlocks = ClientProject & {
  unlocks: ClientUnlock[];
};

export async function fetchClientProjectsWithUnlocks(
  clientId: string,
): Promise<ClientProjectWithUnlocks[]> {
  const { data: projects, error } = await supabase
    .from("projects")
    .select(
      "id, specialty, location, description, status, created_at, max_unlocks, urgency_level",
    )
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  if (error || !projects) return [];

  const ids = projects.map((p) => p.id);
  if (ids.length === 0) return projects.map((p) => ({ ...p, unlocks: [] }));

  const { data: unlocks } = await supabase
    .from("lead_unlocks")
    .select(
      `id, project_id, status, unlocked_at, first_contact_at,
       artisans:artisan_id(id, name, specialty, location, avatar_url, rating, reviews_count)`,
    )
    .in("project_id", ids)
    .order("unlocked_at", { ascending: false });

  const byProject = new Map<string, ClientUnlock[]>();
  ((unlocks ?? []) as unknown as ClientUnlock[]).forEach((u) => {
    const arr = byProject.get(u.project_id) ?? [];
    arr.push(u);
    byProject.set(u.project_id, arr);
  });

  return projects.map((p) => ({ ...p, unlocks: byProject.get(p.id) ?? [] }));
}

export async function clientMarkContacted(
  unlockId: string,
): Promise<{ ok: boolean; error?: string }> {
  const { data, error } = await supabase.rpc("client_mark_contacted", {
    p_unlock_id: unlockId,
  });
  if (error) return { ok: false, error: error.message };
  return data as { ok: boolean; error?: string };
}
