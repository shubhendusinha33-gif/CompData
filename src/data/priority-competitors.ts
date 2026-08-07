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
  "CARREFOUR",
] as const;

/**
 * Brands whose bare name is too generic (e.g. "Lifestyle" mom-and-pop shops).
 * Only STRICT aliases may match — never a loose substring on the brand alone.
 */
const STRICT_BRANDS = new Set<string>([
  "LIFESTYLE",
  "CITY KART",
  "CITI STYLE",
  "MAX RETAIL",
  "MORE SUPERMARKET",
  "MEGA SHOP",
  "UNLIMITED",
  "YOUTH",
  "FASHION CITY",
  "STYLE UP",
  "STYLE UNION",
  "STYLE BAZAAR",
  "BIG MART",
  "RANK 1",
  "M BAZAAR",
  "START BAZAAR",
  "GRAND MART",
  "NATIONAL MART",
]);

/** Extra aliases so Google place names still match the priority list. */
const ALIASES: Record<string, string[]> = {
  "D-MART": ["DMART", "D MART", "AVENUE SUPERMARTS", "D-MART INDIA"],
  "MAX RETAIL": ["MAX FASHION", "MAX RETAIL STORE", "MAX"],
  "MORE MEGA STORE": ["MORE MEGA", "MORE HYPER", "MORE MEGASTORE"],
  "MORE SUPERMARKET": ["MORE SUPERMARKET", "MORE SUPER MARKET"],
  "SPENCER'S": ["SPENCERS", "SPENCER RETAIL", "SPENCER S"],
  "SPAR HYPERMARKET": ["SPAR HYPER", "SPAR INDIA", "SPAR"],
  "TATA STAR BAZAAR HYPERMARKET": [
    "STAR BAZAAR",
    "STARBAZAAR",
    "TATA STAR BAZAAR",
  ],
  "TATA STAR MARKET": ["STAR MARKET", "TATA STAR"],
  "RELIANCE SMART BAZAAR": ["SMART BAZAAR", "RELIANCE SMARTBAZAAR"],
  "RELIANCE SMART": ["RELIANCE SMART STORE"],
  "RELIANCE FRESH": ["RELIANCEFRESH"],
  "RELIANCE TRENDS": ["RELIANCE TREND"],
  "V-MART": ["VMART", "V MART", "V-MART RETAIL"],
  "V-BAZAAR": ["V BAZAAR", "VBAZAAR"],
  "V2": ["V2 RETAIL", "V 2 RETAIL"],
  "CITY KART": ["CITYKART", "CITY KART FASHION", "CITYKART FASHION"],
  "CITI STYLE": ["CITISTYLE"],
  "SHOPPERS STOP": ["SHOPPERSSTOP", "SHOPPER STOP"],
  "FAB INDIA": ["FABINDIA"],
  "MR. DIY": ["MR DIY", "MRDIY"],
  "LULU HYPERMARKET": ["LULU HYPER", "LU LU HYPERMARKET"],
  "LULU WHOLESALE MART": ["LULU WHOLESALE"],
  "METRO WHOLESALE": ["METRO CASH", "METRO AG", "METRO WHOLESALE INDIA"],
  "BLINKIT": ["GROFERS"],
  "1 INDIA FAMILY MART": ["INDIA FAMILY MART", "1INDIA FAMILY"],
  "ZUDIO": ["ZUDIO TATA", "ZUDIO STORE"],
  "PANTALOONS": ["PANTALOON"],
  "CARREFOUR": ["CARREFOUR MARKET", "CARREFOUR HYPERMARKET", "CARREFOUR INDIA"],
  "BRAND FACTORY": ["BRANDFACTORY"],
  "WESTSIDE": ["WEST SIDE", "WESTSIDE TATA"],
  // Landmark Group Lifestyle only — bare "Lifestyle" is rejected (STRICT_BRANDS)
  "LIFESTYLE": [
    "LIFESTYLE STORES",
    "LIFESTYLE STORE",
    "LANDMARK LIFESTYLE",
    "LIFESTYLE BY LANDMARK",
    "LANDMARK GROUP LIFESTYLE",
  ],
};

