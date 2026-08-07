export interface ReverseGeocodeResult {
  storeName: string;
  locality: string;
}

/**
 * Auto store label from coordinates via OpenStreetMap Nominatim (no API key).
 * Format: "VMM — {area}" e.g. VMM — Dwarka Mod
 */
export async function reverseGeocodeStoreName(
  lat: number,
  lng: number,
  signal?: AbortSignal
): Promise<ReverseGeocodeResult> {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lng));
  url.searchParams.set("zoom", "16");
  url.searchParams.set("addressdetails", "1");

  const res = await fetch(url.toString(), {
    signal,
    headers: {
      Accept: "application/json",
      // Nominatim usage policy requires a valid identifying UA
      "User-Agent": "CompData-VMM-Portal/1.0 (executive competitor intelligence)",
    },
  });

  if (!res.ok) {
    throw new Error("Could not resolve store location name");
  }

  const data = (await res.json()) as {
    address?: Record<string, string>;
    name?: string;
    display_name?: string;
  };

  const a = data.address ?? {};
  const locality =
    a.suburb ||
    a.neighbourhood ||
    a.quarter ||
    a.village ||
    a.town ||
    a.city_district ||
    a.city ||
    a.county ||
    a.state_district ||
    data.name ||
    "Store";

  const cleaned = locality.replace(/\s+/g, " ").trim();
  return {
    locality: cleaned,
    storeName: `VMM — ${cleaned}`,
  };
}
