-- ============================================================
-- BTP GUADA — Migration Wallet de crédits + Lead-Flash
-- À exécuter dans Supabase SQL Editor APRÈS supabase-migration-geo.sql
-- ============================================================

-- 1. ENUM des transactions
do $$ begin
  create type public.credit_tx_type as enum ('purchase','lead_unlock','refund','bonus','admin_adjust');
exception when duplicate_object then null; end $$;

-- 2. Wallet (1 ligne par artisan)
create table if not exists public.artisan_wallets (
  artisan_id uuid primary key references public.artisans(id) on delete cascade,
  credits_balance int not null default 0,
  updated_at timestamptz not null default now()
);
alter table public.artisan_wallets enable row level security;

drop policy if exists "Artisan lit son wallet" on public.artisan_wallets;
create policy "Artisan lit son wallet"
  on public.artisan_wallets for select
  using (
    exists (select 1 from public.artisans a where a.id = artisan_id and a.user_id = auth.uid())
    or public.has_role(auth.uid(), 'admin')
  );

drop policy if exists "Admin gère les wallets" on public.artisan_wallets;
create policy "Admin gère les wallets"
  on public.artisan_wallets for all
  using (public.has_role(auth.uid(), 'admin'));

-- 3. Historique transactions
create table if not exists public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  artisan_id uuid not null references public.artisans(id) on delete cascade,
  type public.credit_tx_type not null,
  amount int not null,           -- signé : +recharge, -dépense
  reference_id uuid,             -- project_id pour unlock, order_id pour purchase
  note text,
  created_at timestamptz not null default now()
);
alter table public.credit_transactions enable row level security;

create index if not exists idx_credit_tx_artisan on public.credit_transactions(artisan_id, created_at desc);

drop policy if exists "Artisan lit ses transactions" on public.credit_transactions;
create policy "Artisan lit ses transactions"
  on public.credit_transactions for select
  using (
    exists (select 1 from public.artisans a where a.id = artisan_id and a.user_id = auth.uid())
    or public.has_role(auth.uid(), 'admin')
  );

drop policy if exists "Admin gère les transactions" on public.credit_transactions;
create policy "Admin gère les transactions"
  on public.credit_transactions for all
  using (public.has_role(auth.uid(), 'admin'));

