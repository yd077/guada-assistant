-- Option admin : autoriser les artisans à acheter des packs avant validation de leur fiche
alter table public.payment_settings
  add column if not exists allow_unverified_purchase boolean not null default true;
