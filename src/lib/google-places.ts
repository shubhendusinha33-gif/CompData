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

async function nearbySearch(
  lat: number,
  lng: number,
  radiusM: number,
  apiKey: string,
  opts: { type?: string; keyword?: string }
): Promise<GoogleNearbyResult[]> {
  const url = new URL(
    "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
  );
  url.searchParams.set("location", `${lat},${lng}`);
  url.searchParams.set("radius", String(radiusM));
  if (opts.type) url.searchParams.set("type", opts.type);
  if (opts.keyword) url.searchParams.set("keyword", opts.keyword);
  url.searchParams.set("key", apiKey);

  const res = await fetch(url.toString(), { next: { revalidate: 0 } });
  if (!res.ok) return [];
  const data = (await res.json()) as {
    results?: GoogleNearbyResult[];
    status: string;
  };
  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    console.warn(`NearbySearch:`, data.status, opts);
    return [];
  }
  return data.results ?? [];
}

export async function fetchGoogleCompetitors(
  lat: number,
  lng: number,
  radiusKm: number,
  apiKey: string
): Promise<Competitor[]> {
  const radiusM = Math.min(Math.round(radiusKm * 1000), 50000);
  const keywords = getPlacesSearchKeywords();
  const byId = new Map<string, GoogleNearbyResult>();

  const add = (batch: GoogleNearbyResult[]) => {
    for (const place of batch) {
      if (!place.place_id || isSelfStore(place.name)) continue;
      if (!byId.has(place.place_id)) byId.set(place.place_id, place);
    }
  };

  const batches = await Promise.all(
    keywords.map((keyword) =>
      nearbySearch(lat, lng, radiusM, apiKey, { keyword })
    )
  );
  batches.forEach(add);

  return [...byId.values()]
    .filter((p) => isPriorityCompetitor(p.name))
    .map((p) => {
      const name = p.name;
      const match = matchPriorityBrand(name)!;
      const types = p.types ?? [];
      const category =
        mapTypesToCategory(types) === "Other"
          ? inferCategoryFromName(name)
          : mapTypesToCategory(types);
      const plat = p.geometry.location.lat;
      const plng = p.geometry.location.lng;
      const dist = distanceKm(lat, lng, plat, plng);

      const competitor: Competitor = {
        id: p.place_id,
        name,
        brand: match.brand,
        parentCompany: match.parentCompany,
        category,
        distanceKm: Math.round(dist * 10) / 10,
        rating: p.rating ?? null,
        ratingCount: p.user_ratings_total ?? null,
        openedOn: null,
        address: p.vicinity ?? "Address unavailable",
        phone: null,
        sizeSqFt: null,
        lat: plat,
        lng: plng,
        placeId: p.place_id,
        website: null,
        businessStatus: p.business_status ?? null,
        mapsUrl: `https://www.google.com/maps/search/?api=1&query=${plat},${plng}`,
      };
      return competitor;
    })
    .filter((p) => p.distanceKm <= radiusKm + 0.05)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .reduce<Competitor[]>((acc, row) => {
      if (!acc.some((x) => x.brand === row.brand)) acc.push(row);
      return acc;
    }, []);
}
