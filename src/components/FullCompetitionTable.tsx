"use client";

import { Star, Phone, MapPin, ExternalLink } from "lucide-react";
import type { Competitor } from "@/types/competitor";
import {
  brandColor,
  brandInitial,
  formatDistance,
  formatSize,
} from "@/lib/geo";

export default function FullCompetitionTable({
  competitors,
}: {
  competitors: Competitor[];
}) {
  return (
    <section id="full-analysis" className="panel full-analysis animate-rise">
      <header className="panel-head">
        <div>
          <h2>Full competition analysis</h2>
          <p className="panel-sub">
            Ratings, distance, category, open date, address, contact &amp; size
          </p>
        </div>
        <span className="count-pill">{competitors.length} stores</span>
      </header>

      <div className="analysis-scroll">
        <table className="analysis-table">
          <thead>
            <tr>
              <th>Brand</th>
              <th>Rating</th>
              <th>Distance</th>
              <th>Category</th>
              <th>Opened on</th>
              <th>Address &amp; contact</th>
              <th>Size</th>
            </tr>
          </thead>
          <tbody>
            {competitors.map((c) => (
              <tr key={c.id}>
                <td>
                  <div className="brand-cell">
                    <span
                      className="brand-avatar"
                      style={{ background: brandColor(c.name) }}
                    >
                      {brandInitial(c.name)}
                    </span>
                    <div>
                      <div className="brand-name">{c.brand}</div>
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
            {competitors.length === 0 && (
              <tr>
                <td colSpan={7} className="empty-cell">
                  Run a search to populate competitor details.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
