-- Aktualizacja intro sekcji Pakiety (stare wersje tekstu w bazie).
update public.sections
set content = jsonb_set(
  content,
  '{intro}',
  '"Postaw na kompleksową pielęgnację i ciesz się lepszym rezultatem w niższej cenie."'::jsonb,
  true
)
where key = 'offer'
  and (
    content->>'intro' is null
    or content->>'intro' ilike 'starannie dobrane terapie%'
    or content->>'intro' ilike 'zabiegi w pakiecie%'
    or content->>'intro' ~* 'odst[eę]pach\s+2\s*[–-]\s*4\s*tygodni'
  );
