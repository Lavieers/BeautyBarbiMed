-- Komunikaty włączają się same w zadanym oknie czasu.
-- Strona dostaje też zaplanowane (jeszcze nie rozpoczęte) wiersze, żeby pasek
-- pojawił się o właściwej godzinie bez odświeżania.

update public.notices
set is_active = true
where is_active = false;

drop policy if exists "notices public read" on public.notices;
create policy "notices public read" on public.notices
  for select using (
    is_active
    and (ends_at is null or ends_at >= now())
  );
