# Arhitektura Projekta | Olea Digitalis

Ovaj dokument definira tehničke standarde i strukturu koda. Svako odstupanje zahtijeva odobrenje Seniora.

## 1. Komponente

Smještaj: `src/components/` (zajedničke) i `src/components/ui/` (specifične).

*   **Modularnost:** Svaka komponenta mora biti samostalna.
*   **Stilovi:** Isključivo Tailwind CSS. Bez `<style>` tagova s običnim CSS-om unutar Astro komponenti.
*   **Props:** TypeScript `interface Props { ... }` za sve props-e.
*   **i18n:** Komponente primaju `lang: Lang` prop i koriste `useTranslations(lang)` za tekstove.

## 2. Stilovi i Dizajn Tokeni

*   **Tailwind v4 `@theme`:** Dizajn tokeni (boje, fontovi) definirani su u `@theme` bloku u `src/styles/global.css`. Ovo je jedini izvor istine — `tailwind.config.mjs` je prazan (ili ga nema).
*   **Global CSS:** `src/styles/global.css` uključuje `@import "tailwindcss"`, `@theme` blok s tokenima, i `@layer base` s baznim stilovima (body, headings).
*   **Fontovi:** Self-hostani putem `@fontsource` paketa (Playfair Display, Inter, JetBrains Mono), uvezeni na vrhu `global.css`.

## 3. Slike i Resursi

*   **`src/assets/`** — slike koje zahtijevaju optimizaciju (Astro `<Image />`).
*   **`public/`** — statički resursi (favicon, robots.txt).
*   **Alt tagovi:** Svaka `<Image />` obavezno ima smislen `alt` tekst.

## 4. Rutiranje i Internacionalizacija (i18n)

*   **Struktura:** Eksplicitne mape po jeziku: `src/pages/hr/` i `src/pages/en/`.
*   **Konfiguracija:** Astro i18n u `astro.config.mjs` — `defaultLocale: 'hr'`, `locales: ['hr', 'en']`, `prefixDefaultLocale: true`, `redirectToDefaultLocale: true`.
*   **Rječnik putanja:** `src/i18n/routes.ts` mapira slugove između jezika (npr. `hr.o-projektu` ↔ `en.about-project`). Koristi se u Navbaru i Layoutu za generiranje hreflang alternates i jezičnog preklopnika.
*   **Tradukcije:** `src/i18n/ui.ts` učitava JSON datoteke (`src/data/i18n/hr.json`, `en.json`) i nudi `useTranslations(lang)` funkciju s dot-notacijom (npr. `t('nav.pocetna')`).
*   **Preusmjeravanje:** `/` → `/hr/` automatski putem Astro i18n configa.

## 5. SEO i Sitemap

*   **Kanonske adrese:** Layout (`src/layouts/Layout.astro`) automatski generira `canonical` URL i `hreflang` alternates za `hr`, `en`, i `x-default` koristeći `Astro.url.pathname` i `routes.ts`.
*   **Sitemap:** `@astrojs/sitemap` generira `sitemap-index.xml` u `dist/` pri svakom buildu.
*   **Meta tagovi:** Svaka stranica definira `title`, `description`, i opcionalno `keywords` kroz Layout props.

## 6. Workflow

1. **Lokalni razvoj:** `npm run dev` (port 4321).
2. **Build:** `npm run build` — provjeri da nema grešaka.
3. **Dokumentacija:** Prije pusha ažuriraj `docs/dev-logs/` i `src/data/version.json`.
