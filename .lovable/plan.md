

## Livraison 8 — Compléments stratégiques (Lead-Flash, Confiance, Pro, SEO local)

Cette livraison renforce les piliers de la promesse client : exclusivité des leads, priorité par abonnement, vérification stricte des artisans, parcours pro, et SEO local exhaustif.

---

### 1. Système de Leads — Lead-Flash renforcé

**1.1 Limite à 3 artisans maximum par lead**
- Ajout d'une colonne `max_unlocks` (défaut = 3) sur `projects`.
- Le RPC `unlock_lead` vérifie le nombre d'unlocks déjà existants pour le projet et refuse au-delà avec `error: 'lead_full'`.
- La vue `available_leads` masque les projets ayant atteint le quota (filtre `unlocks_count < max_unlocks`).
- Badge "Plus que X places" affiché dans les cartes de leads.

**1.2 Priorité temporelle par abonnement (Standard / Premium / Élite)**
- Nouvelle table `artisan_subscriptions` avec `tier` enum (`free`, `premium`, `elite`) et dates de validité.
- Colonne `available_at` calculée sur les leads selon le tier de l'artisan :
  - Élite : accès immédiat (T+0)
  - Premium : T+15 minutes
  - Free : T+30 minutes
- La vue `available_leads` joint le tier de l'utilisateur courant via `auth.uid()` et filtre par `now() >= available_at`.
- Badge "🔒 Réservé Élite — disponible dans 12 min" pour leads en attente.
- Toast Lead-Flash personnalisé selon le tier (priorité visuelle).

**1.3 Mise en relation < 24h — suivi automatisé**
- Trigger PostgreSQL : à chaque unlock, planification d'un check à T+24h.
- Champ `first_contact_at` sur `lead_unlocks` (rempli quand statut → `contacted`).
- Si `first_contact_at` reste null après 24h → le client reçoit un email de relance automatique + le projet redevient `open` pour permettre 1 unlock supplémentaire.
- Compteur visible dans le dashboard artisan : "⏱ Contactez sous 18h".

---

### 2. Confiance — Vérification & Réclamation

**2.1 Vérification stricte Kbis + Décennale**
- Nouvelles colonnes sur `artisans` : `kbis_url`, `insurance_url`, `kbis_verified_at`, `insurance_verified_at`, `verification_status` (`pending`, `verified`, `rejected`).
- Upload via Supabase Storage (bucket privé `artisan-docs` avec RLS : artisan lit/écrit ses propres docs, admin lit tout).
- Section "Documents" dans `ArtisanDashboard` avec upload + statut de validation.
- Panel admin : nouvel onglet "Vérifications" listant les docs en attente, preview PDF/image, boutons Approuver/Rejeter avec motif.
- **Blocage métier** : un artisan ne peut acheter aucun lead tant que `verification_status != 'verified'` (vérification dans le RPC `unlock_lead`).

**2.2 Bouton "Lead invalide" dans le dashboard artisan**
- Nouvelle table `lead_disputes` : `unlock_id`, `reason` enum (`wrong_number`, `not_reachable`, `not_owner`, `out_of_zone`, `other`), `description`, `status` (`pending`, `approved`, `rejected`).
- Bouton "Signaler ce lead" sur chaque lead débloqué → modal de réclamation.
- Panel admin : nouvel onglet "Réclamations" avec validation manuelle. À l'approbation : appel automatique de `admin_refund_unlock` (déjà existant) → recrédit instantané du wallet.

---

### 3. Segmentation Pro — Agences & Syndics

**3.1 Parcours dédié Agences/Syndics dans le tunnel**
- L'étape "Profil" du tunnel `/projet` (déjà existante avec `client_type`) affiche une bannière dédiée pour Agences/Syndics : "Volume élevé ? Demandez un compte Pro" (lien vers `/contact-pro`).
- Pour `client_type ∈ {agence, syndic}` : champs supplémentaires conditionnels (nombre de biens gérés, urgence, SLA souhaité).
- Nouveau champ `urgency_level` : `normal`, `urgent` (24h), `sos` (immédiat).

**3.2 Grille tarifaire dynamique étendue**
- Extension de `lead_pricing_rules` avec colonnes additionnelles :
  - `client_type` (filtre par profil — `agence`/`syndic` = +30% crédits)
  - `urgency_level` (`sos` = ×2, `urgent` = ×1.5)
  - `specialty` (déjà présent)
