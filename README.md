# Olea Digitalis

Službena PR web stranica projekta **Olea Digitalis** — platforme za digitalnu sljedivost maslinovog ulja, od stabla do boce s digitalnim certifikatom autentičnosti na Algorand blockchainu.

🌐 [oleadigitalis.eu](https://oleadigitalis.eu)

## Tehnološki stack

- **Astro 6** — Static Site Generation, TypeScript, i18n routing
- **Tailwind CSS v4** — utility-first styling s `@theme` design tokenima
- **astro-icon** — Lucide ikone (self-hosted putem @iconify)
- **@fontsource** — self-hosted fontovi (Playfair Display, Inter, JetBrains Mono)
- **@astrojs/sitemap** — automatski XML sitemap s hreflang alternates
- **Docker** — multi-stage build (Node build → Nginx alpine serve)

## Pokretanje

```bash
# Lokalno
npm install
npm run dev

# Docker
docker build -t olea-digitalis-frontend .
docker run -p 8080:80 olea-digitalis-frontend
```

## Dokumentacija

- [Arhitektura](docs/architecture.md)
- [Brendiranje i boje](docs/branding.md)
- [Dnevnici razvoja](docs/dev-logs/)

---

## Pravila za developere

1. Svi dizajn tokeni (boje, fontovi) definirani su u `@theme` bloku u `src/styles/global.css`.
2. Prije svakog pusha obavezno ispuniti dnevnik rada u `docs/dev-logs/`.
