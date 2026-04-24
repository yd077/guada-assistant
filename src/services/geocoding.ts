// Géocodage via Nominatim (OpenStreetMap, gratuit, rate limit 1 req/s)
// Utilisé côté client uniquement (UX d'autocomplete d'adresse)

import { COMMUNE_BY_NAME, type Commune } from "@/data/communes";

export type GeocodeResult = {
  lat: number;
  lng: number;
  displayName: string;
};

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org/search";

// Cache mémoire simple pour éviter de hammeriser l'API
const cache = new Map<string, GeocodeResult | null>();

/**
 * Géocode une adresse libre, biaisée vers la Guadeloupe.
 * Retourne null si introuvable.
 */
export async function geocodeAddress(query: string): Promise<GeocodeResult | null> {
  const key = query.trim().toLowerCase();
  if (!key) return null;
  if (cache.has(key)) return cache.get(key) ?? null;

  // 1) Si la requête correspond à une commune connue, court-circuit
  const commune = COMMUNE_BY_NAME[query.trim()];
  if (commune) {
    const result: GeocodeResult = {
      lat: commune.lat,
      lng: commune.lng,
      displayName: `${commune.name}, Guadeloupe`,
    };
    cache.set(key, result);
    return result;
  }

  try {
    const params = new URLSearchParams({
      q: `${query}, Guadeloupe`,
      format: "json",
      limit: "1",
      countrycodes: "gp",
      "accept-language": "fr",
    });
    const res = await fetch(`${NOMINATIM_BASE}?${params}`, {
      headers: {
        // Nominatim demande un User-Agent identifiable
        "Accept": "application/json",
      },
    });
    if (!res.ok) {
      cache.set(key, null);
      return null;
    }
    const data = (await res.json()) as Array<{
      lat: string;
      lon: string;
      display_name: string;
    }>;
    if (!data.length) {
      cache.set(key, null);
      return null;
    }
    const result: GeocodeResult = {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      displayName: data[0].display_name,
    };
    cache.set(key, result);
    return result;
  } catch (e) {
    console.error("[geocode] erreur:", e);
    return null;
  }
}

/**
 * Fallback : retourne directement la commune si elle est listée,
 * sinon tente Nominatim.
 */
export async function geocodeCommuneOrAddress(
  communeName: string,
  addressLine?: string,
): Promise<GeocodeResult | null> {
  if (addressLine && addressLine.trim()) {
    const r = await geocodeAddress(`${addressLine}, ${communeName}`);
    if (r) return r;
  }
  return geocodeAddress(communeName);
}

/**
 * Distance Haversine en km (formule pure JS).
 */
export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function communeCenter(name: string): { lat: number; lng: number } | null {
  const c = COMMUNE_BY_NAME[name];
  return c ? { lat: c.lat, lng: c.lng } : null;
}

export type { Commune };
