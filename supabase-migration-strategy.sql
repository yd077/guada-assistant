-- ============================================================
-- BTP GUADA — Migration STRATÉGIE (Lead-Flash, Confiance, Pro, SEO)
-- À exécuter APRÈS supabase-migration-wallet.sql et payments-email.sql
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. LEAD-FLASH RENFORCÉ
-- ────────────────────────────────────────────────────────────

-- 1.1 Limite à N artisans max par lead
alter table public.projects
  add column if not exists max_unlocks int not null default 3;

-- 1.2 Niveau d'urgence (normal | urgent | sos)
do $$ begin
  create type public.urgency_level as enum ('normal','urgent','sos');
exception when duplicate_object then null; end $$;

alter table public.projects
  add column if not exists urgency_level public.urgency_level not null default 'normal';

-- 1.3 Champs Pro (déjà présents en partie)
alter table public.projects
  add column if not exists managed_units int,
  add column if not exists desired_sla text;

-- 1.4 Suivi mise en relation < 24h
alter table public.lead_unlocks
  add column if not exists first_contact_at timestamptz,
  add column if not exists deadline_at timestamptz;

-- backfill deadline_at = unlocked_at + 24h
update public.lead_unlocks set deadline_at = unlocked_at + interval '24 hours'
  where deadline_at is null;

-- Trigger : à chaque unlock, fixer first_contact_at quand status passe à 'contacted'
create or replace function public.set_first_contact_at()
returns trigger
language plpgsql as $$
begin
  if new.status = 'contacted' and old.status <> 'contacted' and new.first_contact_at is null then
    new.first_contact_at := now();
  end if;
  return new;
end $$;

drop trigger if exists lead_unlocks_first_contact on public.lead_unlocks;
create trigger lead_unlocks_first_contact
  before update on public.lead_unlocks
  for each row execute function public.set_first_contact_at();

-- ────────────────────────────────────────────────────────────
-- 2. ABONNEMENTS / TIERS (priorité temporelle)
-- ────────────────────────────────────────────────────────────

do $$ begin
  create type public.subscription_tier as enum ('free','premium','elite');
exception when duplicate_object then null; end $$;

create table if not exists public.artisan_subscriptions (
  artisan_id uuid primary key references public.artisans(id) on delete cascade,
  tier public.subscription_tier not null default 'free',
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  updated_at timestamptz not null default now()
);
alter table public.artisan_subscriptions enable row level security;

drop policy if exists "Artisan lit son abonnement" on public.artisan_subscriptions;
create policy "Artisan lit son abonnement"
  on public.artisan_subscriptions for select
  using (
    exists (select 1 from public.artisans a where a.id = artisan_id and a.user_id = auth.uid())
    or public.has_role(auth.uid(), 'admin')
  );

drop policy if exists "Admin gère les abonnements" on public.artisan_subscriptions;
create policy "Admin gère les abonnements"
  on public.artisan_subscriptions for all
  using (public.has_role(auth.uid(), 'admin'));

-- Backfill : free pour tous les artisans existants
insert into public.artisan_subscriptions (artisan_id, tier)
  select id, 'free' from public.artisans
  on conflict (artisan_id) do nothing;

-- Trigger : abonnement free auto à la création d'un artisan
create or replace function public.create_subscription_for_new_artisan()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.artisan_subscriptions (artisan_id, tier)
  values (new.id, 'free')
  on conflict (artisan_id) do nothing;
  return new;
end $$;

drop trigger if exists artisans_subscription_init on public.artisans;
create trigger artisans_subscription_init
  after insert on public.artisans
  for each row execute function public.create_subscription_for_new_artisan();

-- Helper : tier courant
create or replace function public.current_artisan_tier()
returns public.subscription_tier
language sql stable security definer set search_path = public as $$
  select coalesce(s.tier, 'free'::public.subscription_tier)
  from public.artisans a
  left join public.artisan_subscriptions s on s.artisan_id = a.id
  where a.user_id = auth.uid()
  limit 1;
$$;

-- Délai en minutes selon le tier (Élite=0, Premium=15, Free=30)
create or replace function public.tier_delay_minutes(t public.subscription_tier)
returns int
language sql immutable as $$
  select case t
    when 'elite' then 0
    when 'premium' then 15
    else 30
  end;
