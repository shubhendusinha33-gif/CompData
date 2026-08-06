import { NextRequest, NextResponse } from "next/server";
import { buildDemoCompetitors, DEFAULT_STORE } from "@/data/demo-competitors";
import { fetchGoogleCompetitors } from "@/lib/google-places";
import { sortByDistance } from "@/lib/geo";
import type { CompetitorSearchResponse } from "@/types/competitor";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const lat = Number(searchParams.get("lat") ?? DEFAULT_STORE.lat);
  const lng = Number(searchParams.get("lng") ?? DEFAULT_STORE.lng);
  const radiusKm = Number(searchParams.get("radius") ?? DEFAULT_STORE.radiusKm);
  const forceDemo = searchParams.get("demo") === "1";
  const storeName =
    searchParams.get("name")?.trim() || DEFAULT_STORE.name;

  if (
    Number.isNaN(lat) ||
    Number.isNaN(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    return NextResponse.json(
      { error: "Invalid latitude or longitude" },
      { status: 400 }
    );
  }

  if (Number.isNaN(radiusKm) || radiusKm <= 0 || radiusKm > 50) {
    return NextResponse.json(
      { error: "Radius must be between 0 and 50 km" },
      { status: 400 }
    );
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const store = { name: storeName, lat, lng, radiusKm };

  try {
    if (apiKey && !forceDemo) {
      const competitors = sortByDistance(
        await fetchGoogleCompetitors(lat, lng, radiusKm, apiKey)
      );
      const body: CompetitorSearchResponse = {
        store,
        competitors,
        source: "google",
        message:
          competitors.length === 0
            ? "No retail competitors found in this radius. Try a larger radius."
            : undefined,
      };
      return NextResponse.json(body);
    }

    const competitors = sortByDistance(
      buildDemoCompetitors(lat, lng, radiusKm)
    );
    const body: CompetitorSearchResponse = {
      store,
      competitors,
      source: "demo",
      message: apiKey
        ? undefined
        : "Demo mode — add GOOGLE_MAPS_API_KEY to enable live Google Places data. Opened-on and size fields are illustrative in demo.",
    };
    return NextResponse.json(body);
  } catch (err) {
    console.error(err);
    const competitors = sortByDistance(
      buildDemoCompetitors(lat, lng, radiusKm)
    );
    const body: CompetitorSearchResponse = {
      store,
      competitors,
      source: "demo",
      message:
        "Live Google Places request failed; showing demo competitors instead.",
    };
    return NextResponse.json(body);
  }
}
