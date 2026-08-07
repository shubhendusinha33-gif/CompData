"use client";

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
}: {
  values: SearchFormValues;
  onChange: (next: SearchFormValues) => void;
  onSubmit: () => void;
  onAutoName: () => void;
  onDownloadCsv: () => void;
  loading: boolean;
  resolvingName: boolean;
  hasResults: boolean;
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
          <div className="field-with-action">
            <input
              value={values.name}
              onChange={(e) => onChange({ ...values, name: e.target.value })}
              placeholder="Auto → VMM-Uttam Nagar"
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
