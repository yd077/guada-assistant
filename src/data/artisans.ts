export type Artisan = {
  id: string;
  name: string;
  specialty: string;
  location: string;
  rating: number;
  reviewsCount: number;
  yearsExperience: number;
  verified: boolean;
  avatar: string;
  cover: string;
  bio: string;
  certifications: string[];
  portfolio: { src: string; title: string }[];
  reviews: { author: string; rating: number; comment: string; date: string }[];
};

export const SPECIALTIES = [
  "Maçonnerie",
  "Électricité",
  "Plomberie",
  "Peinture",
  "Paysagisme",
  "Architecture d'intérieur",
  "Couverture",
  "Menuiserie",
] as const;

export const COMMUNES = [
  "Pointe-à-Pitre",
  "Les Abymes",
  "Le Gosier",
  "Sainte-Anne",
  "Saint-François",
  "Basse-Terre",
  "Baie-Mahault",
  "Petit-Bourg",
  "Lamentin",
  "Sainte-Rose",
  "Le Moule",
  "Capesterre-Belle-Eau",
] as const;

export const ARTISANS: Artisan[] = [
  {
    id: "jean-pierre-durand",
    name: "Jean-Pierre Durand",
    specialty: "Maçonnerie",
    location: "Le Gosier",
    rating: 4.9,
    reviewsCount: 87,
    yearsExperience: 22,
    verified: true,
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    cover:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80",
    bio: "Maître maçon installé en Guadeloupe depuis plus de 20 ans. Spécialiste des constructions parasismiques et des finitions haut de gamme pour villas créoles contemporaines.",
    certifications: ["RGE Qualibat", "Norme parasismique PS-MI", "Assurance décennale"],
    portfolio: [
      {
        src: "https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=900&q=80",
        title: "Villa contemporaine — Sainte-Anne",
      },
      {
        src: "https://images.unsplash.com/photo-1486718448742-163732cd1544?auto=format&fit=crop&w=900&q=80",
        title: "Extension piscine — Le Gosier",
      },
      {
        src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80",
        title: "Rénovation case créole — Petit-Bourg",
      },
    ],
    reviews: [
      {
        author: "Marc L.",
        rating: 5,
        comment: "Travail impeccable, livré dans les délais. Je recommande sans hésiter.",
        date: "Mars 2024",
      },
      {
        author: "Sandrine D.",
        rating: 5,
        comment: "Une équipe sérieuse et passionnée. Notre villa est magnifique.",
        date: "Janvier 2024",
      },
    ],
  },
  {
    id: "marie-line-gauthier",
    name: "Marie-Line Gauthier",
    specialty: "Architecture d'intérieur",
    location: "Pointe-à-Pitre",
    rating: 5.0,
    reviewsCount: 64,
    yearsExperience: 12,
    verified: true,
    avatar:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    cover:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=80",
    bio: "Architecte d'intérieur diplômée. J'imagine des espaces lumineux qui dialoguent avec la nature caribéenne — bois locaux, lumière douce, lignes épurées.",
    certifications: ["DPLG Architecture intérieure", "Membre CFAI", "Éco-conception"],
    portfolio: [
      {
        src: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=80",
        title: "Loft tropical — Pointe-à-Pitre",
      },
      {
        src: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80",
        title: "Suite parentale — Saint-François",
      },
      {
        src: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=80",
        title: "Cuisine ouverte — Baie-Mahault",
      },
    ],
    reviews: [
      {
        author: "Olivier P.",
        rating: 5,
        comment: "Marie-Line a sublimé notre intérieur. Élégance et fonctionnalité.",
        date: "Février 2024",
      },
    ],
  },
  {
    id: "sebastien-hoarau",
    name: "Sébastien Hoarau",
    specialty: "Électricité",
    location: "Baie-Mahault",
    rating: 4.8,
    reviewsCount: 142,
    yearsExperience: 15,
    verified: true,
    avatar:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80",
    cover:
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1600&q=80",
    bio: "Électricien certifié IRVE et photovoltaïque. Mises aux normes, domotique et installations solaires sur l'ensemble de l'archipel.",
    certifications: ["Qualifelec", "QualiPV", "IRVE niveau 2"],
    portfolio: [
      {
        src: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=900&q=80",
        title: "Centrale photovoltaïque résidentielle",
      },
      {
        src: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=900&q=80",
        title: "Domotique villa — Sainte-Anne",
      },
    ],
    reviews: [
      {
        author: "Élise M.",
        rating: 5,
        comment: "Très professionnel, explications claires. Notre installation solaire fonctionne parfaitement.",
        date: "Avril 2024",
      },
    ],
  },
  {
    id: "lucie-belrose",
    name: "Lucie Belrose",
    specialty: "Paysagisme",
    location: "Sainte-Anne",
    rating: 4.9,
    reviewsCount: 56,
    yearsExperience: 9,
    verified: true,
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80",
    cover:
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1600&q=80",
    bio: "Paysagiste créatrice de jardins tropicaux durables. Conception, aménagement et entretien — espèces endémiques privilégiées.",
    certifications: ["BTSA Aménagements paysagers", "Certiphyto", "Jardin botanique partenaire"],
    portfolio: [
      {
        src: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=900&q=80",
        title: "Jardin créole — Le Moule",
      },
      {
        src: "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?auto=format&fit=crop&w=900&q=80",
        title: "Patio tropical — Gosier",
      },
    ],
    reviews: [
      {
        author: "Hélène R.",
        rating: 5,
        comment: "Un jardin de rêve, parfaitement adapté à notre climat.",
        date: "Mai 2024",
      },
    ],
  },
  {
    id: "thomas-valery",
    name: "Thomas Valéry",
    specialty: "Plomberie",
    location: "Les Abymes",
    rating: 4.7,
    reviewsCount: 98,
    yearsExperience: 18,
    verified: true,
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
    cover:
      "https://images.unsplash.com/photo-1585129777188-9bd0fd1a8efe?auto=format&fit=crop&w=1600&q=80",
    bio: "Plombier-chauffagiste, spécialiste des réseaux d'eau, sanitaires haut de gamme et chauffe-eau solaires.",
    certifications: ["Qualibat Plomberie", "QualiSol", "Assurance décennale"],
    portfolio: [
      {
        src: "https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=900&q=80",
        title: "Salle de bain spa — Saint-François",
      },
      {
        src: "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=900&q=80",
        title: "Réseau complet — villa neuve",
      },
    ],
    reviews: [
      {
        author: "Patrick V.",
        rating: 5,
        comment: "Réactif, précis, prix juste. Un vrai professionnel.",
        date: "Mars 2024",
      },
    ],
  },
  {
    id: "karine-desrosiers",
    name: "Karine Desrosiers",
    specialty: "Peinture",
    location: "Saint-François",
    rating: 4.9,
    reviewsCount: 73,
    yearsExperience: 11,
    verified: true,
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    cover:
      "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=1600&q=80",
    bio: "Peintre en bâtiment et décoration. Enduits décoratifs, peintures naturelles et finitions soignées pour intérieurs raffinés.",
    certifications: ["CAP Peinture", "Qualibat 6111", "Peintures écolabel"],
    portfolio: [
      {
        src: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=80",
        title: "Salon enduit chaux — Gosier",
      },
      {
        src: "https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=900&q=80",
        title: "Façade villa — Saint-François",
      },
    ],
    reviews: [
      {
        author: "Nathalie B.",
        rating: 5,
        comment: "Travail soigné, résultat magnifique. Karine a un vrai œil.",
        date: "Février 2024",
      },
    ],
  },
];

export function getArtisanById(id: string): Artisan | undefined {
  return ARTISANS.find((a) => a.id === id);
}
