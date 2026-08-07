import type { Competitor } from "@/types/competitor";
import { distanceKm } from "@/lib/geo";

/**
 * Demo competitors relative to a store at (originLat, originLng).
 * Offsets approximate the sample layout from the product brief.
 */
const DEMO_OFFSETS: Omit<Competitor, "id" | "distanceKm" | "lat" | "lng">[] = [
  {
    name: "Zudio",
    brand: "Zudio",
    category: "Fashion",
    rating: 4.2,
    ratingCount: 1840,
    openedOn: "Mar 2022",
    address: "Ground Floor, City Centre Mall, Sector 12",
    phone: "+91 98765 43210",
    sizeSqFt: 8500,
  },
  {
    name: "V-Mart",
    brand: "V-Mart",
    category: "Fashion",
    rating: 4.0,
    ratingCount: 962,
    openedOn: "Aug 2019",
    address: "Shop 4-7, Market Road, Near Bus Stand",
    phone: "+91 98111 22334",
    sizeSqFt: 12000,
  },
  {
    name: "D-Mart",
    brand: "D-Mart",
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
    brand: "Reliance Smart",
    category: "Grocery",
    rating: 4.1,
    ratingCount: 2301,
    openedOn: "Nov 2020",
    address: "Lower Ground, Metro Plaza",
    phone: "+91 1800 891 0001",
    sizeSqFt: 18000,
  },
  {
    name: "Smart Bazaar",
    brand: "Smart Bazaar",
    category: "Grocery",
    rating: 3.9,
    ratingCount: 1455,
    openedOn: "Jun 2021",
    address: "NH-24 Service Lane, Block C",
    phone: "+91 120 456 7890",
    sizeSqFt: 22000,
  },
  {
    name: "Pantaloons",
    brand: "Pantaloons",
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
    brand: "Max",
    category: "Fashion",
    rating: 4.0,
    ratingCount: 1102,
    openedOn: "Sep 2023",
    address: "Unit 12, High Street Arcade",
    phone: "+91 99887 76655",
    sizeSqFt: 7200,
  },
  {
    name: "More",
    brand: "More",
    category: "Hypermarket",
    rating: 3.8,
    ratingCount: 890,
    openedOn: "Apr 2016",
    address: "Opposite Civil Hospital, Main Road",
    phone: "+91 80 4123 4567",
    sizeSqFt: 28000,
  },
];

/** Relative offsets in km (north, east) for demo placement */
const OFFSETS_KM: [number, number][] = [
  [0.55, 0.72],
  [-0.4, 1.1],
  [1.2, -0.35],
  [-0.9, -0.6],
  [0.2, 1.8],
  [1.5, 0.9],
  [-1.3, 0.4],
  [0.8, -1.6],
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
      id: `demo-${i + 1}`,
      lat,
      lng,
      distanceKm: Math.round(dist * 10) / 10,
      mapsUrl: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
    };
  }).filter((c) => c.distanceKm <= radiusKm);
}

/** Sample VMM store — Noida Sector 18 area (illustrative). */
export const DEFAULT_STORE = {
  name: "Vishal Mega Mart — Sample Store",
  lat: 28.5703,
  lng: 77.3219,
  radiusKm: 5,
};
