

## Correctif migration `supabase-migration-strategy.sql`

### Problème
`CREATE OR REPLACE VIEW` ne peut qu'ajouter des colonnes en fin de liste, jamais en renommer ou réordonner. La vue `available_leads` créée dans `supabase-migration-wallet.sql` a `description_preview` en 7ᵉ position. La nouvelle version insère `urgency_level` + `client_type` avant, ce qui décale les colonnes → PostgreSQL bloque.

### Correction (1 ligne ajoutée)

Dans `supabase-migration-strategy.sql`, juste avant le `create or replace view public.available_leads` (ligne 373), ajouter :

```sql
drop view if exists public.available_leads;
```

Puis garder le `create view public.available_leads as ...` tel quel (le `or replace` peut rester ou disparaître, sans incidence après le drop).

### Action utilisateur

1. J'applique le correctif dans le fichier `supabase-migration-strategy.sql`.
2. Vous relancez **uniquement** `supabase-migration-strategy.sql` dans le SQL Editor — il finira sans erreur cette fois.
3. Vous enchaînez ensuite avec `supabase-migration-completion.sql` (qui dépendait de `lead_unlocks` créé par strategy).

### Note
Aucun impact sur les données : `available_leads` est une vue (pas de stockage). Le drop+recreate est instantané. Le code TypeScript qui interroge la vue continue de fonctionner — toutes les colonnes d'origine sont préservées, seules de nouvelles s'ajoutent (`urgency_level`, `client_type`, `max_unlocks`, `unlocks_count`, `remaining_slots`, `available_at`).

