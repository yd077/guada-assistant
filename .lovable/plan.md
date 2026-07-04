## Réponse à l'audit — état actuel et reste à faire

Ce rapport reprend les 20 points de l'audit. Une grande partie a déjà été livrée dans les tours précédents. Ce plan liste **uniquement ce qui reste**, plus les décisions à trancher.

---

### Déjà livré (à valider visuellement, aucune action requise ici)

- Stats homepage à 0 → **section supprimée** (option A choisie).
- Faux profils "Artisans à la une" → remplacés par un bloc "Nos premiers artisans vérifiés arrivent bientôt" + CTA partenaire / projet.
- Téléphone placeholder `+590 590 00 00 00` → **retiré du footer et des mentions légales**.
- Badge "Edit with Lovable" → **masqué** (set_badge_visibility).
- Page `/tarifs` (packs 50/150/500 € + abonnements 0/29/49 €) → présente.
- Dashboard artisan + wallet + zone d'intervention → présents.
- Rôle client/artisan à l'inscription (`/auth`) → présent.
- Champ "Référence interne" conditionnel agences/syndics → présent dans `/projet`.
- Dispatch max 3 artisans + contestation 48 h + remboursement crédits → présents côté service.
- Pages `/mentions-legales`, `/confidentialite`, `/cgu` → contenu réel via `LegalLayout`.
- Pages `/sos`, `/contact-pro`, `/a-propos`, `/comment-ca-marche` (avec parcours artisan ajouté) → présentes.
- SEO par métier × commune (`/artisan/$metier/$commune`) + sitemap + robots → présents.
- Lien "Mot de passe oublié" + page `/reset-password` → ajoutés.

---

### Reste à faire

**Lot 1 — Google OAuth (audit 3.2)**

1. Activer le provider Google via `supabase--configure_social_auth`.
2. Ajouter un bouton "Continuer avec Google" sur `/auth` (onglets connexion + inscription) via le helper `lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin })`.
3. Router post-OAuth : lecture de la session, redirection vers `/dashboard` (artisan) ou `/` (client).

Facebook non supporté nativement par Lovable Cloud — je ne l'ajoute pas.

**Lot 2 — SEO & marque (audit 5.2, 6)**

4. **Nom de marque** : décision à prendre (voir question ci-dessous). Sans réponse, je conserve "BTP Guada" partout.
5. Vérifier/rédiger meta title + description uniques pour chaque route restante, en cohérence avec les mots-clés du BP ("artisan Guadeloupe", "devis travaux 971", "plombier urgence Guadeloupe"). Ajouter `canonical` + `og:url` sur les leaves qui n'en ont pas encore.

**Lot 3 — Vérification mobile (audit 5.3)**

6. Test Playwright headless (375×812 iOS, 412×914 Android) sur `/`, `/projet` (les 4 étapes), `/auth`, `/tarifs`, `/dashboard`. Captures d'écran + correction des zones de clic < 44 px et débordements éventuels.

**Lot 4 — Contact email opérationnel (audit 1.5)**

7. Point de confirmation utilisateur : la boîte `contact@btp-guada.fr` est-elle réellement active ? Sinon, je la remplace par une adresse temporaire fournie, ou je masque la ligne email du footer.

---

### Explicitement exclus (conformément à tes consignes précédentes)

- **OTP SMS sur `/projet`** (audit 2.3) : tu as dit "retire SMS, on remplacera par email plus tard". Statu quo — pas d'OTP pour l'instant.
- **Envois email transactionnels** (audit 2.7, réinit mdp) : désactivés jusqu'à la configuration du SMTP.
- **Configuration Stripe** (audit 2.2) : tu la fais toi-même via les paramètres admin. Le webhook et les server-fns sont en place côté code.

---

### Questions bloquantes avant exécution

1. **Nom de marque définitif** — "BTP Guada" (garder), "ArtisansGP", "Plateforme BTP & Services Guadeloupe", ou autre ? (impact : header, footer, meta, JSON-LD, mentions légales, emails futurs)
2. **Google OAuth** — je l'active maintenant ? (Facebook n'est pas dispo nativement, je le laisse de côté)
3. **Email `contact@btp-guada.fr`** — active et surveillée, ou à remplacer / masquer ?
4. **Test mobile Playwright** — je le lance après les corrections ci-dessus, ou uniquement à la fin ?
