# 🛠️ Technical Post-Mortem: Android Chrome Viewport & Repaint Bug Fix

**Datum:** 9. kolovoza 2026.
**Verzija:** `v0.5.2` (fiks), `v0.5.3` (dvh cleanup + dokumentacija)
**Komponente:** `Layout.astro`, `Navbar.astro`, `global.css`
**Status:** ✅ **Riješeno, merge-an u `main` i deployano na produkciju**

---

## 📌 Problem Summary

Pri skrolanju prema dolje na Android uređajima (primarno Google Chrome / Blink engine), sadržaj stranice na `oleadigitalis.eu` iznenada bi nestao, ostavljajući bijeli/prazan ekran.

### Root Cause Analysis

1. **Dynamic Viewport Heights & `100vh` Mismatch**
   - Korištenje klasične CSS jedinice `100vh` temelji se na visini ekrana u trenutku kada su adresna i navigacijska traka preglednika *vidljive*.
   - Kada korisnik skrola prema dolje, Chrome dinamički sakriva adresnu traku, čime se visina vidljivog dijela ekrana poveća za ~60–80px.
   - Re-calculation layouta na starim `vh` jedinicama uzrokuje nenadani skok u DOM-u (Layout Shift).

2. **Compositing Layer Failure & Overflow Lock**
   - Kombinacija `height: 100vh` (ili `min-h-screen`) s globalnim `overflow: hidden` na parent elementima blokira vertikalno izračunavanje skrola u Blink render engineu.
   - Uslijed preračunavanja visine uz fiksno pozicionirane komponente, preglednik izgubi sklopni sloj (*compositing layer*) i propusti okinuti ponovno isrtavanje (*repaint*). Sadržaj ostaje skriveni "ghost" DOM element izvan vidokruga GPU-a.

3. **Branch Mismatch (Deployment Issue)**
   - Popravak je bio napravljen na grani `feature/payload-cms-integration`, a produkcijski CI/CD pipeline sluša isključivo `main` granu.

---

## 🏗️ Implementirano inženjersko rješenje

Trostruki popravak:

1. **Dinamičke Viewport Jedinice (`100dvh`)** — umjesto statičkog `100vh`, uveden je `100dvh` (Dynamic Viewport Height) koji u realnom vremenu preračunava visinu prateći širenje i skupljanje Chrome trake.

2. **Granularna Kontrola `overflow` Svojstva** — uklonjen je opći `overflow: hidden` na `body`/`html` razini, zamijenjen s `overflow-x-hidden` kako bi se spriječilo horizontalno ispadanje bez utjecaja na vertikalni kalkulator skrola.

3. **Prisilni Hardware Acceleration (GPU Compositing)** — `Navbar.astro` prebačen u vlastiti GPU sloj pomoću `transform-gpu` klase.

---

## 💻 Kodne Izmjene

### 1. `src/layouts/Layout.astro` (commit `8010eed`, v0.5.1)

```diff
-<html lang={lang} class="scroll-smooth">
+<html lang={lang} class="h-full scroll-smooth">

-    class="bg-olea-sand text-olea-earth flex min-h-screen flex-col font-sans antialiased"
+    class="bg-olea-sand text-olea-earth flex min-h-dvh flex-col overflow-x-hidden font-sans antialiased"
```

### 2. `src/components/layout/Navbar.astro` (commit `15435db`, v0.5.2)

```diff
-  class="bg-olea-sand/90 border-olea-olive/10 sticky top-0 z-50 border-b px-6 py-4 backdrop-blur-md transition-all duration-300 lg:px-12"
+  class="bg-olea-sand/90 border-olea-olive/10 sticky top-0 z-50 border-b px-6 py-4 backdrop-blur-md transform-gpu transition-all duration-300 lg:px-12"
```

### 3. `src/styles/global.css` (commit `15435db`, v0.5.2)

```css
@layer base {
+ html {
+   /* Podrška za mobilni Chrome i Safari */
+   height: -webkit-fill-available;
+ }
+
  body {
+   min-height: 100dvh;
+   min-height: -webkit-fill-available;
+   /* Prisilno osvježavanje slojeva pri skrolanju */
+   -webkit-overflow-scrolling: touch;
    background-color: var(--color-olea-sand);
    color: var(--color-olea-earth);
    font-family: var(--font-sans);
  }
```

