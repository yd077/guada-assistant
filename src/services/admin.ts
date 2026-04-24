import { supabase } from "@/integrations/supabase/client";

export type AdminArtisan = {
  id: string;
  user_id: string | null;
  name: string;
  specialty: string;
  location: string;
  bio: string | null;
  avatar_url: string | null;
  experience_years: number | null;
  status: "pending" | "verified" | "rejected";
  rating: number | null;
  reviews_count: number | null;
  created_at: string;
};

export type AdminProject = {
  id: string;
  specialty: string;
  location: string;
  description: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  budget: string | null;
  status: "open" | "in_review" | "closed";
  client_type?: "particulier" | "entreprise" | "agence" | "syndic" | null;
  company_name?: string | null;
  internal_ref?: string | null;
  created_at: string;
};

export type AdminQuoteRequest = {
  id: string;
  artisan_id: string;
  contact_name: string;
  contact_email: string;
  city: string;
  message: string;
  status: "pending" | "read" | "responded";
  created_at: string;
  artisans?: { name: string } | null;
};

export type AdminStats = {
  artisansTotal: number;
  artisansPending: number;
  artisansVerified: number;
  projectsTotal: number;
  projectsOpen: number;
  quoteRequestsTotal: number;
  quoteRequestsPending: number;
};

export async function fetchAdminStats(): Promise<AdminStats> {
  const [artisans, projects, quotes] = await Promise.all([
    supabase.from("artisans").select("status"),
    supabase.from("projects").select("status"),
    supabase.from("quote_requests").select("status"),
  ]);

  const aRows = (artisans.data ?? []) as { status: string }[];
  const pRows = (projects.data ?? []) as { status: string }[];
  const qRows = (quotes.data ?? []) as { status: string }[];

  return {
    artisansTotal: aRows.length,
    artisansPending: aRows.filter((r) => r.status === "pending").length,
    artisansVerified: aRows.filter((r) => r.status === "verified").length,
    projectsTotal: pRows.length,
    projectsOpen: pRows.filter((r) => r.status === "open").length,
    quoteRequestsTotal: qRows.length,
    quoteRequestsPending: qRows.filter((r) => r.status === "pending").length,
  };
}

export async function fetchAllArtisans(): Promise<AdminArtisan[]> {
  const { data, error } = await supabase
    .from("artisans")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as AdminArtisan[];
}

export async function updateArtisanStatus(
  id: string,
  status: "pending" | "verified" | "rejected",
) {
  const { error } = await supabase
    .from("artisans")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteArtisan(id: string) {
  const { error } = await supabase.from("artisans").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchAllProjects(): Promise<AdminProject[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data ?? []) as AdminProject[];
}

export async function updateProjectStatus(
  id: string,
  status: "open" | "in_review" | "closed",
) {
  const { error } = await supabase
    .from("projects")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
}

export async function fetchAllQuoteRequests(): Promise<AdminQuoteRequest[]> {
  const { data, error } = await supabase
    .from("quote_requests")
    .select("*, artisans(name)")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data ?? []) as unknown as AdminQuoteRequest[];
}
