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

/** Extra aliases so Google place names still match the priority list. */
const ALIASES: Record<string, string[]> = {
  "D-MART": ["DMART", "D MART", "AVENUE SUPERMARTS", "D-MART INDIA"],
  "MAX RETAIL": ["MAX FASHION", "MAX RETAIL STORE", "MAX"],
  "MORE MEGA STORE": ["MORE MEGA", "MORE HYPER", "MORE MEGASTORE"],
  "MORE SUPERMARKET": ["MORE SUPERMARKET", "MORE SUPER MARKET"],
  "SPENCER'S": ["SPENCERS", "SPENCER", "SPENCER RETAIL"],
  "SPAR HYPERMARKET": ["SPAR HYPER", "SPAR INDIA", "SPAR"],
  "TATA STAR BAZAAR HYPERMARKET": ["STAR BAZAAR", "STARBAZAAR", "TATA STAR BAZAAR"],
  "TATA STAR MARKET": ["STAR MARKET", "TATA STAR"],
  "RELIANCE SMART BAZAAR": ["SMART BAZAAR", "RELIANCE SMARTBAZAAR"],
  "RELIANCE SMART": ["RELIANCE SMART STORE"],
  "RELIANCE FRESH": ["RELIANCEFRESH"],
  "RELIANCE TRENDS": ["RELIANCE TREND"],
  "V-MART": ["VMART", "V MART", "V-MART RETAIL"],
  "V-BAZAAR": ["V BAZAAR", "VBAZAAR"],
  "V2": ["V2 RETAIL", "V 2"],
  "CITY KART": ["CITYKART", "CITY CART", "CITYKART FASHION"],
  "CITI STYLE": ["CITISTYLE", "CITY STYLE"],
  "SHOPPERS STOP": ["SHOPPERSSTOP", "SHOPPER STOP"],
  "FAB INDIA": ["FABINDIA"],
  "MR. DIY": ["MR DIY", "MRDIY"],
  "DYI": ["DIY STORE"],
  "LULU HYPERMARKET": ["LULU HYPER", "LU LU HYPERMARKET", "LULU MALL"],
  "LULU WHOLESALE MART": ["LULU WHOLESALE"],
  "METRO WHOLESALE": ["METRO CASH", "METRO AG", "METRO WHOLESALE INDIA"],
  "BLINKIT": ["GROFERS"],
  "1 INDIA FAMILY MART": ["INDIA FAMILY MART", "1INDIA FAMILY"],
  "ZUDIO": ["ZUDIO TATA", "ZUDIO STORE"],
  "PANTALOONS": ["PANTALOON"],
  "CARREFOUR": ["CARREFOUR MARKET", "CARREFOUR HYPERMARKET", "CARREFOUR INDIA"],
  "BRAND FACTORY": ["BRANDFACTORY"],
  "WESTSIDE": ["WEST SIDE"],
  "LIFESTYLE": ["LIFESTYLE STORES", "LANDMARK LIFESTYLE"],
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

function needleHits(hayRaw: string, needleRaw: string): boolean {
  const hay = normalize(hayRaw);
  const needle = normalize(needleRaw);
  if (!hay || !needle) return false;

  const hayC = compact(hayRaw);
  const needleC = compact(needleRaw);
  const word = new RegExp(`(^|\\s)${escapeRegExp(needle)}(\\s|$)`);

  // Short codes (V2) — word-boundary only
  if (needleC.length <= 2) {
    return word.test(hay);
  }

  // Short tokens (MAX, SPAR) — word boundary or exact compact equality / prefix + break
  if (needleC.length <= 3) {
    if (word.test(hay) || hayC === needleC) return true;
    // "MAXFASHION".startsWith("MAX") — allow only if next chars continue as separate known alias via longer needles
    return false;
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
  const hay = normalize(placeName);
  if (!hay) return null;

  let best: PriorityMatch | null = null;

  PRIORITY_COMPETITORS.forEach((brand, index) => {
    const aliases = ALIASES[brand] ?? [];
    const needles = [brand, ...aliases];

    for (const needle of needles) {
      if (!needleHits(placeName, needle)) continue;
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
 * Keywords sent to Google Places nearby/text search.
 * Family brands (Reliance) searched once; client maps to specific banners.
 */
export function getPlacesSearchKeywords(): string[] {
  const seeds = [
    "Zudio",
    "V-Mart",
    "V2 Retail",
    "City Kart",
    "Citi Style",
    "D-Mart",
    "DMart",
    "Reliance Smart",
    "Reliance Fresh",
    "Reliance Trends",
    "Reliance Digital",
    "Reliance Market",
    "Smart Bazaar",
    "Pantaloons",
    "Westside",
    "Lifestyle",
    "Max Fashion",
    "More Mega",
    "More Supermarket",
    "Spencer",
    "Spar",
    "Brand Factory",
    "Shoppers Stop",
    "Carrefour",
    "Lulu Hypermarket",
    "Metro Wholesale",
    "Blinkit",
    "Yousta",
    "Unlimited",
    "Easybuy",
    "Star Bazaar",
    "Fabindia",
    "Snitch",
    "Nesto",
    "Fashion City",
    "Bazaar Kolkata",
    "Bazar India",
    "Cosmo Bazaar",
    "M Bazaar",
    "Style Bazaar",
    "Style Union",
    "Style Up",
    "V-Bazaar",
    "National Mart",
    "Express Bazaar",
    "KPN Supermarket",
    "Big Day Hypermarket",
    "Big Mart",
    "Rolla Hypermarket",
    "Ratnadeep",
    "Sunsar",
    "Grand Mart",
    "Reliance Fashion",
    "Mr DIY",
    "One India Fashion",
    "LimeRoad",
  ];

  // Also include every priority brand name as a keyword
  const all = new Set<string>([...seeds, ...PRIORITY_COMPETITORS]);
  return [...all];
}
