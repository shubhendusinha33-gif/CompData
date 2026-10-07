"use client";

import dynamic from "next/dynamic";
import {
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { AlertCircle, Download } from "lucide-react";
import StoreSearchForm, {
  type SearchFormValues,
} from "@/components/StoreSearchForm";
import TopCompetitorsPanel from "@/components/TopCompetitorsPanel";
import FullCompetitionTable from "@/components/FullCompetitionTable";
import StatsRow from "@/components/StatsRow";
import BulkUploadPanel from "@/components/BulkUploadPanel";
import { DEFAULT_STORE } from "@/data/demo-competitors";
import {
  getStoredApiKey,
  setStoredApiKey,
} from "@/lib/google-places-browser";
import { searchCompetitors } from "@/lib/search-competitors";
import { resolveStoreName } from "@/lib/resolve-store-name";
import {
  bulkResultsToCsv,
  competitorsToCsvRows,
  downloadCsv,
} from "@/lib/csv";
import type { Competitor, StoreLocation } from "@/types/competitor";

const CompetitorsMap = dynamic(() => import("@/components/CompetitorsMap"), {
  ssr: false,
  loading: () => (
    <div className="map-skeleton flex h-full min-h-[280px] items-center justify-center">
      <span className="muted small">Loading map…</span>
    </div>
  ),
});

export default function Dashboard() {
  const [form, setForm] = useState<SearchFormValues>({
    name: DEFAULT_STORE.name,
    lat: String(DEFAULT_STORE.lat),
    lng: String(DEFAULT_STORE.lng),
    radius: "5",
    apiKey: "",
  });
  const [store, setStore] = useState<StoreLocation>({
    ...DEFAULT_STORE,
    radiusKm: 5,
  });
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [source, setSource] = useState<"google" | "demo">("demo");
  const [message, setMessage] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [resolvingName, setResolvingName] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeNav, setActiveNav] = useState<"search" | "bulk" | "review">(
    "search"
  );
  const [apiEditorOpen, setApiEditorOpen] = useState(false);
  const [apiDraft, setApiDraft] = useState("");
  const analysisRef = useRef<HTMLDivElement>(null);
  const bootstrapped = useRef(false);
  const searchAbort = useRef<AbortController | null>(null);

  const hasApiKey = Boolean(form.apiKey.trim());

  const saveApiKey = () => {
    const key = apiDraft.trim();
    setForm((prev) => ({ ...prev, apiKey: key }));
    setStoredApiKey(key);
    setApiDraft("");
    setApiEditorOpen(false);
  };

  const clearApiKey = () => {
    setForm((prev) => ({ ...prev, apiKey: "" }));
    setStoredApiKey("");
    setApiDraft("");
    setApiEditorOpen(false);
  };

  const goToSection = (
    id: "search" | "bulk" | "review",
    el?: HTMLElement | null
  ) => {
    setActiveNav(id);
    const target =
      el ??
      (id === "review"
        ? analysisRef.current
        : document.getElementById(id));
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const runSearch = useCallback(async (values: SearchFormValues) => {
    searchAbort.current?.abort();
    const controller = new AbortController();
    searchAbort.current = controller;

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
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;

      startTransition(() => {
        setStore(data.store);
        setCompetitors(data.competitors);
        setSource(data.source);
        setMessage(data.message);
      });
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  const autoName = useCallback(async () => {
    const lat = Number(form.lat);
    const lng = Number(form.lng);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      setError("Enter valid latitude and longitude first");
      return;
    }
    setResolvingName(true);
    setError(null);
    try {
      const { storeName } = await resolveStoreName(lat, lng, form.apiKey);
      setForm((prev) => ({ ...prev, name: storeName }));
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not resolve store name"
      );
    } finally {
      setResolvingName(false);
    }
  }, [form.lat, form.lng, form.apiKey]);

  const downloadCurrentCsv = useCallback(() => {
    const rows = competitorsToCsvRows(store, competitors, source);
    downloadCsv(
      `vmm-competitors-${store.lat.toFixed(4)}-${store.lng.toFixed(4)}.csv`,
      bulkResultsToCsv(rows)
    );
  }, [store, competitors, source]);

  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;
    const savedKey = getStoredApiKey();
    const initial = {
      ...form,
      apiKey: savedKey,
      radius: "5",
    };
    setForm(initial);

    void (async () => {
      try {
        const { storeName } = await resolveStoreName(
          Number(initial.lat),
          Number(initial.lng),
          savedKey
        );
        const named = { ...initial, name: storeName };
        setForm(named);
        await runSearch(named);
      } catch {
        await runSearch(initial);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-resolve only on Auto button / first load — not on every lat/lng keystroke

  const scrollToAnalysis = () => {
    goToSection("review", analysisRef.current);
  };

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-mark">VMM</div>
          <div>
            <p className="sidebar-eyebrow">Exec Check</p>
            <h1 className="sidebar-title">CompData</h1>
          </div>
        </div>
        <nav className="sidebar-nav">
          <button
            type="button"
            className={`nav-item ${activeNav === "search" ? "active" : ""}`}
            onClick={() => goToSection("search")}
          >
            Single store
          </button>
          <button
            type="button"
            className={`nav-item ${activeNav === "bulk" ? "active" : ""}`}
            onClick={() => goToSection("bulk")}
          >
            Bulk upload
          </button>
          <button
            type="button"
            className={`nav-item ${activeNav === "review" ? "active" : ""}`}
            onClick={() => goToSection("review", analysisRef.current)}
          >
            Review
          </button>
        </nav>

        <div className="sidebar-api">
          <p className="sidebar-api-label">Google Maps API key</p>
          {!apiEditorOpen ? (
            <>
              <p className="sidebar-api-status">
                {hasApiKey ? "Key saved — hidden" : "No key saved"}
              </p>
              <div className="sidebar-api-actions">
                <button
                  type="button"
                  className="btn-sidebar"
                  onClick={() => {
                    setApiDraft("");
                    setApiEditorOpen(true);
                  }}
                >
                  {hasApiKey ? "Change key" : "Add key"}
                </button>
                {hasApiKey && (
                  <button
                    type="button"
                    className="btn-sidebar danger"
                    onClick={clearApiKey}
                  >
                    Remove
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <input
                type="password"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                name="compdata-api-key-draft"
                value={apiDraft}
                onChange={(e) => setApiDraft(e.target.value)}
                placeholder="Paste new key"
                aria-label="Enter Google Maps API key"
              />
              <div className="sidebar-api-actions">
                <button
                  type="button"
                  className="btn-sidebar primary"
                  onClick={saveApiKey}
                  disabled={!apiDraft.trim()}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="btn-sidebar"
                  onClick={() => {
                    setApiDraft("");
                    setApiEditorOpen(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </>
          )}
          <p className="sidebar-api-help">
            Key is never shown after save. Needs Maps JavaScript API + Places
            API.
          </p>
        </div>

        <p className="sidebar-note">
          Official chains only, with mother company (D-Mart = Avenue
          Supermarts Limited, Zudio = Trent Limited). Local lookalikes such as
          Vivid Mart or “K D-Mart” are excluded.
        </p>
      </aside>

      <div className="main">
        <header className="topbar">
          <div>
            <p className="topbar-kicker">Competitor intelligence</p>
            <h2 className="topbar-title">Store catchment review</h2>
          </div>
          <div className="topbar-actions">
            <span className={`source-badge ${source}`}>
              {source === "google" ? "Live Places" : "Demo"}
            </span>
            <button
              type="button"
              className="btn-ghost"
              onClick={downloadCurrentCsv}
              disabled={competitors.length === 0 && !store}
            >
              <Download size={15} />
              CSV
            </button>
          </div>
        </header>

        <div className="dashboard">
          <section id="search" className="panel search-panel">
            <header className="panel-head">
              <h2>Store query</h2>
              <span className="muted small">
                Enter radius (km) · priority brands · nearest per brand
              </span>
            </header>
            <StoreSearchForm
              values={form}
              onChange={setForm}
              onSubmit={() => void runSearch(form)}
              onAutoName={() => void autoName()}
              onDownloadCsv={downloadCurrentCsv}
              loading={loading}
              resolvingName={resolvingName}
              hasResults={competitors.length > 0}
            />
            {(message || error) && (
              <div className={`banner ${error ? "error" : "info"}`}>
                <AlertCircle size={15} />
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
            <section className="panel map-panel">
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

          <div id="bulk">
            <BulkUploadPanel
              radiusKm={Number(form.radius) || store.radiusKm}
              apiKey={form.apiKey}
            />
          </div>

          <div id="review" ref={analysisRef}>
            <FullCompetitionTable competitors={competitors} />
          </div>

          <footer className="dash-footer">
            <p>
              Official-chain matching with mother company. Opened-on / size
              fields are usually unavailable from Google Places.
            </p>
            <p className="credit">
              Designed and Developed by <strong>Shubhendu Sinha</strong>
              {" · "}
              <span className="muted">build 2026-10-07 mother-company</span>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
