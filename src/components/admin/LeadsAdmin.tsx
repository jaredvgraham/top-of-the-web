"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import AdminLeadCard from "@/components/admin/AdminLeadCard";
import type { AdminLeadRow } from "@/lib/adminLeads";

type SourceFilter = "all" | "meta" | "organic" | "contact";

type Payload = {
  source: SourceFilter;
  leads: AdminLeadRow[];
  counts: {
    total: number;
    meta: number;
    organic: number;
    contact: number;
    shown: number;
  };
};

const ease = [0.65, 0, 0.35, 1] as const;

const FILTERS: Array<[SourceFilter, string]> = [
  ["all", "All"],
  ["meta", "Meta ad"],
  ["organic", "Organic"],
  ["contact", "Contact"],
];

export default function LeadsAdmin() {
  const [source, setSource] = useState<SourceFilter>("all");
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/admin/leads?source=${encodeURIComponent(source)}&limit=300`,
        { cache: "no-store" }
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error || "Failed to load leads");
        setData(null);
        return;
      }
      setData(json as Payload);
      setSelectedIds(new Set());
    } catch {
      setError("Unable to load leads");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [source]);

  useEffect(() => {
    void load();
  }, [load]);

  const leads = data?.leads || [];

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllShown = () => {
    setSelectedIds(new Set(leads.map((l) => l.id)));
  };

  const clearSelection = () => setSelectedIds(new Set());

  const deleteIds = async (ids: string[]) => {
    if (!ids.length) return;
    const label =
      ids.length === 1
        ? "this lead"
        : `${ids.length} leads`;
    const ok = window.confirm(
      `Delete ${label}?\n\nThis permanently removes the Lead record(s). Paid websites/customers are not deleted.`
    );
    if (!ok) return;

    setMessage("");
    setDeletingIds(new Set(ids));
    try {
      const res = await fetch("/api/admin/leads/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(json.error || "Delete failed");
        return;
      }
      setMessage(`Deleted ${json.deleted ?? ids.length} lead(s)`);
      setData((prev) => {
        if (!prev) return prev;
        const removed = new Set(ids);
        const nextLeads = prev.leads.filter((l) => !removed.has(l.id));
        const contact = nextLeads.filter((l) => l.source === "contact").length;
        const meta = nextLeads.filter(
          (l) => l.source !== "contact" && l.fromMeta
        ).length;
        const organic = nextLeads.length - meta - contact;
        return {
          ...prev,
          leads: nextLeads,
          counts: {
            ...prev.counts,
            shown: nextLeads.length,
            // Approximate until refresh; full counts reload on next filter/refresh
            total: Math.max(0, prev.counts.total - (json.deleted ?? ids.length)),
            meta:
              source === "meta"
                ? nextLeads.length
                : source === "all"
                  ? meta
                  : prev.counts.meta,
            organic:
              source === "organic"
                ? nextLeads.length
                : source === "all"
                  ? organic
                  : prev.counts.organic,
            contact:
              source === "contact"
                ? nextLeads.length
                : source === "all"
                  ? contact
                  : prev.counts.contact,
          },
        };
      });
      setSelectedIds((prev) => {
        const next = new Set(prev);
        for (const id of ids) next.delete(id);
        return next;
      });
    } catch {
      setMessage("Delete failed");
    } finally {
      setDeletingIds(new Set());
    }
  };

  return (
    <main className="min-h-screen bg-paper px-4 pb-24 pt-24 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease }}
          className="mb-8"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/45">
            Bsites admin
          </p>
          <h1 className="mt-2 font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
            Leads
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-ink/55">
            Preview captures and contact-form inquiries. Meta ad = stored{" "}
            <code className="text-ink/70">fbclid</code>/
            <code className="text-ink/70">fbc</code> from an ad click. Contact =
            /contact form. Organic = other preview leads.
          </p>
        </motion.div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          {FILTERS.map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setSource(id)}
              className={`rounded-full px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] transition ${
                source === id
                  ? "bg-ink text-paper"
                  : "bg-ink/5 text-ink/55 active:bg-ink/10"
              }`}
            >
              {label}
              {data
                ? ` · ${
                    id === "all"
                      ? data.counts.total
                      : id === "meta"
                        ? data.counts.meta
                        : id === "contact"
                          ? data.counts.contact
                          : data.counts.organic
                  }`
                : ""}
            </button>
          ))}
          <button
            type="button"
            onClick={() => void load()}
            className="ml-auto rounded-full border border-ink/15 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-ink/60"
          >
            Refresh
          </button>
        </div>

        {leads.length > 0 ? (
          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
            <button
              type="button"
              onClick={selectAllShown}
              className="rounded-lg bg-ink/5 px-3 py-2 font-semibold uppercase tracking-[0.08em] text-ink/60"
            >
              Select all shown
            </button>
            {selectedIds.size > 0 ? (
              <>
                <button
                  type="button"
                  onClick={clearSelection}
                  className="rounded-lg bg-ink/5 px-3 py-2 font-semibold uppercase tracking-[0.08em] text-ink/60"
                >
                  Clear ({selectedIds.size})
                </button>
                <button
                  type="button"
                  onClick={() => void deleteIds(Array.from(selectedIds))}
                  disabled={deletingIds.size > 0}
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 font-semibold uppercase tracking-[0.08em] text-red-700 disabled:opacity-50"
                >
                  Delete selected ({selectedIds.size})
                </button>
              </>
            ) : null}
          </div>
        ) : null}

        {message ? (
          <p className="mb-4 rounded-xl border border-ink/10 bg-white/70 px-4 py-3 text-sm text-ink/70">
            {message}
          </p>
        ) : null}

        {loading && !data ? (
          <p className="text-sm text-ink/50">Loading leads…</p>
        ) : error ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : leads.length === 0 ? (
          <p className="text-sm text-ink/50">No leads for this filter.</p>
        ) : (
          <div className="border-t border-ink/10">
            {leads.map((lead) => (
              <AdminLeadCard
                key={lead.id}
                lead={lead}
                showSource
                selected={selectedIds.has(lead.id)}
                onToggleSelect={toggleSelect}
                onDelete={(id) => void deleteIds([id])}
                deleting={deletingIds.has(lead.id)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
