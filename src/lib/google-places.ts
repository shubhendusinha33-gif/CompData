import type { Competitor } from "@/types/competitor";
import {
  distanceKm,
  inferCategoryFromName,
  isSelfStore,
  mapTypesToCategory,
} from "@/lib/geo";

interface GoogleNearbyResult {
  place_id: string;
  name: string;
  geometry: { location: { lat: number; lng: number } };
  rating?: number;
  user_ratings_total?: number;
  types?: string[];
  vicinity?: string;
  business_status?: string;
}

interface GooglePlaceDetails {
  result?: {
    name?: string;
    formatted_address?: string;
    formatted_phone_number?: string;
    international_phone_number?: string;
    website?: string;
    rating?: number;
    user_ratings_total?: number;
    types?: string[];
    url?: string;
    business_status?: string;
    geometry?: { location: { lat: number; lng: number } };
  };
  status: string;
}

const RETAIL_TYPES = [
  "department_store",
  "supermarket",
  "clothing_store",
  "shopping_mall",
  "home_goods_store",
  "electronics_store",
];

async function nearbyByType(
  lat: number,
  lng: number,
  radiusM: number,
  type: string,
  apiKey: string
): Promise<GoogleNearbyResult[]> {
  const url = new URL(
    "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
  );
  url.searchParams.set("location", `${lat},${lng}`);
  url.searchParams.set("radius", String(radiusM));
  url.searchParams.set("type", type);
  url.searchParams.set("key", apiKey);

  const res = await fetch(url.toString(), { next: { revalidate: 0 } });
  if (!res.ok) return [];
  const data = (await res.json()) as {
    results?: GoogleNearbyResult[];
    status: string;
  };
  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    console.warn(`NearbySearch ${type}:`, data.status);
    return [];
  }
  return data.results ?? [];
}

async function placeDetails(
  placeId: string,
  apiKey: string
): Promise<GooglePlaceDetails["result"] | null> {
  const url = new URL(
    "https://maps.googleapis.com/maps/api/place/details/json"
  );
  url.searchParams.set("place_id", placeId);
  url.searchParams.set(
    "fields",
    "name,formatted_address,formatted_phone_number,international_phone_number,website,rating,user_ratings_total,types,url,business_status,geometry"
  );
  url.searchParams.set("key", apiKey);

  const res = await fetch(url.toString(), { next: { revalidate: 0 } });
  if (!res.ok) return null;
  const data = (await res.json()) as GooglePlaceDetails;
  if (data.status !== "OK") return null;
  return data.result ?? null;
}

export async function fetchGoogleCompetitors(
  lat: number,
  lng: number,
  radiusKm: number,
  apiKey: string
): Promise<Competitor[]> {
  const radiusM = Math.min(Math.round(radiusKm * 1000), 50000);

  const batches = await Promise.all(
    RETAIL_TYPES.map((type) => nearbyByType(lat, lng, radiusM, type, apiKey))
  );

  const byId = new Map<string, GoogleNearbyResult>();
  for (const batch of batches) {
    for (const place of batch) {
      if (!byId.has(place.place_id)) byId.set(place.place_id, place);
    }
  }

  const nearby = [...byId.values()]
    .filter((p) => !isSelfStore(p.name))
    .map((p) => ({
      ...p,
      dist: distanceKm(lat, lng, p.geometry.location.lat, p.geometry.location.lng),
    }))
    .filter((p) => p.dist <= radiusKm)
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 24);

  const detailed = await Promise.all(
    nearby.map(async (place, index) => {
      const details = await placeDetails(place.place_id, apiKey);
      const types = details?.types ?? place.types ?? [];
      const name = details?.name ?? place.name;
      const category =
        mapTypesToCategory(types) === "Other"
          ? inferCategoryFromName(name)
          : mapTypesToCategory(types);

      const plat = details?.geometry?.location.lat ?? place.geometry.location.lat;
      const plng = details?.geometry?.location.lng ?? place.geometry.location.lng;

      const competitor: Competitor = {
        id: place.place_id || `g-${index}`,
        name,
        brand: name.split(/[,|-]/)[0].trim(),
        category,
        distanceKm: Math.round(place.dist * 10) / 10,
        rating: details?.rating ?? place.rating ?? null,
        ratingCount:
          details?.user_ratings_total ?? place.user_ratings_total ?? null,
        // Google Places does not expose store open date or floor area
        openedOn: null,
        address:
          details?.formatted_address ?? place.vicinity ?? "Address unavailable",
        phone:
          details?.formatted_phone_number ??
          details?.international_phone_number ??
          null,
        sizeSqFt: null,
        lat: plat,
        lng: plng,
        placeId: place.place_id,
        website: details?.website ?? null,
        businessStatus:
          details?.business_status ?? place.business_status ?? null,
        mapsUrl:
          details?.url ??
          `https://www.google.com/maps/search/?api=1&query=${plat},${plng}`,
      };
      return competitor;
    })
  );

  return detailed;
}
