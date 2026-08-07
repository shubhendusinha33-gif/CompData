import { getStoredApiKey, resolveVmmStoreFromGoogle } from "@/lib/google-places-browser";
import { reverseGeocodeStoreName } from "@/lib/reverse-geocode";

export interface StoreNameResult {
  storeName: string;
  locality: string;
  source: "google-vmm" | "google" | "bigdatacloud" | "fallback";
}

/**
 * Prefer the exact Vishal Mega Mart place name from Google at these coordinates.
 * Falls back to reverse-geocode label when no API key / no VMM found.
 */
export async function resolveStoreName(
  lat: number,
  lng: number,
  apiKey?: string,
  signal?: AbortSignal
): Promise<StoreNameResult> {
  const key = (apiKey ?? getStoredApiKey()).trim();

  if (key) {
    try {
      const vmm = await resolveVmmStoreFromGoogle(lat, lng, key, signal);
      if (vmm?.storeName) {
        return {
          storeName: vmm.storeName,
          locality: vmm.storeName,
          source: "google-vmm",
        };
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") throw err;
    }
  }

  const fallback = await reverseGeocodeStoreName(lat, lng, signal);
  return {
    storeName: fallback.storeName,
    locality: fallback.locality,
    source: fallback.source,
  };
}
