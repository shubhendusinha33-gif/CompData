import type { Competitor } from "@/types/competitor";
import {
  getPlacesSearchKeywords,
  isPriorityCompetitor,
  matchPriorityBrand,
} from "@/data/priority-competitors";
import {
  distanceKm,
  inferCategoryFromName,
  isSelfStore,
  mapTypesToCategory,
} from "@/lib/geo";

const STORAGE_KEY = "compdata_google_maps_api_key";

declare global {
  interface Window {
    google?: typeof google;
    __compdataMapsLoader?: Promise<typeof google.maps>;
  }
}

export function getStoredApiKey(): string {
  if (typeof window === "undefined") return "";
  const fromEnv = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  return (localStorage.getItem(STORAGE_KEY) || fromEnv).trim();
}

export function setStoredApiKey(key: string): void {
  if (typeof window === "undefined") return;
  const trimmed = key.trim();
  if (trimmed) localStorage.setItem(STORAGE_KEY, trimmed);
  else localStorage.removeItem(STORAGE_KEY);
}

function loadMaps(apiKey: string): Promise<typeof google.maps> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Maps only available in the browser"));
  }
  if (window.google?.maps?.places) {
    return Promise.resolve(window.google.maps);
  }
  if (window.__compdataMapsLoader) return window.__compdataMapsLoader;

  window.__compdataMapsLoader = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      "script[data-compdata-maps]"
    );
    if (existing) {
      existing.addEventListener("load", () => {
        if (window.google?.maps) resolve(window.google.maps);
        else reject(new Error("Google Maps failed to load"));
      });
      existing.addEventListener("error", () =>
        reject(new Error("Google Maps script failed to load"))
      );
      return;
    }

    const script = document.createElement("script");
    script.dataset.compdataMaps = "1";
    script.async = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      apiKey
    )}&libraries=places`;
    script.onload = () => {
      if (window.google?.maps?.places) resolve(window.google.maps);
      else
        reject(
          new Error("Places library unavailable — enable Places API on this key")
        );
    };
    script.onerror = () =>
      reject(new Error("Could not load Google Maps. Check the API key."));
    document.head.appendChild(script);
  });

  return window.__compdataMapsLoader;
}

function yieldToMain(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(() => resolve());
    } else {
      setTimeout(resolve, 0);
    }
  });
}

function nearbySearch(
  service: google.maps.places.PlacesService,
  request: google.maps.places.PlaceSearchRequest
): Promise<google.maps.places.PlaceResult[]> {
  return new Promise((resolve) => {
    service.nearbySearch(request, (results, status) => {
      if (
        status === google.maps.places.PlacesServiceStatus.OK &&
        results?.length
      ) {
        resolve(results);
        return;
      }
      resolve([]);
    });
  });
}

function textSearch(
  service: google.maps.places.PlacesService,
  request: google.maps.places.TextSearchRequest
): Promise<google.maps.places.PlaceResult[]> {
  return new Promise((resolve) => {
    service.textSearch(request, (results, status) => {
      if (
        status === google.maps.places.PlacesServiceStatus.OK &&
        results?.length
      ) {
        resolve(results);
        return;
      }
      resolve([]);
    });
  });
}

function getDetails(
  service: google.maps.places.PlacesService,
  placeId: string
): Promise<google.maps.places.PlaceResult | null> {
  return new Promise((resolve) => {
    service.getDetails(
      {
        placeId,
        fields: [
          "place_id",
          "name",
          "formatted_address",
          "formatted_phone_number",
          "international_phone_number",
          "website",
          "rating",
          "user_ratings_total",
          "types",
          "url",
          "business_status",
          "geometry",
        ],
      },
      (result, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && result) {
          resolve(result);
          return;
        }
        resolve(null);
      }
    );
  });
}

function createService(maps: typeof google.maps) {
  const attribution = document.createElement("div");
  attribution.style.display = "none";
  document.body.appendChild(attribution);
  const service = new maps.places.PlacesService(attribution);
  return {
    service,
    cleanup: () => attribution.remove(),
  };
}

/**
 * Resolve the exact Vishal Mega Mart store name nearest to these coordinates
 * from Google Places (e.g. "Vishal Mega Mart - Dwarka Mod").
 */
export async function resolveVmmStoreFromGoogle(
  lat: number,
  lng: number,
  apiKey: string,
  signal?: AbortSignal
): Promise<{ storeName: string; placeId?: string; address?: string } | null> {
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

  const maps = await loadMaps(apiKey);
  const { service, cleanup } = createService(maps);

  try {
    const location = new maps.LatLng(lat, lng);
    const [textHits, nearbyHits] = await Promise.all([
      textSearch(service, {
        query: "Vishal Mega Mart",
        location,
        radius: 2500,
      }),
      nearbySearch(service, {
        location,
        radius: 2500,
        keyword: "Vishal Mega Mart",
      }),
    ]);

    const byId = new Map<string, google.maps.places.PlaceResult>();
    for (const place of [...textHits, ...nearbyHits]) {
      if (!place.place_id || !place.name) continue;
      if (!isSelfStore(place.name)) continue;
      if (!byId.has(place.place_id)) byId.set(place.place_id, place);
    }

    const ranked = [...byId.values()]
      .map((place) => {
        const plat = place.geometry?.location?.lat() ?? lat;
        const plng = place.geometry?.location?.lng() ?? lng;
        return { place, dist: distanceKm(lat, lng, plat, plng) };
      })
      .sort((a, b) => a.dist - b.dist);

    const best = ranked[0]?.place;
    if (!best?.name) return null;

    return {
      storeName: best.name,
      placeId: best.place_id,
      address: best.vicinity || best.formatted_address,
    };
  } finally {
    cleanup();
  }
}

/** Live competitor pull — keyword search for priority brands (not type-only). */
export async function fetchBrowserGoogleCompetitors(
  lat: number,
  lng: number,
  radiusKm: number,
  apiKey: string,
  onProgress?: (done: number, total: number) => void
): Promise<Competitor[]> {
  const maps = await loadMaps(apiKey);
  const { service, cleanup } = createService(maps);

  try {
    const location = new maps.LatLng(lat, lng);
    const radiusM = Math.min(Math.round(radiusKm * 1000), 50000);
    const keywords = getPlacesSearchKeywords();
    const byId = new Map<string, google.maps.places.PlaceResult>();

    const addPlaces = (places: google.maps.places.PlaceResult[]) => {
      for (const place of places) {
        if (!place.place_id || !place.name) continue;
        if (isSelfStore(place.name)) continue;
        if (!byId.has(place.place_id)) byId.set(place.place_id, place);
      }
    };

    // 1) Keyword searches for priority brands (batched so UI stays responsive)
    const batchSize = 6;
    for (let i = 0; i < keywords.length; i += batchSize) {
      const chunk = keywords.slice(i, i + batchSize);
      const results = await Promise.all(
        chunk.map((keyword) =>
          nearbySearch(service, {
            location,
            radius: radiusM,
            keyword,
          })
        )
      );
      results.forEach(addPlaces);
      onProgress?.(Math.min(i + batchSize, keywords.length), keywords.length);
      await yieldToMain();
    }

    // 2) Light type sweep as a backfill
    const typeResults = await Promise.all(
      (
        [
          "department_store",
          "supermarket",
          "clothing_store",
          "shopping_mall",
        ] as const
      ).map((type) => nearbySearch(service, { location, radius: radiusM, type }))
    );
    typeResults.forEach(addPlaces);

    // Filter to priority brands BEFORE capping — previous bug sliced generic retail first
    const priorityHits = [...byId.values()]
      .filter((place) => place.name && isPriorityCompetitor(place.name))
      .map((place) => {
        const plat = place.geometry?.location?.lat() ?? lat;
        const plng = place.geometry?.location?.lng() ?? lng;
        return {
          place,
          dist: distanceKm(lat, lng, plat, plng),
          plat,
          plng,
        };
      })
      .filter((p) => p.dist <= radiusKm + 0.05)
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 40);

    const detailed: Competitor[] = [];
    for (let i = 0; i < priorityHits.length; i++) {
      const { place, dist, plat, plng } = priorityHits[i];
      const details = place.place_id
        ? await getDetails(service, place.place_id)
        : null;
      const name = details?.name ?? place.name ?? `Competitor ${i + 1}`;
      const match = matchPriorityBrand(name);
      const types = details?.types ?? place.types ?? [];
      const category =
        mapTypesToCategory(types) === "Other"
          ? inferCategoryFromName(name)
          : mapTypesToCategory(types);
      const dlat = details?.geometry?.location?.lat() ?? plat;
      const dlng = details?.geometry?.location?.lng() ?? plng;

      detailed.push({
        id: place.place_id || `g-browser-${i}`,
        name,
        brand: match?.brand ?? name.split(/[,|-]/)[0].trim(),
        category,
        distanceKm: Math.round(dist * 10) / 10,
        rating: details?.rating ?? place.rating ?? null,
        ratingCount:
          details?.user_ratings_total ?? place.user_ratings_total ?? null,
        openedOn: null,
        address:
          details?.formatted_address ??
          place.vicinity ??
          "Address unavailable",
        phone:
          details?.formatted_phone_number ??
          details?.international_phone_number ??
          null,
        sizeSqFt: null,
        lat: dlat,
        lng: dlng,
        placeId: place.place_id,
        website: details?.website ?? null,
        businessStatus: details?.business_status
          ? String(details.business_status)
          : null,
        mapsUrl:
          details?.url ??
          `https://www.google.com/maps/search/?api=1&query=${dlat},${dlng}`,
      });

      if (i % 4 === 3) await yieldToMain();
    }

    return detailed;
  } finally {
    cleanup();
  }
}
