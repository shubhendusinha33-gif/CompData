# CompData — VMM Exec Check

Executive competitor intelligence for **Vishal Mega Mart**. Enter store coordinates (or upload a CSV) and pull nearby **priority organized retailers** — mom-and-pop shops are excluded.

## Web app (no install)

**https://shubhendusinha33-gif.github.io/CompData/**

Enable GitHub Pages once if needed: Settings → Pages → branch → `/docs`.

### Features
- Corporate Exec Check layout
- Auto store name from lat/long (`VMM — Dwarka Mod`)
- Radius presets **5 km** / **10 km**
- Priority competitor allowlist (D-Mart, Reliance, Zudio, V-Mart, Pantaloons, …)
- Single-store + **bulk CSV upload** (`Store cd`, `lat`, `Long`)
- **Download CSV** for current or bulk results
- Non-blocking bulk processing (progress bar + cancel)
- Optional Google Maps API key (password field in API settings)
- Designed and Developed by **Shubhendu Sinha**

### Bulk CSV template

```csv
Store cd,lat,Long
VMM001,28.5703,77.3219
VMM002,28.5921,77.0460
```

## Developer run

```bash
npm install
npm run dev
```

```bash
npm run build:pages   # static site → out/ (copied to docs/)
```
