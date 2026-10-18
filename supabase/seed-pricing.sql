-- ============================================================
-- Aktualizacja sekcji CENNIK w tabeli sections
-- 
-- Jak użyć:
--   Supabase Dashboard → SQL Editor → New query → wklej i Run
-- ============================================================

INSERT INTO public.sections (key, content)
VALUES (
  'pricing',
  '{
    "kicker": "",
    "titleLead": "Cennik Zabiegów",
    "titleAccent": "",
    "intro": "Przejrzyste ceny, bez ukrytych kosztów.\nInwestycja w jakość, która procentuje Twoim samopoczuciem.",
    "groups": [
      {
        "id": "twarz",
        "label": "Zabiegi na Twarz i Ciało",
        "rows": [
          { "id": "konsultacja",    "name": "Konsultacja kosmetologiczna (darmowa przy zabiegu)", "price": "80 zł" },
          { "id": "peeling",        "name": "Peeling kawitacyjny",                                "price": "80 zł" },
          { "id": "mezo-beziglowa", "name": "Mezoterapia bezigłowa",                              "price": "250 zł" },
          { "id": "mezo-mikro",     "name": "Mezoterapia mikroigłowa",                            "price": "270 zł" },
          { "id": "mezo-iglowa",    "name": "Mezoterapia igłowa",                                 "price": "400 zł" },
          { "id": "stymulacja",     "name": "Stymulacja i ujędrnianie skóry twarzy",              "price": "120 zł" },
          { "id": "indywidualny",   "name": "Zabieg indywidualnie dobrany (na twarz)",            "price": "200 zł" },
          { "id": "mikroderm",      "name": "Mikrodermabrazja diamentowa",                        "price": "130 zł" },
          { "id": "rf",             "name": "Radiofrekwencja – zabieg RF",                        "price": "270 zł" },
          { "id": "bankietowy",     "name": "Zabieg bankietowy na twarz z maską",                 "price": "120 zł" },
          { "id": "kobido",         "name": "Masaż twarzy z elementami Kobido",                   "price": "150 zł" },
          { "id": "liposukcja",     "name": "Liposukcja kawitacyjna z Infraterapią IR",           "price": "170 zł" }
        ]
      },
      {
        "id": "rzesy",
        "label": "Stylizacja Rzęs",
        "rows": [
          { "id": "uzup-1-1",    "name": "Uzupełnienie rzęs 1:1",              "price": "100 zł" },
          { "id": "uzup-2-3d",   "name": "Uzupełnienie rzęs 2/3D",            "price": "130 zł" },
          { "id": "przed-2-3d",  "name": "Przedłużanie rzęs 2/3D",            "price": "160 zł" },
          { "id": "przed-3-4d",  "name": "Przedłużanie rzęs 3/4D",            "price": "180 zł" },
          { "id": "mokry-efekt", "name": "Przedłużanie rzęs Mokry Efekt",     "price": "150 zł" }
        ]
      },
      {
        "id": "pedicure",
        "label": "Pedicure",
        "rows": [
          { "id": "ped-hybryda",      "name": "Pedicure hybrydowy",                              "price": "130 zł" },
          { "id": "ped-spa",          "name": "Pedicure SPA",                                    "price": "140 zł" },
          { "id": "ped-spa-maska",    "name": "Pedicure SPA + hybryda z maską",                  "price": "150 zł" },
          { "id": "ped-spa-masaz",    "name": "Pedicure SPA + hybryda z maską i masażem stóp",   "price": "170 zł" }
        ]
      }
    ],
    "disclaimer": "* Podane ceny są cenami orientacyjnymi. Ostateczny koszt zabiegu ustalany jest podczas konsultacji."
  }'::jsonb
)
ON CONFLICT (key) DO UPDATE
  SET content    = EXCLUDED.content,
      updated_at = now();
