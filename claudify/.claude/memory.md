# Memory

## Now
- Świeży setup Claudify — priorytety: nowe funkcje UI + SEO/meta tagi

## Project
- **Nazwa:** osiedle-test (wyszukiwarka lokali deweloperskich)
- **Typ:** Produkt komercyjny dla klienta-dewelopera
- **Stack:** Next.js 16 (App Router) + TypeScript + Sanity CMS + styled-components + Tailwind v4
- **Sanity:** projectId z env, dataset production, studio na /studio
- **Kolorystyka:** #1a1a2e (granat), #4f7cff (niebieski akcent), #f0f2f5 (tło)

## Key Files
- `app/page.tsx` — główna lista lokali (Client Component, ~710 linii)
- `app/lokal/[id]/` — podstrona szczegółów lokalu
- `app/studio/[[...tool]]/` — Sanity Studio
- `sanity/schemaTypes/lokal.ts` — schema lokalu
- `lib/client.ts`, `lib/image.ts`, `lib/live.ts` — Sanity utils

## Co już działa
- Lista kafelki/tabela, filtry (pokoje/piętro/status/budynek), sortowanie
- Porównywarka do 3 lokali (sticky pasek + modal)
- Statusy: wolne/rezerwacja/sprzedane
- Zdjęcia z Sanity + rzut mieszkania

## Do zrobienia (priorytety)
- Strona główna inwestycji (hero, opis osiedla, galeria)
- SEO: meta tagi, OG, JSON-LD dla stron lokali
- Formularz kontaktowy / rezerwacja
- Mapa okolicy

## Workflow
- Claude koduje, użytkownik recenzuje i akceptuje
- Pisać po polsku

## Open Threads
- (none)

## Recent Decisions
- Claudify onboarding 041626

## Blockers
- (none)
