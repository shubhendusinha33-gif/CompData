"use client";

import { useRef, useState, useTransition } from "react";
import { Upload, Download, FileSpreadsheet, X } from "lucide-react";
import {
  bulkResultsToCsv,
  downloadCsv,
  parseStoreCsv,
  SAMPLE_UPLOAD_CSV,
  type BulkResultRow,
  type BulkStoreRow,
} from "@/lib/csv";
import { reverseGeocodeStoreName } from "@/lib/reverse-geocode";
import { searchCompetitors } from "@/lib/search-competitors";
import { competitorsToCsvRows } from "@/lib/csv";

function yieldToMain(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(() => resolve());
    } else {
      setTimeout(resolve, 0);
    }
  });
}

export default function BulkUploadPanel({
  radiusKm,
  apiKey,
}: {
  radiusKm: number;
  apiKey: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<BulkResultRow[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  const cancel = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setRunning(false);
    setStatus("Cancelled — partial results kept.");
  };

  const runBulk = async (stores: BulkStoreRow[]) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setRunning(true);
    setError(null);
    setRows([]);
    setProgress({ done: 0, total: stores.length });
    setStatus(`Processing ${stores.length} stores…`);

    const collected: BulkResultRow[] = [];

    try {
      for (let i = 0; i < stores.length; i++) {
        if (controller.signal.aborted) break;
        const store = stores[i];

        let storeName = `VMM — ${store.storeCd}`;
        try {
          const geo = await reverseGeocodeStoreName(
            store.lat,
            store.lng,
            controller.signal
          );
          storeName = geo.storeName;
        } catch {
          // keep code-based name
        }

        const result = await searchCompetitors({
          name: storeName,
          lat: store.lat,
          lng: store.lng,
          radiusKm,
          apiKey,
          signal: controller.signal,
        });

        const batch = competitorsToCsvRows(
          {
            storeCd: store.storeCd,
            name: result.store.name,
            lat: store.lat,
            lng: store.lng,
            radiusKm,
          },
          result.competitors,
          result.source
        );
        collected.push(...batch);

        startTransition(() => {
          setProgress({ done: i + 1, total: stores.length });
          setRows([...collected]);
          setStatus(
            `Processed ${i + 1}/${stores.length} — ${store.storeCd} (${result.competitors.length} comps)`
          );
        });

        // Keep UI responsive between stores (+ Nominatim politeness gap)
        await yieldToMain();
        await new Promise((r) => setTimeout(r, 350));
      }

      if (!controller.signal.aborted) {
        setStatus(
          `Complete — ${stores.length} stores, ${collected.length} competitor rows. Download CSV below.`
        );
      }
    } catch (e) {
      if (!(e instanceof DOMException && e.name === "AbortError")) {
        setError(e instanceof Error ? e.message : "Bulk run failed");
      }
    } finally {
      setRunning(false);
      abortRef.current = null;
    }
  };

  const onFile = async (file: File) => {
    try {
      const text = await file.text();
      const stores = parseStoreCsv(text);
      await runBulk(stores);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid CSV");
    }
  };

  const pct =
    progress.total > 0
      ? Math.round((progress.done / progress.total) * 100)
      : 0;

  return (
    <section className="panel bulk-panel">
      <header className="panel-head">
        <div>
          <h2>Bulk store upload</h2>
          <p className="panel-sub">
            Upload CSV with <code>Store cd</code>, <code>lat</code>,{" "}
            <code>Long</code> — portal processes each store without freezing,
            then export full competitor pack.
          </p>
        </div>
        <FileSpreadsheet size={18} className="panel-icon" />
      </header>

      <div className="bulk-actions">
        <button
          type="button"
          className="btn-primary"
          disabled={running || pending}
          onClick={() => inputRef.current?.click()}
        >
          <Upload size={15} />
          Upload store CSV
        </button>
        <button
          type="button"
          className="btn-ghost"
          onClick={() =>
            downloadCsv("vmm-store-upload-template.csv", SAMPLE_UPLOAD_CSV)
          }
        >
          <Download size={15} />
          Template
        </button>
        {running && (
          <button type="button" className="btn-ghost danger" onClick={cancel}>
            <X size={15} />
            Cancel
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) void onFile(file);
          }}
        />
      </div>

      {(running || progress.total > 0) && (
        <div className="progress-block">
          <div className="progress-meta">
            <span>
              {progress.done}/{progress.total} stores
            </span>
            <span>{pct}%</span>
          </div>
          <div className="progress-track" aria-hidden>
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      {status && <p className="bulk-status">{status}</p>}
      {error && <p className="bulk-error">{error}</p>}

      {rows.length > 0 && (
        <button
          type="button"
          className="btn-outline-full"
          onClick={() =>
            downloadCsv(
              `vmm-competitor-bulk-${new Date().toISOString().slice(0, 10)}.csv`,
              bulkResultsToCsv(rows)
            )
          }
        >
          <Download size={15} />
          Download full results CSV ({rows.length} rows)
        </button>
      )}
    </section>
  );
}
