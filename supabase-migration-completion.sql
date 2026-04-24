-- ============================================================
-- BTP GUADA — Migration COMPLÉTION (Cron 24h, Pro, Avis, Onboarding)
-- À exécuter APRÈS supabase-migration-strategy.sql
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. CRON RELANCE 24h
-- ────────────────────────────────────────────────────────────

-- Activer pg_cron (nécessite extension activée côté instance)
create extension if not exists pg_cron;

-- Table pour tracer les relances envoyées (évite double envoi)
create table if not exists public.lead_reminders (
  id uuid primary key default gen_random_uuid(),
  unlock_id uuid not null references public.lead_unlocks(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  sent_at timestamptz not null default now(),
  kind text not null default 'deadline_24h'
);
create index if not exists idx_lead_reminders_unlock on public.lead_reminders(unlock_id);

-- Fonction qui balaye toutes les heures :
--   - unlocks dont la deadline est dépassée et sans first_contact_at
--   - on enregistre une relance + on rouvre le projet (status = open)
--   - on incrémente max_unlocks de 1 (place supplémentaire pour un nouvel artisan)
create or replace function public.process_overdue_unlocks()
returns json
language plpgsql security definer set search_path = public as $$
declare
  v_count int := 0;
  v_row record;
begin
  for v_row in
    select u.id as unlock_id, u.project_id
    from public.lead_unlocks u
    left join public.lead_reminders r
      on r.unlock_id = u.id and r.kind = 'deadline_24h'
    where u.deadline_at < now()
      and u.first_contact_at is null
      and u.status = 'new'
      and r.id is null
  loop
    insert into public.lead_reminders (unlock_id, project_id)
      values (v_row.unlock_id, v_row.project_id);

    update public.projects
      set status = 'open',
          max_unlocks = coalesce(max_unlocks, 3) + 1
      where id = v_row.project_id;

    v_count := v_count + 1;
  end loop;

  return json_build_object('ok', true, 'processed', v_count);
end $$;

-- Planification (toutes les heures)
do $$ begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.unschedule('process_overdue_unlocks_hourly')
      where exists (select 1 from cron.job where jobname = 'process_overdue_unlocks_hourly');
    perform cron.schedule(
      'process_overdue_unlocks_hourly',
      '0 * * * *',
      $cron$ select public.process_overdue_unlocks(); $cron$
    );
  end if;
exception when others then
  raise notice 'pg_cron non disponible : skip schedule';
end $$;

-- RPC : marquer un projet comme contacté côté CLIENT (validation croisée)
create or replace function public.client_mark_contacted(p_unlock_id uuid)
returns json
language plpgsql security definer set search_path = public as $$
declare
  v_owner uuid;
begin
  select p.client_id into v_owner
    from public.lead_unlocks u
    join public.projects p on p.id = u.project_id
    where u.id = p_unlock_id;

  if v_owner is null then
    return json_build_object('ok', false, 'error', 'not_found');
  end if;

  if v_owner <> auth.uid() then
    return json_build_object('ok', false, 'error', 'forbidden');
  end if;

  update public.lead_unlocks
    set status = case when status = 'new' then 'contacted' else status end,
        first_contact_at = coalesce(first_contact_at, now())
    where id = p_unlock_id;

  return json_build_object('ok', true);
end $$;

-- ────────────────────────────────────────────────────────────
-- 2. CONTACT PRO (Agences/Syndics)
-- ────────────────────────────────────────────────────────────

create table if not exists public.pro_inquiries (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  contact_name text not null,
  email text not null,
  phone text,
  client_type text not null,         -- 'agence' | 'syndic' | 'autre'
  managed_units int,
  recurring_specialties text[],
  desired_sla text,
  message text,
  status text not null default 'new', -- new | contacted | converted | rejected
  created_at timestamptz not null default now()
);
alter table public.pro_inquiries enable row level security;

drop policy if exists "Public crée des demandes pro" on public.pro_inquiries;
create policy "Public crée des demandes pro"
  on public.pro_inquiries for insert
  with check (true);

drop policy if exists "Admin lit les demandes pro" on public.pro_inquiries;
create policy "Admin lit les demandes pro"
  on public.pro_inquiries for all
  using (public.has_role(auth.uid(), 'admin'));

-- ────────────────────────────────────────────────────────────
-- 3. AVIS — submission par client après mission gagnée
-- ────────────────────────────────────────────────────────────

-- Permettre au client de créer un avis si un unlock 'won' existe pour la paire (artisan, client)
create or replace function public.submit_review(
  p_artisan_id uuid,
  p_rating int,
  p_comment text default null
) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_existing uuid;
  v_proof boolean;
  v_review_id uuid;
begin
  if auth.uid() is null then
    return json_build_object('ok', false, 'error', 'auth_required');
  end if;

  if p_rating < 1 or p_rating > 5 then
    return json_build_object('ok', false, 'error', 'invalid_rating');
  end if;

  -- Preuve : il existe un projet du client débloqué par cet artisan
  select exists (
    select 1 from public.lead_unlocks u
    join public.projects p on p.id = u.project_id
    where u.artisan_id = p_artisan_id
      and p.client_id = auth.uid()
  ) into v_proof;

  if not v_proof then
    return json_build_object('ok', false, 'error', 'no_relationship');
  end if;

  -- Un seul avis par couple
  select id into v_existing from public.reviews
    where artisan_id = p_artisan_id and author_id = auth.uid();

  if v_existing is not null then
    update public.reviews
      set rating = p_rating, comment = p_comment, created_at = now()
      where id = v_existing
      returning id into v_review_id;
  else
    insert into public.reviews (artisan_id, author_id, rating, comment)
      values (p_artisan_id, auth.uid(), p_rating, p_comment)
      returning id into v_review_id;
  end if;

  -- Recalcul agrégat
  update public.artisans a
    set rating = sub.avg_rating,
        reviews_count = sub.cnt
    from (
      select avg(rating)::numeric(3,2) as avg_rating, count(*)::int as cnt
      from public.reviews where artisan_id = p_artisan_id
    ) sub
    where a.id = p_artisan_id;

  return json_build_object('ok', true, 'review_id', v_review_id);
end $$;

-- ────────────────────────────────────────────────────────────
-- 4. ONBOARDING — étape complète sur l'artisan
-- ────────────────────────────────────────────────────────────

alter table public.artisans
  add column if not exists onboarding_step int not null default 0,
  add column if not exists onboarding_completed_at timestamptz;
-- Étapes : 0=profil créé, 1=zone, 2=docs uploadés, 3=tier choisi, 4=complet
