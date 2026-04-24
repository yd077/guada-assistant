-- ============================================================
-- BTP GUADA — Migration géolocalisation (livraison 6)
-- À exécuter dans Supabase SQL Editor APRÈS supabase-schema.sql
-- ============================================================

-- 1. Ajout colonnes géoloc sur artisans
alter table public.artisans
  add column if not exists base_lat numeric(9,6),
  add column if not exists base_lng numeric(9,6),
  add column if not exists radius_km int not null default 20,
  add column if not exists base_address text;

-- 2. Ajout colonnes géoloc sur projects
alter table public.projects
  add column if not exists project_lat numeric(9,6),
  add column if not exists project_lng numeric(9,6);

-- 3. Index pour recherches géo (par commune + statut)
create index if not exists idx_artisans_geo
  on public.artisans (status)
  where base_lat is not null and base_lng is not null;

-- 4. Fonction Haversine en SQL pur (km entre 2 coords)
create or replace function public.haversine_km(
  lat1 numeric, lng1 numeric, lat2 numeric, lng2 numeric
) returns numeric
language plpgsql immutable
as $$
declare
  r constant numeric := 6371; -- rayon Terre en km
  dlat numeric; dlng numeric; a numeric; c numeric;
begin
  if lat1 is null or lng1 is null or lat2 is null or lng2 is null then
    return null;
  end if;
  dlat := radians(lat2 - lat1);
  dlng := radians(lng2 - lng1);
  a := sin(dlat/2)^2
       + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlng/2)^2;
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  return r * c;
end;
$$;

-- 5. Fonction : artisans matchant un projet (specialty + dans rayon)
--    Renvoie les artisans dont la zone d'intervention couvre le projet.
create or replace function public.artisans_matching_project(_project_id uuid)
returns table (
  artisan_id uuid,
  distance_km numeric
)
language sql stable security definer
set search_path = public
as $$
  select
    a.id as artisan_id,
    public.haversine_km(a.base_lat, a.base_lng, p.project_lat, p.project_lng) as distance_km
  from public.projects p
  join public.artisans a
    on a.specialty = p.specialty
   and a.status = 'verified'
   and a.base_lat is not null
   and a.base_lng is not null
  where p.id = _project_id
    and p.project_lat is not null
    and p.project_lng is not null
    and public.haversine_km(a.base_lat, a.base_lng, p.project_lat, p.project_lng) <= a.radius_km
  order by distance_km asc;
$$;
