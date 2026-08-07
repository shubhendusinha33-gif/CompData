import type { Competitor, StoreLocation } from "@/types/competitor";

export interface BulkStoreRow {
  storeCd: string;
  lat: number;
  lng: number;
  rowNumber: number;
}

export interface BulkResultRow {
  storeCd: string;
  storeName: string;
  storeLat: number;
  storeLng: number;
  radiusKm: number;
  competitorBrand: string;
  competitorName: string;
  category: string;
  distanceKm: number | "";
  rating: string;
  ratingCount: string;
  openedOn: string;
  address: string;
  phone: string;
  sizeSqFt: string;
  mapsUrl: string;
  source: string;
}

function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }
  cells.push(current.trim());
  return cells;
}

function normalizeHeader(h: string): string {
  return h.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Parse upload CSV with columns: Store cd / St cd, lat, Long */
export function parseStoreCsv(text: string): BulkStoreRow[] {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) throw new Error("CSV file is empty");

  const header = splitCsvLine(lines[0]).map(normalizeHeader);
  const findCol = (...aliases: string[]) =>
    header.findIndex((h) => aliases.some((a) => h === normalizeHeader(a)));

  let cdIdx = findCol("storecd", "stcd", "storecode", "code", "storeid");
  let latIdx = findCol("lat", "latitude");
  let lngIdx = findCol("long", "lng", "lon", "longitude");

  const hasHeader = cdIdx >= 0 || latIdx >= 0 || lngIdx >= 0;
  const dataLines = hasHeader ? lines.slice(1) : lines;

  if (!hasHeader) {
    cdIdx = 0;
    latIdx = 1;
    lngIdx = 2;
  } else if (latIdx < 0 || lngIdx < 0) {
    throw new Error("CSV must include lat and Long columns");
  }

  const rows: BulkStoreRow[] = [];
  dataLines.forEach((line, i) => {
    const cells = splitCsvLine(line);
    const lat = Number(cells[latIdx]);
    const lng = Number(cells[lngIdx]);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return;
    const storeCd =
      cdIdx >= 0 && cells[cdIdx]
        ? cells[cdIdx]
        : `ROW-${hasHeader ? i + 2 : i + 1}`;
    rows.push({
      storeCd,
      lat,
      lng,
      rowNumber: hasHeader ? i + 2 : i + 1,
    });
  });

  if (rows.length === 0) {
    throw new Error("No valid store rows found (need St cd, lat, Long)");
  }
  return rows;
}

function csvEscape(value: string | number): string {
  const s = String(value ?? "");
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function competitorsToCsvRows(
  store: StoreLocation & { storeCd?: string },
  competitors: Competitor[],
  source: string
): BulkResultRow[] {
  if (competitors.length === 0) {
    return [
      {
        storeCd: store.storeCd ?? "",
        storeName: store.name,
        storeLat: store.lat,
        storeLng: store.lng,
        radiusKm: store.radiusKm,
        competitorBrand: "",
        competitorName: "",
        category: "",
        distanceKm: "",
        rating: "",
        ratingCount: "",
        openedOn: "",
        address: "",
        phone: "",
        sizeSqFt: "",
        mapsUrl: "",
        source,
      },
    ];
  }

  return competitors.map((c) => ({
    storeCd: store.storeCd ?? "",
    storeName: store.name,
    storeLat: store.lat,
    storeLng: store.lng,
    radiusKm: store.radiusKm,
    competitorBrand: c.brand,
    competitorName: c.name,
    category: c.category,
    distanceKm: c.distanceKm,
    rating: c.rating != null ? String(c.rating) : "",
    ratingCount: c.ratingCount != null ? String(c.ratingCount) : "",
    openedOn: c.openedOn ?? "",
    address: c.address,
    phone: c.phone ?? "",
    sizeSqFt: c.sizeSqFt != null ? String(c.sizeSqFt) : "",
    mapsUrl: c.mapsUrl ?? "",
    source,
  }));
}

const RESULT_HEADERS = [
  "Store cd",
  "Store name",
  "Store lat",
  "Store long",
  "Radius km",
  "Competitor brand",
  "Competitor name",
  "Category",
  "Distance km",
  "Google rating",
  "Rating count",
  "Opened on",
  "Address",
  "Contact",
  "Size sq ft",
  "Maps URL",
  "Source",
] as const;

export function bulkResultsToCsv(rows: BulkResultRow[]): string {
  const lines = [
    RESULT_HEADERS.join(","),
    ...rows.map((r) =>
      [
        r.storeCd,
        r.storeName,
        r.storeLat,
        r.storeLng,
        r.radiusKm,
        r.competitorBrand,
        r.competitorName,
        r.category,
        r.distanceKm,
        r.rating,
        r.ratingCount,
        r.openedOn,
        r.address,
        r.phone,
        r.sizeSqFt,
        r.mapsUrl,
        r.source,
      ]
        .map(csvEscape)
        .join(",")
    ),
  ];
  return lines.join("\n");
}

export function downloadCsv(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export const SAMPLE_UPLOAD_CSV = `Store cd,lat,Long
VMM001,28.5703,77.3219
VMM002,28.5921,77.0460
`;
