import { buildDemoCompetitors, DEFAULT_STORE } from "@/data/demo-competitors";
import { filterPriorityCompetitors } from "@/lib/competitor-filter";
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
  apiKey?: string;
  /** When false, return all Places hits (not recommended). Default true. */
  priorityOnly?: boolean;
  signal?: AbortSignal;
}

function applyPriority(
  competitors: CompetitorSearchResponse["competitors"],
  priorityOnly: boolean
) {
  return priorityOnly
    ? filterPriorityCompetitors(competitors)
    : sortByDistance(competitors);
}

/**
 * Competitor search priority:
 * 1) Google Places via Maps JS (optional API key)
 * 2) Same-origin /api/competitors
 * 3) Demo dataset of priority organized retailers
 */
export async function searchCompetitors(
  input: SearchInput
): Promise<CompetitorSearchResponse> {
  const priorityOnly = input.priorityOnly !== false;
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

  if (input.signal?.aborted) {
    throw new DOMException("Aborted", "AbortError");
  }

  const apiKey = (input.apiKey ?? getStoredApiKey()).trim();

  if (apiKey && typeof window !== "undefined") {
    try {
      const competitors = applyPriority(
        await fetchBrowserGoogleCompetitors(
          store.lat,
          store.lng,
          store.radiusKm,
          apiKey
        ),
        priorityOnly
      );
      return {
        store,
        competitors,
        source: "google",
        message:
          competitors.length === 0
            ? "No priority organized retailers found in this radius. Try 10 km."
            : "Live Google Places — keyword scan for priority brands (Zudio, V-Mart, D-Mart, Reliance, Carrefour, …). Mom-and-pop excluded.",
      };
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") throw err;
      console.warn("Browser Google Places failed:", err);
    }
  }

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
        signal: input.signal,
      });
      if (res.ok) {
        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const data = (await res.json()) as CompetitorSearchResponse;
          return {
            ...data,
            competitors: applyPriority(data.competitors, priorityOnly),
            message:
              data.source === "google"
                ? "Live data filtered to priority organized retailers."
                : data.message,
          };
        }
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") throw err;
    }
  }

  return {
    store,
    competitors: applyPriority(
      buildDemoCompetitors(store.lat, store.lng, store.radiusKm),
      priorityOnly
    ),
    source: "demo",
    message: apiKey
      ? "Google Places unavailable — showing priority demo retailers. Verify Maps JavaScript API + Places API on the key."
      : "Demo mode — priority organized retailers only. Add an API key in Settings for live Places.",
  };
}

export { DEFAULT_STORE };
