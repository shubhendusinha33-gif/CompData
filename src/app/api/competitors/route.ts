import { NextRequest, NextResponse } from "next/server";
import { buildDemoCompetitors, DEFAULT_STORE } from "@/data/demo-competitors";
import { filterPriorityCompetitors } from "@/lib/competitor-filter";
import { fetchGoogleCompetitors } from "@/lib/google-places";
import type { CompetitorSearchResponse } from "@/types/competitor";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const lat = Number(searchParams.get("lat") ?? DEFAULT_STORE.lat);
  const lng = Number(searchParams.get("lng") ?? DEFAULT_STORE.lng);
  const radiusKm = Number(searchParams.get("radius") ?? 5);
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
      const competitors = filterPriorityCompetitors(
        await fetchGoogleCompetitors(lat, lng, radiusKm, apiKey)
      );
      const body: CompetitorSearchResponse = {
        store,
        competitors,
        source: "google",
        message:
          competitors.length === 0
            ? "No priority organized retailers found in this radius."
            : "Live data filtered to priority organized retailers.",
      };
      return NextResponse.json(body);
    }

    const competitors = filterPriorityCompetitors(
      buildDemoCompetitors(lat, lng, radiusKm)
    );
    const body: CompetitorSearchResponse = {
      store,
      competitors,
      source: "demo",
      message:
        "Demo mode — priority organized retailers only. Mom-and-pop stores excluded.",
    };
    return NextResponse.json(body);
  } catch (err) {
    console.error(err);
    const competitors = filterPriorityCompetitors(
      buildDemoCompetitors(lat, lng, radiusKm)
    );
    const body: CompetitorSearchResponse = {
      store,
      competitors,
      source: "demo",
      message:
        "Live Google Places request failed; showing priority demo competitors.",
    };
    return NextResponse.json(body);
  }
}
