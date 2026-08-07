import type { Competitor } from "@/types/competitor";
import {
  isPriorityCompetitor,
  matchPriorityBrand,
} from "@/data/priority-competitors";
import { isSelfStore } from "@/lib/geo";

/** Keep only organized priority retailers; drop mom-and-pop / unlisted shops. */
export function filterPriorityCompetitors(
  competitors: Competitor[]
): Competitor[] {
  return competitors
    .filter((c) => !isSelfStore(c.name) && isPriorityCompetitor(c.name))
    .map((c) => {
      const match = matchPriorityBrand(c.name);
      return {
        ...c,
        brand: match?.brand ?? c.brand,
      };
    })
    .sort((a, b) => {
      const pa = matchPriorityBrand(a.name)?.priorityIndex ?? 9999;
      const pb = matchPriorityBrand(b.name)?.priorityIndex ?? 9999;
      if (pa !== pb) return pa - pb;
      return a.distanceKm - b.distanceKm;
    });
}
