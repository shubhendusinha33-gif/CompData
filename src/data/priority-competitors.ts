/**
 * Priority organized retail competitors vs Vishal Mega Mart.
 *
 * Only authentic national chains (and a few listed regional chains) match.
 * Local copycats such as "K D-Mart" must never count as D-Mart (Avenue Supermarts).
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
  "CAPIAN",
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
  "OSIA HYPERMART",
  "EASYDAY",
  "HERITAGE FRESH",
  "NILGIRIS",
  "NATURE'S BASKET",
  "HYPERCITY",
  "BEST PRICE",
  "JIOMART",
] as const;

/**
 * Brands whose bare name is too generic (e.g. "Lifestyle" mom-and-pop shops).
 * Only official aliases, or a leading brand phrase with no copycat prefix, may match.
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
  "CAPIAN",
  "BEST PRICE",
]);

/** Extra aliases so Google place names still match the official chain. */
const ALIASES: Record<string, string[]> = {
  "D-MART": [
    "DMART",
    "D MART",
    "AVENUE SUPERMARTS",
    "AVENUE SUPERMART",
    "D-MART INDIA",
    "DMART INDIA",
    "D MART READY",
    "DMART READY",
  ],
  "MAX RETAIL": ["MAX FASHION", "MAX RETAIL STORE", "MAX"],
  "MORE MEGA STORE": ["MORE MEGA", "MORE HYPER", "MORE MEGASTORE"],
  "MORE SUPERMARKET": ["MORE SUPERMARKET", "MORE SUPER MARKET"],
  "SPENCER'S": ["SPENCERS", "SPENCER RETAIL", "SPENCER S"],
  "SPAR HYPERMARKET": ["SPAR HYPER", "SPAR INDIA", "SPAR HYPERMARKET", "SPAR"],
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
  "V-MART": ["VMART", "V MART", "V-MART RETAIL", "VMART RETAIL"],
  "V-BAZAAR": ["V BAZAAR", "VBAZAAR"],
  "V2": ["V2 RETAIL", "V 2 RETAIL"],
  "CITY KART": ["CITYKART", "CITY KART FASHION", "CITYKART FASHION"],
  "CITI STYLE": ["CITISTYLE"],
  "SHOPPERS STOP": ["SHOPPERSSTOP", "SHOPPER STOP"],
  "FAB INDIA": ["FABINDIA"],
  "MR. DIY": ["MR DIY", "MRDIY"],
  "LULU HYPERMARKET": ["LULU HYPER", "LU LU HYPERMARKET"],
  "LULU WHOLESALE MART": ["LULU WHOLESALE"],
  "METRO WHOLESALE": ["METRO CASH", "METRO AG", "METRO WHOLESALE INDIA", "METRO CASH AND CARRY"],
  "BLINKIT": ["GROFERS"],
  "1 INDIA FAMILY MART": ["INDIA FAMILY MART", "1INDIA FAMILY"],
  "ZUDIO": ["ZUDIO TATA", "ZUDIO STORE", "TRENT ZUDIO"],
  "PANTALOONS": ["PANTALOON", "ADITYA BIRLA PANTALOONS"],
  "CARREFOUR": ["CARREFOUR MARKET", "CARREFOUR HYPERMARKET", "CARREFOUR INDIA"],
  "BRAND FACTORY": ["BRANDFACTORY"],
  "WESTSIDE": ["WEST SIDE", "WESTSIDE TATA", "TRENT WESTSIDE"],
  "SHUBHAM K MART": [
    "SHUBHAM KMART",
    "SHUBHAM K-MART",
    "SHUBHAMK MART",
    "SHUBHAM K MART PRIVATE",
  ],
  CAPIAN: ["CAPIAN MART", "CAPIAN SUPERMARKET", "CAPIAN HYPERMARKET", "CAPIYAN"],
  "OSIA HYPERMART": ["OSIA HYPER", "OSIA HYPERMARKET", "OSIA MART"],
  EASYDAY: ["EASY DAY", "EASYDAY MARKET"],
  "HERITAGE FRESH": ["HERITAGE FRESH STORE"],
  NILGIRIS: ["NILGIRIS SUPERMARKET", "NILGIRIS STORE"],
  "NATURE'S BASKET": ["NATURES BASKET", "NATURE S BASKET"],
  HYPERCITY: ["HYPER CITY"],
  "BEST PRICE": ["BEST PRICE WHOLESALE", "WALMART BEST PRICE"],
  JIOMART: ["JIO MART", "JIOMART DIGITAL"],
  "SUMIT BAZAAR": ["SUMEET BAZAAR", "SUMEET BAZAR"],
  // Landmark Group Lifestyle — prefer Landmark phrasing; bare "Lifestyle…"
  // only when it is the FIRST word (rejects "Healthy Lifestyle Spa" etc.)
  LIFESTYLE: [
    "LANDMARK LIFESTYLE",
    "LIFESTYLE BY LANDMARK",
    "LANDMARK GROUP LIFESTYLE",
    "LIFESTYLE STORES",
    "LIFESTYLE STORE",
  ],
};

