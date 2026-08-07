import type { Competitor, CompetitorCategory } from "@/types/competitor";

/** Haversine distance in kilometers */
export function distanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const TYPE_TO_CATEGORY: Record<string, CompetitorCategory> = {
  clothing_store: "Fashion",
  shoe_store: "Fashion",
  department_store: "Department Store",
  supermarket: "Grocery",
  grocery_or_supermarket: "Grocery",
  shopping_mall: "Lifestyle",
  electronics_store: "Electronics",
  home_goods_store: "Lifestyle",
  convenience_store: "Grocery",
};

export function mapTypesToCategory(types: string[] = []): CompetitorCategory {
  for (const t of types) {
    if (TYPE_TO_CATEGORY[t]) return TYPE_TO_CATEGORY[t];
  }
  return "Other";
}

/** Guess retail category from brand/name heuristics (India retail). */
export function inferCategoryFromName(name: string): CompetitorCategory {
  const n = name.toLowerCase();
  if (
    /zudio|pantaloons|max |max fashion|westside|lifestyle|trends|brand factory|fbb|van heusen/.test(
      n
    )
  ) {
    return "Fashion";
  }
  if (/d-?mart|reliance fresh|more mega|smart bazaar|spencer|big bazaar|easyday/.test(n)) {
    return "Hypermarket";
  }
  if (/reliance smart|v-?mart|vishal|spar|nature.?s basket|blinkit|zepto/.test(n)) {
    return "Grocery";
  }
  if (/croma|vijay sales|reliance digital|poorvika/.test(n)) {
    return "Electronics";
  }
  return "Department Store";
}

export function brandInitial(name: string): string {
  const cleaned = name.replace(/[^a-zA-Z0-9 ]/g, "").trim();
  return (cleaned[0] || "?").toLowerCase();
}

const BRAND_COLORS = [
  "#1a1a1a",
  "#c62828",
  "#1565c0",
  "#2e7d32",
  "#ef6c00",
  "#6a1b9a",
  "#00838f",
  "#ad1457",
  "#4527a0",
  "#f9a825",
];

export function brandColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return BRAND_COLORS[Math.abs(hash) % BRAND_COLORS.length];
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export function formatSize(sqFt: number | null): string {
  if (sqFt == null) return "—";
  if (sqFt >= 10000) return `${(sqFt / 1000).toFixed(0)}k sq ft`;
  return `${sqFt.toLocaleString("en-IN")} sq ft`;
}

export function sortByDistance(competitors: Competitor[]): Competitor[] {
  return [...competitors].sort((a, b) => a.distanceKm - b.distanceKm);
}

/** Exclude Vishal Mega Mart itself from competitor results */
export function isSelfStore(name: string): boolean {
  return /vishal\s*mega\s*mart|vmm\b/i.test(name);
}