- Nouvelles règles seedées :
  - Dépannage urgent (plomberie/serrurerie, budget <2000€, urgent) : 8 crédits
  - Gros chantier (>50k€) : 50 crédits
  - Marché pro (agence/syndic, gros volume) : 70 crédits
- La fonction `compute_lead_price` est étendue pour pondérer selon `client_type` et `urgency_level`.
- UI admin : éditeur de la grille tarifaire (CRUD sur `lead_pricing_rules`) dans l'onglet "Wallets & leads".

---

### 4. SEO local

**4.1 Pages SOS (urgence haute conversion)**
- Nouvelle route `src/routes/sos.$metier.tsx` (ex : `/sos/plomberie`, `/sos/serrurerie`).
- H1 dédié "SOS Plomberie Guadeloupe — Intervention en moins de 2h", numéro click-to-call géant, formulaire simplifié (3 champs : nom, tél, commune) qui crée un projet avec `urgency_level='sos'`.
- Liste des 32 communes en maillage interne vers `/sos/plomberie/[commune]`.
- Schema.org `EmergencyService` + `LocalBusiness` injecté.

**4.2 Maillage exhaustif métier × commune**
- La route existante `/artisan/$metier/$commune` est déjà en place. On l'étend par :
  - Génération du `sitemap.xml` enrichi : produit cartésien `METIERS × COMMUNES` (≈ 20 métiers × 32 communes = 640 URLs SEO).
  - Composant `<RelatedLinks>` au bas de chaque page artisan/commune avec liens vers les communes voisines (calcul Haversine sur `COMMUNES_LIST`) et autres métiers de la même commune.
  - Schema.org `LocalBusiness` enrichi : `areaServed` rempli avec la commune + GPS, `priceRange`, `aggregateRating` si avis dispo.
- Page hub `/metiers/$metier` listant les 32 communes en grid pour booster le maillage.

---

### Détails techniques

**Nouveaux fichiers**
- `supabase-migration-strategy.sql` — toutes les modifications DB ci-dessus en un seul fichier.
- `src/services/subscriptions.ts` — fetch tier courant, helpers de priorité.
- `src/services/disputes.ts` — création/lecture de réclamations.
- `src/services/documents.ts` — upload Kbis/décennale via Storage.
- `src/components/dashboard/ArtisanDocumentsPanel.tsx` — UI upload + statut.
- `src/components/dashboard/LeadDisputeModal.tsx` — modal réclamation.
- `src/components/admin/AdminVerificationsPanel.tsx` — validation Kbis/décennale.
- `src/components/admin/AdminDisputesPanel.tsx` — gestion réclamations.
- `src/components/admin/AdminPricingRulesPanel.tsx` — éditeur grille tarifaire.
- `src/routes/sos.$metier.tsx` + `src/routes/sos.$metier.$commune.tsx`.
- `src/routes/metiers.$metier.tsx` — page hub métier.
- `src/components/site/RelatedLinks.tsx` — maillage interne.

**Fichiers modifiés**
- `src/services/wallet.ts` — gérer `lead_full`, `available_at`, statut vérifié.
- `src/components/dashboard/ArtisanWalletPanel.tsx` — badges priorité/places restantes/compte à rebours 24h, bouton "Signaler".
- `src/components/dashboard/ArtisanDashboard.tsx` — nouvelle section Documents + statut vérification.
- `src/routes/admin.tsx` — onglets "Vérifications", "Réclamations", "Tarification".
- `src/routes/projet.tsx` — champs urgency_level + bannière Pro pour agence/syndic.
- `src/routes/sitemap[.]xml.ts` — produit cartésien métiers × communes + pages SOS.

**Storage Supabase**
- Bucket privé `artisan-docs` avec policies RLS (artisan lit/écrit ses fichiers, admin lit tout).

**Pas dans cette livraison** (gardés pour plus tard) :
- Stripe Connect pour rechargement wallet et paiement abonnements (déjà préparé via la table `payment_settings`).
- Envoi réel d'emails de relance 24h (nécessite le provider email final).

---

### Action requise après implémentation

1. Exécuter `supabase-migration-strategy.sql` dans le SQL Editor.
2. Créer manuellement le bucket Storage `artisan-docs` (privé) — ou le faire via la migration.
3. Tester le flux complet : upload Kbis → validation admin → unlock → réclamation → remboursement.

