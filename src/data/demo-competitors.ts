import type { Competitor } from "@/types/competitor";
import { getParentCompany } from "@/data/priority-competitors";
import { distanceKm } from "@/lib/geo";

/**
 * Demo competitors drawn from the priority organized-retailer list.
 */
const DEMO_OFFSETS: Omit<
  Competitor,
  "id" | "distanceKm" | "lat" | "lng" | "parentCompany"
>[] = [
  {
    name: "Zudio",
    brand: "ZUDIO",
    category: "Fashion",
    rating: 4.2,
    ratingCount: 1840,
    openedOn: "Mar 2022",
    address: "Ground Floor, City Centre Mall",
    phone: "+91 98765 43210",
    sizeSqFt: 8500,
  },
  {
    name: "V-Mart",
    brand: "V-MART",
    category: "Fashion",
    rating: 4.0,
    ratingCount: 962,
    openedOn: "Aug 2019",
    address: "Shop 4-7, Market Road",
    phone: "+91 98111 22334",
    sizeSqFt: 12000,
  },
  {
    name: "D-Mart",
    brand: "D-MART",
    category: "Hypermarket",
    rating: 4.4,
    ratingCount: 5120,
    openedOn: "Jan 2018",
    address: "Plot 22, Ring Road Junction",
    phone: "+91 22 3344 5566",
    sizeSqFt: 45000,
  },
  {
    name: "Reliance Smart",
    brand: "RELIANCE SMART",
    category: "Grocery",
    rating: 4.1,
    ratingCount: 2301,
    openedOn: "Nov 2020",
    address: "Lower Ground, Metro Plaza",
    phone: "+91 1800 891 0001",
    sizeSqFt: 18000,
  },
  {
    name: "Reliance Smart Bazaar",
    brand: "RELIANCE SMART BAZAAR",
    category: "Grocery",
    rating: 3.9,
    ratingCount: 1455,
    openedOn: "Jun 2021",
    address: "NH Service Lane, Block C",
    phone: "+91 120 456 7890",
    sizeSqFt: 22000,
  },
  {
    name: "Pantaloons",
    brand: "PANTALOONS",
    category: "Fashion",
    rating: 4.3,
    ratingCount: 2876,
    openedOn: "Feb 2017",
    address: "1st Floor, Galaxy Mall",
    phone: "+91 98700 11223",
    sizeSqFt: 15000,
  },
  {
    name: "Max",
    brand: "MAX RETAIL",
    category: "Fashion",
    rating: 4.0,
    ratingCount: 1102,
    openedOn: "Sep 2023",
    address: "Unit 12, High Street Arcade",
    phone: "+91 99887 76655",
    sizeSqFt: 7200,
  },
  {
    name: "More Mega Store",
    brand: "MORE MEGA STORE",
    category: "Hypermarket",
    rating: 3.8,
    ratingCount: 890,
    openedOn: "Apr 2016",
    address: "Opposite Civil Hospital, Main Road",
    phone: "+91 80 4123 4567",
    sizeSqFt: 28000,
  },
  {
    name: "Westside",
    brand: "WESTSIDE",
    category: "Fashion",
    rating: 4.2,
    ratingCount: 1660,
    openedOn: "May 2015",
    address: "2nd Floor, Central Mall",
    phone: "+91 22 6665 0000",
    sizeSqFt: 14000,
  },
  {
    name: "Lifestyle Stores",
    brand: "LIFESTYLE",
    category: "Lifestyle",
    rating: 4.1,
    ratingCount: 2104,
    openedOn: "Oct 2014",
    address: "Anchor Store, City Square",
    phone: "+91 40 4000 1234",
    sizeSqFt: 32000,
  },
  {
    name: "Shoppers Stop",
    brand: "SHOPPERS STOP",
    category: "Department Store",
    rating: 4.0,
    ratingCount: 3340,
    openedOn: "Jul 2012",
    address: "Mall Road, Sector 18",
    phone: "+91 22 4245 0000",
    sizeSqFt: 48000,
  },
  {
    name: "Reliance Trends",
    brand: "RELIANCE TRENDS",
    category: "Fashion",
    rating: 4.0,
    ratingCount: 980,
    openedOn: "Dec 2019",
    address: "Ground Floor, Plaza Walk",
    phone: "+91 1800 891 1000",
    sizeSqFt: 9000,
  },
  {
    name: "City Kart",
    brand: "CITY KART",
    category: "Fashion",
    rating: 3.9,
    ratingCount: 420,
    openedOn: "Jan 2021",
    address: "Main Market Complex",
    phone: "+91 98100 11223",
    sizeSqFt: 6500,
  },
  {
    name: "V2 Retail",
    brand: "V2",
    category: "Fashion",
    rating: 4.0,
    ratingCount: 780,
    openedOn: "Aug 2018",
    address: "Ring Road Commercial Hub",
    phone: "+91 98765 10011",
    sizeSqFt: 11000,
  },
  {
    name: "Carrefour",
    brand: "CARREFOUR",
    category: "Hypermarket",
    rating: 4.1,
    ratingCount: 1560,
    openedOn: "Mar 2015",
    address: "Hypercity Mall Anchor",
    phone: "+91 124 400 2000",
    sizeSqFt: 55000,
  },
];

const OFFSETS_KM: [number, number][] = [
  [0.55, 0.72],
  [-0.4, 1.1],
  [1.2, -0.35],
  [-0.9, -0.6],
  [0.2, 1.8],
  [1.5, 0.9],
  [-1.3, 0.4],
  [0.8, -1.6],
  [2.1, 0.3],
  [-1.8, 1.2],
  [0.6, 2.4],
  [-2.2, -0.8],
  [1.1, -2.0],
  [-0.7, 2.6],
  [2.4, 1.1],
];

function offsetLatLng(
  lat: number,
  lng: number,
  northKm: number,
  eastKm: number
): { lat: number; lng: number } {
  const dLat = northKm / 111.32;
  const dLng = eastKm / (111.32 * Math.cos((lat * Math.PI) / 180));
  return { lat: lat + dLat, lng: lng + dLng };
}

export function buildDemoCompetitors(
  originLat: number,
  originLng: number,
  radiusKm: number
): Competitor[] {
  return DEMO_OFFSETS.map((item, i) => {
    const [n, e] = OFFSETS_KM[i];
    const { lat, lng } = offsetLatLng(originLat, originLng, n, e);
    const dist = distanceKm(originLat, originLng, lat, lng);
    return {
      ...item,
      parentCompany: getParentCompany(item.brand),
      id: `demo-${i + 1}`,
      lat,
      lng,
      distanceKm: Math.round(dist * 10) / 10,
      mapsUrl: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
    };
  }).filter((c) => c.distanceKm <= radiusKm);
}

export const DEFAULT_STORE = {
  name: "VMM — Sample Store",
  lat: 28.5703,
  lng: 77.3219,
  radiusKm: 5,
};
