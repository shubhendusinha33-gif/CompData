import { getStoredApiKey } from "@/lib/google-places-browser";

export interface ReverseGeocodeResult {
  storeName: string;
  locality: string;
  source: "google" | "bigdatacloud" | "fallback";
}

function formatStoreName(locality: string): ReverseGeocodeResult {
  const cleaned = locality.replace(/\s+/g, " ").trim() || "Store";
  return {
    locality: cleaned,
    storeName: `VMM — ${cleaned}`,
    source: "fallback",
  };
}

function coordFallback(lat: number, lng: number): ReverseGeocodeResult {
  return {
    locality: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    storeName: `VMM — ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    source: "fallback",
  };
}

/** Google Geocoding REST — used when a Maps API key is available. */
async function geocodeWithGoogle(
  lat: number,
  lng: number,
  apiKey: string,
  signal?: AbortSignal
): Promise<ReverseGeocodeResult | null> {
  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("latlng", `${lat},${lng}`);
  url.searchParams.set("key", apiKey);

  const res = await fetch(url.toString(), { signal });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    status: string;
    results?: Array<{
      address_components?: Array<{ long_name: string; types: string[] }>;
      formatted_address?: string;
    }>;
  };
  if (data.status !== "OK" || !data.results?.[0]) return null;

  const comps = data.results[0].address_components ?? [];
  const pick = (...types: string[]) =>
    comps.find((c) => types.some((t) => c.types.includes(t)))?.long_name;

  const locality =
    pick("sublocality", "sublocality_level_1") ||
    pick("neighborhood") ||
    pick("locality") ||
    pick("administrative_area_level_2") ||
    data.results[0].formatted_address?.split(",")[0] ||
    "Store";

  return { ...formatStoreName(locality), source: "google" };
}

/**
 * BigDataCloud client reverse-geocode (browser-friendly, no API key).
 * Used so store names work on GitHub Pages without Nominatim.
 */
async function geocodeWithBigDataCloud(
  lat: number,
  lng: number,
  signal?: AbortSignal
): Promise<ReverseGeocodeResult | null> {
  const url = new URL(
    "https://api.bigdatacloud.net/data/reverse-geocode-client"
  );
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lng));
  url.searchParams.set("localityLanguage", "en");

  const res = await fetch(url.toString(), {
    signal,
    headers: { Accept: "application/json" },
  });
  if (!res.ok) return null;

  const data = (await res.json()) as {
    locality?: string;
    city?: string;
    principalSubdivision?: string;
    localityInfo?: {
      administrative?: Array<{ name: string; order: number }>;
      informative?: Array<{ name: string; order: number }>;
    };
  };

  const admin = [...(data.localityInfo?.informative ?? [])].sort(
    (a, b) => a.order - b.order
  );
  const locality =
    data.locality ||
    admin[0]?.name ||
    data.city ||
    data.principalSubdivision ||
    "";

  if (!locality) return null;
  return { ...formatStoreName(locality), source: "bigdatacloud" };
}

/**
 * Auto store label from coordinates.
 * Does not depend on Nominatim (skipped in env allowlist).
 * Format: "VMM — {area}" e.g. VMM — Dwarka Mod
 */
export async function reverseGeocodeStoreName(
  lat: number,
  lng: number,
  signal?: AbortSignal
): Promise<ReverseGeocodeResult> {
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return coordFallback(lat, lng);
  }

  const apiKey =
    typeof window !== "undefined" ? getStoredApiKey().trim() : "";

  if (apiKey) {
    try {
      const google = await geocodeWithGoogle(lat, lng, apiKey, signal);
      if (google) return google;
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") throw err;
    }
  }

  try {
    const bdc = await geocodeWithBigDataCloud(lat, lng, signal);
    if (bdc) return bdc;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
  }

  return coordFallback(lat, lng);
}
