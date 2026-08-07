"use client";

import { Store, Radar, Star, Ruler } from "lucide-react";
import type { Competitor } from "@/types/competitor";

export default function StatsRow({
  competitors,
  radiusKm,
  source,
}: {
  competitors: Competitor[];
  radiusKm: number;
  source: "google" | "demo";
}) {
  const rated = competitors.filter((c) => c.rating != null);
  const avgRating =
    rated.length > 0
      ? rated.reduce((s, c) => s + (c.rating ?? 0), 0) / rated.length
      : null;
  const nearest = competitors[0]?.distanceKm ?? null;

  const stats = [
    {
      label: "Competitors found",
      value: String(competitors.length),
      hint: `within ${radiusKm} km`,
      icon: Radar,
    },
    {
      label: "Avg. Google rating",
      value: avgRating != null ? avgRating.toFixed(1) : "—",
      hint: rated.length ? `${rated.length} rated` : "no ratings",
      icon: Star,
    },
    {
      label: "Nearest rival",
      value: nearest != null ? `${nearest.toFixed(1)} km` : "—",
      hint: competitors[0]?.brand ?? "n/a",
      icon: Ruler,
    },
    {
      label: "Data source",
      value: source === "google" ? "Live" : "Demo",
      hint: source === "google" ? "Google Places" : "Sample dataset",
      icon: Store,
    },
  ];

  return (
    <div className="stats-row">
      {stats.map((s) => (
        <article key={s.label} className="stat-card">
          <div className="stat-icon">
            <s.icon size={16} />
          </div>
          <div>
            <p className="stat-label">{s.label}</p>
            <p className="stat-value">{s.value}</p>
            <p className="stat-hint">{s.hint}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
