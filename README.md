# CompData — VMM Competitor Intelligence

Beautiful dashboard for **Vishal Mega Mart** store teams: enter a store’s coordinates and pull nearby retail competitors with Google rating, distance, category, open date, address, phone, and size.

## Features

- Coordinate + radius search for any VMM location
- Interactive catchment map (Leaflet / OSM)
- **Top competitors** summary panel (brand · category · distance)
- Full competition table: rating, distance, category, opened on, address & contact, size
- **Live mode** via Google Places Nearby Search + Place Details
- **Demo mode** with sample Indian retail rivals when no API key is set

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Without an API key the app loads demo competitors around a sample Noida store.

## Google Maps API (live data)

1. Create a key in [Google Cloud Console](https://console.cloud.google.com/) with **Places API** enabled.
2. Copy `.env.example` to `.env.local`:

```bash
GOOGLE_MAPS_API_KEY=your_key_here
```

3. Restart `npm run dev`.

### Field availability

| Field | Source |
| --- | --- |
| Brand, category, distance, rating, address, phone | Google Places (live) or demo |
| Opened on, store size (sq ft) | Demo illustrative values — not published by Google Places |

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Run production build |
| `npm run lint` | ESLint |

## Stack

Next.js · TypeScript · Tailwind CSS · Leaflet · Google Places API