-- 4. Unlocks (qui a débloqué quel projet)
create table if not exists public.lead_unlocks (
  id uuid primary key default gen_random_uuid(),
  artisan_id uuid not null references public.artisans(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  credits_spent int not null,
  status text not null default 'new', -- new | contacted | won | lost
  unlocked_at timestamptz not null default now(),
  unique (artisan_id, project_id)
);
alter table public.lead_unlocks enable row level security;

create index if not exists idx_lead_unlocks_artisan on public.lead_unlocks(artisan_id, unlocked_at desc);

drop policy if exists "Artisan lit ses unlocks" on public.lead_unlocks;
create policy "Artisan lit ses unlocks"
  on public.lead_unlocks for select
  using (
    exists (select 1 from public.artisans a where a.id = artisan_id and a.user_id = auth.uid())
    or public.has_role(auth.uid(), 'admin')
  );

drop policy if exists "Artisan met à jour le statut de ses unlocks" on public.lead_unlocks;
create policy "Artisan met à jour le statut de ses unlocks"
  on public.lead_unlocks for update
  using (
    exists (select 1 from public.artisans a where a.id = artisan_id and a.user_id = auth.uid())
  );

drop policy if exists "Admin gère les unlocks" on public.lead_unlocks;
create policy "Admin gère les unlocks"
  on public.lead_unlocks for all
  using (public.has_role(auth.uid(), 'admin'));

-- 5. Grille de tarification des leads
create table if not exists public.lead_pricing_rules (
  id uuid primary key default gen_random_uuid(),
  specialty text,                -- null = wildcard
  min_budget_eur int not null default 0,
  max_budget_eur int,            -- null = pas de plafond
  credits_cost int not null,
  created_at timestamptz not null default now()
);
alter table public.lead_pricing_rules enable row level security;

drop policy if exists "Tarifs leads visibles tous" on public.lead_pricing_rules;
create policy "Tarifs leads visibles tous"
  on public.lead_pricing_rules for select using (true);

drop policy if exists "Admin gère les tarifs" on public.lead_pricing_rules;
create policy "Admin gère les tarifs"
  on public.lead_pricing_rules for all
  using (public.has_role(auth.uid(), 'admin'));

-- Grille par défaut (8 → 70 crédits)
insert into public.lead_pricing_rules (specialty, min_budget_eur, max_budget_eur, credits_cost) values
  (null, 0, 2000, 8),
  (null, 2001, 5000, 15),
  (null, 5001, 15000, 25),
  (null, 15001, 50000, 40),
  (null, 50001, null, 70)
on conflict do nothing;

-- 6. Colonne lead_price_credits sur projects
alter table public.projects add column if not exists lead_price_credits int;

-- 7. Helper : extraire un nombre à partir du champ budget texte ("ex. 15 000 €")
create or replace function public.extract_budget_eur(budget_txt text)
returns int
language plpgsql immutable as $$
declare
  cleaned text;
  n int;
begin
  if budget_txt is null then return 0; end if;
  cleaned := regexp_replace(budget_txt, '[^0-9]', '', 'g');
  if cleaned = '' then return 0; end if;
  begin
    n := cleaned::int;
  exception when others then
    return 0;
  end;
  return n;
end $$;

-- 8. Calcul du prix d'un lead
create or replace function public.compute_lead_price(p_specialty text, p_budget_eur int)
returns int
language sql stable as $$
  select coalesce(
    (
      select credits_cost
      from public.lead_pricing_rules
      where (specialty is null or specialty = p_specialty)
        and p_budget_eur >= min_budget_eur
        and (max_budget_eur is null or p_budget_eur <= max_budget_eur)
      order by (specialty = p_specialty) desc nulls last, credits_cost desc
      limit 1
    ),
    8
  )
$$;

-- 9. Trigger : remplir lead_price_credits à l'insert
create or replace function public.set_project_lead_price()
returns trigger
language plpgsql as $$
begin
  if new.lead_price_credits is null then
    new.lead_price_credits := public.compute_lead_price(
      new.specialty,
      public.extract_budget_eur(new.budget)
    );
  end if;
  return new;
end $$;

drop trigger if exists projects_set_lead_price on public.projects;
create trigger projects_set_lead_price
  before insert on public.projects
  for each row execute function public.set_project_lead_price();

-- 10. Vue "leads disponibles" pour artisans : projets ouverts dans leur zone & spécialité
--     SANS exposer les coordonnées avant unlock.
create or replace view public.available_leads as
select
  p.id,
  p.specialty,
  p.location,
  p.surface,
  p.budget,
  p.deadline,
  -- description tronquée (teaser) tant que pas débloqué
  case
    when length(coalesce(p.description, '')) > 140
    then substr(p.description, 1, 140) || '…'
    else p.description
  end as description_preview,
  p.lead_price_credits,
  p.project_lat,
  p.project_lng,
  p.created_at,
  p.status
from public.projects p
where p.status = 'open';

-- Pas de RLS sur les vues : on filtre côté client par spécialité + distance.
-- Les coordonnées de contact restent dans `projects` (RLS strict client_id/admin).

-- 11. Wallet auto-créé à la création d'un artisan
create or replace function public.create_wallet_for_new_artisan()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.artisan_wallets (artisan_id, credits_balance)
  values (new.id, 0)
  on conflict (artisan_id) do nothing;
  return new;
end $$;

drop trigger if exists artisans_wallet_init on public.artisans;
create trigger artisans_wallet_init
  after insert on public.artisans
  for each row execute function public.create_wallet_for_new_artisan();

-- Backfill pour les artisans existants
insert into public.artisan_wallets (artisan_id, credits_balance)
select id, 0 from public.artisans
on conflict (artisan_id) do nothing;

-- 12. RPC : débloquer un lead (atomique : vérifie solde, débite, insère unlock & tx)
create or replace function public.unlock_lead(p_project_id uuid)
returns json
language plpgsql security definer set search_path = public as $$
declare
  v_artisan_id uuid;
  v_price int;
  v_balance int;
  v_existing uuid;
begin
  -- Identifier l'artisan courant
  select id into v_artisan_id
  from public.artisans
  where user_id = auth.uid()
  limit 1;

  if v_artisan_id is null then
    return json_build_object('ok', false, 'error', 'no_artisan_profile');
  end if;

  -- Déjà débloqué ?
  select id into v_existing
  from public.lead_unlocks
  where artisan_id = v_artisan_id and project_id = p_project_id;

  if v_existing is not null then
    return json_build_object('ok', true, 'already_unlocked', true);
  end if;

  -- Prix du lead
  select coalesce(lead_price_credits, 8) into v_price
  from public.projects where id = p_project_id and status = 'open';

  if v_price is null then
    return json_build_object('ok', false, 'error', 'project_not_available');
  end if;

  -- Solde
  select credits_balance into v_balance
  from public.artisan_wallets where artisan_id = v_artisan_id for update;

  if v_balance is null or v_balance < v_price then
    return json_build_object('ok', false, 'error', 'insufficient_credits', 'required', v_price, 'balance', coalesce(v_balance, 0));
  end if;

  -- Débit
  update public.artisan_wallets
    set credits_balance = credits_balance - v_price,
        updated_at = now()
    where artisan_id = v_artisan_id;

  insert into public.credit_transactions (artisan_id, type, amount, reference_id, note)
  values (v_artisan_id, 'lead_unlock', -v_price, p_project_id, 'Déblocage lead');

  insert into public.lead_unlocks (artisan_id, project_id, credits_spent)
  values (v_artisan_id, p_project_id, v_price);

  return json_build_object('ok', true, 'spent', v_price, 'balance', v_balance - v_price);
end $$;

-- 13. RPC admin : ajuster un wallet (crédit / débit / remboursement)
create or replace function public.admin_adjust_wallet(
  p_artisan_id uuid,
  p_amount int,
  p_type public.credit_tx_type default 'admin_adjust',
  p_note text default null,
  p_reference_id uuid default null
)
returns json
language plpgsql security definer set search_path = public as $$
declare
  v_balance int;
begin
  if not public.has_role(auth.uid(), 'admin') then
    return json_build_object('ok', false, 'error', 'forbidden');
  end if;

  insert into public.artisan_wallets (artisan_id, credits_balance)
  values (p_artisan_id, 0)
  on conflict (artisan_id) do nothing;

  update public.artisan_wallets
    set credits_balance = credits_balance + p_amount,
        updated_at = now()
    where artisan_id = p_artisan_id
    returning credits_balance into v_balance;

  insert into public.credit_transactions (artisan_id, type, amount, reference_id, note)
  values (p_artisan_id, p_type, p_amount, p_reference_id, p_note);

  return json_build_object('ok', true, 'balance', v_balance);
end $$;

-- 14. RPC admin : rembourser un unlock (créditer + marquer)
create or replace function public.admin_refund_unlock(p_unlock_id uuid, p_note text default null)
returns json
language plpgsql security definer set search_path = public as $$
declare
  v_artisan uuid;
  v_amount int;
  v_project uuid;
begin
  if not public.has_role(auth.uid(), 'admin') then
    return json_build_object('ok', false, 'error', 'forbidden');
  end if;

  select artisan_id, credits_spent, project_id
    into v_artisan, v_amount, v_project
    from public.lead_unlocks where id = p_unlock_id;

  if v_artisan is null then
    return json_build_object('ok', false, 'error', 'not_found');
  end if;

  perform public.admin_adjust_wallet(v_artisan, v_amount, 'refund', coalesce(p_note, 'Remboursement lead invalide'), v_project);

  update public.lead_unlocks set status = 'lost' where id = p_unlock_id;

  return json_build_object('ok', true, 'refunded', v_amount);
end $$;

-- 15. Realtime : activer pour projects (Lead-Flash) et wallets
alter publication supabase_realtime add table public.projects;
alter publication supabase_realtime add table public.artisan_wallets;