$$;

-- ────────────────────────────────────────────────────────────
-- 3. CONFIANCE — Vérification Kbis & Décennale
-- ────────────────────────────────────────────────────────────

do $$ begin
  create type public.verification_status as enum ('pending','verified','rejected');
exception when duplicate_object then null; end $$;

alter table public.artisans
  add column if not exists kbis_url text,
  add column if not exists insurance_url text,
  add column if not exists kbis_verified_at timestamptz,
  add column if not exists insurance_verified_at timestamptz,
  add column if not exists verification_status public.verification_status not null default 'pending',
  add column if not exists verification_note text;

-- Bucket privé artisan-docs
insert into storage.buckets (id, name, public)
  values ('artisan-docs', 'artisan-docs', false)
  on conflict (id) do nothing;

-- Policies storage : artisan lit/écrit son dossier ; admin lit tout
drop policy if exists "Artisan lit ses docs" on storage.objects;
create policy "Artisan lit ses docs"
  on storage.objects for select
  using (
    bucket_id = 'artisan-docs' and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.has_role(auth.uid(), 'admin')
    )
  );

drop policy if exists "Artisan upload ses docs" on storage.objects;
create policy "Artisan upload ses docs"
  on storage.objects for insert
  with check (
    bucket_id = 'artisan-docs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Artisan met à jour ses docs" on storage.objects;
create policy "Artisan met à jour ses docs"
  on storage.objects for update
  using (
    bucket_id = 'artisan-docs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Artisan supprime ses docs" on storage.objects;
create policy "Artisan supprime ses docs"
  on storage.objects for delete
  using (
    bucket_id = 'artisan-docs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Admin gère artisan-docs" on storage.objects;
create policy "Admin gère artisan-docs"
  on storage.objects for all
  using (bucket_id = 'artisan-docs' and public.has_role(auth.uid(), 'admin'));

-- ────────────────────────────────────────────────────────────
-- 4. RÉCLAMATIONS (lead invalide)
-- ────────────────────────────────────────────────────────────

do $$ begin
  create type public.dispute_reason as enum (
    'wrong_number','not_reachable','not_owner','out_of_zone','other'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.dispute_status as enum ('pending','approved','rejected');
exception when duplicate_object then null; end $$;

create table if not exists public.lead_disputes (
  id uuid primary key default gen_random_uuid(),
  unlock_id uuid not null references public.lead_unlocks(id) on delete cascade,
  artisan_id uuid not null references public.artisans(id) on delete cascade,
  reason public.dispute_reason not null,
  description text,
  status public.dispute_status not null default 'pending',
  resolved_at timestamptz,
  resolved_note text,
  created_at timestamptz not null default now()
);
alter table public.lead_disputes enable row level security;

create index if not exists idx_lead_disputes_artisan on public.lead_disputes(artisan_id, created_at desc);
create index if not exists idx_lead_disputes_status on public.lead_disputes(status);

drop policy if exists "Artisan lit ses réclamations" on public.lead_disputes;
create policy "Artisan lit ses réclamations"
  on public.lead_disputes for select
  using (
    exists (select 1 from public.artisans a where a.id = artisan_id and a.user_id = auth.uid())
    or public.has_role(auth.uid(), 'admin')
  );

drop policy if exists "Artisan crée ses réclamations" on public.lead_disputes;
create policy "Artisan crée ses réclamations"
  on public.lead_disputes for insert
  with check (
    exists (select 1 from public.artisans a where a.id = artisan_id and a.user_id = auth.uid())
  );

drop policy if exists "Admin gère les réclamations" on public.lead_disputes;
create policy "Admin gère les réclamations"
  on public.lead_disputes for all
  using (public.has_role(auth.uid(), 'admin'));

-- RPC : approuver une réclamation → rembourse + clôture
create or replace function public.admin_approve_dispute(p_dispute_id uuid, p_note text default null)
returns json
language plpgsql security definer set search_path = public as $$
declare
  v_unlock uuid;
  v_artisan uuid;
  v_amount int;
  v_project uuid;
begin
  if not public.has_role(auth.uid(), 'admin') then
    return json_build_object('ok', false, 'error', 'forbidden');
  end if;

  select unlock_id, artisan_id into v_unlock, v_artisan
    from public.lead_disputes where id = p_dispute_id;
  if v_unlock is null then
    return json_build_object('ok', false, 'error', 'not_found');
  end if;

  select credits_spent, project_id into v_amount, v_project
    from public.lead_unlocks where id = v_unlock;

  perform public.admin_adjust_wallet(
    v_artisan, v_amount, 'refund',
    coalesce(p_note, 'Réclamation approuvée — lead invalide'),
    v_project
  );

  update public.lead_unlocks set status = 'lost' where id = v_unlock;
  update public.lead_disputes
    set status = 'approved', resolved_at = now(), resolved_note = p_note
    where id = p_dispute_id;

  return json_build_object('ok', true, 'refunded', v_amount);
end $$;

create or replace function public.admin_reject_dispute(p_dispute_id uuid, p_note text default null)
returns json
language plpgsql security definer set search_path = public as $$
begin
  if not public.has_role(auth.uid(), 'admin') then
    return json_build_object('ok', false, 'error', 'forbidden');
  end if;
  update public.lead_disputes
    set status = 'rejected', resolved_at = now(), resolved_note = p_note
    where id = p_dispute_id;
  return json_build_object('ok', true);
end $$;

-- ────────────────────────────────────────────────────────────
-- 5. GRILLE TARIFAIRE ÉTENDUE
-- ────────────────────────────────────────────────────────────

alter table public.lead_pricing_rules
  add column if not exists client_type text,        -- null = wildcard
  add column if not exists urgency_level public.urgency_level,  -- null = wildcard
  add column if not exists label text;

-- Recalcul prix en tenant compte client_type & urgency
create or replace function public.compute_lead_price(
  p_specialty text,
  p_budget_eur int,
  p_client_type text default 'particulier',
  p_urgency public.urgency_level default 'normal'
)
returns int
language plpgsql stable as $$
declare
  v_base int;
  v_pro_factor numeric := 1.0;
  v_urgency_factor numeric := 1.0;
begin
  -- Règle la plus spécifique d'abord
  select credits_cost into v_base
  from public.lead_pricing_rules
  where (specialty is null or specialty = p_specialty)
    and (client_type is null or client_type = p_client_type)
    and (urgency_level is null or urgency_level = p_urgency)
    and p_budget_eur >= min_budget_eur
    and (max_budget_eur is null or p_budget_eur <= max_budget_eur)
  order by
    (specialty = p_specialty)::int desc,
    (client_type = p_client_type)::int desc,
    (urgency_level = p_urgency)::int desc,
    credits_cost desc
  limit 1;

  v_base := coalesce(v_base, 8);

  if p_client_type in ('agence','syndic') then
    v_pro_factor := 1.30;
  end if;

  if p_urgency = 'sos' then
    v_urgency_factor := 2.0;
  elsif p_urgency = 'urgent' then
    v_urgency_factor := 1.5;
  end if;

  return ceil(v_base * v_pro_factor * v_urgency_factor)::int;
end $$;

-- Maj du trigger pour tenir compte des nouveaux paramètres
create or replace function public.set_project_lead_price()
returns trigger
language plpgsql as $$
begin
  if new.lead_price_credits is null then
    new.lead_price_credits := public.compute_lead_price(
      new.specialty,
      public.extract_budget_eur(new.budget),
      coalesce(new.client_type::text, 'particulier'),
      coalesce(new.urgency_level, 'normal'::public.urgency_level)
    );
  end if;
  return new;
end $$;

-- Règles seedées additionnelles
insert into public.lead_pricing_rules (specialty, min_budget_eur, max_budget_eur, credits_cost, urgency_level, label)
values
  (null, 0, 2000, 8, 'urgent', 'Dépannage urgent (<2k€)'),
  (null, 50001, null, 50, null, 'Gros chantier (>50k€)')
on conflict do nothing;

insert into public.lead_pricing_rules (specialty, min_budget_eur, max_budget_eur, credits_cost, client_type, label)
values
  (null, 0, null, 70, 'agence', 'Marché pro agence'),
  (null, 0, null, 70, 'syndic', 'Marché pro syndic')
on conflict do nothing;

-- ────────────────────────────────────────────────────────────
-- 6. VUE available_leads ENRICHIE
--    + max_unlocks   + unlocks_count   + available_at par tier
-- ────────────────────────────────────────────────────────────

create or replace view public.available_leads as
with counts as (
  select project_id, count(*)::int as unlocks_count
    from public.lead_unlocks group by project_id
)
select
  p.id,
  p.specialty,
  p.location,
  p.surface,
  p.budget,
  p.deadline,
  p.urgency_level,
  p.client_type,
  case
    when length(coalesce(p.description, '')) > 140
      then substr(p.description, 1, 140) || '…'
    else p.description
  end as description_preview,
  p.lead_price_credits,
  p.project_lat,
  p.project_lng,
  p.created_at,
  p.status,
  coalesce(p.max_unlocks, 3) as max_unlocks,
  coalesce(c.unlocks_count, 0) as unlocks_count,
  greatest(0, coalesce(p.max_unlocks, 3) - coalesce(c.unlocks_count, 0)) as remaining_slots,
  -- moment où ce lead devient visible pour l'artisan courant
  p.created_at + (public.tier_delay_minutes(public.current_artisan_tier()) || ' minutes')::interval
    as available_at
from public.projects p
left join counts c on c.project_id = p.id
where p.status = 'open'
  and coalesce(p.email_verified, true) = true
  and coalesce(c.unlocks_count, 0) < coalesce(p.max_unlocks, 3);

-- ────────────────────────────────────────────────────────────
-- 7. RPC unlock_lead — vérifie verified, full, available_at
-- ────────────────────────────────────────────────────────────

create or replace function public.unlock_lead(p_project_id uuid)
returns json
language plpgsql security definer set search_path = public as $$
declare
  v_artisan_id uuid;
  v_status public.verification_status;
  v_price int;
  v_balance int;
  v_existing uuid;
  v_count int;
  v_max int;
  v_created timestamptz;
  v_available timestamptz;
  v_tier public.subscription_tier;
begin
  select a.id, a.verification_status
    into v_artisan_id, v_status
    from public.artisans a
    where a.user_id = auth.uid()
    limit 1;

  if v_artisan_id is null then
    return json_build_object('ok', false, 'error', 'no_artisan_profile');
  end if;

  if v_status <> 'verified' then
    return json_build_object('ok', false, 'error', 'not_verified');
  end if;

  select id into v_existing
  from public.lead_unlocks
  where artisan_id = v_artisan_id and project_id = p_project_id;

  if v_existing is not null then
    return json_build_object('ok', true, 'already_unlocked', true);
  end if;

  select coalesce(lead_price_credits, 8), coalesce(max_unlocks, 3), created_at
    into v_price, v_max, v_created
    from public.projects where id = p_project_id and status = 'open';

  if v_price is null then
    return json_build_object('ok', false, 'error', 'project_not_available');
  end if;

  -- Quota atteint ?
  select count(*) into v_count from public.lead_unlocks where project_id = p_project_id;
  if v_count >= v_max then
    return json_build_object('ok', false, 'error', 'lead_full');
  end if;

  -- Disponibilité par tier
  v_tier := public.current_artisan_tier();
  v_available := v_created + (public.tier_delay_minutes(v_tier) || ' minutes')::interval;
  if now() < v_available then
    return json_build_object(
      'ok', false, 'error', 'not_yet_available',
      'available_at', v_available, 'tier', v_tier
    );
  end if;

  -- Solde
  select credits_balance into v_balance
  from public.artisan_wallets where artisan_id = v_artisan_id for update;

  if v_balance is null or v_balance < v_price then
    return json_build_object(
      'ok', false, 'error', 'insufficient_credits',
      'required', v_price, 'balance', coalesce(v_balance, 0)
    );
  end if;

  update public.artisan_wallets
    set credits_balance = credits_balance - v_price, updated_at = now()
    where artisan_id = v_artisan_id;

  insert into public.credit_transactions (artisan_id, type, amount, reference_id, note)
  values (v_artisan_id, 'lead_unlock', -v_price, p_project_id, 'Déblocage lead');

  insert into public.lead_unlocks (artisan_id, project_id, credits_spent, deadline_at)
  values (v_artisan_id, p_project_id, v_price, now() + interval '24 hours');

  return json_build_object('ok', true, 'spent', v_price, 'balance', v_balance - v_price);
end $$;
