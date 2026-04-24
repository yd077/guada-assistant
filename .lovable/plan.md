

# Plan : rendre la plateforme fonctionnelle et prête au déploiement

État actuel : interface premium complète mais **100% statique**. 6 artisans codés en dur, formulaires sans envoi réel, aucune authentification, aucune base de données. Voici tout ce qu'il manque pour passer du prototype à une plateforme exploitable.

## 1. Backend & base de données (Lovable Cloud)

Activer Lovable Cloud et créer le schéma :

- **profiles** — extension de `auth.users` (nom, téléphone, avatar, rôle d'affichage)
- **user_roles** — table séparée (`client` | `artisan` | `admin`) avec enum `app_role` + fonction `has_role()` SECURITY DEFINER (jamais sur profiles, sécurité critique)
- **artisans** — fiche pro liée à `auth.users` (spécialité, commune, bio, années d'expérience, certifications[], statut `pending` | `verified` | `rejected`)
- **portfolio_items** — photos de réalisations (artisan_id, url, titre)
- **reviews** — avis clients (artisan_id, author_id, note 1-5, commentaire, date) + contrainte unique par couple
- **projects** — projets soumis par les clients (spécialité, commune, surface, budget, délai, description, coordonnées, statut)
- **quote_requests** — demandes de devis directes à un artisan (project_id ou champs libres, message, statut `pending` | `read` | `responded`)

RLS activée partout :
- Annuaire artisans/portfolios/reviews : lecture publique uniquement si `verified`
- Projects/quotes : lisibles par leur auteur + l'artisan destinataire + admin
- Écriture : par le propriétaire authentifié uniquement
- Admin : full access via `has_role(auth.uid(), 'admin')`

Storage : bucket public `artisan-media` (avatars, covers, portfolios) avec policies par dossier `{user_id}/...`.

## 2. Authentification

Page `/auth` (sign-in + sign-up dans onglets) :
- Email + mot de passe (auto-confirm activé pour éviter friction de test)
- Au signup : choix du rôle (client ou artisan) → insertion dans `user_roles`
- Trigger `on_auth_user_created` → crée la ligne `profiles`
- Hook `useAuth()` partagé (session, user, role, signOut)
- Header : remplacer le bouton statique par menu utilisateur (avatar + déconnexion) si connecté

## 3. Câblage des pages existantes au backend

- **`/recherche`** — remplacer `ARTISANS` codé en dur par `useQuery` sur la table `artisans` filtrée côté serveur (specialty, location, min_rating). Pagination 12 par page.
- **`/artisan/$id`** — loader interroge Supabase au lieu de `getArtisanById()`. Ajout d'un formulaire d'avis pour clients connectés (un seul avis par artisan).
- **`/projet`** — soumission réelle dans `projects` via server function. Validation Zod stricte (longueurs min/max, email, téléphone). Email de confirmation au client + notification aux artisans correspondants (spécialité + commune).
- **`/contact-artisan/$id`** — insertion dans `quote_requests`. Validation Zod. Notification email à l'artisan.
- **`/succes`** — affiche l'ID de référence de la demande pour suivi.

## 4. Espaces utilisateurs (nouvelles routes)

- **`/dashboard`** — redirige selon rôle vers `/dashboard/client` ou `/dashboard/artisan`
- **`/dashboard/client`** — liste des projets soumis, statut, devis reçus
- **`/dashboard/artisan`** — 3 onglets :
  - *Profil* : édition fiche (bio, spécialité, certifications, photos portfolio via upload Storage)
  - *Demandes* : liste des `quote_requests` reçues, marquage lu/répondu
  - *Avis* : avis reçus, note moyenne
- **`/devenir-artisan`** — landing + formulaire d'inscription pro qui crée un compte avec rôle `artisan` et fiche en statut `pending`
- **`/dashboard/admin`** — modération : valider/rejeter les artisans `pending`, voir tous les projets, supprimer avis abusifs

## 5. Notifications email (server function)

Server function `sendNotificationEmail` utilisant Resend (via secret `RESEND_API_KEY`) :
- Confirmation projet soumis (client)
- Nouvelle demande de devis (artisan)
- Nouvel avis reçu (artisan)
- Validation/rejet de fiche (artisan)

Templates HTML simples avec branding BTP Guada.

## 6. Pages légales et institutionnelles manquantes

Routes obligatoires pour un déploiement public en France :
- **`/mentions-legales`**
- **`/confidentialite`** (RGPD)
- **`/cgu`**
- **`/comment-ca-marche`** (lien déjà présent dans footer mais cassé)
- **`/tarifs`** (lien déjà présent dans footer mais cassé)
- **`/contact`** — formulaire général

Mettre à jour le Footer pour activer ces liens.

## 7. SEO, robustesse & qualité

- `sitemap.xml` dynamique (route serveur listant artisans vérifiés + pages statiques)
- `robots.txt`
- Favicon + icônes Apple touch
- 404 personnalisée francisée (actuellement en anglais dans `__root.tsx`)
- `errorComponent` global dans `router.tsx` (defaultErrorComponent)
- Validation Zod côté serveur pour **toutes** les entrées utilisateur
- Limites strictes (longueur, regex) pour prévenir DoS et XSS
- Rate-limiting basique sur les soumissions de projets/devis (1 toutes les 30s par IP)

## 8. Données de démarrage

Script de seed (server function `/api/admin/seed`) qui insère les 6 artisans actuels comme données réelles dans Supabase, pour garder un site démontrable dès le premier chargement après déploiement.

## 9. Configuration de déploiement

- Vérifier `wrangler.jsonc` (Cloudflare Workers) : compatibilité OK
- Variables d'env nécessaires : `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY` (auto-injectées par Lovable Cloud sauf Resend à ajouter)
- Test final : build production + parcours complet (signup client → projet → signup artisan → devis → avis)

---

## Détails techniques

**Architecture serveur** : `createServerFn` pour la logique applicative (soumissions, modération), `createFileRoute` server handlers sous `/api/public/*` pour webhooks Resend si tracking. RLS partout — jamais de `supabaseAdmin` côté client.

**Stockage rôles** : strictement séparé dans `user_roles` avec fonction `has_role()` SECURITY DEFINER pour éviter récursion RLS et escalade de privilèges.

**Validation** : Zod côté client (UX) ET côté serveur (sécurité), schémas partagés dans `src/lib/validation.ts`.

**Découpage proposé en 4 livraisons** pour itérer proprement :
1. Cloud + auth + schéma DB + seed (fondations)
2. Câblage pages publiques au backend (lecture)
3. Espaces dashboard + emails (écriture authentifiée)
4. Pages légales + SEO + admin (production-ready)

```text
Couches finales
├─ Public         → /, /recherche, /artisan/$id, pages légales
├─ Authentifié    → /projet, /contact-artisan/$id, /dashboard/*
├─ Artisan only   → /dashboard/artisan/*
└─ Admin only     → /dashboard/admin
```

Approuvez ce plan et je passe en mode build pour commencer par la livraison 1 (Cloud + auth + DB).

