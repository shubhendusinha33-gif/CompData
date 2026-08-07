"use client";

import { useRef } from "react";
import { Search, LocateFixed, Download, Loader2 } from "lucide-react";
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
  onAutoName,
  onDownloadCsv,
  loading,
  resolvingName,
  hasResults,
  showApiKey,
  onToggleApiKey,
}: {
  values: SearchFormValues;
  onChange: (next: SearchFormValues) => void;
  onSubmit: () => void;
  onAutoName: () => void;
  onDownloadCsv: () => void;
  loading: boolean;
  resolvingName: boolean;
  hasResults: boolean;
  showApiKey: boolean;
  onToggleApiKey: () => void;
}) {
  const keyRef = useRef<HTMLInputElement>(null);

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
          <div className="field-with-action">
            <input
              value={values.name}
              onChange={(e) => onChange({ ...values, name: e.target.value })}
              placeholder="Auto-fills from lat/long — e.g. VMM — Dwarka Mod"
            />
            <button
              type="button"
              className="btn-inline"
              onClick={onAutoName}
              disabled={resolvingName || loading}
              title="Resolve name from coordinates"
            >
              {resolvingName ? <Loader2 size={14} className="spin" /> : "Auto"}
            </button>
          </div>
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
      </div>

      <div className="radius-presets" role="group" aria-label="Radius presets">
        <span className="preset-label">Quick radius</span>
        {[5, 10].map((km) => (
          <button
            key={km}
            type="button"
            className={`preset-chip ${Number(values.radius) === km ? "active" : ""}`}
            onClick={() => onChange({ ...values, radius: String(km) })}
          >
            {km} km
          </button>
        ))}
      </div>

      <div className="settings-row">
        <button type="button" className="link-quiet" onClick={onToggleApiKey}>
          {showApiKey ? "Hide API settings" : "API settings"}
        </button>
      </div>

      {showApiKey && (
        <label className="field field-wide api-key-field">
          <span>Google Maps API key</span>
          <input
            ref={keyRef}
            type="password"
            autoComplete="new-password"
            name="google-maps-api-key"
            spellCheck={false}
            value={values.apiKey}
            onChange={(e) => onChange({ ...values, apiKey: e.target.value })}
            placeholder="••••••••••••••••"
            aria-label="Google Maps API key (masked)"
          />
          <span className="field-help">
            Stored in this browser only. Enable Maps JavaScript API + Places API.
          </span>
        </label>
      )}

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
              radius: "5",
            })
          }
        >
          <LocateFixed size={15} />
          Sample VMM
        </button>
        <button
          type="button"
          className="btn-ghost"
          onClick={onDownloadCsv}
          disabled={!hasResults}
        >
          <Download size={15} />
          Download CSV
        </button>
        <button type="submit" className="btn-primary" disabled={loading}>
          <Search size={15} />
          {loading ? "Scanning…" : "Find competitors"}
        </button>
      </div>
    </form>
  );
}
