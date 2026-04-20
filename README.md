# Olea Digitalis | Frontend (Astro)

Platforma za digitalnu trasabilnost maslinovog ulja. Od stabla do boce — s digitalnim certifikatom autentičnosti.

## ⚠️ Stroga pravila za developere (OBAVEZNO PROČITATI)
Ovaj projekt izgrađen je na **Clean Slate** principu. Zabranjeno je "vibe kodiranje" i nasumično dodavanje stilova.
1. Svi dizajn tokeni (boje, fontovi) nalaze se isključivo u `tailwind.config.mjs`.
2. Zabranjeno je mijenjanje globalne CSS arhitekture bez odobrenja Seniora.
3. Prije svakog pusha, obavezno je ispuniti dnevnik rada u `docs/dev-logs/`.

## 🛠️ Tehnološki Stack
* **Framework:** Astro (Static Site Generation)
* **Styling:** Tailwind CSS
* **Ikone:** Lucide Astro (`@lucide/astro`)
* **Infrastruktura:** Docker (Nginx Multi-stage build)

## 🚀 Pokretanje projekta (Lokalno)
1. Instaliraj ovisnosti: `npm install`
2. Pokreni server: `npm run dev`
3. Projekt je dostupan na: `http://localhost:4321`

## 🐳 Pokretanje (Docker)
```bash
docker build -t olea-digitalis-frontend .
docker run -p 8080:80 olea-digitalis-frontend
```

## 📚 Dokumentacija

Detaljna dokumentacija nalazi se u `docs/` direktoriju:

* [Arhitektura projekta](docs/architecture.md)
* [Pravila Brendiranja i Boje](docs/branding.md)
* [Dnevnici razvoja (Dev Logs)](docs/dev-logs/)
