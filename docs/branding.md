# Branding Guide | Olea Digitalis

Ova pravila osiguravaju vizualni integritet Olea projekta. **Nema improvizacije.**

## 🎨 Boje (Design Tokens)

Boje su definirane u `@theme` bloku u `src/styles/global.css`. Ne koristi boje izvan ovog skupa.

| Uloga | Boja | Hex | Tailwind Klasa |
| :--- | :--- | :--- | :--- |
| **Pozadina** | Olea Sand | `#F4F1EA` | `bg-olea-sand` / `text-olea-sand` |
| **Primarna** | Olea Olive | `#556B2F` | `bg-olea-olive` / `text-olea-olive` |
| **Tekst/Tamna**| Olea Earth | `#3D2B1F` | `bg-olea-earth` / `text-olea-earth` |

## Typography

Fontovi su self-hostani putem `@fontsource` paketa.

### Naslovi (h1, h2, h3)
*   **Font:** `Playfair Display` (serif)
*   **Tailwind klasa:** `font-serif`
*   **Dodatno:** `tracking-wide` (letter-spacing 0.025em)

### Body tekst (p, span, li, a, button)
*   **Font:** `Inter` (sans-serif)
*   **Tailwind klasa:** `font-sans`

### Monospace (code, kbd)
*   **Font:** `JetBrains Mono` (monospace)
*   **Tailwind klasa:** `font-mono`

## 📏 Elementi Sučelja

*   **Gumbi:** Zaobljeni (`rounded-full`), s tranzicijom (`transition-all duration-300`).
*   **Razmaci:** Standardne Tailwind spacing klase (npr. `py-24` za sekcije).
*   **Logo:** 110px širine u Navbaru, 160px u Footeru.
