import type { Competitor } from "@/types/competitor";
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
      else reject(new Error("Places library unavailable — enable Places API on this key"));
    };
    script.onerror = () =>
      reject(new Error("Could not load Google Maps. Check the API key."));
    document.head.appendChild(script);
  });

  return window.__compdataMapsLoader;
}

const RETAIL_TYPES = [
  "department_store",
  "supermarket",
  "clothing_store",
  "shopping_mall",
  "home_goods_store",
  "electronics_store",
] as const;

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

/** Live competitor pull via Maps JavaScript Places (works on GitHub Pages). */
export async function fetchBrowserGoogleCompetitors(
  lat: number,
  lng: number,
  radiusKm: number,
  apiKey: string
): Promise<Competitor[]> {
  const maps = await loadMaps(apiKey);
  const attribution = document.createElement("div");
  attribution.style.display = "none";
  document.body.appendChild(attribution);
  const service = new maps.places.PlacesService(attribution);

  const location = new maps.LatLng(lat, lng);
  const radiusM = Math.min(Math.round(radiusKm * 1000), 50000);

  const batches = await Promise.all(
    RETAIL_TYPES.map((type) =>
      nearbySearch(service, { location, radius: radiusM, type })
    )
  );

  const byId = new Map<string, google.maps.places.PlaceResult>();
  for (const batch of batches) {
    for (const place of batch) {
      if (!place.place_id || !place.name) continue;
      if (isSelfStore(place.name)) continue;
      if (!byId.has(place.place_id)) byId.set(place.place_id, place);
    }
  }

  const nearby = [...byId.values()]
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
    .filter((p) => p.dist <= radiusKm)
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 24);

  const detailed = await Promise.all(
    nearby.map(async ({ place, dist, plat, plng }, index) => {
      const details = place.place_id
        ? await getDetails(service, place.place_id)
        : null;
      const name = details?.name ?? place.name ?? `Competitor ${index + 1}`;
      const types = details?.types ?? place.types ?? [];
      const category =
        mapTypesToCategory(types) === "Other"
          ? inferCategoryFromName(name)
          : mapTypesToCategory(types);
      const dlat = details?.geometry?.location?.lat() ?? plat;
      const dlng = details?.geometry?.location?.lng() ?? plng;

      const competitor: Competitor = {
        id: place.place_id || `g-browser-${index}`,
        name,
        brand: name.split(/[,|-]/)[0].trim(),
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
      };
      return competitor;
    })
  );

  attribution.remove();
  return detailed;
}
