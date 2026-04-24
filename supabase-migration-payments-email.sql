-- ============================================================
-- BTP GUADA — Migration Paramètres de paiement + Vérification email
-- À exécuter dans Supabase SQL Editor
-- ============================================================

-- 1. Table de configuration des paiements (Stripe)
create table if not exists public.payment_settings (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'stripe',
  mode text not null default 'test' check (mode in ('test', 'live')),
  -- clés stockées en base (saisies depuis l'admin)
  test_publishable_key text,
  test_secret_key text,
  test_webhook_secret text,
  live_publishable_key text,
  live_secret_key text,
  live_webhook_secret text,
  -- métadonnées
  enabled boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  unique (provider)
);

-- Insertion de la ligne par défaut Stripe
insert into public.payment_settings (provider, mode, enabled)
values ('stripe', 'test', false)
on conflict (provider) do nothing;

-- RLS — uniquement les admins peuvent lire / écrire
alter table public.payment_settings enable row level security;

drop policy if exists "Admins read payment_settings" on public.payment_settings;
create policy "Admins read payment_settings"
  on public.payment_settings for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admins update payment_settings" on public.payment_settings;
create policy "Admins update payment_settings"
  on public.payment_settings for update
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admins insert payment_settings" on public.payment_settings;
create policy "Admins insert payment_settings"
  on public.payment_settings for insert
  to authenticated
  with check (public.has_role(auth.uid(), 'admin'));

-- 2. Vérification email sur projects (remplace OTP SMS)
alter table public.projects
  add column if not exists email_verified boolean not null default false,
  add column if not exists email_verification_token text,
  add column if not exists email_verification_sent_at timestamptz,
  add column if not exists email_verified_at timestamptz;

-- Index pour lookup par token
create index if not exists idx_projects_email_token
  on public.projects(email_verification_token)
  where email_verification_token is not null;

-- 3. RPC publique : vérifier un email via token (pas besoin d'être connecté)
create or replace function public.verify_project_email(_token text)
returns table (project_id uuid, contact_email text, ok boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  _project public.projects%rowtype;
begin
  select * into _project
  from public.projects
  where email_verification_token = _token
  limit 1;

  if not found then
    return query select null::uuid, null::text, false;
    return;
  end if;

  if _project.email_verified then
    return query select _project.id, _project.contact_email, true;
    return;
  end if;

  update public.projects
  set email_verified = true,
      email_verified_at = now(),
      email_verification_token = null
  where id = _project.id;

  return query select _project.id, _project.contact_email, true;
end;
$$;

grant execute on function public.verify_project_email(text) to anon, authenticated;
