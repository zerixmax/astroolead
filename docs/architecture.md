# Arhitektura Projekta | Olea Digitalis

Ovaj dokument definira tehničke standarde, strukturu koda i smjernice za razvoj sukladno **OleaD Astro SOP v6**. Svako odstupanje zahtijeva odobrenje Seniora.

---

## 1. Arhitektura Komponenti

Smještaj: `src/components/layout/` (komponente izgleda/okvira poput `Navbar` i `Footer`) te `src/components/ui/` ili `src/components/` (samostalni UI elementi).

- **Modularnost:** Svaka komponenta mora biti izolirana i samostalna.
- **Props:** Obavezna stroga TypeScript tipizacija za sve props parametre putem `interface Props { ... }`.
- **Internacionalizacija (i18n):** Sve komponente primaju `lang: Lang` prop i koriste helper `useTranslations(lang)` za lokalizirani sadržaj.

---

## 2. CSS i Dizajn Tokeni (Tailwind v4)

- **Jedinstven izvor istine:** Svi dizajn tokeni (poput `--color-olea-sand` i `--color-olea-olive`) moraju biti definirani isključivo unutar `@theme` bloka u glavnoj datoteci [global.css](file:///home/z3r1x/Dokumenti/astroolead/src/styles/global.css).
- **Zabrana konfiguracijskih datoteka:** Datoteka `tailwind.config.mjs` ili slične JS/MJS konfiguracije su strogo zabranjene i izbrisane iz projekta. Tailwind v4 automatski skenira kod i povlači postavke iz CSS-a.
- **Fontovi:** Uvoze se iz `@fontsource` paketa na vrhu `global.css` (Playfair Display, Inter, JetBrains Mono) radi lokalnog hostanja.

---

## 3. SEO i Strukturirani Podaci (GEO)

- **SEO Inženjering:** Za sve metapodatke, OpenGraph tagove i kanonske poveznice zadužena je komponenta [SEO.astro](file:///home/z3r1x/Dokumenti/astroolead/src/components/SEO.astro).
- **GEO Inženjering:** strukturirani JSON-LD podaci ubacuju se isključivo preko komponente [Schema.astro](file:///home/z3r1x/Dokumenti/astroolead/src/components/Schema.astro) izravno u `<head>` predloška.
- **AgroTech Specifikacija:** Svaka stranica mora po zadanom imati injektiranu shemu za **Organization**, **LocalBusiness** i **Product** (definirano na razini `Layout.astro`), dok blog stranice dinamički dodaju **Blog** i **TechArticle** sheme.

---

## 4. Sigurnost Klijentske Logike (Astro View Transitions)

Zbog korištenja Astro View Transitions, tradicionalne metode poput `DOMContentLoaded` ili direktno pozivanje funkcija na dnu `<script>` tagova stvaraju duplikaciju koda i memorijsko curenje.

- **Pravilo 1:** Svi klijentski event listeneri i inicijalizacije funkcija moraju se registrirati *isključivo* putem:
  ```javascript
  document.addEventListener('astro:page-load', inicijalizacijaFunkcije);
  ```
- **Pravilo 2:** Zabranjeno je bilo kakvo samostalno (direktno) izvršavanje funkcija na dnu skripti izvan `astro:page-load` callbacka.

---

## 5. Rukovanje Greškama (Error Pages)

- **404 Stranica:** [404.astro](file:///home/z3r1x/Dokumenti/astroolead/src/pages/404.astro) prikazuje brendiranu, lokaliziranu stranicu s brzim povratkom na početnu u slučaju nepostojećih ruta.
- **500 Stranica:** [500.astro](file:///home/z3r1x/Dokumenti/astroolead/src/pages/500.astro) elegantno prikazuje serversku grešku (ili build-time grešku) s tehničkim ispisom pod haubom umjesto sirovog server dumpa.

---

## 6. Upravljanje Tajnama (Environment Variables)

- **Predložak za deployment:** U mapi [src/data/](file:///home/z3r1x/Dokumenti/astroolead/src/data/) kreirana je datoteka [.env.example](file:///home/z3r1x/Dokumenti/astroolead/src/data/.env.example) koja služi kao predložak za postavljanje varijabli poput `CMS_URL` bez izlaganja stvarnih vrijednosti.

---

## 7. Razvojni Workflow

1. **Pokretanje Payload CMS-a:** Unutar `/cms` pokrenuti `npm run dev` (port 3005).
2. **Pokretanje Astro Frontenda:** Unutar korijena pokrenuti `npm run dev` (port 4321).
3. **Build aplikacije:** `npm run build` za validaciju tipova i produkcijsku provjeru.
4. **Senior Check:** Prije pusha ukloniti sve `tailwind.config.*` reference i ažurirati [version.json](file:///home/z3r1x/Dokumenti/astroolead/src/data/version.json) te razvojni dnevnik u `docs/dev-logs/`.
