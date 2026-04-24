import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { SPECIALTIES_LIST } from "@/data/specialties";
import { COMMUNES_LIST } from "@/data/communes";

const STATIC_PATHS = [
  "/",
  "/recherche",
  "/projet",
  "/auth",
  "/metiers",
  "/comment-ca-marche",
  "/tarifs",
  "/contact",
  "/mentions-legales",
  "/confidentialite",
  "/cgu",
];

function buildXml(host: string, urls: { loc: string; lastmod?: string; priority?: string }[]) {
  const body = urls
    .map(
      (u) =>
        `  <url><loc>${host}${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}${u.priority ? `<priority>${u.priority}</priority>` : ""}</url>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const host = `${url.protocol}//${url.host}`;
        const today = new Date().toISOString().slice(0, 10);

        const urls: { loc: string; lastmod?: string; priority?: string }[] = STATIC_PATHS.map(
          (p) => ({ loc: p, lastmod: today, priority: p === "/" ? "1.0" : "0.7" }),
        );

        // Pages SEO : /metiers/:metier hub + /artisan/:metier + /artisan/:metier/:commune
        for (const s of SPECIALTIES_LIST) {
          urls.push({ loc: `/metiers/${s.slug}`, lastmod: today, priority: "0.8" });
          urls.push({ loc: `/artisan/${s.slug}`, lastmod: today, priority: "0.8" });
          urls.push({ loc: `/sos/${s.slug}`, lastmod: today, priority: "0.7" });
          for (const c of COMMUNES_LIST) {
            urls.push({
              loc: `/artisan/${s.slug}/${c.slug}`,
              lastmod: today,
              priority: "0.6",
            });
            urls.push({
              loc: `/sos/${s.slug}/${c.slug}`,
              lastmod: today,
              priority: "0.5",
            });
          }
        }

        try {
          const { data } = await supabase
            .from("artisans")
            .select("id, updated_at")
            .eq("status", "verified")
            .limit(500);
          for (const a of data ?? []) {
            urls.push({
              loc: `/artisan/${a.id}`,
              lastmod: (a.updated_at ?? today).slice(0, 10),
              priority: "0.8",
            });
          }
        } catch {
          // pas grave, on retourne au moins les pages statiques
        }

        return new Response(buildXml(host, urls), {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
