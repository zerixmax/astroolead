# Arhitektura Projekta | Olea Digitalis

Ovaj dokument definira tehničke standarde i strukturu koda. Svako odstupanje zahtijeva odobrenje Seniora.

## 1. Komponente (`src/components/`)
*   **Modularnost:** Svaka komponenta mora biti samostalna.
*   **Stilovi:** Isključivo Tailwind CSS. Zabranjeno je korištenje `<style>` tagova s običnim CSS-om unutar Astro komponenti osim u ekstremnim slučajevima.
*   **Props:** Koristi TypeScript za definiranje sučelja propsa (`interface Props { ... }`).

## 2. Stilovi i Dizajn Tokenc
*   **Tailwind Config:** Sva proširenja teme (boje, fontovi, spacing) idu u `tailwind.config.mjs`.
*   **Global CSS:** Nalazi se u `src/styles/global.css`. Ovdje se definiraju samo @font-face i bazični reseti. Ne dodaj klase ovdje!

## 3. Slike i Resursi
*   **Public vs Assets:** Slike koje se ne mijenjaju idu u `public/`. Slike koje zahtijevaju optimizaciju idu u `src/assets/`.
*   **Alt Tags:** Svaka slika OBAVEZNO mora imati smislen `alt` tekst.

## 4. Rutiranje i Internacionalizacija (i18n)
*   **Struktura stranica:** Stranice se nalaze u odvojenim mapama po jezicima unutar `src/pages/hr/` i `src/pages/en/`.
*   **Rječnik putanja:** Sve lokalizirane putanje moraju biti definirane u `src/i18n/routes.ts`. Taj rječnik se koristi za mapiranje alternativnih jezika u Navbaru i hreflang meta tagovima.
*   **Preusmjeravanje:** Glavni `/` preusmjerava na zadani jezik `/hr/` pomoću Astro i18n routing postavki u `astro.config.mjs`.

## 5. SEO i Sitemap
*   **Kanonske adrese:** Svaki Layout automatski generira canonical URL i hreflang alternatove za jezike (`hr`, `en`, `x-default`) pomoću `Astro.url.pathname` i `routes.ts`.
*   **Sitemap:** Integracija `@astrojs/sitemap` automatski stvara `sitemap-index.xml` i pripadajuće sitemape u direktoriju `dist/` pri svakom buildanju.
*   **Meta tagovi:** Svaka stranica mora definirati unikatan `title`, `description` i `keywords` preko layout propsa.

## 6. Workflow
1.  **Lokalni razvoj:** `npm run dev`.
2.  **Linting & Build:** Provjeri build s `npm run build` kako bi se osiguralo da nema preklapanja ruta.
3.  **Dokumentacija:** Prije pusha, ažuriraj `docs/dev-logs/` koristeći predložak i ažuriraj verziju u `src/data/version.json`.
