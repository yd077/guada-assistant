// Métiers du BTP & services référencés sur la plateforme
export type Specialty = {
  name: string;
  slug: string;
  // Singulier masculin pour le H1 ("Plombier à …")
  singular: string;
  // Description courte SEO
  description: string;
};

export const SPECIALTIES_LIST: Specialty[] = [
  {
    name: "Maçonnerie",
    slug: "maconnerie",
    singular: "Maçon",
    description:
      "Construction, extension et rénovation de bâtiments, fondations parasismiques, dalles et murs porteurs.",
  },
  {
    name: "Électricité",
    slug: "electricite",
    singular: "Électricien",
    description:
      "Installation, mise aux normes, dépannage électrique, domotique et bornes de recharge IRVE.",
  },
  {
    name: "Plomberie",
    slug: "plomberie",
    singular: "Plombier",
    description:
      "Installation sanitaire, dépannage fuites, chauffe-eau solaire, raccordements eau et évacuation.",
  },
  {
    name: "Peinture",
    slug: "peinture",
    singular: "Peintre",
    description:
      "Peinture intérieure et extérieure, enduits décoratifs, ravalement de façade, finitions soignées.",
  },
  {
    name: "Paysagisme",
    slug: "paysagisme",
    singular: "Paysagiste",
    description:
      "Conception et entretien de jardins tropicaux, terrasses végétalisées, élagage et abattage.",
  },
  {
    name: "Architecture d'intérieur",
    slug: "architecture-interieur",
    singular: "Architecte d'intérieur",
    description:
      "Aménagement, décoration et rénovation d'espaces intérieurs résidentiels et professionnels.",
  },
  {
    name: "Couverture",
    slug: "couverture",
    singular: "Couvreur",
    description:
      "Installation et réparation de toitures, étanchéité, charpente, gouttières et descentes d'eau.",
  },
  {
    name: "Menuiserie",
    slug: "menuiserie",
    singular: "Menuisier",
    description:
      "Pose de portes, fenêtres, escaliers, agencement sur-mesure en bois local et exotique.",
  },
  {
    name: "Carrelage",
    slug: "carrelage",
    singular: "Carreleur",
    description:
      "Pose de carrelage sol et mur, faïence, mosaïque, terrasses extérieures et plages de piscine.",
  },
  {
    name: "Climatisation",
    slug: "climatisation",
    singular: "Climaticien",
    description:
      "Installation et entretien de climatiseurs, pompes à chaleur, ventilation et fluide frigorigène.",
  },
  {
    name: "Serrurerie",
    slug: "serrurerie",
    singular: "Serrurier",
    description:
      "Installation et dépannage serrures, blindage de portes, ouverture d'urgence 7j/7.",
  },
  {
    name: "Piscine",
    slug: "piscine",
    singular: "Pisciniste",
    description:
      "Construction, rénovation et entretien de piscines, traitement de l'eau et systèmes de filtration.",
  },
  {
    name: "Terrassement",
    slug: "terrassement",
    singular: "Terrassier",
    description:
      "Travaux de terrassement, viabilisation, assainissement et préparation de terrains.",
  },
  {
    name: "Énergies renouvelables",
    slug: "energies-renouvelables",
    singular: "Installateur photovoltaïque",
    description:
      "Installation de panneaux solaires, chauffe-eau solaires et systèmes d'autoconsommation.",
  },
  {
    name: "Multi-services",
    slug: "multi-services",
    singular: "Artisan multi-services",
    description:
      "Petits travaux d'entretien, dépannage, bricolage et interventions polyvalentes au domicile.",
  },
];

export const SPECIALTY_BY_SLUG: Record<string, Specialty> = Object.fromEntries(
  SPECIALTIES_LIST.map((s) => [s.slug, s]),
);

export const SPECIALTY_BY_NAME: Record<string, Specialty> = Object.fromEntries(
  SPECIALTIES_LIST.map((s) => [s.name, s]),
);

export function findSpecialtyBySlug(slug: string): Specialty | undefined {
  return SPECIALTY_BY_SLUG[slug.toLowerCase()];
}

export function findSpecialtyByName(name: string): Specialty | undefined {
  return SPECIALTY_BY_NAME[name];
}
