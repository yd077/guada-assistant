import { supabase } from "@/integrations/supabase/client";
import { ARTISANS, type Artisan, getArtisanById as getMockArtisanById } from "@/data/artisans";

export type ArtisanFilters = {
  specialty?: string;
  location?: string;
  minRating?: number;
};

type DbArtisan = {
  id: string;
  name: string;
  specialty: string;
  location: string;
  bio: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  experience_years: number | null;
  certifications: string[] | null;
  rating: number | null;
  reviews_count: number | null;
};

type DbPortfolio = { image_url: string; title: string | null };
type DbReview = {
  rating: number;
  comment: string | null;
  created_at: string;
  author_id: string;
  profiles?: { full_name: string | null } | null;
};

const FALLBACK_AVATAR =
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80";
const FALLBACK_COVER =
  "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80";

function mapDbArtisan(
  row: DbArtisan,
  portfolio: DbPortfolio[] = [],
  reviews: DbReview[] = [],
): Artisan {
  return {
    id: row.id,
    name: row.name,
    specialty: row.specialty,
    location: row.location,
    rating: Number(row.rating ?? 0),
    reviewsCount: row.reviews_count ?? 0,
    yearsExperience: row.experience_years ?? 0,
    verified: true,
    avatar: row.avatar_url || FALLBACK_AVATAR,
    cover: row.cover_url || FALLBACK_COVER,
    bio: row.bio ?? "",
    certifications: row.certifications ?? [],
    portfolio: portfolio.map((p) => ({
      src: p.image_url,
      title: p.title ?? "",
    })),
    reviews: reviews.map((r) => ({
      author: r.profiles?.full_name ?? "Client",
      rating: r.rating,
      comment: r.comment ?? "",
      date: new Date(r.created_at).toLocaleDateString("fr-FR", {
        month: "long",
        year: "numeric",
      }),
    })),
  };
}

/** Liste paginée d'artisans vérifiés. Fallback mock si DB vide. */
export async function listArtisans(filters: ArtisanFilters = {}): Promise<Artisan[]> {
  let query = supabase
    .from("artisans")
    .select("*")
    .eq("status", "verified")
    .order("rating", { ascending: false });

  if (filters.specialty) query = query.eq("specialty", filters.specialty);
  if (filters.location) query = query.eq("location", filters.location);
  if (filters.minRating && filters.minRating > 0)
    query = query.gte("rating", filters.minRating);

  const { data, error } = await query;
  if (error) {
    console.error("[listArtisans] supabase error:", error.message);
    return applyMockFilters(filters);
  }

  if (!data || data.length === 0) {
    // DB vide → fallback mock filtré (utile en démo / seed)
    return applyMockFilters(filters);
  }

  return (data as DbArtisan[]).map((r) => mapDbArtisan(r));
}

function applyMockFilters(filters: ArtisanFilters): Artisan[] {
  return ARTISANS.filter(
    (a) =>
      (!filters.specialty || a.specialty === filters.specialty) &&
      (!filters.location || a.location === filters.location) &&
      a.rating >= (filters.minRating ?? 0),
  );
}

/** Détail artisan avec portfolio + reviews. Fallback mock si introuvable. */
export async function getArtisanDetail(id: string): Promise<Artisan | null> {
  // 1) Tenter Supabase (UUID)
  const { data: artisan, error } = await supabase
    .from("artisans")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!error && artisan) {
    const [{ data: portfolio }, { data: reviews }] = await Promise.all([
      supabase
        .from("portfolio_items")
        .select("image_url, title")
        .eq("artisan_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("reviews")
        .select("rating, comment, created_at, author_id, profiles:author_id(full_name)")
        .eq("artisan_id", id)
        .order("created_at", { ascending: false }),
    ]);

    return mapDbArtisan(
      artisan as DbArtisan,
      (portfolio ?? []) as DbPortfolio[],
      (reviews ?? []) as unknown as DbReview[],
    );
  }

  // 2) Fallback mock (slug)
  return getMockArtisanById(id) ?? null;
}
