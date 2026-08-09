# 🌿 Olea Digitalis

Službena web stranica i javni portal projekta **Olea Digitalis** — platforme za digitalnu sljedivost maslinovog ulja, od stabla do boce s digitalnim certifikatom autentičnosti.

🌐 **Portal:** [oleadigitalis.eu](https://oleadigitalis.eu)

## 📌 Vizija
Olea Digitalis rješava problem digitalizacije, autentičnosti i sljedivosti proizvodnje maslinovog ulja. Projekt spaja inovativne poljoprivredne tehnologije (IoT) s naprednim softverom kako bi obiteljskim poljoprivrednim gospodarstvima (OPG-ovima) omogućio jednostavan pristup modernom tržištu.

*(Napomena: OleaDbot i IoT povezanost razvijaju se unutar odvojene SaaS aplikacije bazirane na Next.js-u, dok je ovaj repozitorij isključivo javni web portal i blog platforma).*

## 🏗️ Tehnološka Arhitektura

### Frontend (Klijentska aplikacija)
- **Framework:** Astro (Static Site Generation - SSG) za maksimalnu brzinu učitavanja.
- **Stilizacija:** Tailwind CSS v4 (s ugrađenim Vite purgingom za uklanjanje neiskorištenog koda).
- **Višejezičnost (i18n):** Puni dvojezični prikaz (Hrvatski i Engleski) s dinamičkim rutiranjem iz baze.
- **Tipizacija:** Strogi TypeScript (striktno definirani `Props` interfejsi unutar svih UI i Layout komponenti).
- **SEO & PWA:** Ugrađen lokalni Service Worker (offline podrška), stroga kompresija HTML-a i strukturirani JSON-LD sheme za indeksiranje.

### Backend (Upravljanje sadržajem)
- **CMS:** Payload CMS 3.0 (Headless arhitektura postavljena u direktoriju `cms/`).
- **Baza podataka:** Lokalni SQLite (za brzo i neovisno lokalno okruženje i laku implementaciju).
- **Integracija:** Komunikacija Astro frontenda i Payload CMS-a putem **Astro Loader API-ja**. Sadržaj se validira pomoću **Zod** shema, a višejezični JSON prijevodi iz baze pretvaraju se direktno u HTML pomoću prilagođenog Lexical parsera.

## 🚀 Pokretanje projekta

Aplikacija je podijeljena u dva procesa: Frontend (Astro) i Backend (Payload CMS).

### 1. Pokretanje Payload CMS-a
Pokrenite CMS u odvojenom terminalu kako bi Astro mogao povlačiti najnoviji sadržaj iz baze prilikom renderiranja stranica.
```bash
cd cms
npm install
npm run dev
```

### 2. Pokretanje Astro Frontenda
```bash
# Otvorite novi terminal na rootu projekta
npm install
npm run dev
```

## 📚 Dokumentacija

- [Arhitektura](docs/architecture.md)
- [Brendiranje i boje](docs/branding.md)
- [Dnevnici razvoja](docs/dev-logs/)

---

## 🛠️ Pravila za developere

1. Svi dizajn tokeni (boje, fontovi) definirani su u `@theme` bloku u `src/styles/global.css`.
2. Komponente se strogo dijele na `src/components/layout/` (struktura) i `src/components/ui/` (elementi).
3. Svi klijentski event listeneri moraju se inicijalizirati isključivo preko `astro:page-load` događaja kako bi se spriječilo dupliciranje koda pri klijentskim tranzicijama.
4. Za SEO (metatagovi, OG, hreflang) i GEO (JSON-LD strukturirani podaci) koriste se isključivo komponente `SEO.astro` i `Schema.astro`.
5. Prije svakog pusha obavezno ispuniti dnevnik rada u `docs/dev-logs/` i sinkronizirati verziju.

