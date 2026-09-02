do $$ begin
  create type public.app_role as enum ('client', 'artisan', 'admin');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.artisan_status as enum ('pending', 'verified', 'rejected');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.project_status as enum ('open', 'in_review', 'closed');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.quote_status as enum ('pending', 'read', 'responded');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.credit_tx_type as enum ('purchase', 'lead_unlock', 'refund', 'bonus', 'admin_adjust');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.subscription_tier as enum ('free', 'premium', 'elite');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.verification_status as enum ('pending', 'verified', 'rejected');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.dispute_reason as enum ('wrong_number', 'not_reachable', 'not_owner', 'out_of_zone', 'other');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.dispute_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.client_type as enum ('particulier', 'entreprise', 'agence', 'syndic');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.urgency_level as enum ('normal', 'urgent', 'sos');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null default 'client',
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select, insert, update, delete on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create table if not exists public.artisans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete cascade,
  name text not null,
  specialty text not null,
  location text not null,
  bio text,
  avatar_url text,
  cover_url text,
  experience_years int default 0,
  certifications text[] default '{}',
  rating numeric(3,2) default 0,
  reviews_count int default 0,
  status public.artisan_status not null default 'pending',
  base_lat numeric(9,6),
  base_lng numeric(9,6),
  radius_km int not null default 20,
  base_address text,
  kbis_url text,
  insurance_url text,
  kbis_verified_at timestamptz,
  insurance_verified_at timestamptz,
  verification_status public.verification_status not null default 'pending',
  verification_note text,
  onboarding_step int not null default 0,
  onboarding_completed_at timestamptz,
  notify_new_leads boolean not null default true,
  email text,
  first_name text,
  last_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.artisans to authenticated;
grant select on public.artisans to anon;
grant all on public.artisans to service_role;
alter table public.artisans enable row level security;

create table if not exists public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  artisan_id uuid not null references public.artisans(id) on delete cascade,
  image_url text not null,
  title text,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.portfolio_items to authenticated;
grant select on public.portfolio_items to anon;
grant all on public.portfolio_items to service_role;
alter table public.portfolio_items enable row level security;

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  artisan_id uuid not null references public.artisans(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (artisan_id, author_id)
);
grant select, insert, update, delete on public.reviews to authenticated;
grant select on public.reviews to anon;
grant all on public.reviews to service_role;
alter table public.reviews enable row level security;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references auth.users(id) on delete set null,
  specialty text not null,
  location text not null,
  surface text,
  budget text,
  deadline text,
  description text not null,
  contact_name text not null,
  contact_email text not null,
  contact_phone text not null default '',
  status public.project_status not null default 'open',
  client_type public.client_type not null default 'particulier',
  internal_ref text,
  company_name text,
  phone_verified boolean not null default false,
  email_verified boolean not null default true,
  email_verification_token text,
  email_verification_sent_at timestamptz,
  email_verified_at timestamptz,
  email_otp_code text,
  email_otp_expires_at timestamptz,
  email_otp_attempts int not null default 0,
  project_lat numeric(9,6),
  project_lng numeric(9,6),
  lead_price_credits int,
  max_unlocks int not null default 3,
  urgency_level public.urgency_level not null default 'normal',
  managed_units int,
  desired_sla text,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.projects to authenticated;
grant select, insert on public.projects to anon;
grant all on public.projects to service_role;
alter table public.projects enable row level security;

create table if not exists public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  artisan_id uuid not null references public.artisans(id) on delete cascade,
  client_id uuid references auth.users(id) on delete set null,
  contact_name text not null,
  contact_email text not null,
  contact_phone text not null default '',
  city text not null,
  message text not null,
  status public.quote_status not null default 'pending',
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.quote_requests to authenticated;
grant insert on public.quote_requests to anon;
grant all on public.quote_requests to service_role;
alter table public.quote_requests enable row level security;

