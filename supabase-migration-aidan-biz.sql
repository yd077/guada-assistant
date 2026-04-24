-- ============================================================
-- BTP GUADA — Migration ALIGNEMENT DOSSIER AIDAN_BIZ
-- (Sprints A → E : tarifs, packs, Stripe, OTP email, notifs)
-- À exécuter APRÈS toutes les migrations précédentes
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- A. ALIGNEMENT TARIFAIRE (Packs + Tiers + Grille leads)
-- ────────────────────────────────────────────────────────────

-- A.1 Table des packs de crédits (Starter, Pro, Expert)
create table if not exists public.credit_packs (
  id text primary key,                       -- 'starter' | 'pro' | 'expert'
  name text not null,
  credits int not null,
  price_eur numeric(10,2) not null,
  highlight boolean not null default false,
  description text,
  sort_order int not null default 0,
  active boolean not null default true,
  stripe_price_id_test text,
  stripe_price_id_live text,
  created_at timestamptz not null default now()
);

alter table public.credit_packs enable row level security;

drop policy if exists "Packs visibles tous" on public.credit_packs;
create policy "Packs visibles tous"
  on public.credit_packs for select using (active = true);

drop policy if exists "Admin gère les packs" on public.credit_packs;
create policy "Admin gère les packs"
  on public.credit_packs for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

insert into public.credit_packs (id, name, credits, price_eur, highlight, description, sort_order)
values
  ('starter', 'Starter', 10, 50,  false, 'Pour démarrer ou tester un nouveau créneau.', 1),
  ('pro',     'Pro',     35, 150, true,  'Le meilleur ratio crédits / euro pour développer votre activité.', 2),
  ('expert',  'Expert',  120, 500, false, 'Pour les artisans qui chassent les gros chantiers et le marché pro.', 3)
on conflict (id) do update set
  name = excluded.name,
  credits = excluded.credits,
  price_eur = excluded.price_eur,
  highlight = excluded.highlight,
  description = excluded.description,
  sort_order = excluded.sort_order;

-- A.2 Métadonnées des tiers d'abonnement (rayons + prix dossier)
create table if not exists public.subscription_plans (
  tier public.subscription_tier primary key,
  name text not null,
  price_eur numeric(10,2) not null,
  radius_km int,                       -- null = toute la Guadeloupe
  delay_minutes int not null,
  description text,
  highlight boolean not null default false,
  stripe_price_id_test text,
  stripe_price_id_live text,
  active boolean not null default true
);

alter table public.subscription_plans enable row level security;

drop policy if exists "Plans visibles tous" on public.subscription_plans;
create policy "Plans visibles tous"
  on public.subscription_plans for select using (active = true);

drop policy if exists "Admin gère les plans" on public.subscription_plans;
create policy "Admin gère les plans"
  on public.subscription_plans for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

insert into public.subscription_plans (tier, name, price_eur, radius_km, delay_minutes, description, highlight)
values
  ('free',    'Standard', 0,   5,    30, 'Découvrez les leads autour de vous (5 km).', false),
  ('premium', 'Premium',  29,  25,   15, 'Voyez les leads avant la majorité du marché (rayon 25 km).', true),
  ('elite',   'Élite',    49,  null, 0,  'Accès immédiat à toute la Guadeloupe.', false)
on conflict (tier) do update set
  name = excluded.name,
  price_eur = excluded.price_eur,
  radius_km = excluded.radius_km,
  delay_minutes = excluded.delay_minutes,
  description = excluded.description,
  highlight = excluded.highlight;

-- A.3 Grille de coût des leads conforme au dossier (8/20/50/70)
-- On nettoie l'ancienne grille générique pour repartir propre
delete from public.lead_pricing_rules
  where label is null
    and specialty is null
    and client_type is null
    and urgency_level is null;

insert into public.lead_pricing_rules
  (specialty, client_type, urgency_level, min_budget_eur, max_budget_eur, credits_cost, label)
values
  -- Particuliers
  (null, 'particulier', null, 0,     2000,  8,  'Dépannage / petit travaux (<2k€)'),
  (null, 'particulier', null, 2001,  15000, 20, 'Chantier moyen (2k–15k€)'),
  (null, 'particulier', null, 15001, null,  50, 'Gros chantier (>15k€)'),
  -- Entreprises
  (null, 'entreprise',  null, 0,     null,  20, 'Demande entreprise'),
  -- Marché pro (agences / syndics)
  (null, 'agence',      null, 0,     null,  70, 'Marché pro — agence immobilière'),
  (null, 'syndic',      null, 0,     null,  70, 'Marché pro — syndic / régie')
