## Audit — Fonctionnalités stratégiques : ce qui manque

Voici l'état réel par rapport à la stratégie complète discutée.

---

### ✅ Déjà livré (fonctionnel)

**Lead-Flash**

- Limite 3 artisans/lead (`max_unlocks`) + badge "places restantes"
- Tiers d'abonnement (`free` / `premium` / `elite`) avec délais d'accès
- Compte à rebours 24h sur leads débloqués
- Bouton "Signaler ce lead" + modal réclamation

**Confiance**

- Upload Kbis + assurance décennale (Storage `artisan-docs`)
- Panel admin Vérifications (approve/reject)
- Blocage `unlock_lead` si artisan non vérifié
- Table `lead_disputes` + panel admin Réclamations

**Pro & Pricing**

- `urgency_level` (normal / urgent / sos)
- Champs Pro (`managed_units`, `desired_sla`)
- Grille `lead_pricing_rules` étendue + UI admin CRUD

**SEO**

- Routes `/sos/$metier` et `/sos/$metier/$commune`
- Page hub `/metiers/$metier`
- Composant `<RelatedLinks>` intégré sur `/artisan/$metier/$commune`
- Sitemap produit cartésien métiers × communes

**Paiements & Email**

- Admin Stripe (config en DB, mode test/live)
- Vérification email par lien magique

---

### ❌ Manquant — à implémenter

#### 1. Provider email réel (BLOQUANT en prod)

- Aucun envoi réel n'est branché. Le lien de vérification email est généré et stocké, mais **rien ne l'envoie au client**. Idem pour la relance 24h, les notifications artisan (nouveau lead, dispute approuvée), et le formulaire `/contact`.
- À faire : intégrer **Resend** via une server function TanStack (`/api/public/send-email` ou helper interne), templates HTML pour : vérification email, lead-flash artisan, relance 24h, approbation dispute, contact admin.

#### 2. Stripe en exécution (BLOQUANT pour le revenu)

- Les clés sont configurables dans l'admin, mais **aucun checkout n'existe**. Bouton "Recharger" du wallet est désactivé ("Bientôt disponible").
- À faire :
  - Server function `create-checkout-session` (achat de crédits artisan : packs 50/200/500 crédits).
  - Server function `create-subscription` (Premium / Élite mensuel).
  - Webhook `/api/public/stripe-webhook` avec vérif signature → crédite le wallet ou active la sub dans `artisan_subscriptions`.
  - UI : modale "Choisir un pack de crédits" dans `ArtisanWalletPanel`, page `/tarifs` avec boutons "Souscrire" branchés.

#### 3. Page `/contact-pro` (référencée mais inexistante)

- Le tunnel `/projet` parle d'un compte Pro pour Agences/Syndics mais aucune page n'existe.
- À faire : route `/contact-pro` avec formulaire qualifié (volume biens, métiers récurrents, SLA) → enregistre dans une table `pro_inquiries` + email admin.

#### 4. Page hub `/sos` (entrée d'urgence globale)

- On a `/sos/$metier` mais pas de landing `/sos` listant tous les métiers d'urgence avec téléphone géant. Forte opportunité SEO + conversion.

#### 5. Notifications & dashboard client

- Le client qui dépose un projet n'a aucun retour visuel sur **qui a débloqué son lead, combien de places restantes, statut de mise en relation**. Le `ClientDashboard` est minimal.
- À faire : section "Mes projets" avec : nb d'artisans contactés, badge "Vous serez recontacté sous 24h", bouton "Marquer comme contacté" (côté client pour validation croisée).

#### 6. Avis / `aggregateRating` pour le SEO

- Table `reviews` existe en DB mais aucun UI pour laisser un avis ni pour afficher la note dans le JSON-LD `LocalBusiness`. Manque pour le maillage SEO promis.
- À faire : formulaire d'avis post-mission (déclenché à la clôture d'unlock `won`), affichage étoiles sur fiches artisan, injection `aggregateRating` dans schema.org.

#### 7. Trigger de relance 24h côté DB

- La colonne `deadline_at` existe mais **aucun cron** ne déclenche la relance ni la réouverture du projet. Le compteur s'affiche mais ne fait rien.
- À faire : pg_cron toutes les heures → query unlocks `deadline_at < now() AND first_contact_at IS NULL` → enqueue email + `update projects set status='open'`.

#### 8. Page `/abonnements` (ou enrichir `/tarifs`)

- L'artisan ne voit nulle part comment **changer de tier**. Le tier est en DB mais sans UI de souscription/résiliation.

#### 9. Onboarding artisan complet

- L'inscription artisan ne force pas le parcours : profil → zones → documents → choix tier. Aujourd'hui un artisan peut créer son compte et rester invisible/non-vérifié sans guidage.

---

### Ordre de priorité recommandé


| #   | Bloc                                 | Impact                              | Complexité |
| --- | ------------------------------------ | ----------------------------------- | ---------- |
| 1   | **Resend (provider email)**          | Bloque vérif email, relances, leads | Moyenne    |
| 2   | **Stripe checkout + webhook**        | Bloque tout revenu                  | Élevée     |
| 3   | **Cron relance 24h**                 | Promesse client                     | Faible     |
| 4   | **Dashboard client enrichi**         | UX client                           | Moyenne    |
| 5   | **Avis + aggregateRating**           | SEO + confiance                     | Moyenne    |
| 6   | **Page `/contact-pro` + hub `/sos**` | Conversion                          | Faible     |
| 7   | **UI souscription tiers**            | Monétisation artisan                | Moyenne    |
| 8   | **Onboarding artisan guidé**         | Activation                          | Moyenne    |


---

fait tout sauf mail et stripe pour le moment

&nbsp;