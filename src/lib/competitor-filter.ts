import type { Competitor } from "@/types/competitor";
import {
  isPriorityCompetitor,
  matchPriorityBrand,
} from "@/data/priority-competitors";
import { isSelfStore } from "@/lib/geo";

/**
 * Keep only organized priority retailers; drop mom-and-pop / unlisted shops.
 * Dedupes to the nearest store per priority brand (stops 7× fake "Lifestyle").
 */
export function filterPriorityCompetitors(
  competitors: Competitor[]
): Competitor[] {
  const matched = competitors
    .filter((c) => !isSelfStore(c.name) && isPriorityCompetitor(c.name))
    .map((c) => {
      const match = matchPriorityBrand(c.name)!;
      return {
        ...c,
        brand: match.brand,
        parentCompany: match.parentCompany,
        _priorityIndex: match.priorityIndex,
      };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);

  const nearestByBrand = new Map<string, (typeof matched)[number]>();
  for (const row of matched) {
    if (!nearestByBrand.has(row.brand)) {
      nearestByBrand.set(row.brand, row);
    }
  }

  return [...nearestByBrand.values()]
    .map(({ _priorityIndex: _, ...rest }) => rest)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

export type DistanceSort = "asc" | "desc";

export function sortCompetitorsByDistance(
  competitors: Competitor[],
  direction: DistanceSort = "asc"
): Competitor[] {
  const copy = [...competitors];
  copy.sort((a, b) =>
    direction === "asc"
      ? a.distanceKm - b.distanceKm
      : b.distanceKm - a.distanceKm
  );
  return copy;
}

export function searchCompetitorsList(
  competitors: Competitor[],
  query: string
): Competitor[] {
  const q = query.trim().toLowerCase();
  if (!q) return competitors;
  return competitors.filter((c) => {
    const hay = `${c.brand} ${c.parentCompany} ${c.name} ${c.category} ${c.address}`.toLowerCase();
    return hay.includes(q);
  });
}
