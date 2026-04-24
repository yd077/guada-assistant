// 32 communes officielles de Guadeloupe avec slugs URL-friendly
export type Commune = {
  name: string;
  slug: string;
  // Coordonnées approximatives du centre — utiles pour SEO + future géoloc
  lat: number;
  lng: number;
};

export const COMMUNES_LIST: Commune[] = [
  { name: "Les Abymes", slug: "les-abymes", lat: 16.2716, lng: -61.5054 },
  { name: "Anse-Bertrand", slug: "anse-bertrand", lat: 16.4747, lng: -61.5083 },
  { name: "Baie-Mahault", slug: "baie-mahault", lat: 16.2675, lng: -61.5878 },
  { name: "Baillif", slug: "baillif", lat: 16.0214, lng: -61.7536 },
  { name: "Basse-Terre", slug: "basse-terre", lat: 15.9956, lng: -61.7333 },
  { name: "Bouillante", slug: "bouillante", lat: 16.1314, lng: -61.7708 },
  { name: "Capesterre-Belle-Eau", slug: "capesterre-belle-eau", lat: 16.0431, lng: -61.5639 },
  { name: "Capesterre-de-Marie-Galante", slug: "capesterre-de-marie-galante", lat: 15.9008, lng: -61.2356 },
  { name: "Deshaies", slug: "deshaies", lat: 16.3019, lng: -61.7942 },
  { name: "La Désirade", slug: "la-desirade", lat: 16.3083, lng: -61.0581 },
  { name: "Le Gosier", slug: "le-gosier", lat: 16.2103, lng: -61.4925 },
  { name: "Gourbeyre", slug: "gourbeyre", lat: 15.9836, lng: -61.7011 },
  { name: "Goyave", slug: "goyave", lat: 16.1308, lng: -61.5772 },
  { name: "Grand-Bourg", slug: "grand-bourg", lat: 15.8825, lng: -61.3122 },
  { name: "Lamentin", slug: "lamentin", lat: 16.2697, lng: -61.6322 },
  { name: "Morne-à-l'Eau", slug: "morne-a-l-eau", lat: 16.3458, lng: -61.5197 },
  { name: "Le Moule", slug: "le-moule", lat: 16.3328, lng: -61.3531 },
  { name: "Petit-Bourg", slug: "petit-bourg", lat: 16.1928, lng: -61.5897 },
  { name: "Petit-Canal", slug: "petit-canal", lat: 16.3825, lng: -61.4878 },
  { name: "Pointe-à-Pitre", slug: "pointe-a-pitre", lat: 16.2415, lng: -61.5328 },
  { name: "Pointe-Noire", slug: "pointe-noire", lat: 16.2336, lng: -61.7822 },
  { name: "Port-Louis", slug: "port-louis", lat: 16.4197, lng: -61.5331 },
  { name: "Saint-Claude", slug: "saint-claude", lat: 16.0181, lng: -61.6975 },
  { name: "Saint-François", slug: "saint-francois", lat: 16.2522, lng: -61.2706 },
  { name: "Saint-Louis", slug: "saint-louis", lat: 15.9583, lng: -61.3217 },
  { name: "Sainte-Anne", slug: "sainte-anne", lat: 16.2278, lng: -61.3825 },
  { name: "Sainte-Rose", slug: "sainte-rose", lat: 16.3322, lng: -61.6975 },
  { name: "Terre-de-Bas", slug: "terre-de-bas", lat: 15.8389, lng: -61.6386 },
  { name: "Terre-de-Haut", slug: "terre-de-haut", lat: 15.8714, lng: -61.5853 },
  { name: "Trois-Rivières", slug: "trois-rivieres", lat: 15.9783, lng: -61.6469 },
  { name: "Vieux-Fort", slug: "vieux-fort", lat: 15.9489, lng: -61.7044 },
  { name: "Vieux-Habitants", slug: "vieux-habitants", lat: 16.0578, lng: -61.7625 },
];

export const COMMUNE_BY_SLUG: Record<string, Commune> = Object.fromEntries(
  COMMUNES_LIST.map((c) => [c.slug, c]),
);

export const COMMUNE_BY_NAME: Record<string, Commune> = Object.fromEntries(
  COMMUNES_LIST.map((c) => [c.name, c]),
);

export function findCommuneBySlug(slug: string): Commune | undefined {
  return COMMUNE_BY_SLUG[slug.toLowerCase()];
}

export function findCommuneByName(name: string): Commune | undefined {
  return COMMUNE_BY_NAME[name];
}