/** Corporate operators that prove the place is the real chain even if the brand is not first. */
const CORPORATE_MARKERS: Record<string, string[]> = {
  "D-MART": ["AVENUE SUPERMARTS", "AVENUE SUPERMART"],
  LIFESTYLE: ["LANDMARK GROUP", "LANDMARK LIFESTYLE"],
  PANTALOONS: ["ADITYA BIRLA"],
  WESTSIDE: ["TRENT LIMITED", "TRENT LTD"],
  ZUDIO: ["TRENT LIMITED", "TRENT LTD"],
  "RELIANCE SMART": ["RELIANCE RETAIL"],
  "RELIANCE SMART BAZAAR": ["RELIANCE RETAIL"],
  "RELIANCE FRESH": ["RELIANCE RETAIL"],
  "RELIANCE TRENDS": ["RELIANCE RETAIL"],
  "RELIANCE DIGITAL": ["RELIANCE RETAIL"],
  "SHUBHAM K MART": ["SHUBHAM K MART PRIVATE LIMITED"],
};

/** Articles / legal prefixes Google sometimes puts in front of the brand. */
const IGNORABLE_PREFIX = new Set(["THE", "A", "AN", "MS", "M"]);

/** Reject non-retail noise when a generic brand word leads the place name. */
const NON_RETAIL_NOISE =
  /\b(SPA|SALON|GYM|YOGA|FITNESS|CLINIC|CAFE|COFFEE|RESTAURANT|HOTEL|PG|HOSTEL|COACH|CONSULT|THERAPY|WELLNESS|BEAUTY|PARLOUR|PARLOR|HOSPITAL|HEALTHCARE|HEALTH|INSURANCE|TYRE|TIRE|FURNITURE|INTERIOR|SCHOOL|COLLEGE|BANK|ATM|PETROL|FUEL)\b/;

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

function tokens(value: string): string[] {
  const n = normalize(value);
  return n ? n.split(" ") : [];
}

function stripIgnorable(toks: string[]): string[] {
  const out = [...toks];
  while (out.length && IGNORABLE_PREFIX.has(out[0])) out.shift();
  return out;
}

function sequenceAtStart(hay: string[], needle: string[]): boolean {
  if (!needle.length || hay.length < needle.length) return false;
  return needle.every((t, i) => hay[i] === t);
}

function containsSequence(hay: string[], needle: string[]): boolean {
  if (!needle.length || hay.length < needle.length) return false;
  for (let i = 0; i <= hay.length - needle.length; i++) {
    if (needle.every((t, j) => hay[i + j] === t)) return true;
  }
  return false;
}

/**
 * Official chain hit: brand/alias must lead the place name.
 * "D-Mart Whitefield" matches; "K D-Mart" / "KDMart" do not.
 */
