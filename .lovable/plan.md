## Plan de réponse à l'audit

Note: plusieurs points de l'audit sont **déjà livrés** dans le code (page /tarifs avec packs crédits + abonnements, dashboard artisan + wallet, rôle client/artisan à l'inscription, champ `internal_ref` pour agences/syndics, pages légales, dispatch 3 artisans max, contestation 48h, SEO `/artisan/[metier]/[commune]`). Le plan ci-dessous traite uniquement le **reste réellement manquant**, en respectant tes choix actés: **pas de SMS** (remplacé par email plus tard) et **vérifications email désactivées** jusqu'au SMTP.

---

### Lot 1 — Crédibilité (BLOQUANT, priorité 1)

1. **Homepage — supprimer données fictives**
   - Masquer la section stats `0+ / 0+ / 0 / 0%` (la retirer tant qu'on n'a pas de vraies données).
   - Remplacer la section "Artisans à la une" (qui lit `ARTISANS` fictifs) par un état vide premium: "Nos premiers artisans vérifiés arrivent bientôt" + CTA `Devenir partenaire` / `Soumettre un projet`.
   - Garder les compteurs `count` des métiers mais les remplacer par des libellés neutres (sans nombre inventé).

2. **Footer — placeholders**
   - Retirer le numéro `+590 590 00 00 00` (masquer la ligne tant qu'aucun numéro réel).
   - Garder `contact@btp-guada.fr` (à toi de confirmer la boîte; sinon je la masquerai aussi sur demande).
   - Retirer les liens morts du footer ou les pointer vers une vraie page (cf. Lot 3).

3. **Badge "Edit with Lovable"** — je le masquerai côté projet (option Pro requise).

---

### Lot 2 — Auth & parcours (BLOQUANT/MOYEN)

4. **Mot de passe oublié** sur `/auth` (onglet connexion) + nouvelle page `/reset-password` (publique). Email Supabase natif — désactivé tant que SMTP non configuré, le bouton restera mais avec message "Bientôt disponible" pour cohérence avec ta consigne "pas de vérif email pour l'instant".
5. **Google OAuth** sur `/auth` via `lovable.auth.signInWithOAuth("google", ...)` + appel `supabase--configure_social_auth`. (Facebook non supporté nativement — je ne l'ajoute pas.)
6. **Pas d'OTP SMS** sur `/projet`: conformément à ta consigne, on garde le tunnel actuel sans vérification téléphone. Je laisse un TODO clair dans le code pour brancher l'email de confirmation plus tard.

---

### Lot 3 — Pages manquantes (MOYEN)

7. **`/sos`** — page d'urgence 24/7 avec CTA WhatsApp/téléphone (placeholder neutre tant que pas de numéro).
8. **`/contact-pro`** — landing Agences/Syndics avec formulaire de pré-inscription (déjà câblé via `proInquiries`, juste vérifier que la page existe et l'enrichir si vide).
9. **`/comment-ca-marche`** — ajouter un onglet/section "Parcours artisan" (inscription → vérif docs → zone → leads → crédits).
10. **Pages légales** — vérifier `/mentions-legales`, `/confidentialite`, `/cgu` et compléter le contenu si vide (trames standard plateforme de mise en relation FR).

---

### Lot 4 — SEO & marque (MOYEN)

11. **Métadonnées** — passer en revue chaque route et écrire title/description uniques ciblés Guadeloupe (mots-clés: artisan Guadeloupe, devis travaux 971, etc.). Les pages SEO `/artisan/[metier]/[commune]` existent déjà — je vérifierai juste leurs meta + schema LocalBusiness.
12. **Nom de marque** — **décision à prendre** (cf. question ci-dessous) avant remplacement global "BTP Guada" → nom retenu.

---

### Hors scope (déjà fait ou exclu par tes consignes)

- Page /tarifs + packs crédits + abonnements ✅
- Dashboard artisan + wallet + zone ✅
- Tunnel inscription artisan (via `/auth` rôle artisan + onboarding checklist) ✅
- Champ "Référence interne" agences/syndics ✅
- Dispatch 3 artisans max + contestation 48h + remboursement crédits ✅
- Stripe — configuration via panneau admin (toi)
- OTP SMS et notifications SMS — exclus (sera email)
- Vérifications email — désactivées pour l'instant

---

### Questions avant exécution

1. **Nom de marque définitif**: "BTP Guada", "ArtisansGP", ou autre ? (impacte header/footer/SEO partout)
2. **Footer téléphone**: je masque complètement la ligne, ou je mets un lien WhatsApp avec un numéro que tu me donnes ?
3. **Lot 1 (crédibilité) seul d'abord**, puis je propose les lots 2-4 ? Ou **je fais les 4 lots d'un coup** ?
