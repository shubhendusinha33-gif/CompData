import { matchPriorityBrand } from "../src/data/priority-competitors";

function expectBrand(name: string, brand: string | null) {
  const match = matchPriorityBrand(name);
  const got = match?.brand ?? null;
  if (got !== brand) {
    throw new Error(
      `matchPriorityBrand(${JSON.stringify(name)}) → ${JSON.stringify(got)}, expected ${JSON.stringify(brand)}`
    );
  }
}

// Real Avenue Supermarts D-Mart
expectBrand("D-Mart", "D-MART");
expectBrand("DMart", "D-MART");
expectBrand("D Mart", "D-MART");
expectBrand("D-Mart Whitefield", "D-MART");
expectBrand("DMart - Dwarka", "D-MART");
expectBrand("Avenue Supermarts - D-Mart", "D-MART");
expectBrand("Avenue Supermarts Ltd", "D-MART");

// Local copycats must never count as D-Mart
expectBrand("K D-Mart", null);
expectBrand("K D Mart", null);
expectBrand("KD-Mart", null);
expectBrand("KDMart", null);
expectBrand("Super D-Mart", null);
expectBrand("Mini D-Mart", null);
expectBrand("New D-Mart", null);
expectBrand("Shree D Mart", null);
expectBrand("Raj D-Mart", null);
expectBrand("Local DMart", null);

// Other national chains: leading official names only
expectBrand("Reliance Smart", "RELIANCE SMART");
expectBrand("Reliance Smart Bazaar", "RELIANCE SMART BAZAAR");
expectBrand("Zudio", "ZUDIO");
expectBrand("Zudio - Forum Mall", "ZUDIO");
expectBrand("V-Mart", "V-MART");
expectBrand("V Mart Retail", "V-MART");
expectBrand("Pantaloons", "PANTALOONS");
expectBrand("Max Fashion", "MAX RETAIL");
expectBrand("Lifestyle Stores", "LIFESTYLE");
expectBrand("Lifestyle - Select Citywalk", "LIFESTYLE");

expectBrand("My V-Mart", null);
expectBrand("Super V Mart", null);
expectBrand("Healthy Lifestyle Spa", null);
expectBrand("Max Healthcare", null);

// State / regional listed brands
expectBrand("Shubham K Mart", "SHUBHAM K MART");
expectBrand("Shubham K-Mart Raipur", "SHUBHAM K MART");
expectBrand("Capian", "CAPIAN");
expectBrand("Capian Mart", "CAPIAN");
expectBrand("Osia Hypermart", "OSIA HYPERMART");
expectBrand("Sumeet Bazaar", "SUMIT BAZAAR");

console.log("brand match tests passed");
