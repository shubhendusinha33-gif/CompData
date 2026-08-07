"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle } from "lucide-react";
import StoreSearchForm, {
  type SearchFormValues,
} from "@/components/StoreSearchForm";
import TopCompetitorsPanel from "@/components/TopCompetitorsPanel";
import FullCompetitionTable from "@/components/FullCompetitionTable";
import StatsRow from "@/components/StatsRow";
import { DEFAULT_STORE } from "@/data/demo-competitors";
import {
  getStoredApiKey,
  setStoredApiKey,
} from "@/lib/google-places-browser";
import { searchCompetitors } from "@/lib/search-competitors";
import type { Competitor, StoreLocation } from "@/types/competitor";

const CompetitorsMap = dynamic(() => import("@/components/CompetitorsMap"), {
  ssr: false,
  loading: () => (
    <div className="map-skeleton flex h-full min-h-[320px] items-center justify-center rounded-2xl">
      <span className="text-sm text-[var(--muted)]">Loading map…</span>
    </div>
  ),
});

export default function Dashboard() {
  const [form, setForm] = useState<SearchFormValues>({
    name: DEFAULT_STORE.name,
    lat: String(DEFAULT_STORE.lat),
    lng: String(DEFAULT_STORE.lng),
    radius: String(DEFAULT_STORE.radiusKm),
    apiKey: "",
  });
  const [store, setStore] = useState<StoreLocation>(DEFAULT_STORE);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [source, setSource] = useState<"google" | "demo">("demo");
  const [message, setMessage] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const analysisRef = useRef<HTMLDivElement>(null);
  const bootstrapped = useRef(false);

  const runSearch = useCallback(async (values: SearchFormValues) => {
    setLoading(true);
    setError(null);
    setStoredApiKey(values.apiKey);
    try {
      const data = await searchCompetitors({
        name: values.name,
        lat: Number(values.lat),
        lng: Number(values.lng),
        radiusKm: Number(values.radius),
        apiKey: values.apiKey,
      });
      setStore(data.store);
      setCompetitors(data.competitors);
      setSource(data.source);
      setMessage(data.message);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;
    const savedKey = getStoredApiKey();
    const initial = { ...form, apiKey: savedKey };
    setForm(initial);
    void runSearch(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollToAnalysis = () => {
    analysisRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="dashboard">
      <div className="ambient" aria-hidden />

      <header className="dash-header animate-rise">
        <div className="brand-lockup">
          <div className="brand-mark">VMM</div>
          <div>
            <p className="brand-eyebrow">CompData</p>
            <h1 className="brand-title">Competitor Intelligence</h1>
          </div>
        </div>
        <p className="header-tagline">
          Drop a Vishal Mega Mart coordinate — pull nearby retail rivals,
          ratings, and store details in one view.
        </p>
      </header>

      <section className="panel search-panel animate-rise">
        <header className="panel-head">
          <h2>Your VMM store</h2>
          <span className={`source-badge ${source}`}>
            {source === "google" ? "Google Places live" : "Demo dataset"}
          </span>
        </header>
        <StoreSearchForm
          values={form}
          onChange={setForm}
          onSubmit={() => runSearch(form)}
          loading={loading}
        />
        {(message || error) && (
          <div className={`banner ${error ? "error" : "info"}`}>
            <AlertCircle size={16} />
            <span>{error ?? message}</span>
          </div>
        )}
      </section>

      <StatsRow
        competitors={competitors}
        radiusKm={store.radiusKm}
        source={source}
      />

      <div className="main-grid">
        <section className="panel map-panel animate-rise">
          <header className="panel-head">
            <h2>Catchment map</h2>
            <span className="muted small">
              {store.lat.toFixed(4)}, {store.lng.toFixed(4)}
            </span>
          </header>
          <div className="map-frame">
            <CompetitorsMap store={store} competitors={competitors} />
          </div>
        </section>

        <TopCompetitorsPanel
          competitors={competitors}
          radiusKm={store.radiusKm}
          onViewAll={scrollToAnalysis}
        />
      </div>

      <div ref={analysisRef}>
        <FullCompetitionTable competitors={competitors} />
      </div>

      <footer className="dash-footer">
        <p>
          Paste a Google Maps API key in the form to pull live competitors in
          the browser (GitHub Pages supported). Store open dates and floor area
          are not published by Google — demo data includes illustrative values
          for those fields.
        </p>
      </footer>
    </div>
  );
}
