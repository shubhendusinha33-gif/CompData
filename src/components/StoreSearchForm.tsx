"use client";

import { Search, LocateFixed, KeyRound } from "lucide-react";
import { DEFAULT_STORE } from "@/data/demo-competitors";

export interface SearchFormValues {
  name: string;
  lat: string;
  lng: string;
  radius: string;
  apiKey: string;
}

export default function StoreSearchForm({
  values,
  onChange,
  onSubmit,
  loading,
}: {
  values: SearchFormValues;
  onChange: (next: SearchFormValues) => void;
  onSubmit: () => void;
  loading: boolean;
}) {
  return (
    <form
      className="store-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <div className="form-grid">
        <label className="field field-wide">
          <span>Store name</span>
          <input
            value={values.name}
            onChange={(e) => onChange({ ...values, name: e.target.value })}
            placeholder="Vishal Mega Mart — City"
          />
        </label>
        <label className="field">
          <span>Latitude</span>
          <input
            value={values.lat}
            onChange={(e) => onChange({ ...values, lat: e.target.value })}
            placeholder="28.5703"
            inputMode="decimal"
            required
          />
        </label>
        <label className="field">
          <span>Longitude</span>
          <input
            value={values.lng}
            onChange={(e) => onChange({ ...values, lng: e.target.value })}
            placeholder="77.3219"
            inputMode="decimal"
            required
          />
        </label>
        <label className="field">
          <span>Radius (km)</span>
          <input
            type="number"
            min={1}
            max={50}
            step={0.5}
            value={values.radius}
            onChange={(e) => onChange({ ...values, radius: e.target.value })}
            required
          />
        </label>
        <label className="field field-wide">
          <span>
            <KeyRound size={12} className="inline-key" /> Google Maps API key
            (optional — for live data)
          </span>
          <input
            type="password"
            autoComplete="off"
            spellCheck={false}
            value={values.apiKey}
            onChange={(e) => onChange({ ...values, apiKey: e.target.value })}
            placeholder="Paste key to switch from demo → live Places"
          />
        </label>
      </div>
      <p className="key-hint">
        Create a key in Google Cloud with <strong>Maps JavaScript API</strong> +{" "}
        <strong>Places API</strong>. Restrict by HTTP referrer to{" "}
        <code>https://shubhendusinha33-gif.github.io/*</code>. Key stays in this
        browser only.
      </p>
      <div className="form-actions">
        <button
          type="button"
          className="btn-ghost"
          onClick={() =>
            onChange({
              ...values,
              name: DEFAULT_STORE.name,
              lat: String(DEFAULT_STORE.lat),
              lng: String(DEFAULT_STORE.lng),
              radius: String(DEFAULT_STORE.radiusKm),
            })
          }
        >
          <LocateFixed size={16} />
          Use sample VMM
        </button>
        <button type="submit" className="btn-primary" disabled={loading}>
          <Search size={16} />
          {loading ? "Scanning…" : "Find competitors"}
        </button>
      </div>
    </form>
  );
}
