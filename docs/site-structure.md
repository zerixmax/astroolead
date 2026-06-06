# Struktura Projekta i Stranica | Olea Digitalis

Ovaj dokument služi kao tehnički nacrt i karta trenutne strukture koda, stranica i stilova nakon odrađenih nadogradnji (animacije, 3 stupa, roadmap, blog i back-to-top gumb). Pomaže u sprječavanju neželjenih nuspojava pri budućim promjenama.

---

## 1. Stablasta struktura mapa (`src/`)

```text
src/
├── assets/
│   └── images/                     # Slike i nacrti (eager/lazy optimizirani)
├── components/
│   ├── ui/
│   │   ├── Hero.astro              # Hero sekcija s animacijom učitavanja (staggered delay)
│   │   ├── Navbar.astro            # Višejezična navigacija s padajućim izbornicima
│   │   └── VideoSection.astro      # YouTube video player (učitavanje u omjeru 16:9)
│   ├── Footer.astro                # Podnožje s društvenim mrežama, kontaktom i verzijom
│   └── Slideshow.astro             # Carousel s nacrtima i FSlightbox integracijom
├── content/
│   ├── blog/
│   │   ├── poor-signal-problem.md  # Blog post na engleskom (lang: en)
│   │   └── problem-signala.md      # Blog post na hrvatskom (lang: hr)
│   └── config.ts                   # Astro v6 Content Collections konfiguracija (glob loader)
├── data/
│   ├── i18n/
│   │   ├── en.json                 # Engleski prijevod
│   │   └── hr.json                 # Hrvatski prijevod (sadrži tekstove za 3 stupa i roadmap)
│   └── version.json                # Verzija i codename projekta (trenutno 0.3.6)
├── i18n/
│   ├── routes.ts                   # Rječnik ruta za prevođenje slugova (npr. o-projektu ↔ about-project)
│   └── ui.ts                       # Helper `useTranslations` za dot-notaciju
├── layouts/
│   └── Layout.astro                # Glavni HTML predložak, progressive enhancement (.js klasa),
│                                   # IntersectionObserver fallback i Back-to-Top gumb.
├── pages/
│   ├── en/
│   │   ├── blog/
│   │   │   ├── [slug].astro        # Prikaz pojedinačnog članka (engleski)
│   │   │   └── index.astro         # Popis svih članaka (engleski)
│   │   ├── about-project.astro     # Stranica O projektu
│   │   ├── digital-log.astro       # Dnevnik uzgoja (engleski)
│   │   ├── index.astro             # Engleska početna stranica
│   │   ├── nft.astro               # Certifikati
│   │   ├── oleadbot.astro          # OleaDbot asistent
│   │   └── oleadenode.astro        # OleaD-Node senzorska mreža
│   ├── hr/
│   │   ├── blog/
│   │   │   ├── [slug].astro        # Prikaz pojedinačnog članka (hrvatski)
│   │   │   └── index.astro         # Popis svih članaka (hrvatski)
│   │   ├── dnevnik-uzgoja.astro    # Dnevnik uzgoja (hrvatski)
│   │   ├── index.astro             # Hrvatska početna stranica
│   │   ├── nft.astro               # Certifikati
│   │   ├── o-projektu.astro        # Stranica O projektu
│   │   ├── oleadbot.astro          # OleaDbot asistent
│   │   └── oleadenode.astro        # OleaD-Node senzorska mreža
│   └── index.astro                 # Root preusmjeravanje (Astro.redirect('/hr/'))
└── styles/
    └── global.css                  # Tailwind v4 uvoz, @theme tokeni, animacije i blog tipografija
```

---

## 2. Redoslijed i struktura Početne Stranice (`pages/[lang]/index.astro`)

Svaka početna stranica (hrvatska i engleska) dijeli istu JSX/HTML strukturu s ugrađenim animacijama na skrolanje:

