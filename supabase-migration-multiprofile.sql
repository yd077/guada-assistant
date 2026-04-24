-- ============================================================
-- BTP GUADA — Migration Tunnel multi-profils
-- À exécuter dans Supabase SQL Editor
-- ============================================================

-- 1. ENUM type de demandeur
do $$ begin
  create type public.client_type as enum ('particulier', 'entreprise', 'agence', 'syndic');
exception when duplicate_object then null; end $$;

-- 2. Colonnes additionnelles sur projects
alter table public.projects
  add column if not exists client_type public.client_type not null default 'particulier',
  add column if not exists internal_ref text,
  add column if not exists company_name text,
  add column if not exists phone_verified boolean not null default false;

-- Index pour reporting / admin
create index if not exists idx_projects_client_type on public.projects(client_type);
