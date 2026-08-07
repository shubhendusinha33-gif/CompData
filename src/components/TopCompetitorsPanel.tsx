"use client";

import { ArrowRight } from "lucide-react";
import type { Competitor } from "@/types/competitor";
import { brandColor, brandInitial, formatDistance } from "@/lib/geo";

export default function TopCompetitorsPanel({
  competitors,
  radiusKm,
  onViewAll,
}: {
  competitors: Competitor[];
  radiusKm: number;
  onViewAll: () => void;
}) {
  const top = competitors.slice(0, 10);

  return (
    <section className="panel top-competitors">
      <header className="panel-head">
        <h2>Priority competitors (within {radiusKm} km)</h2>
        <button type="button" className="link-accent" onClick={onViewAll}>
          View all ›
        </button>
      </header>

      <div className="comp-table-wrap">
        <table className="comp-table">
          <thead>
            <tr>
              <th>Brand</th>
              <th>Category</th>
              <th className="text-right">Distance</th>
            </tr>
          </thead>
          <tbody>
            {top.map((c) => (
              <tr key={c.id}>
                <td>
                  <div className="brand-cell">
                    <span
                      className="brand-avatar"
                      style={{ background: brandColor(c.brand) }}
                    >
                      {brandInitial(c.brand)}
                    </span>
                    <span className="brand-name">{c.brand}</span>
                  </div>
                </td>
                <td className="muted">{c.category}</td>
                <td className="text-right muted">
                  {formatDistance(c.distanceKm)}
                </td>
              </tr>
            ))}
            {top.length === 0 && (
              <tr>
                <td colSpan={3} className="empty-cell">
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