### 4. `v0.5.3` — dvh cleanup na page-level `<main>` elementima

Za potpunu konzistentnost s dvh strategijom, `min-h-screen` (→ `100vh`) zamijenjen je s `min-h-dvh` na svim preostalim page-level kontejnerima (11 lokacija / 10 fajlova):

| Fajl | Promjena |
|---|---|
| `src/pages/hr/nft.astro`, `src/pages/en/nft.astro` | `min-h-screen` → `min-h-dvh` |
| `src/pages/hr/o-projektu.astro`, `src/pages/en/about-project.astro` | `min-h-screen` → `min-h-dvh` |
| `src/pages/hr/blog/index.astro`, `src/pages/en/blog/index.astro` | `min-h-screen` → `min-h-dvh` |
| `src/pages/hr/blog/[slug].astro`, `src/pages/en/blog/[slug].astro` | `min-h-screen` → `min-h-dvh` |
| `src/pages/upitnik.astro` | `min-h-screen` → `min-h-dvh` |
| `src/pages/404.astro`, `src/pages/500.astro` | `min-h-screen` → `min-h-dvh` |

> **Napomena (optional follow-up):** Sekcijski min-heightovi `min-h-[70vh]` / `min-h-[80vh]` (Hero, index stranice) su benigni (min-height, bez overflow locka) te su ostavljeni nepromijenjeni. Po želji se mogu prebaciti na `min-h-[70dvh]` / `min-h-[80dvh]`.

---

## 🔍 Verifikacija Produkcije (post-deploy)

Provjera live stranice `oleadigitalis.eu` nakon deploymenta:

| Provjera | Rezultat |
|---|---|
| Verzija u footeru (`/hr/`) | ✅ `0.5.2` (kasnije `0.5.3`) |
| Built HTML — `transform-gpu` (Navbar) | ✅ prisutno |
| Built HTML — `overflow-x-hidden` (body) | ✅ prisutno |
| Built CSS — `100dvh` | ✅ prisutno |
| Built CSS — `-webkit-fill-available` | ✅ prisutno |

---

## ⚙️ CI/CD Pipeline (ispravljen podatak)

> ⚠️ **Korekcija izvorne dokumentacije:** Deployment se **ne** odvija preko Coolifyja, već putem GitHub Actions workflowa [`.github/workflows/main.yml`](../../.github/workflows/main.yml):
>
> - **Trigger:** `push` na granu `main`
> - **Koraci:** checkout → Node 22 + `npm ci` → `npm run build` (Astro + Rust compiler-rs) → FTPS upload `./dist/` na cPanel (`public_html`, server `ftp.oleadigitalis.eu`)
> - **Tajne:** `secrets.FTP_PASSWORD`

Budući da je fiks (commit `15435db`) bio merge-an i push-an na `origin/main`, workflow se automatski okidao i produkcija je odmah dobila ispravljeni build.

---

## 📋 Timeline

| Vrijeme | Događaj |
|---|---|
| `08:58` | `8010eed` — v0.5.1: `min-h-dvh` + `overflow-x-hidden` u `Layout.astro` |
| `09:32` | `15435db` — v0.5.2: `transform-gpu` (Navbar) + dvh/fill-available (global.css); merge u `main` + push |
| `09:33` | GitHub Actions automatski deploy na cPanel |
| Post-verifikacija | Live stranica servira `0.5.2`, svi markeri fixa prisutni u built assetima |
| `v0.5.3` | dvh cleanup na page-level `<main>` + post-mortem dokumentacija |

---

## ✅ Zaključak

Bug je u potpunosti riješen na frontend razini bez rušenja performansi, isporučen na produkciju i verificiran. Savjet za budućnost: **izbjegavati `100vh` za full-page kontejnere na mobilnim preglednicima** te držati CI/CD trigger i granu za produkcijski deploy usklađene (`main`).
