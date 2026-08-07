export type CompetitorCategory =
  | "Fashion"
  | "Hypermarket"
  | "Grocery"
  | "Department Store"
  | "Electronics"
  | "Lifestyle"
  | "Other";

export interface Competitor {
  id: string;
  name: string;
  brand: string;
  category: CompetitorCategory;
  distanceKm: number;
  rating: number | null;
  ratingCount: number | null;
  openedOn: string | null;
  address: string;
  phone: string | null;
  sizeSqFt: number | null;
  lat: number;
  lng: number;
  placeId?: string;
  website?: string | null;
  businessStatus?: string | null;
  mapsUrl?: string | null;
}

export interface StoreLocation {
  name: string;
  lat: number;
  lng: number;
  radiusKm: number;
}

export interface CompetitorSearchResponse {
  store: StoreLocation;
  competitors: Competitor[];
  source: "google" | "demo";
  message?: string;
}
