import { getStoredApiKey, resolveVmmStoreFromGoogle } from "@/lib/google-places-browser";
import { reverseGeocodeStoreName } from "@/lib/reverse-geocode";

export interface StoreNameResult {
  storeName: string;
  locality: string;
  source: "google-vmm" | "google" | "bigdatacloud" | "fallback";
}

/**
 * Format as VMM-{Exact area} e.g. VMM-Uttam Nagar
 */
export function formatVmmAreaLabel(area: string): string {
  let cleaned = area.replace(/\s+/g, " ").trim();
  cleaned = cleaned
    .replace(/^vishal\s*mega\s*mart\b/i, "")
    .replace(/^vmm\b/i, "")
    .replace(/^[\s,|/\-:]+/, "")
    .trim();

  // Take leading locality token before city/state noise
  const first = cleaned.split(",")[0]?.trim() || cleaned;
  const areaName = first || "Store";
  return `VMM-${areaName}`;
}

function areaFromVmmGoogleName(placeName: string, address?: string): string {
  // "Vishal Mega Mart Uttam Nagar" | "Vishal Mega Mart - Dwarka Mod"
  const stripped = placeName
    .replace(/^vishal\s*mega\s*mart\b/i, "")
    .replace(/^[\s,|/\-:]+/, "")
    .trim();

  if (stripped) return stripped.split(",")[0].trim();

  if (address) {
    // Vicinity often "Uttam Nagar, Delhi"
    return address.split(",")[0].trim();
  }
  return "Store";
}

/**
 * Prefer nearest Vishal Mega Mart on Google, labeled VMM-{area}.
 * Falls back to reverse-geocode area with the same format.
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
        const locality = areaFromVmmGoogleName(vmm.storeName, vmm.address);
        return {
          storeName: formatVmmAreaLabel(locality),
          locality,
          source: "google-vmm",
        };
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") throw err;
    }
  }

  const fallback = await reverseGeocodeStoreName(lat, lng, signal);
  return {
    storeName: formatVmmAreaLabel(fallback.locality),
    locality: fallback.locality,
    source: fallback.source,
  };
}
