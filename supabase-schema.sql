-- ============================================================
-- BTP GUADA — Schéma complet (à exécuter dans Supabase SQL Editor)
-- ============================================================

-- 1. ENUMS
create type public.app_role as enum ('client', 'artisan', 'admin');
create type public.artisan_status as enum ('pending', 'verified', 'rejected');
create type public.project_status as enum ('open', 'in_review', 'closed');
create type public.quote_status as enum ('pending', 'read', 'responded');

-- 2. PROFILES (extension de auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "Profils visibles par tous (lecture)"
  on public.profiles for select using (true);
create policy "Utilisateur peut modifier son profil"
  on public.profiles for update using (auth.uid() = id);
create policy "Utilisateur peut créer son profil"
  on public.profiles for insert with check (auth.uid() = id);

-- 3. USER_ROLES (table dédiée — JAMAIS sur profiles)
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

-- 4. Fonction has_role SECURITY DEFINER (anti-récursion RLS)
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create policy "Utilisateur lit ses rôles"
  on public.user_roles for select using (auth.uid() = user_id);
create policy "Admin lit tous les rôles"
  on public.user_roles for select using (public.has_role(auth.uid(), 'admin'));
create policy "Admin gère les rôles"
  on public.user_roles for all using (public.has_role(auth.uid(), 'admin'));

-- 5. ARTISANS
create table public.artisans (
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
  rating numeric(2,1) default 0,
  reviews_count int default 0,
  status public.artisan_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.artisans enable row level security;

create policy "Artisans vérifiés visibles publiquement"
  on public.artisans for select using (status = 'verified' or auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));
create policy "Artisan modifie sa fiche"
  on public.artisans for update using (auth.uid() = user_id);
create policy "Artisan crée sa fiche"
  on public.artisans for insert with check (auth.uid() = user_id);
create policy "Admin gère toutes les fiches"
  on public.artisans for all using (public.has_role(auth.uid(), 'admin'));

create index idx_artisans_specialty on public.artisans(specialty);
create index idx_artisans_location on public.artisans(location);
create index idx_artisans_status on public.artisans(status);

-- 6. PORTFOLIO_ITEMS
create table public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  artisan_id uuid not null references public.artisans(id) on delete cascade,
  image_url text not null,
  title text,
  created_at timestamptz not null default now()
);
alter table public.portfolio_items enable row level security;

create policy "Portfolios publics si artisan vérifié"
  on public.portfolio_items for select using (
    exists (select 1 from public.artisans a where a.id = artisan_id and (a.status = 'verified' or a.user_id = auth.uid()))
  );
create policy "Artisan gère son portfolio"
  on public.portfolio_items for all using (
    exists (select 1 from public.artisans a where a.id = artisan_id and a.user_id = auth.uid())
  );

-- 7. REVIEWS
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  artisan_id uuid not null references public.artisans(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (artisan_id, author_id)
);
alter table public.reviews enable row level security;

create policy "Avis publics"
  on public.reviews for select using (true);
create policy "Auteur crée son avis"
  on public.reviews for insert with check (auth.uid() = author_id);
create policy "Auteur modifie/supprime son avis"
  on public.reviews for update using (auth.uid() = author_id);
create policy "Auteur supprime son avis"
  on public.reviews for delete using (auth.uid() = author_id);
create policy "Admin gère les avis"
  on public.reviews for all using (public.has_role(auth.uid(), 'admin'));

-- 8. PROJECTS (demandes des clients)
create table public.projects (
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
  contact_phone text not null,
  status public.project_status not null default 'open',
  created_at timestamptz not null default now()
);
alter table public.projects enable row level security;

create policy "Client voit ses projets"
  on public.projects for select using (auth.uid() = client_id or public.has_role(auth.uid(), 'admin'));
create policy "Création de projet (auth ou anon)"
  on public.projects for insert with check (true);
create policy "Admin gère les projets"
  on public.projects for all using (public.has_role(auth.uid(), 'admin'));

-- 9. QUOTE_REQUESTS
create table public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  artisan_id uuid not null references public.artisans(id) on delete cascade,
  client_id uuid references auth.users(id) on delete set null,
  contact_name text not null,
  contact_email text not null,
  contact_phone text not null,
  city text not null,
  message text not null,
  status public.quote_status not null default 'pending',
  created_at timestamptz not null default now()
);
alter table public.quote_requests enable row level security;

create policy "Client voit ses demandes"
  on public.quote_requests for select using (auth.uid() = client_id);
create policy "Artisan voit ses demandes reçues"
  on public.quote_requests for select using (
    exists (select 1 from public.artisans a where a.id = artisan_id and a.user_id = auth.uid())
  );
create policy "Création de demande (auth ou anon)"
  on public.quote_requests for insert with check (true);
create policy "Artisan met à jour le statut"
  on public.quote_requests for update using (
    exists (select 1 from public.artisans a where a.id = artisan_id and a.user_id = auth.uid())
  );
create policy "Admin gère toutes les demandes"
  on public.quote_requests for all using (public.has_role(auth.uid(), 'admin'));

-- 10. Trigger : créer profile auto au signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone'
  );
  -- rôle par défaut : client (sauf si meta_data contient un autre rôle valide)
  insert into public.user_roles (user_id, role)
  values (
    new.id,
    coalesce((new.raw_user_meta_data->>'role')::public.app_role, 'client'::public.app_role)
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 11. Trigger updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger artisans_updated before update on public.artisans
  for each row execute function public.set_updated_at();

-- 12. STORAGE bucket pour médias artisans
insert into storage.buckets (id, name, public)
values ('artisan-media', 'artisan-media', true)
on conflict (id) do nothing;

create policy "Médias artisans publics en lecture"
  on storage.objects for select
  using (bucket_id = 'artisan-media');

create policy "Utilisateur upload dans son dossier"
  on storage.objects for insert
  with check (
    bucket_id = 'artisan-media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Utilisateur gère ses médias"
  on storage.objects for update
  using (
    bucket_id = 'artisan-media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Utilisateur supprime ses médias"
  on storage.objects for delete
  using (
    bucket_id = 'artisan-media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
