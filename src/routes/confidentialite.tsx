import { createFileRoute } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { LegalLayout } from "@/components/site/LegalLayout";

export const Route = createFileRoute("/confidentialite")({
  head: () => ({
    meta: [
      { title: "Politique de confidentialité — BTP Guada" },
      { name: "description", content: "Comment BTP Guada collecte, traite et protège vos données personnelles, conformément au RGPD." },
      { property: "og:title", content: "Politique de confidentialité — BTP Guada" },
      { property: "og:description", content: "RGPD : finalités, durées, droits et contact DPO." },
    ],
  }),
  component: () => (
    <LegalLayout
      eyebrow="RGPD"
      title="Politique de confidentialité"
      icon={Lock}
      intro="BTP Guada s'engage à protéger vos données personnelles conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés."
      sections={[
        {
          title: "Données collectées",
          body: (
            <>
              <p>Nous collectons uniquement les données nécessaires au fonctionnement du service :</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Lors de la création d'un compte : nom, email, mot de passe (haché), téléphone optionnel.</li>
                <li>Pour les artisans : informations professionnelles, photos de réalisations, certifications.</li>
                <li>Lors d'une demande : description du projet, commune, budget, coordonnées.</li>
                <li>Données techniques : adresse IP, logs de connexion (sécurité, anti-fraude).</li>
              </ul>
            </>
          ),
        },
        {
          title: "Finalités du traitement",
          body: (
            <>
              <p>Vos données sont utilisées pour :</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Mettre en relation clients et artisans (base contractuelle).</li>
                <li>Gérer votre compte et vos demandes (base contractuelle).</li>
                <li>Sécuriser la plateforme et prévenir les fraudes (intérêt légitime).</li>
                <li>Vous adresser des notifications opérationnelles par email (base contractuelle).</li>
              </ul>
              <p>Aucune donnée n'est revendue à des tiers à des fins commerciales.</p>
            </>
          ),
        },
        {
          title: "Durée de conservation",
          body: (
            <>
              <p>Comptes actifs : pendant toute la durée de la relation, puis 3 ans après la dernière connexion.</p>
              <p>Demandes de devis et projets : 3 ans après la dernière interaction.</p>
              <p>Données de facturation (le cas échéant) : 10 ans, conformément aux obligations comptables.</p>
            </>
          ),
        },
        {
          title: "Vos droits",
          body: (
            <>
              <p>Conformément au RGPD, vous disposez à tout moment des droits suivants :</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Accès, rectification et effacement de vos données.</li>
                <li>Limitation et opposition au traitement.</li>
                <li>Portabilité de vos données.</li>
                <li>Définition de directives post-mortem.</li>
              </ul>
              <p>Pour exercer ces droits, écrivez à <strong>contact@btp-guada.fr</strong>. Vous pouvez également introduire une réclamation auprès de la <a href="https://www.cnil.fr" className="text-emerald hover:underline" target="_blank" rel="noopener">CNIL</a>.</p>
            </>
          ),
        },
        {
          title: "Cookies",
          body: (
            <>
              <p>Le site utilise uniquement des cookies strictement nécessaires (session d'authentification, préférences). Aucun cookie publicitaire ni de tracking tiers n'est déposé sans votre consentement.</p>
            </>
          ),
        },
        {
          title: "Sécurité",
          body: (
            <p>Toutes les communications sont chiffrées en HTTPS. Les mots de passe sont hachés. L'accès aux données est restreint et journalisé. Les sauvegardes sont quotidiennes.</p>
          ),
        },
      ]}
    />
  ),
});
