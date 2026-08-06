"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import type { Competitor, StoreLocation } from "@/types/competitor";
import { brandColor, brandInitial, formatDistance } from "@/lib/geo";
import "leaflet/dist/leaflet.css";

function storeIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:36px;height:36px;border-radius:50%;
      background:#c8102e;border:3px solid #fff;
      box-shadow:0 4px 14px rgba(200,16,46,.45);
      display:flex;align-items:center;justify-content:center;
      color:#fff;font-weight:700;font-size:11px;font-family:system-ui;
    ">VMM</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

function competitorIcon(name: string) {
  const color = brandColor(name);
  const letter = brandInitial(name);
  return L.divIcon({
    className: "",
    html: `<div style="
      width:28px;height:28px;border-radius:8px;
      background:${color};border:2px solid #fff;
      box-shadow:0 2px 8px rgba(0,0,0,.25);
      display:flex;align-items:center;justify-content:center;
      color:#fff;font-weight:700;font-size:13px;text-transform:lowercase;
      font-family:system-ui;
    ">${letter}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function FitBounds({
  store,
  competitors,
}: {
  store: StoreLocation;
  competitors: Competitor[];
}) {
  const map = useMap();
  useEffect(() => {
    const points: [number, number][] = [
      [store.lat, store.lng],
      ...competitors.map((c) => [c.lat, c.lng] as [number, number]),
    ];
    if (points.length === 1) {
      map.setView(points[0], 14);
      return;
    }
    map.fitBounds(points, { padding: [40, 40], maxZoom: 15 });
  }, [map, store, competitors]);
  return null;
}

export default function CompetitorsMap({
  store,
  competitors,
}: {
  store: StoreLocation;
  competitors: Competitor[];
}) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  if (!ready) {
    return (
      <div className="map-skeleton flex h-full min-h-[320px] items-center justify-center rounded-2xl">
        <span className="text-sm text-[var(--muted)]">Loading map…</span>
      </div>
    );
  }

  return (
    <MapContainer
      center={[store.lat, store.lng]}
      zoom={13}
      className="h-full min-h-[320px] w-full rounded-2xl"
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      <Circle
        center={[store.lat, store.lng]}
        radius={store.radiusKm * 1000}
        pathOptions={{
          color: "#c8102e",
          fillColor: "#c8102e",
          fillOpacity: 0.06,
          weight: 1.5,
          dashArray: "6 6",
        }}
      />
      <Marker position={[store.lat, store.lng]} icon={storeIcon()}>
        <Popup>
          <strong>{store.name}</strong>
          <br />
          Your VMM store
        </Popup>
      </Marker>
      {competitors.map((c) => (
        <Marker key={c.id} position={[c.lat, c.lng]} icon={competitorIcon(c.name)}>
          <Popup>
            <strong>{c.name}</strong>
            <br />
            {c.category} · {formatDistance(c.distanceKm)}
            {c.rating != null && (
              <>
                <br />★ {c.rating.toFixed(1)}
              </>
            )}
          </Popup>
        </Marker>
      ))}
      <FitBounds store={store} competitors={competitors} />
    </MapContainer>
  );
}
