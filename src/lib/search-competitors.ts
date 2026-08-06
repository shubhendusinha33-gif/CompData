import { buildDemoCompetitors, DEFAULT_STORE } from "@/data/demo-competitors";
import { sortByDistance } from "@/lib/geo";
import type { CompetitorSearchResponse } from "@/types/competitor";

export interface SearchInput {
  name: string;
  lat: number;
  lng: number;
  radiusKm: number;
}

/**
 * Browser-safe competitor search.
 * Uses the built-in demo dataset (works on GitHub Pages with zero install).
 * When a same-origin /api/competitors endpoint exists (local/Vercel + API key),
 * prefers that for live Google Places results.
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

  // Try live API when hosted on Node (dev server / Vercel). Skip on static hosts.
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
      // Fall through to demo — expected on GitHub Pages static hosting
    }
  }

  return {
    store,
    competitors: sortByDistance(
      buildDemoCompetitors(store.lat, store.lng, store.radiusKm)
    ),
    source: "demo",
    message:
      "Web demo mode — sample Indian retail rivals around your coordinates. Add GOOGLE_MAPS_API_KEY on a Node host for live Google Places data.",
  };
}