```html
<Layout title="{...}" description="{...}" lang="{lang}">
  <Navbar lang="{lang}" />

  <main>
    <!-- 1. Hero sekcija (sadrži staggered animacije učitavanja) -->
    <Hero lang="{lang}" />

    <!-- 2. Video sekcija (scroll-reveal) -->
    <VideoSection lang="{lang}" />

    <!-- 3. Projekt uvod ("Sustav izgrađen na zemlji...") (scroll-reveal) -->
    <section id="projekt" class="scroll-reveal ...">
      <!-- Naslov i opis učitani iz i18n -->
    </section>

    <!-- 4. Slideshow nacrta (scroll-reveal) -->
    <section class="scroll-reveal ...">
      <Slideshow images="{...}" />
    </section>

    <!-- 5. Tri stupa OleaD sustava ("Kako to radi...") (scroll-reveal) -->
    <section id="stupi" class="scroll-reveal ...">
      <!-- 3 Glassmorphic kolone (I. PWA, II. Senzori/Prepoznavanje, III. Blockchain) -->
    </section>

    <!-- 6. OleaDbot robotski asistent (scroll-reveal) -->
    <section id="oleadbot" class="scroll-reveal ...">
      <!-- Poveznica i CTA za podstranicu oleadbot -->
    </section>

    <!-- 7. OleaDnode senzorska mreža (scroll-reveal) -->
    <section id="oleadnode" class="scroll-reveal ...">
      <!-- Poveznica i CTA za podstranicu oleadenode -->
    </section>

    <!-- 8. Tehnološka mapa puta (Roadmap) (scroll-reveal) -->
    <section id="roadmap" class="scroll-reveal ...">
      <!-- 2 kolone: Verzija 1.0 (završeno) i Verzija 2.0 (u razvoju) s pripadajućim SVG ikonama -->
    </section>
  </main>

  <footer lang="{lang}" />
</Layout>
```

---

## 3. Sustav stilova i animacija (`global.css` i `Layout.astro`)

Sustav animacija je hibridan i optimiziran kako ne bi stvarao vizualno zakašnjenje ili layout shift.

### CSS Animacije u `global.css`

- **Page Load (`@keyframes slide-up-fade`)**: Animira elemente Hero sekcije pri prvom učitavanju. Koriste se klase `.animate-fade-in-up` u kombinaciji s kašnjenjima `.delay-1` (0.2s) i `.delay-2` (0.4s).
- **Scroll Reveal (`@keyframes fade-in-up-scroll`)**:
  - **Nativna podrška**: Koristi se CSS `animation-timeline: view()` s dometom `animation-range: entry 10% entry 70%` na preglednicima koji to podržavaju (Chrome, Safari 19+, Edge).
  - **JS Fallback**: Na preglednicima koji ne podržavaju CSS timeline (npr. Firefox), JavaScript `IntersectionObserver` osluškuje skrolanje i dodaje klasu `.is-visible` na elemente s klasom `.scroll-reveal`, što pokreće CSS tranziciju.
  - **Progresivni prikaz**: Stilovi za animacije bez JS-a su isključeni (korištenjem roditeljske klase `.js .scroll-reveal`) kako bi stranica radila savršeno i bez JavaScripta.
  - **Pristupačnost**: Cijeli scroll-reveal sustav je onemogućen ako korisnik ima uključen `prefers-reduced-motion` u postavkama sustava.
- **Back-to-Top gumb (`@keyframes float-bounce`)**:
  - Fiksni okrugli gumb s glassmorphic efektom na poziciji `bottom-28 right-6`.
  - Stalno poskakuje prema gore (`.animate-float`), ali se animacija pauzira na `hover` kako bi korisnik lakše kliknuo na njega.
  - Skripta u `Layout.astro` detektira skrolanje i nakon 300px visine mu dodaje klasu `.show-btn` koja ga animirano prikazuje.

---

## 4. Tipografija za Blog (`.blog-prose` u `global.css`)

Budući da projekt ne koristi gotov paket poput `@tailwindcss/typography`, kreirana je lagana, visoko legibilna i prilagođena tipografija pod klasom `.blog-prose`. Ona automatski stilizira elemente koje Astro generira iz Markdown datoteka:

- `h2`, `h3`: Serif font (Playfair Display) s finim donjim obrubom na `h2` za razdvajanje poglavlja.
- `p`, `li`: Povećan prored (`line-height: 1.8`), serif/sans fontovi i prigušene prirodne boje radi smanjenja zamora očiju.
- `strong`: Podebljana zemljana boja.
- `ul`: Suptilni kružići s lijevom marginom.
