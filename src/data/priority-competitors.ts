/**
 * Priority organized retail competitors vs Vishal Mega Mart.
 * Mom-and-pop / unlisted local shops are excluded from results.
 */
export const PRIORITY_COMPETITORS = [
  "1 INDIA FAMILY MART",
  "BAZAAR KOLKATA",
  "BAZAR INDIA",
  "BRAND FACTORY",
  "CITI STYLE",
  "CITY KART",
  "COSMO BAZAAR",
  "D-MART",
  "EASYBUY",
  "FASHION CITY",
  "LIFESTYLE",
  "M BAZAAR",
  "MAX RETAIL",
  "MEGA SHOP",
  "MORE MEGA STORE",
  "MORE SUPERMARKET",
  "PANTALOONS",
  "RELIANCE DIGITAL",
  "RELIANCE FRESH",
  "RELIANCE FRESH SIGNATURE",
  "RELIANCE MARKET",
  "RELIANCE SMART",
  "RELIANCE SMART BAZAAR",
  "RELIANCE SMART POINT",
  "RELIANCE TRENDS",
  "SHOPPERS STOP",
  "SPAR HYPERMARKET",
  "SPENCER'S",
  "STYLE BAZAAR",
  "STYLE UNION",
  "STYLE UP",
  "TATA STAR BAZAAR HYPERMARKET",
  "TATA STAR MARKET",
  "UNLIMITED",
  "V2",
  "V-BAZAAR",
  "V-MART",
  "WESTSIDE",
  "YOUSTA",
  "ZUDIO",
  "BLINKIT",
  "ZECODE",
  "NATIONAL MART",
  "EXPRESS BAZAAR",
  "SHUBHAM K MART",
  "RAJ MANDIR",
  "DYI",
  "KPN SUPERMARKET",
  "BIG DAY HYPERMARKET",
  "LULU WHOLESALE MART",
  "RANK 1",
  "FAB INDIA",
  "SNITCH",
  "ARUNODHYA",
  "CHENNAI MALL",
  "YOUTH",
  "BIG MART",
  "ROLLA HYPERMARKET",
  "MANGALAYA",
  "FAZIYO BY KALYAN APPARELS",
  "STYLOVA",
  "NESTO",
  "RELIANCE FASHION FACTORY",
  "LULU HYPERMARKET",
  "ELENTA MART",
  "MR. DIY",
  "METRO WHOLESALE",
  "START BAZAAR",
  "SUMIT BAZAAR",
  "ONE INDIA FASHION",
  "LIME ROAD",
  "RATNADEEP SUPERMARKET",
  "SUNSAR SUPERMARKET",
  "NEW SHOPPING BAZAAR",
  "GRAND MART",
  "RELIANCE FASHION WORLD",
] as const;

/** Extra aliases so Google place names still match the priority list. */
const ALIASES: Record<string, string[]> = {
  "D-MART": ["DMART", "D MART", "AVENUE SUPERMARTS"],
  "MAX RETAIL": ["MAX", "MAX FASHION"],
  "MORE MEGA STORE": ["MORE MEGA", "MORE HYPER"],
  "MORE SUPERMARKET": ["MORE SUPERMARKET", "MORE SUPER MARKET"],
  "SPENCER'S": ["SPENCERS", "SPENCER"],
  "SPAR HYPERMARKET": ["SPAR"],
  "TATA STAR BAZAAR HYPERMARKET": ["STAR BAZAAR", "STARBAZAAR"],
  "TATA STAR MARKET": ["STAR MARKET"],
  "RELIANCE SMART BAZAAR": ["SMART BAZAAR"],
  "V-MART": ["VMART", "V MART"],
  "V-BAZAAR": ["V BAZAAR", "VBAZAAR"],
  "SHOPPERS STOP": ["SHOPPERSSTOP"],
  "FAB INDIA": ["FABINDIA"],
  "MR. DIY": ["MR DIY", "MRDIY"],
  "DYI": ["DIY"],
  "LULU HYPERMARKET": ["LULU HYPER", "LU LU HYPERMARKET"],
  "LULU WHOLESALE MART": ["LULU WHOLESALE"],
  "METRO WHOLESALE": ["METRO CASH", "METRO AG"],
  "BLINKIT": ["GROFERS"],
  "1 INDIA FAMILY MART": ["INDIA FAMILY MART", "1INDIA FAMILY"],
};

function normalize(value: string): string {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export interface PriorityMatch {
  brand: string;
  priorityIndex: number;
}

export function matchPriorityBrand(placeName: string): PriorityMatch | null {
  const hay = normalize(placeName);
  if (!hay) return null;

  let best: PriorityMatch | null = null;

  PRIORITY_COMPETITORS.forEach((brand, index) => {
    const canon = normalize(brand);
    const aliases = ALIASES[brand] ?? [];
    const needles = [canon, ...aliases.map(normalize)].filter(Boolean);

    for (const needle of needles) {
      if (!needle) continue;
      // Avoid tiny false positives (e.g. "MAX" inside unrelated words handled via word boundary)
      const hit =
        hay === needle ||
        hay.startsWith(`${needle} `) ||
        hay.includes(` ${needle} `) ||
        hay.endsWith(` ${needle}`) ||
        (needle.length >= 4 && hay.includes(needle));

      if (hit) {
        if (!best || index < best.priorityIndex) {
          best = { brand, priorityIndex: index };
        }
        break;
      }
    }
  });

  return best;
}

export function isPriorityCompetitor(placeName: string): boolean {
  return matchPriorityBrand(placeName) != null;
}
