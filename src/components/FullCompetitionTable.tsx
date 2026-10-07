"use client";

import { useMemo, useState } from "react";
import {
  Star,
  Phone,
  MapPin,
  ExternalLink,
  Search,
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
} from "lucide-react";
import type { Competitor } from "@/types/competitor";
import {
  brandColor,
  brandInitial,
  formatDistance,
  formatSize,
} from "@/lib/geo";
import {
  searchCompetitorsList,
  sortCompetitorsByDistance,
  type DistanceSort,
} from "@/lib/competitor-filter";

export default function FullCompetitionTable({
  competitors,
}: {
  competitors: Competitor[];
}) {
  const [query, setQuery] = useState("");
  const [distanceSort, setDistanceSort] = useState<DistanceSort>("asc");

  const rows = useMemo(() => {
    const filtered = searchCompetitorsList(competitors, query);
    return sortCompetitorsByDistance(filtered, distanceSort);
  }, [competitors, query, distanceSort]);

  return (
    <section id="full-analysis" className="panel full-analysis">
      <header className="panel-head">
        <div>
          <h2>Review — full competition analysis</h2>
          <p className="panel-sub">
            Official national chains only (plus listed regionals). Mother
            company is shown so D-Mart is Avenue Supermarts, Zudio is Trent —
            not local lookalikes.
          </p>
        </div>
        <span className="count-pill">{rows.length} brands</span>
      </header>

      <div className="list-toolbar">
        <label className="list-search">
          <Search size={14} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search brand / mother company / address"
            aria-label="Search full competitor list"
          />
        </label>
        <button
          type="button"
          className="btn-ghost sort-btn"
          onClick={() =>
            setDistanceSort((d) => (d === "asc" ? "desc" : "asc"))
          }
        >
          {distanceSort === "asc" ? (
            <ArrowUpWideNarrow size={15} />
          ) : (
            <ArrowDownWideNarrow size={15} />
          )}
          Sort distance {distanceSort === "asc" ? "↑" : "↓"}
        </button>
      </div>

      <div className="analysis-scroll">
        <table className="analysis-table">
          <thead>
            <tr>
              <th>Brand</th>
              <th>Mother company</th>
              <th>Rating</th>
              <th>Distance</th>
              <th>Category</th>
              <th>Opened on</th>
              <th>Address &amp; contact</th>
              <th>Size</th>
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
                      <div className="brand-name">{c.brand}</div>
                      <div className="muted small">{c.name}</div>
                      {c.mapsUrl && (
                        <a
                          href={c.mapsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mini-link"
                        >
                          Map <ExternalLink size={11} />
                        </a>
                      )}
                    </div>
                  </div>
                </td>
                <td className="muted small">{c.parentCompany || "—"}</td>
                <td>
                  {c.rating != null ? (
                    <div className="rating-cell">
                      <Star size={14} className="star" />
                      <strong>{c.rating.toFixed(1)}</strong>
                      {c.ratingCount != null && (
                        <span className="muted small">
                          ({c.ratingCount.toLocaleString("en-IN")})
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="muted">—</span>
                  )}
                </td>
                <td>{formatDistance(c.distanceKm)}</td>
                <td>
                  <span className="cat-chip">{c.category}</span>
                </td>
                <td className="muted">{c.openedOn ?? "—"}</td>
                <td>
                  <div className="addr-cell">
                    <span className="addr-line">
                      <MapPin size={13} />
                      {c.address}
                    </span>
                    {c.phone ? (
                      <a href={`tel:${c.phone}`} className="phone-line">
                        <Phone size={13} />
                        {c.phone}
                      </a>
                    ) : (
                      <span className="muted small">No phone listed</span>
                    )}
                  </div>
                </td>
                <td>{formatSize(c.sizeSqFt)}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="empty-cell">
                  No matching priority competitors.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
