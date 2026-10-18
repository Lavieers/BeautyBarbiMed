-- Beauty Barbi Med — schemat treści strony.
--
-- Wklej całość w Supabase → SQL Editor → New query → Run.
-- Skrypt można uruchomić ponownie bez utraty danych.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Kto może edytować treści
-- ---------------------------------------------------------------------------

-- Konta z uprawnieniami do panelu. Samo istnienie konta w auth.users nie
-- wystarcza — user_id musi być tutaj, inaczej zapis zostanie odrzucony.
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ---------------------------------------------------------------------------
-- Wspólny trigger na updated_at
-- ---------------------------------------------------------------------------

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Ustawienia strony: kontakt, godziny, motyw. Zawsze dokładnie jeden wiersz.
-- ---------------------------------------------------------------------------

create table if not exists public.site_settings (
  id smallint primary key default 1 check (id = 1),
  contact jsonb not null default '{}'::jsonb,
  theme text not null default 'mocha',
  theme_overrides jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.site_settings (id) values (1) on conflict (id) do nothing;

drop trigger if exists site_settings_touch on public.site_settings;
create trigger site_settings_touch before update on public.site_settings
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Teksty sekcji. Jeden wiersz na sekcję, treść jako JSON o tym samym
-- kształcie co obiekty `content` w komponentach (src/data/defaults.js).
-- Brak wiersza = front używa wartości domyślnej z kodu.
-- ---------------------------------------------------------------------------

create table if not exists public.sections (
  key text primary key,
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

drop trigger if exists sections_touch on public.sections;
create trigger sections_touch before update on public.sections
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Komunikaty: wcześniejsze zamknięcie, urlop, zmiana godzin.
-- ---------------------------------------------------------------------------

create table if not exists public.notices (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  kind text not null default 'info' check (kind in ('info', 'warning', 'closure')),
  -- Puste daty = komunikat widoczny od razu i bez końca.
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists notices_touch on public.notices;
create trigger notices_touch before update on public.notices
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Galeria. Plik leży w Storage (bucket „media”), tu trzymamy tylko ścieżkę.
-- ---------------------------------------------------------------------------

create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null,
  alt text not null default '',
  -- Podpis kafelka: category = nazwa zabiegu, caption = jeden konkretny fakt.
  caption text,
  category text,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists gallery_images_order_idx
  on public.gallery_images (sort_order, created_at desc);

drop trigger if exists gallery_images_touch on public.gallery_images;
create trigger gallery_images_touch before update on public.gallery_images
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Opinie klientek. Dodawane wyłącznie z panelu.
-- ---------------------------------------------------------------------------

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  author text not null,
  body text not null,
  rating smallint check (rating between 1 and 5),
  treatment text,
  source text,
  is_published boolean not null default false,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  reviewed_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reviews_order_idx
  on public.reviews (sort_order, created_at desc);

drop trigger if exists reviews_touch on public.reviews;
create trigger reviews_touch before update on public.reviews
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- RLS: strona (klucz anon) tylko czyta opublikowane treści, zapis = admin.
-- ---------------------------------------------------------------------------

alter table public.admins enable row level security;
alter table public.site_settings enable row level security;
alter table public.sections enable row level security;
alter table public.notices enable row level security;
alter table public.gallery_images enable row level security;
alter table public.reviews enable row level security;

-- admins: własny wiersz do odczytu, zmiany tylko przez SQL Editor.
drop policy if exists "admins read self" on public.admins;
create policy "admins read self" on public.admins
  for select using (auth.uid() = user_id);

drop policy if exists "settings public read" on public.site_settings;
create policy "settings public read" on public.site_settings
  for select using (true);

drop policy if exists "settings admin write" on public.site_settings;
create policy "settings admin write" on public.site_settings
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "sections public read" on public.sections;
create policy "sections public read" on public.sections
  for select using (true);

drop policy if exists "sections admin write" on public.sections;
create policy "sections admin write" on public.sections
  for all using (public.is_admin()) with check (public.is_admin());

-- Komunikat widoczny publicznie tylko gdy włączony i w oknie czasowym.
drop policy if exists "notices public read" on public.notices;
create policy "notices public read" on public.notices
  for select using (
    is_active
    and (starts_at is null or starts_at <= now())
    and (ends_at is null or ends_at >= now())
  );

drop policy if exists "notices admin write" on public.notices;
create policy "notices admin write" on public.notices
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "gallery public read" on public.gallery_images;
create policy "gallery public read" on public.gallery_images
  for select using (is_published);

drop policy if exists "gallery admin write" on public.gallery_images;
create policy "gallery admin write" on public.gallery_images
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "reviews public read" on public.reviews;
create policy "reviews public read" on public.reviews
  for select using (is_published);

drop policy if exists "reviews admin write" on public.reviews;
create policy "reviews admin write" on public.reviews
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage: bucket na zdjęcia. Publiczny odczyt, wgrywanie tylko z panelu.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

drop policy if exists "media public read" on storage.objects;
create policy "media public read" on storage.objects
  for select using (bucket_id = 'media');

drop policy if exists "media admin insert" on storage.objects;
create policy "media admin insert" on storage.objects
  for insert with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "media admin update" on storage.objects;
create policy "media admin update" on storage.objects
  for update using (bucket_id = 'media' and public.is_admin());

drop policy if exists "media admin delete" on storage.objects;
create policy "media admin delete" on storage.objects
  for delete using (bucket_id = 'media' and public.is_admin());
