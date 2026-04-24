import { createFileRoute } from "@tanstack/react-router";
import { Building2 } from "lucide-react";
import { LegalLayout } from "@/components/site/LegalLayout";

export const Route = createFileRoute("/mentions-legales")({
  head: () => ({
    meta: [
      { title: "Mentions légales — BTP Guada" },
      { name: "description", content: "Mentions légales de la plateforme BTP Guada : éditeur, hébergeur, propriété intellectuelle." },
      { property: "og:title", content: "Mentions légales — BTP Guada" },
      { property: "og:description", content: "Informations légales sur l'éditeur et l'hébergeur de BTP Guada." },
    ],
  }),
  component: () => (
    <LegalLayout
      eyebrow="Informations légales"
      title="Mentions légales"
      icon={Building2}
      intro="Conformément aux dispositions des articles 6-III et 19 de la Loi n°2004-575 du 21 juin 2004 pour la Confiance dans l'économie numérique, dite L.C.E.N."
      sections={[
        {
          title: "Éditeur du site",
          body: (
            <>
              <p><strong>BTP Guada</strong> — Plateforme de mise en relation BTP en Guadeloupe.</p>
              <p>Siège social : Pointe-à-Pitre, 97110 Guadeloupe (France).</p>
              <p>Email : contact@btp-guada.fr</p>
              <p>Téléphone : +590 590 00 00 00</p>
              <p>Directeur de la publication : l'éditeur du site.</p>
            </>
          ),
        },
        {
          title: "Hébergement",
          body: (
            <>
              <p>Le site est hébergé par <strong>Cloudflare, Inc.</strong>, 101 Townsend St, San Francisco, CA 94107, USA.</p>
              <p>Infrastructure de base de données et authentification : <strong>Supabase</strong> (Lovable Cloud).</p>
            </>
          ),
        },
        {
          title: "Propriété intellectuelle",
          body: (
            <>
              <p>L'ensemble des contenus présents sur le site (textes, images, logos, charte graphique) est protégé par le droit d'auteur et la législation sur la propriété intellectuelle.</p>
              <p>Toute reproduction, représentation, modification ou exploitation, même partielle, sans autorisation écrite préalable, est strictement interdite.</p>
              <p>Les photos et descriptifs des artisans demeurent la propriété de leurs auteurs ; ils sont publiés avec leur consentement.</p>
            </>
          ),
        },
        {
          title: "Responsabilité",
          body: (
            <>
              <p>BTP Guada agit en qualité d'intermédiaire de mise en relation. La plateforme ne réalise pas les prestations de travaux et n'est pas partie aux contrats conclus entre les clients et les artisans référencés.</p>
              <p>Les artisans inscrits restent seuls responsables des prestations qu'ils fournissent, de leurs assurances professionnelles et du respect de la réglementation applicable.</p>
              <p>BTP Guada vérifie les informations déclaratives à l'inscription mais ne peut garantir leur exactitude permanente.</p>
            </>
          ),
        },
        {
          title: "Loi applicable",
          body: <p>Le présent site est soumis au droit français. En cas de litige, les tribunaux français sont seuls compétents.</p>,
        },
      ]}
    />
  ),
});