create table if not exists public.artisan_wallets (
  artisan_id uuid primary key references public.artisans(id) on delete cascade,
  credits_balance int not null default 0,
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.artisan_wallets to authenticated;
grant all on public.artisan_wallets to service_role;
alter table public.artisan_wallets enable row level security;

create table if not exists public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  artisan_id uuid not null references public.artisans(id) on delete cascade,
  type public.credit_tx_type not null,
  amount int not null,
  reference_id uuid,
  note text,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.credit_transactions to authenticated;
grant all on public.credit_transactions to service_role;
alter table public.credit_transactions enable row level security;

create table if not exists public.lead_unlocks (
  id uuid primary key default gen_random_uuid(),
  artisan_id uuid not null references public.artisans(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  credits_spent int not null,
  status text not null default 'new',
  unlocked_at timestamptz not null default now(),
  first_contact_at timestamptz,
  deadline_at timestamptz,
  unique (artisan_id, project_id)
);
grant select, insert, update, delete on public.lead_unlocks to authenticated;
grant all on public.lead_unlocks to service_role;
alter table public.lead_unlocks enable row level security;

create table if not exists public.lead_pricing_rules (
  id uuid primary key default gen_random_uuid(),
  specialty text,
  min_budget_eur int not null default 0,
  max_budget_eur int,
  credits_cost int not null,
  client_type public.client_type,
  urgency_level public.urgency_level,
  label text,
  created_at timestamptz not null default now()
);
grant select on public.lead_pricing_rules to anon, authenticated;
grant insert, update, delete on public.lead_pricing_rules to authenticated;
grant all on public.lead_pricing_rules to service_role;
alter table public.lead_pricing_rules enable row level security;

create table if not exists public.artisan_subscriptions (
  artisan_id uuid primary key references public.artisans(id) on delete cascade,
  tier public.subscription_tier not null default 'free',
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.artisan_subscriptions to authenticated;
grant all on public.artisan_subscriptions to service_role;
alter table public.artisan_subscriptions enable row level security;

create table if not exists public.payment_settings (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'stripe',
  mode text not null default 'test' check (mode in ('test', 'live')),
  test_publishable_key text,
  test_secret_key text,
  test_webhook_secret text,
  live_publishable_key text,
  live_secret_key text,
  live_webhook_secret text,
  enabled boolean not null default false,
  allow_unverified_purchase boolean not null default true,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  unique (provider)
);
grant select, insert, update, delete on public.payment_settings to authenticated;
grant all on public.payment_settings to service_role;
alter table public.payment_settings enable row level security;

create table if not exists public.credit_packs (
  id text primary key,
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
grant select on public.credit_packs to anon, authenticated;
grant insert, update, delete on public.credit_packs to authenticated;
grant all on public.credit_packs to service_role;
alter table public.credit_packs enable row level security;

create table if not exists public.subscription_plans (
  tier public.subscription_tier primary key,
  name text not null,
  price_eur numeric(10,2) not null,
  radius_km int,
  delay_minutes int not null,
  description text,
  highlight boolean not null default false,
  stripe_price_id_test text,
  stripe_price_id_live text,
  active boolean not null default true
);
grant select on public.subscription_plans to anon, authenticated;
grant insert, update, delete on public.subscription_plans to authenticated;
grant all on public.subscription_plans to service_role;
alter table public.subscription_plans enable row level security;

create table if not exists public.stripe_checkout_sessions (
  id text primary key,
  artisan_id uuid not null references public.artisans(id) on delete cascade,
  kind text not null check (kind in ('credits', 'subscription')),
  pack_id text references public.credit_packs(id),
  tier public.subscription_tier,
  credits_to_grant int,
  amount_eur numeric(10,2),
  status text not null default 'pending',
  mode text not null check (mode in ('test', 'live')),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
grant select on public.stripe_checkout_sessions to authenticated;
grant all on public.stripe_checkout_sessions to service_role;
alter table public.stripe_checkout_sessions enable row level security;

create table if not exists public.notification_log (
  id uuid primary key default gen_random_uuid(),
  artisan_id uuid references public.artisans(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  channel text not null default 'email',
  kind text not null,
  status text not null default 'sent',
  error text,
  created_at timestamptz not null default now()
);
grant select on public.notification_log to authenticated;
grant all on public.notification_log to service_role;
alter table public.notification_log enable row level security;

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
grant select, insert, update, delete on public.lead_disputes to authenticated;
grant all on public.lead_disputes to service_role;
alter table public.lead_disputes enable row level security;

create table if not exists public.lead_reminders (
  id uuid primary key default gen_random_uuid(),
  unlock_id uuid not null references public.lead_unlocks(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  sent_at timestamptz not null default now(),
  kind text not null default 'deadline_24h'
);
grant select on public.lead_reminders to authenticated;
grant all on public.lead_reminders to service_role;
alter table public.lead_reminders enable row level security;

create table if not exists public.pro_inquiries (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  contact_name text not null,
  email text not null,
  phone text,
  client_type text not null,
  managed_units int,
  recurring_specialties text[],
  desired_sla text,
  message text,
  status text not null default 'new',
  created_at timestamptz not null default now()
);
grant insert on public.pro_inquiries to anon, authenticated;
grant select, update, delete on public.pro_inquiries to authenticated;
grant all on public.pro_inquiries to service_role;
alter table public.pro_inquiries enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;

drop policy if exists "profiles_public_read" on public.profiles;
create policy "profiles_public_read" on public.profiles for select using (true);
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check (auth.uid() = id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "roles_read_own_or_admin" on public.user_roles;
create policy "roles_read_own_or_admin" on public.user_roles for select to authenticated using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));
drop policy if exists "roles_admin_manage" on public.user_roles;
create policy "roles_admin_manage" on public.user_roles for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "artisans_public_or_owner" on public.artisans;
create policy "artisans_public_or_owner" on public.artisans for select using (status = 'verified' or auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));
drop policy if exists "artisans_insert_own" on public.artisans;
create policy "artisans_insert_own" on public.artisans for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "artisans_update_own_or_admin" on public.artisans;
create policy "artisans_update_own_or_admin" on public.artisans for update to authenticated using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin')) with check (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));
drop policy if exists "artisans_admin_all" on public.artisans;
create policy "artisans_admin_all" on public.artisans for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "portfolio_public_or_owner" on public.portfolio_items;
create policy "portfolio_public_or_owner" on public.portfolio_items for select using (exists (select 1 from public.artisans a where a.id = artisan_id and (a.status = 'verified' or a.user_id = auth.uid() or public.has_role(auth.uid(), 'admin'))));
drop policy if exists "portfolio_owner_manage" on public.portfolio_items;
create policy "portfolio_owner_manage" on public.portfolio_items for all to authenticated using (exists (select 1 from public.artisans a where a.id = artisan_id and (a.user_id = auth.uid() or public.has_role(auth.uid(), 'admin')))) with check (exists (select 1 from public.artisans a where a.id = artisan_id and (a.user_id = auth.uid() or public.has_role(auth.uid(), 'admin'))));

drop policy if exists "reviews_public_read" on public.reviews;
create policy "reviews_public_read" on public.reviews for select using (true);
drop policy if exists "reviews_author_manage" on public.reviews;
create policy "reviews_author_manage" on public.reviews for all to authenticated using (auth.uid() = author_id or public.has_role(auth.uid(), 'admin')) with check (auth.uid() = author_id or public.has_role(auth.uid(), 'admin'));

drop policy if exists "projects_public_create" on public.projects;
create policy "projects_public_create" on public.projects for insert with check (true);
drop policy if exists "projects_owner_or_admin_read" on public.projects;
create policy "projects_owner_or_admin_read" on public.projects for select using (auth.uid() = client_id or public.has_role(auth.uid(), 'admin'));
drop policy if exists "projects_owner_or_admin_update" on public.projects;
create policy "projects_owner_or_admin_update" on public.projects for update to authenticated using (auth.uid() = client_id or public.has_role(auth.uid(), 'admin')) with check (auth.uid() = client_id or public.has_role(auth.uid(), 'admin'));
drop policy if exists "projects_admin_delete" on public.projects;
create policy "projects_admin_delete" on public.projects for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "quotes_public_create" on public.quote_requests;
create policy "quotes_public_create" on public.quote_requests for insert with check (true);
drop policy if exists "quotes_owner_or_artisan_read" on public.quote_requests;
create policy "quotes_owner_or_artisan_read" on public.quote_requests for select using (auth.uid() = client_id or exists (select 1 from public.artisans a where a.id = artisan_id and a.user_id = auth.uid()) or public.has_role(auth.uid(), 'admin'));
drop policy if exists "quotes_artisan_or_admin_update" on public.quote_requests;
create policy "quotes_artisan_or_admin_update" on public.quote_requests for update to authenticated using (exists (select 1 from public.artisans a where a.id = artisan_id and a.user_id = auth.uid()) or public.has_role(auth.uid(), 'admin')) with check (exists (select 1 from public.artisans a where a.id = artisan_id and a.user_id = auth.uid()) or public.has_role(auth.uid(), 'admin'));

drop policy if exists "wallet_owner_or_admin_read" on public.artisan_wallets;
create policy "wallet_owner_or_admin_read" on public.artisan_wallets for select using (exists (select 1 from public.artisans a where a.id = artisan_id and a.user_id = auth.uid()) or public.has_role(auth.uid(), 'admin'));
drop policy if exists "wallet_admin_manage" on public.artisan_wallets;
create policy "wallet_admin_manage" on public.artisan_wallets for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "transactions_owner_or_admin_read" on public.credit_transactions;
create policy "transactions_owner_or_admin_read" on public.credit_transactions for select using (exists (select 1 from public.artisans a where a.id = artisan_id and a.user_id = auth.uid()) or public.has_role(auth.uid(), 'admin'));
drop policy if exists "transactions_admin_manage" on public.credit_transactions;
create policy "transactions_admin_manage" on public.credit_transactions for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "unlocks_owner_or_admin_read" on public.lead_unlocks;
create policy "unlocks_owner_or_admin_read" on public.lead_unlocks for select using (exists (select 1 from public.artisans a where a.id = artisan_id and a.user_id = auth.uid()) or public.has_role(auth.uid(), 'admin'));
drop policy if exists "unlocks_owner_update" on public.lead_unlocks;
create policy "unlocks_owner_update" on public.lead_unlocks for update to authenticated using (exists (select 1 from public.artisans a where a.id = artisan_id and a.user_id = auth.uid()) or public.has_role(auth.uid(), 'admin')) with check (exists (select 1 from public.artisans a where a.id = artisan_id and a.user_id = auth.uid()) or public.has_role(auth.uid(), 'admin'));

drop policy if exists "pricing_public_read" on public.lead_pricing_rules;
create policy "pricing_public_read" on public.lead_pricing_rules for select using (true);
drop policy if exists "pricing_admin_manage" on public.lead_pricing_rules;
create policy "pricing_admin_manage" on public.lead_pricing_rules for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "subs_owner_or_admin_read" on public.artisan_subscriptions;
create policy "subs_owner_or_admin_read" on public.artisan_subscriptions for select using (exists (select 1 from public.artisans a where a.id = artisan_id and a.user_id = auth.uid()) or public.has_role(auth.uid(), 'admin'));
drop policy if exists "subs_admin_manage" on public.artisan_subscriptions;
create policy "subs_admin_manage" on public.artisan_subscriptions for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "payments_admin_read" on public.payment_settings;
create policy "payments_admin_read" on public.payment_settings for select to authenticated using (public.has_role(auth.uid(), 'admin'));
drop policy if exists "payments_admin_manage" on public.payment_settings;
create policy "payments_admin_manage" on public.payment_settings for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "packs_public_read" on public.credit_packs;
create policy "packs_public_read" on public.credit_packs for select using (active = true);
drop policy if exists "packs_admin_manage" on public.credit_packs;
create policy "packs_admin_manage" on public.credit_packs for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "plans_public_read" on public.subscription_plans;
create policy "plans_public_read" on public.subscription_plans for select using (active = true);
drop policy if exists "plans_admin_manage" on public.subscription_plans;
create policy "plans_admin_manage" on public.subscription_plans for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "checkout_owner_or_admin_read" on public.stripe_checkout_sessions;
create policy "checkout_owner_or_admin_read" on public.stripe_checkout_sessions for select using (exists (select 1 from public.artisans a where a.id = artisan_id and a.user_id = auth.uid()) or public.has_role(auth.uid(), 'admin'));

drop policy if exists "notifications_owner_or_admin_read" on public.notification_log;
create policy "notifications_owner_or_admin_read" on public.notification_log for select using (artisan_id is null or exists (select 1 from public.artisans a where a.id = artisan_id and a.user_id = auth.uid()) or public.has_role(auth.uid(), 'admin'));

drop policy if exists "disputes_owner_or_admin_read" on public.lead_disputes;
create policy "disputes_owner_or_admin_read" on public.lead_disputes for select using (exists (select 1 from public.artisans a where a.id = artisan_id and a.user_id = auth.uid()) or public.has_role(auth.uid(), 'admin'));
drop policy if exists "disputes_owner_create" on public.lead_disputes;
create policy "disputes_owner_create" on public.lead_disputes for insert to authenticated with check (exists (select 1 from public.artisans a where a.id = artisan_id and a.user_id = auth.uid()));
drop policy if exists "disputes_admin_manage" on public.lead_disputes;
create policy "disputes_admin_manage" on public.lead_disputes for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "reminders_admin_read" on public.lead_reminders;
create policy "reminders_admin_read" on public.lead_reminders for select to authenticated using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "pro_public_create" on public.pro_inquiries;
create policy "pro_public_create" on public.pro_inquiries for insert with check (true);
drop policy if exists "pro_admin_manage" on public.pro_inquiries;
create policy "pro_admin_manage" on public.pro_inquiries for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

insert into public.payment_settings (provider, mode, enabled, allow_unverified_purchase)
values ('stripe', 'test', false, true)
on conflict (provider) do update set allow_unverified_purchase = coalesce(public.payment_settings.allow_unverified_purchase, true);
insert into public.credit_packs (id, name, credits, price_eur, highlight, description, sort_order)
values
  ('starter', 'Starter', 10, 50, false, 'Pour démarrer ou tester un nouveau créneau.', 1),
  ('pro', 'Pro', 35, 150, true, 'Le meilleur ratio crédits / euro pour développer votre activité.', 2),
  ('expert', 'Expert', 120, 500, false, 'Pour les artisans qui chassent les gros chantiers et le marché pro.', 3)
on conflict (id) do nothing;
insert into public.subscription_plans (tier, name, price_eur, radius_km, delay_minutes, description, highlight)
values
  ('free', 'Standard', 0, 5, 30, 'Découvrez les leads autour de vous.', false),
  ('premium', 'Premium', 29, 25, 15, 'Voyez les leads avant la majorité du marché.', true),
  ('elite', 'Élite', 49, null, 0, 'Accès immédiat à toute la Guadeloupe.', false)
on conflict (tier) do nothing;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone')
  on conflict (id) do nothing;
  insert into public.user_roles (user_id, role)
  values (new.id, 'client')
  on conflict (user_id, role) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.create_wallet_for_new_artisan()
returns trigger language plpgsql security definer set search_path = public
as $$ begin insert into public.artisan_wallets (artisan_id) values (new.id) on conflict (artisan_id) do nothing; return new; end $$;
drop trigger if exists artisans_wallet_init on public.artisans;
create trigger artisans_wallet_init after insert on public.artisans for each row execute function public.create_wallet_for_new_artisan();
create or replace function public.create_subscription_for_new_artisan()
returns trigger language plpgsql security definer set search_path = public
as $$ begin insert into public.artisan_subscriptions (artisan_id, tier) values (new.id, 'free') on conflict (artisan_id) do nothing; return new; end $$;
drop trigger if exists artisans_subscription_init on public.artisans;
create trigger artisans_subscription_init after insert on public.artisans for each row execute function public.create_subscription_for_new_artisan();

create or replace function public.extract_budget_eur(budget_txt text)
returns int language plpgsql immutable as $$ declare cleaned text; begin if budget_txt is null then return 0; end if; cleaned := regexp_replace(budget_txt, '[^0-9]', '', 'g'); if cleaned = '' then return 0; end if; return cleaned::int; exception when others then return 0; end $$;
create or replace function public.compute_lead_price(p_specialty text, p_budget_eur int, p_client_type public.client_type default 'particulier', p_urgency public.urgency_level default 'normal')
returns int language sql stable as $$ select coalesce((select credits_cost from public.lead_pricing_rules where (specialty is null or specialty = p_specialty) and (client_type is null or client_type = p_client_type) and (urgency_level is null or urgency_level = p_urgency) and p_budget_eur >= min_budget_eur and (max_budget_eur is null or p_budget_eur <= max_budget_eur) order by credits_cost desc limit 1), 8) $$;
create or replace function public.set_project_lead_price()
returns trigger language plpgsql as $$ begin if new.lead_price_credits is null then new.lead_price_credits := public.compute_lead_price(new.specialty, public.extract_budget_eur(new.budget), new.client_type, new.urgency_level); end if; return new; end $$;
drop trigger if exists projects_set_lead_price on public.projects;
create trigger projects_set_lead_price before insert on public.projects for each row execute function public.set_project_lead_price();
insert into public.lead_pricing_rules (specialty, min_budget_eur, max_budget_eur, credits_cost, client_type, label)
values
  (null, 0, 2000, 8, 'particulier', 'Dépannage / petit travaux'),
  (null, 2001, 15000, 20, 'particulier', 'Chantier moyen'),
  (null, 15001, null, 50, 'particulier', 'Gros chantier'),
  (null, 0, null, 20, 'entreprise', 'Demande entreprise'),
  (null, 0, null, 70, 'agence', 'Marché pro agence'),
  (null, 0, null, 70, 'syndic', 'Marché pro syndic')
on conflict do nothing;

create or replace view public.available_leads as
select p.id, p.specialty, p.location, p.surface, p.budget, p.deadline, p.description as description_preview, p.lead_price_credits, p.project_lat, p.project_lng, p.created_at, p.status, p.max_unlocks, p.urgency_level, p.client_type
from public.projects p where p.status = 'open' and coalesce(p.email_verified, true) = true;
grant select on public.available_leads to authenticated;
grant all on public.available_leads to service_role;

create or replace function public.admin_adjust_wallet(p_artisan_id uuid, p_amount int, p_type public.credit_tx_type default 'admin_adjust', p_note text default null, p_reference_id uuid default null)
returns json language plpgsql security definer set search_path = public as $$ begin if not public.has_role(auth.uid(), 'admin') then return json_build_object('ok', false, 'error', 'forbidden'); end if; insert into public.artisan_wallets (artisan_id, credits_balance) values (p_artisan_id, 0) on conflict (artisan_id) do nothing; update public.artisan_wallets set credits_balance = credits_balance + p_amount, updated_at = now() where artisan_id = p_artisan_id; insert into public.credit_transactions (artisan_id, type, amount, reference_id, note) values (p_artisan_id, p_type, p_amount, p_reference_id, p_note); return json_build_object('ok', true); end $$;
create or replace function public.client_mark_contacted(p_unlock_id uuid)
returns json language plpgsql security definer set search_path = public as $$ begin update public.lead_unlocks u set status = case when status = 'new' then 'contacted' else status end, first_contact_at = coalesce(first_contact_at, now()) from public.projects p where u.id = p_unlock_id and p.id = u.project_id and p.client_id = auth.uid(); return json_build_object('ok', true); end $$;
grant execute on function public.admin_adjust_wallet(uuid, int, public.credit_tx_type, text, uuid) to authenticated, service_role;
grant execute on function public.client_mark_contacted(uuid) to authenticated;

insert into public.artisan_wallets (artisan_id)
select id from public.artisans on conflict (artisan_id) do nothing;
insert into public.artisan_subscriptions (artisan_id, tier)
select id, 'free' from public.artisans on conflict (artisan_id) do nothing;