function officialLeading(hayRaw: string, needleRaw: string): boolean {
  const hayToks = stripIgnorable(tokens(hayRaw));
  const needleToks = tokens(needleRaw);
  if (!hayToks.length || !needleToks.length) return false;

  if (sequenceAtStart(hayToks, needleToks)) return true;

  const hayN = hayToks.join(" ");
  const needleN = needleToks.join(" ");
  const hayC = compact(hayToks.join(" "));
  const needleC = compact(needleRaw);

  if (hayN === needleN || hayC === needleC) return true;
  if (hayN.startsWith(`${needleN} `)) return true;
  // "DMart Whitefield" → hay "DMART WHITEFIELD", needle "D MART"
  if (hayN.startsWith(`${needleC} `)) return true;

  return false;
}

function hasCorporateMarker(placeName: string, brand: string): boolean {
  const markers = CORPORATE_MARKERS[brand] ?? [];
  const hayToks = tokens(placeName);
  return markers.some((marker) => containsSequence(hayToks, tokens(marker)));
}

export interface PriorityMatch {
  brand: string;
  priorityIndex: number;
  score: number;
}

export function matchPriorityBrand(placeName: string): PriorityMatch | null {
  if (!placeName?.trim()) return null;

  const noisy = NON_RETAIL_NOISE.test(normalize(placeName));
  const corporateNoiseOverride =
    /AVENUE SUPERMARTS|LANDMARK|PANTALOONS|ZUDIO|RELIANCE RETAIL|WESTSIDE|CARREFOUR|TRENT|ADITYA BIRLA/i.test(
      placeName
    );
  if (noisy && !corporateNoiseOverride) return null;

  let best: PriorityMatch | null = null;

  PRIORITY_COMPETITORS.forEach((brand, index) => {
    const aliases = ALIASES[brand] ?? [];
    const strict = STRICT_BRANDS.has(brand);
    const needles = strict ? [...aliases, brand] : [brand, ...aliases];

    let hit = false;
    let score = 0;

    for (const needle of needles) {
      if (!officialLeading(placeName, needle)) continue;
      hit = true;
      score = Math.max(score, compact(needle).length);
    }

    if (!hit && hasCorporateMarker(placeName, brand)) {
      // Operator is present; still require the brand phrase somewhere as a
      // leading sequence after the operator, or as a contiguous token run.
      const hayToks = stripIgnorable(tokens(placeName));
      const brandToks = tokens(brand);
      if (
        containsSequence(hayToks, brandToks) ||
        aliases.some((a) => containsSequence(hayToks, tokens(a)))
      ) {
        hit = true;
        score = compact(brand).length;
      }
    }

    if (!hit) return;

    // SPAR / V2 / MAX: short tokens must not match inside longer first words.
    if (compact(brand).length <= 3 && !strict) {
      const hayToks = stripIgnorable(tokens(placeName));
      const brandToks = tokens(brand);
      if (!sequenceAtStart(hayToks, brandToks) && !aliases.some((a) => officialLeading(placeName, a))) {
        return;
      }
    }

    if (
      !best ||
      score > best.score ||
      (score === best.score && index < best.priorityIndex)
    ) {
      best = { brand, priorityIndex: index, score };
    }
  });

  return best;
}

export function isPriorityCompetitor(placeName: string): boolean {
  return matchPriorityBrand(placeName) != null;
}

/**
 * Compact Google keyword set — official chain phrases only (no generic "mart").
 */
export function getPlacesSearchKeywords(): string[] {
  return [
    "Zudio",
    "V-Mart Retail",
    "V2 Retail",
    "City Kart",
    "Citi Style",
    "Avenue Supermarts",
    "DMart",
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
    "Shubham K Mart",
    "Capian",
    "Osia Hypermart",
    "Heritage Fresh",
    "Nilgiris",
    "Nature's Basket",
    "JioMart",
    "EasyDay",
  ];
}
