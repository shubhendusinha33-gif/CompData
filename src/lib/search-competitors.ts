import { buildDemoCompetitors, DEFAULT_STORE } from "@/data/demo-competitors";
import {
  fetchBrowserGoogleCompetitors,
  getStoredApiKey,
} from "@/lib/google-places-browser";
import { sortByDistance } from "@/lib/geo";
import type { CompetitorSearchResponse } from "@/types/competitor";

export interface SearchInput {
  name: string;
  lat: number;
  lng: number;
  radiusKm: number;
  /** Optional override; otherwise uses localStorage / NEXT_PUBLIC key */
  apiKey?: string;
}

/**
 * Browser-safe competitor search priority:
 * 1) Google Places via Maps JS (works on GitHub Pages with an API key)
 * 2) Same-origin /api/competitors (Node / Vercel host)
 * 3) Built-in demo dataset
 */
export async function searchCompetitors(
  input: SearchInput
): Promise<CompetitorSearchResponse> {
  const store = {
    name: input.name.trim() || DEFAULT_STORE.name,
    lat: input.lat,
    lng: input.lng,
    radiusKm: input.radiusKm,
  };

  if (
    Number.isNaN(store.lat) ||
    Number.isNaN(store.lng) ||
    store.lat < -90 ||
    store.lat > 90 ||
    store.lng < -180 ||
    store.lng > 180
  ) {
    throw new Error("Invalid latitude or longitude");
  }
  if (Number.isNaN(store.radiusKm) || store.radiusKm <= 0 || store.radiusKm > 50) {
    throw new Error("Radius must be between 0 and 50 km");
  }

  const apiKey = (input.apiKey ?? getStoredApiKey()).trim();

  if (apiKey && typeof window !== "undefined") {
    try {
      const competitors = sortByDistance(
        await fetchBrowserGoogleCompetitors(
          store.lat,
          store.lng,
          store.radiusKm,
          apiKey
        )
      );
      return {
        store,
        competitors,
        source: "google",
        message:
          competitors.length === 0
            ? "No retail competitors found in this radius. Try a larger radius or different coordinates."
            : "Live Google Places data. Opened-on and size are not provided by Google.",
      };
    } catch (err) {
      console.warn("Browser Google Places failed:", err);
      // Continue to server API / demo
    }
  }

  // Try live API when hosted on Node (dev server / Vercel).
  if (typeof window !== "undefined") {
    try {
      const params = new URLSearchParams({
        lat: String(store.lat),
        lng: String(store.lng),
        radius: String(store.radiusKm),
        name: store.name,
      });
      const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
      const res = await fetch(`${base}/api/competitors?${params}`, {
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          return (await res.json()) as CompetitorSearchResponse;
        }
      }
    } catch {
      // Fall through to demo — expected on GitHub Pages without a key
    }
  }

  return {
    store,
    competitors: sortByDistance(
      buildDemoCompetitors(store.lat, store.lng, store.radiusKm)
    ),
    source: "demo",
    message: apiKey
      ? "Google Places request failed — showing sample competitors. Check the API key (enable Maps JavaScript API + Places API, allow your site referrer)."
      : "Demo mode — sample rivals for layout/testing. Paste a Google Maps API key above and click Find competitors for live data (no install needed).",
  };
}
