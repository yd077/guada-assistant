import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { LegalLayout } from "@/components/site/LegalLayout";

export const Route = createFileRoute("/cgu")({
  head: () => ({
    meta: [
      { title: "Conditions générales d'utilisation — BTP Guada" },
      { name: "description", content: "Conditions d'utilisation de la plateforme BTP Guada pour clients et artisans." },
      { property: "og:title", content: "CGU — BTP Guada" },
      { property: "og:description", content: "Règles d'usage de la plateforme BTP Guada." },
    ],
  }),
  component: () => (
    <LegalLayout
      eyebrow="Conditions"
      title="Conditions générales d'utilisation"
      icon={FileText}
      intro="Les présentes CGU régissent l'utilisation de la plateforme BTP Guada par les visiteurs, clients et artisans inscrits."
      sections={[
        {
          title: "1. Objet",
          body: <p>BTP Guada est une plateforme en ligne de mise en relation entre des particuliers ou professionnels (clients) souhaitant réaliser des travaux et des artisans du bâtiment exerçant en Guadeloupe.</p>,
        },
        {
          title: "2. Inscription",
          body: (
            <>
              <p>L'inscription est gratuite et ouverte aux personnes majeures. L'utilisateur s'engage à fournir des informations exactes et à les tenir à jour.</p>
              <p>Les artisans doivent justifier d'une activité professionnelle déclarée (SIRET, assurance décennale).</p>
            </>
          ),
        },
        {
          title: "3. Rôle de la plateforme",
          body: (
            <>
              <p>BTP Guada facilite la mise en relation mais n'est <strong>pas partie aux contrats</strong> conclus entre clients et artisans.</p>
              <p>La plateforme ne garantit ni la réalisation des prestations, ni leur qualité, ni le paiement entre les parties.</p>
            </>
          ),
        },
        {
          title: "4. Engagements des artisans",
          body: (
            <ul className="list-disc space-y-1 pl-5">
              <li>Exercer une activité légalement déclarée et assurée.</li>
              <li>Répondre aux demandes dans un délai raisonnable.</li>
              <li>Réaliser les prestations selon les règles de l'art.</li>
              <li>Ne pas solliciter de paiement par la plateforme.</li>
            </ul>
          ),
        },
        {
          title: "5. Engagements des clients",
          body: (
            <ul className="list-disc space-y-1 pl-5">
              <li>Décrire le projet de manière sincère et complète.</li>
              <li>Respecter les rendez-vous fixés avec les artisans.</li>
              <li>Régler les prestations selon les conditions convenues.</li>
              <li>Publier des avis honnêtes et non diffamatoires.</li>
            </ul>
          ),
        },
        {
          title: "6. Modération",
          body: <p>BTP Guada se réserve le droit de modérer, suspendre ou supprimer un compte ou un contenu en cas de manquement aux présentes CGU, de comportement abusif ou de fraude avérée.</p>,
        },
        {
          title: "7. Limitation de responsabilité",
          body: <p>La responsabilité de BTP Guada ne saurait être engagée pour les dommages directs ou indirects résultant des prestations fournies par les artisans, de l'utilisation du site ou d'une indisponibilité temporaire.</p>,
        },
        {
          title: "8. Modifications",
          body: <p>BTP Guada peut modifier les présentes CGU à tout moment. Les utilisateurs seront informés des changements substantiels par email ou notification dans leur espace.</p>,
        },
        {
          title: "9. Loi applicable",
          body: <p>Les présentes CGU sont soumises au droit français. Tout litige relève de la compétence exclusive des tribunaux français.</p>,
        },
      ]}
    />
  ),
});
