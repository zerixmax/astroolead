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

## 4. Workflow
1.  **Lokalni razvoj:** `npm run dev`.
2.  **Linting:** Provjeri kod prije commita.
3.  **Dokumentacija:** Prije pusha, ažuriraj `docs/dev-logs/` koristeći predložak.
