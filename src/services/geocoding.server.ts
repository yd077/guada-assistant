const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_maps";

export type GeocodeHit = {
  lat: number;
  lng: number;
  displayName: string;
};

/**
 * Géocodage Google Maps (via la passerelle connecteur Lovable).
 * Biaisé vers la Guadeloupe (countrycode gp).
 */
export async function googleGeocode(query: string): Promise<GeocodeHit | null> {
  const lovableKey = process.env.LOVABLE_API_KEY;
  const mapsKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!lovableKey || !mapsKey) {
    throw new Error("Identifiants Google Maps manquants");
  }

  const params = new URLSearchParams({
    address: query,
    components: "country:GP",
    language: "fr",
  });

  const res = await fetch(`${GATEWAY_URL}/maps/api/geocode/json?${params}`, {
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": mapsKey,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`[geocode] passerelle Google Maps [${res.status}]: ${body}`);
    if (res.status === 403) {
      throw new Error(
        "Clé Google Maps refusée (403). Vérifiez les restrictions de la clé serveur.",
      );
    }
    throw new Error(`Géocodage indisponible (${res.status})`);
  }

  const data = (await res.json()) as {
    status: string;
    error_message?: string;
    results?: Array<{
      formatted_address: string;
      geometry: { location: { lat: number; lng: number } };
    }>;
  };

  if (data.status === "ZERO_RESULTS" || !data.results?.length) return null;
  if (data.status !== "OK") {
    console.error(`[geocode] Google status ${data.status}: ${data.error_message ?? ""}`);
    throw new Error(data.error_message ?? `Géocodage échoué (${data.status})`);
  }

  const hit = data.results[0];
  return {
    lat: hit.geometry.location.lat,
    lng: hit.geometry.location.lng,
    displayName: hit.formatted_address,
  };
}
