"use client";

import { useMemo, useState } from "react";
import { ArrowDownWideNarrow, ArrowUpWideNarrow, ArrowRight, Search } from "lucide-react";
import type { Competitor } from "@/types/competitor";
import { brandColor, brandInitial, formatDistance } from "@/lib/geo";
import {
  searchCompetitorsList,
  sortCompetitorsByDistance,
  type DistanceSort,
} from "@/lib/competitor-filter";

export default function TopCompetitorsPanel({
  competitors,
  radiusKm,
  onViewAll,
}: {
  competitors: Competitor[];
  radiusKm: number;
  onViewAll: () => void;
}) {
  const [query, setQuery] = useState("");
  const [distanceSort, setDistanceSort] = useState<DistanceSort>("asc");

  const rows = useMemo(() => {
    const filtered = searchCompetitorsList(competitors, query);
    return sortCompetitorsByDistance(filtered, distanceSort).slice(0, 12);
  }, [competitors, query, distanceSort]);

  return (
    <section className="panel top-competitors">
      <header className="panel-head">
        <h2>Priority competitors (within {radiusKm} km)</h2>
        <button type="button" className="link-accent" onClick={onViewAll}>
          View all ›
        </button>
      </header>

      <div className="list-toolbar">
        <label className="list-search">
          <Search size={14} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search brand / mother company"
            aria-label="Search competitors"
          />
        </label>
        <button
          type="button"
          className="btn-ghost sort-btn"
          onClick={() =>
            setDistanceSort((d) => (d === "asc" ? "desc" : "asc"))
          }
          title="Sort by distance"
        >
          {distanceSort === "asc" ? (
            <ArrowUpWideNarrow size={15} />
          ) : (
            <ArrowDownWideNarrow size={15} />
          )}
          Distance {distanceSort === "asc" ? "↑" : "↓"}
        </button>
      </div>

      <div className="comp-table-wrap">
        <table className="comp-table">
          <thead>
            <tr>
              <th>Brand</th>
              <th>Mother company</th>
              <th>Category</th>
              <th className="text-right">Distance</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id}>
                <td>
                  <div className="brand-cell">
                    <span
                      className="brand-avatar"
                      style={{ background: brandColor(c.brand) }}
                    >
                      {brandInitial(c.brand)}
                    </span>
                    <div>
                      <span className="brand-name">{c.brand}</span>
                      <div className="muted small place-name">{c.name}</div>
                    </div>
                  </div>
                </td>
                <td className="muted small">{c.parentCompany || "—"}</td>
                <td className="muted">{c.category}</td>
                <td className="text-right muted">
                  {formatDistance(c.distanceKm)}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="empty-cell">
                  No priority competitors in range.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <button type="button" className="btn-outline-full" onClick={onViewAll}>
        Full competition analysis
        <ArrowRight size={15} />
      </button>
    </section>
  );
}
