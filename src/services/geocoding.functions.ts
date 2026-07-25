import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const geocodeQuery = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ query: z.string().trim().min(2).max(200) }).parse(data))
  .handler(async ({ data }) => {
    const { googleGeocode } = await import("@/services/geocoding.server");
    try {
      const hit = await googleGeocode(data.query);
      return { ok: true as const, hit };
    } catch (e) {
      return {
        ok: false as const,
        hit: null,
        message: e instanceof Error ? e.message : "Géocodage indisponible",
      };
    }
  });
