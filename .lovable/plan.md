## Audit vs. dossier business `AIDAN_BIZ.pdf` — Ce qui manque

Comparaison entre la stratégie présentée dans votre PDF et l'état réel du code.

---

### ✅ Déjà livré (conforme au dossier)


| Élément du dossier                                                | État                      |
| ----------------------------------------------------------------- | ------------------------- |
| Tunnel multi-profils (Particulier / Entreprise / Agence / Syndic) | ✅ `/projet` 4 étapes      |
| Réf. interne pour clients pro                                     | ✅ champ `internal_ref`    |
| Mobile-first                                                      | ✅                         |
| Dashboard artisan géolocalisé (rayon km)                          | ✅ `ArtisanZoneEditor`     |
| Documents Kbis + Décennale                                        | ✅ `ArtisanDocumentsPanel` |
| Wallet de crédits + historique                                    | ✅ `ArtisanWalletPanel`    |
| Système Lead-Flash (3 artisans max, délais par tier)              | ✅ migration strategy      |
| Abonnements Free/Premium/Élite                                    | ✅ `/abonnements`          |
| SEO local : `/artisan/[metier]/[commune]`                         | ✅                         |
| Schema markup LocalBusiness + AggregateRating                     | ✅                         |
| Hub `/sos` + pages SOS par métier/commune                         | ✅                         |
| Admin : artisans, projets, paiements, litiges, wallets            | ✅                         |


---

### ❌ Écarts par rapport au dossier business

#### 1. Grille tarifaire artisan **non conforme au PDF**

Le PDF annonce :

- **Packs crédits** : Starter 10cr/50€, Pro 35cr/150€, Expert 120cr/500€
- **Abonnements** : Gratuit 5km / Premium 25km/29€ / Élite Toute la Guadeloupe/49€
- **Coût par lead** : 8 cr (dépannage) / 20 cr (moyen) / 50 cr (gros) / 70 cr (marché pro)

Code actuel :

- `/tarifs` affiche "Artisan Pro 39€" — **ne correspond pas** aux packs du dossier
- `/abonnements` affiche les 3 tiers mais sans les rayons (5/25/Toute Guadeloupe) ni les prix exacts (29€/49€) du PDF
- Pas de page "Packs de crédits" affichant Starter/Pro/Expert
- Aucune règle visible de prix par type de demande (8/20/50/70 cr)



#### 3. Paiement Stripe **non branché**

- Bouton "Recharger" du wallet : `disabled` avec tooltip "Bientôt disponible"
- `/abonnements` : commentaire explicite "Pas de Stripe pour l'instant"
- L'admin peut saisir les clés Stripe mais aucun checkout/webhook n'existe côté code applicatif
- Pas de facturation automatique mensuelle pour abonnements
- Pas de Stripe Connect pour remboursements





#### 6. Mots-clés SEO du dossier non couverts

Le PDF cite "Urgence plomberie agence Guadeloupe", "Devis travaux 971". Pas de page dédiée "marché pro" / agences-syndics avec ces mots-clés (existe `/contact-pro` mais sans contenu SEO travaillé).

---

### 🎯 Priorisation suggérée (par impact business)


| Priorité  | Chantier                                                                                                                   | Impact                    |
| --------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| 🔴 **P0** | Aligner `/tarifs` + `/abonnements` sur la grille exacte du dossier (packs Starter/Pro/Expert, rayons 5/25/GP, prix 29/49€) | Cohérence pitch ↔ produit |
| 🔴 **P0** | Stripe Checkout : achat de packs de crédits (3 produits)                                                                   | Monétisation immédiate    |
| 🟠 **P1** | Stripe Subscriptions pour Premium 29€ / Élite 49€ + webhook                                                                | Récurrent mensuel         |
| 🟠 **P1** | Vérification OTP SMS via Twilio sur formulaire `/projet`                                                                   | Qualité des leads         |
| 🟡 **P2** | Notifications email (puis SMS) artisan quand un lead match                                                                 | Activation artisan        |
| 🟡 **P2** | Page `/a-propos` ou `/investisseurs` reprenant le pitch                                                                    | Crédibilité               |


---

### 📋 Plan d'action proposé (à approuver)

Je propose de traiter dans cet ordre, en **un sprint = un livrable** :

1. **Sprint A — Alignement tarifaire (sans paiement)**
  Refondre `/tarifs` et `/abonnements` pour matcher le dossier exactement (3 packs crédits, 3 abonnements avec rayons et prix, grille de coût par type de lead). Mettre à jour les seeds DB pour les tarifs serveurs.
2. **Sprint B — Stripe achat de crédits**
  Activer Stripe via le connecteur Lovable, créer une server function `create-checkout` + webhook `/api/public/stripe-webhook`, créditer le wallet à la confirmation.
3. **Sprint C — Stripe abonnements Premium/Élite**
  Subscriptions mensuelles, mise à jour `artisan_subscriptions.tier` via webhook, gestion résiliation.
4. **Sprint D — OTP SMS (Twilio)**
  Server function `send-otp` + `verify-otp`, branchement à l'étape 4 du tunnel `/projet`.
5. **Sprint E — Notifications leads + page pitch**
  Email transactionnel artisan sur nouveau lead matchant + page `/a-propos` reprenant le dossier.

**Question** : on commence par le **Sprint A** seul (alignement visuel sans payer encore), ou je groupe **A + B** (alignement + Stripe crédits) en un seul lot ?  on commence par tout mais retire sms on remplacera par email. Je configurerai stripe dans les parametres admin