function normalize(value: string): string {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function compact(value: string): string {
  return normalize(value).replace(/ /g, "");
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Strict hit: whole phrase as words / compact equality — no loose substring. */
function strictNeedleHits(hayRaw: string, needleRaw: string): boolean {
  const hay = normalize(hayRaw);
  const needle = normalize(needleRaw);
  if (!hay || !needle) return false;
  const hayC = compact(hayRaw);
  const needleC = compact(needleRaw);
  const word = new RegExp(`(^|\\s)${escapeRegExp(needle)}(\\s|$)`);

  if (needleC.length <= 3) {
    return word.test(hay) || hayC === needleC;
  }

  return (
    hay === needle ||
    hay.startsWith(`${needle} `) ||
    hay.includes(` ${needle} `) ||
    hay.endsWith(` ${needle}`) ||
    hayC === needleC ||
    hayC.startsWith(needleC)
  );
}

function looseNeedleHits(hayRaw: string, needleRaw: string): boolean {
  const hay = normalize(hayRaw);
  const needle = normalize(needleRaw);
  if (!hay || !needle) return false;

  const hayC = compact(hayRaw);
  const needleC = compact(needleRaw);
  const word = new RegExp(`(^|\\s)${escapeRegExp(needle)}(\\s|$)`);

  if (needleC.length <= 2) {
    return word.test(hay);
  }
  if (needleC.length <= 3) {
    return word.test(hay) || hayC === needleC;
  }

  return (
    hay === needle ||
    hay.startsWith(`${needle} `) ||
    hay.includes(` ${needle} `) ||
    hay.endsWith(` ${needle}`) ||
    hayC === needleC ||
    hayC.startsWith(needleC) ||
    hayC.includes(needleC)
  );
}

export interface PriorityMatch {
  brand: string;
  priorityIndex: number;
  score: number;
}

export function matchPriorityBrand(placeName: string): PriorityMatch | null {
  if (!placeName?.trim()) return null;

  let best: PriorityMatch | null = null;

  PRIORITY_COMPETITORS.forEach((brand, index) => {
    const aliases = ALIASES[brand] ?? [];
    const strict = STRICT_BRANDS.has(brand);
    // Strict brands: aliases only (never bare brand like "LIFESTYLE")
    const needles = strict ? aliases : [brand, ...aliases];
    const hitFn = strict ? strictNeedleHits : looseNeedleHits;

    for (const needle of needles) {
      if (!hitFn(placeName, needle)) continue;
      const score = compact(needle).length;
      if (
        !best ||
        score > best.score ||
        (score === best.score && index < best.priorityIndex)
      ) {
        best = { brand, priorityIndex: index, score };
      }
    }
  });

  return best;
}

export function isPriorityCompetitor(placeName: string): boolean {
  return matchPriorityBrand(placeName) != null;
}

/**
 * Compact Google keyword set — prefer official chain phrases for ambiguous brands.
 */
export function getPlacesSearchKeywords(): string[] {
  return [
    "Zudio",
    "V-Mart",
    "V2 Retail",
    "City Kart",
    "Citi Style",
    "D-Mart",
    "Reliance Smart",
    "Reliance Fresh",
    "Reliance Trends",
    "Reliance Digital",
    "Smart Bazaar",
    "Pantaloons",
    "Westside",
    "Lifestyle Stores",
    "Landmark Lifestyle",
    "Max Fashion",
    "More Mega",
    "Spencer Retail",
    "Spar Hypermarket",
    "Brand Factory",
    "Shoppers Stop",
    "Carrefour",
    "Lulu Hypermarket",
    "Metro Cash and Carry",
    "Blinkit",
    "Yousta",
    "Unlimited Fashion",
    "Star Bazaar",
    "Fabindia",
    "Easybuy",
  ];
}