on conflict do nothing;

-- ────────────────────────────────────────────────────────────
-- B. STRIPE CHECKOUT (achat de crédits)
-- ────────────────────────────────────────────────────────────

-- Table de suivi des sessions de paiement (idempotence webhook)
create table if not exists public.stripe_checkout_sessions (
  id text primary key,                              -- session id Stripe
  artisan_id uuid not null references public.artisans(id) on delete cascade,
  kind text not null check (kind in ('credits','subscription')),
  pack_id text references public.credit_packs(id),
  tier public.subscription_tier,
  credits_to_grant int,
  amount_eur numeric(10,2),
  status text not null default 'pending',           -- pending|completed|failed
  mode text not null check (mode in ('test','live')),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.stripe_checkout_sessions enable row level security;

drop policy if exists "Artisan voit ses sessions" on public.stripe_checkout_sessions;
create policy "Artisan voit ses sessions"
  on public.stripe_checkout_sessions for select
  using (
    exists (select 1 from public.artisans a where a.id = artisan_id and a.user_id = auth.uid())
    or public.has_role(auth.uid(), 'admin')
  );

-- ────────────────────────────────────────────────────────────
-- C. STRIPE SUBSCRIPTIONS (Premium / Élite)
-- ────────────────────────────────────────────────────────────

alter table public.artisan_subscriptions
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists current_period_end timestamptz,
  add column if not exists cancel_at_period_end boolean not null default false;

create index if not exists idx_artisan_subs_stripe_sub
  on public.artisan_subscriptions(stripe_subscription_id);

-- ────────────────────────────────────────────────────────────
-- D. OTP EMAIL pour /projet (remplace SMS)
-- ────────────────────────────────────────────────────────────
-- On réutilise les colonnes email_verification_token/sent_at déjà créées
-- dans payments-email.sql, et on ajoute un code OTP 6 chiffres pour
-- vérification "rapide" sans cliquer sur un lien.

alter table public.projects
  add column if not exists email_otp_code text,
  add column if not exists email_otp_expires_at timestamptz,
  add column if not exists email_otp_attempts int not null default 0;

create index if not exists idx_projects_email_otp
  on public.projects(email_verification_token, email_otp_code)
  where email_otp_code is not null;

-- RPC : vérifier le code OTP
create or replace function public.verify_project_otp(_token text, _code text)
returns table (project_id uuid, ok boolean, reason text)
language plpgsql
security definer
set search_path = public
as $$
declare
  _p public.projects%rowtype;
begin
  select * into _p from public.projects
    where email_verification_token = _token limit 1;
  if not found then
    return query select null::uuid, false, 'invalid_token';
    return;
  end if;
  if _p.email_verified then
    return query select _p.id, true, 'already_verified';
    return;
  end if;
  if _p.email_otp_expires_at is null or _p.email_otp_expires_at < now() then
    return query select _p.id, false, 'expired';
    return;
  end if;
  if _p.email_otp_attempts >= 5 then
    return query select _p.id, false, 'too_many_attempts';
    return;
  end if;
  if _p.email_otp_code is null or _p.email_otp_code <> _code then
    update public.projects set email_otp_attempts = email_otp_attempts + 1
      where id = _p.id;
    return query select _p.id, false, 'wrong_code';
    return;
  end if;
  update public.projects
    set email_verified = true,
        email_verified_at = now(),
        email_otp_code = null,
        email_verification_token = null
    where id = _p.id;
  return query select _p.id, true, 'ok'::text;
end;
$$;

grant execute on function public.verify_project_otp(text, text) to anon, authenticated;

-- ────────────────────────────────────────────────────────────
-- E. NOTIFICATIONS EMAIL (artisan sur nouveau lead)
-- ────────────────────────────────────────────────────────────

create table if not exists public.notification_log (
  id uuid primary key default gen_random_uuid(),
  artisan_id uuid references public.artisans(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  channel text not null default 'email',
  kind text not null,                               -- 'new_lead' | 'otp' | ...
  status text not null default 'sent',              -- sent|failed
  error text,
  created_at timestamptz not null default now()
);

alter table public.notification_log enable row level security;

drop policy if exists "Artisan voit ses notifs" on public.notification_log;
create policy "Artisan voit ses notifs"
  on public.notification_log for select
  using (
    artisan_id is null
    or exists (select 1 from public.artisans a where a.id = artisan_id and a.user_id = auth.uid())
    or public.has_role(auth.uid(), 'admin')
  );

-- Préférence artisan pour recevoir les alertes leads
alter table public.artisans
  add column if not exists notify_new_leads boolean not null default true;
