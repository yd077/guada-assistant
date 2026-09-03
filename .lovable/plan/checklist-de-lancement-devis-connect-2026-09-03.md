## Checklist de lancement — Devis Connect

État vérifié aujourd'hui sur le projet réel (base, secrets, code, scan sécurité).

### Ce qui est déjà en place
- Stripe **live** : clés dans le coffre (`STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`), prioritaires sur le panneau admin. 3 packs de crédits actifs.
- Auth + rôles (client / artisan / admin), 1 admin existant, redirections `/espace-artisan` et `/espace-client`.
- Pages légales, tarifs, SOS, SEO métier × commune, sitemap, robots.
- Carte (Google avec repli OpenStreetMap), géocodage, dispatch de leads, wallet, contestation.

### Bloquants avant lancement

**1. Faille sécurité — table `profiles` lisible publiquement**
La policy `profiles_public_read` expose nom + téléphone de tous les utilisateurs à n'importe qui. À remplacer par une lecture limitée au propriétaire (`auth.uid() = id`) et aux admins, plus une vue publique restreinte si un affichage public est nécessaire.

**2. Aucun email transactionnel n'est envoyé**
`RESEND_API_KEY` n'est pas configuré : confirmations d'inscription, notification de nouveau lead à l'artisan, reçu de paiement, réinitialisation de mot de passe — tout est seulement loggé. Il faut activer un envoi réel (Resend + domaine `devis-connect.fr` vérifié) et réactiver les vérifications email désactivées pendant le développement.

**3. Contenu vide au lancement**
0 artisan vérifié, 0 projet. La homepage et la recherche afficheront des états vides. À traiter soit par un onboarding manuel des premiers artisans, soit en assumant les états « bientôt disponible » déjà en place.

**4. Mentions légales incomplètes**
Il manque la raison sociale exacte, le SIRET, la forme juridique, le capital et le n° TVA de l'éditeur — obligatoires (LCEN) pour une plateforme commerciale. Les CGU/CGV doivent aussi préciser les conditions de vente des crédits et abonnements (prix TTC, droit de rétractation pro, remboursement des leads contestés).

**5. Webhook Stripe à valider en conditions réelles**
Le endpoint `https://devis-connect.fr/api/public/stripe-webhook` doit être déclaré côté Stripe avec `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, puis testé par un achat réel de petit montant pour confirmer le crédit du wallet.

### Recommandé mais non bloquant
- Fonctions `SECURITY DEFINER` exécutables par anon/authenticated (avertissements du scan) : restreindre les `EXECUTE`.
- Consentement cookies / bandeau RGPD si analytics ou Google Maps chargé avant consentement.
- Page 404 et page d'erreur soignées, contrôle final des metas sur chaque route.
- Test de bout en bout mobile du parcours client (demande de devis) et artisan (inscription → achat de crédits → réception d'un lead).

### Détails techniques
- Correctifs SQL via migration : nouvelle policy `profiles`, `REVOKE EXECUTE` ciblés.
- Emails : secret `RESEND_API_KEY` + `NOTIFICATIONS_FROM_EMAIL`, puis retrait des bypass de confirmation dans `src/lib/auth.functions.ts` et réactivation des envois dans `src/integrations/email.server.ts`.
- Légal : texte à intégrer dans `src/routes/mentions-legales.tsx` et `src/routes/cgu.tsx` une fois les informations société fournies.

### À me confirmer
1. Les informations société (dénomination, SIRET, forme juridique, TVA) pour les mentions légales.
2. On active les emails maintenant (il me faut la clé Resend et un domaine vérifié) ou on lance sans ?
3. Je corrige la faille `profiles` et les avertissements sécurité dès maintenant ?
