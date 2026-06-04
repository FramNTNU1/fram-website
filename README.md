# FRAM NTNU — nettside

Statisk informasjonsnettside for FRAM NTNU. Ingen backend, ingen byggesteg —
rene HTML-, CSS- og JS-filer som kan publiseres direkte.

## Sider

| Fil | Side |
|-----|------|
| `index.html` | Forside |
| `om.html` | Om Fram |
| `miljoer.html` | Organisasjonene |
| `booking.html` | Book lokaler |
| `arrangementer.html` | Arrangementer |
| `innovasjonsdagene.html` | Innovasjonsdagene '26 |
| `idegarasjen.html` | Idégarasjen |
| `404.html` | Feilside (vises automatisk av Vercel) |

## Delte filer

- `assets/` — bilder, ikoner, logoer, fonter, OG-bilde og favicon
- `assets/site.css` — globale mobilfikser + responsiv toppmeny (hamburger)
- `assets/site.js` — mobilmeny-logikk (hamburger + trekkspill-dropdowns)
- `events-data.js` — felles datakilde for arrangementer
- `vercel.json` — redirects, cache-headere og sikkerhetsheadere
- `robots.txt`, `sitemap.xml` — SEO
- `.vercelignore` — holder merkevare-kildefiler (`Visuell profil/`, `Logoer/`, `Gruva/`) utenfor publiseringen

## Oppdatere innhold

- **Arrangementer:** rediger `window.FRAM_EVENTS`-listen øverst i `events-data.js`.
- **Tekst/bilder:** rediger den aktuelle HTML-filen direkte.
- **Domene:** Hvis domenet endres fra `www.framntnu.no`, oppdater `canonical`/`og:url`
  i hver HTML-fil, samt `sitemap.xml`, `robots.txt` og `vercel.json`.

---

## Publisere — steg for steg

### 1. Legg prosjektet på GitHub

```bash
# i prosjektmappen
git init
git add .
git commit -m "FRAM NTNU – nettside klar for publisering"
git branch -M main
git remote add origin https://github.com/<brukernavn>/fram-ntnu.git
git push -u origin main
```

(Opprett først et tomt repo på github.com — uten README — og bruk URL-en derfra.)

### 2. Koble til Vercel

1. Gå til [vercel.com](https://vercel.com) og logg inn med GitHub.
2. **Add New… → Project** og velg `fram-ntnu`-repoet.
3. Framework Preset: **Other** (statisk side — ingen build).
4. La «Build & Output» stå tomt. Trykk **Deploy**.

Nettsiden er live på `https://<prosjekt>.vercel.app` etter et par sekunder.

### 3. Eget domene

1. I Vercel: **Project → Settings → Domains**.
2. Legg til `www.framntnu.no` (og `framntnu.no`).
3. Følg Vercel sine DNS-instruksjoner hos domeneleverandøren
   (vanligvis en CNAME for `www` og en A-/ALIAS-record for rot-domenet).

### 4. Senere oppdateringer

Hver gang du gjør endringer:

```bash
git add .
git commit -m "Beskriv endringen"
git push
```

Vercel bygger og publiserer automatisk ved hver `push` til `main`.
