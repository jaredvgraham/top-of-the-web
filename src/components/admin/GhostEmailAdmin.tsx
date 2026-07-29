"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { GhostTemplateMeta } from "@/lib/ghostEmailTemplates";

type GhostRow = {
  id: string;
  leadToken: string;
  email: string;
  phone: string;
  name: string;
  businessName: string;
  city: string;
  state: string;
  leadStatus: string;
  leadExpired: boolean;
  previewId: string | null;
  previewSlug: string;
  previewStatus: string | null;
  previewExpired: boolean;
  previewExpiresAt: string | null;
  previewCreatedAt: string | null;
  facebookUrl: string;
  segment: "ready" | "expired";
  previewUrl: string;
  claimUrl: string;
  createdAt: string | null;
  updatedAt: string | null;
};

const ease = [0.65, 0, 0.35, 1] as const;

function formatDate(value?: string | null) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function MetaStat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink/40">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl font-medium text-ink">{value}</p>
    </div>
  );
}

export default function GhostEmailAdmin() {
  const [ghosts, setGhosts] = useState<GhostRow[]>([]);
  const [templates, setTemplates] = useState<GhostTemplateMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [segmentFilter, setSegmentFilter] = useState<"all" | "ready" | "expired">(
    "all"
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [templateId, setTemplateId] = useState<string>("demo_waiting");
  const [subject, setSubject] = useState("");
  const [sending, setSending] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewSubject, setPreviewSubject] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/ghost-email?segment=all", {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setGhosts(data.ghosts || []);
      const nextTemplates: GhostTemplateMeta[] = data.templates || [];
      setTemplates(nextTemplates);
      setTemplateId((current) => {
        if (current && nextTemplates.some((t) => t.id === current)) {
          return current;
        }
        return nextTemplates[0]?.id || "demo_waiting";
      });
      setSubject((current) => {
        if (current.trim()) return current;
        return nextTemplates[0]?.defaultSubject || "";
      });
    } catch {
      setError("Could not load ghost leads.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const selectedTemplate = templates.find((t) => t.id === templateId);

  const filtered = useMemo(() => {
    return ghosts.filter((g) => {
      if (segmentFilter !== "all" && g.segment !== segmentFilter) return false;
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return [
        g.email,
        g.name,
        g.businessName,
        g.city,
        g.state,
        g.previewSlug,
        g.phone,
        g.facebookUrl,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [ghosts, segmentFilter, query]);

  const readyCount = ghosts.filter((g) => g.segment === "ready").length;
  const expiredCount = ghosts.filter((g) => g.segment === "expired").length;

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectFiltered = () => {
    setSelectedIds(new Set(filtered.map((g) => g.id)));
  };

  const clearSelection = () => setSelectedIds(new Set());

  const selectedRows = useMemo(
    () => ghosts.filter((g) => selectedIds.has(g.id)),
    [ghosts, selectedIds]
  );

  const onTemplateChange = (id: string) => {
    setTemplateId(id);
    const meta = templates.find((t) => t.id === id);
    if (meta) setSubject(meta.defaultSubject);
    setShowPreview(false);
    setPreviewHtml("");
  };

  const runPreview = async () => {
    setMessage("");
    const ids =
      selectedRows.length > 0
        ? selectedRows.slice(0, 1).map((r) => r.id)
        : filtered.slice(0, 1).map((r) => r.id);

    if (!ids.length) {
      setMessage("No recipients to preview");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/admin/ghost-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId,
          subject,
          ids,
          dryRun: true,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(data.error || "Preview failed");
        return;
      }
      const sample = data.samples?.[0];
      if (!sample) {
        setMessage("No sample generated");
        return;
      }
      setPreviewSubject(sample.subject);
      setPreviewHtml(sample.html);
      setShowPreview(true);
    } catch {
      setMessage("Preview failed");
    } finally {
      setSending(false);
    }
  };

  const sendEmails = async () => {
    if (!selectedRows.length) {
      setMessage("Select at least one recipient");
      return;
    }

    const expiredInSelection = selectedRows.filter(
      (r) => r.segment === "expired"
    ).length;
    const warnExpired =
      selectedTemplate?.audience === "ready" && expiredInSelection
        ? `\n\nNote: ${expiredInSelection} selected have expired demos — their preview/claim links will be empty for this template.`
        : "";

    const ok = window.confirm(
      `Send “${selectedTemplate?.label || templateId}” to ${selectedRows.length} ghost lead(s)?${warnExpired}`
    );
    if (!ok) return;

    setSending(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/ghost-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId,
          subject,
          ids: selectedRows.map((r) => r.id),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(data.error || "Send failed");
        return;
      }
      const failCount = data.failed?.length || 0;
      setMessage(
        `Sent ${data.sent ?? 0} of ${data.requested ?? selectedRows.length}` +
          (failCount ? ` · ${failCount} failed` : "")
      );
      if ((data.sent ?? 0) > 0) clearSelection();
    } catch {
      setMessage("Send failed");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="grain relative min-h-[calc(100dvh-57px)] max-w-[100vw] overflow-x-hidden bg-paper">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse 70% 45% at 0% 0%, rgba(91,46,158,0.1), transparent 50%), radial-gradient(ellipse 50% 35% at 100% 20%, rgba(31,182,214,0.08), transparent 45%)",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-8 sm:px-8 sm:py-14">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="mb-8 sm:mb-10"
        >
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.24em] text-ink/45">
            Outreach
          </p>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-display text-4xl font-medium tracking-tight text-ink sm:text-5xl">
                Ghost leads
              </h1>
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-ink/55">
                People who became leads, generated a preview, and never claimed.
                Send HTML follow-ups with a link back to their demo.
              </p>
            </div>

            {!loading && !error && (
              <div className="grid grid-cols-3 gap-4 text-sm sm:flex sm:gap-8">
                <MetaStat label="Ghosts" value={ghosts.length} />
                <MetaStat label="Ready" value={readyCount} />
                <MetaStat label="Expired" value={expiredCount} />
              </div>
            )}
          </div>
        </motion.header>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease, delay: 0.06 }}
          className="mb-8 border border-ink/10 bg-paper/80 p-5 sm:p-6"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/45">
            Template
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((t) => {
              const active = t.id === templateId;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onTemplateChange(t.id)}
                  className={`rounded-xl border p-4 text-left transition ${
                    active
                      ? "border-accent bg-accent/5"
                      : "border-ink/10 hover:border-ink/25"
                  }`}
                >
                  <p className="text-sm font-medium text-ink">{t.label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-ink/50">
                    {t.description}
                  </p>
                  <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/35">
                    Best for {t.audience}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="mt-5">
            <label
              htmlFor="ghost-subject"
              className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/45"
            >
              Subject
            </label>
            <input
              id="ghost-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full border-b border-ink/20 bg-transparent py-3 text-base outline-none focus:border-accent"
              placeholder="Subject line"
            />
            <p className="mt-2 text-xs text-ink/40">
              Tokens: {"{{business}}"}, {"{{firstName}}"}, {"{{name}}"}
            </p>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={runPreview}
              disabled={sending || loading}
              className="rounded-full border border-ink/15 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-ink/70 transition hover:border-ink/30 disabled:opacity-50"
            >
              Preview HTML
            </button>
            <button
              type="button"
              onClick={sendEmails}
              disabled={sending || loading || selectedIds.size === 0}
              className="rounded-full bg-ink px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-paper disabled:opacity-50"
            >
              {sending
                ? "Working…"
                : `Send to ${selectedIds.size || 0} selected`}
            </button>
          </div>

          {message ? (
            <p className="mt-4 text-sm text-accent">{message}</p>
          ) : null}
        </motion.section>

        <AnimatePresence>
          {showPreview && previewHtml ? (
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.35, ease }}
              className="mb-8 border border-ink/10 bg-white"
            >
              <div className="flex items-center justify-between gap-3 border-b border-ink/10 px-4 py-3 sm:px-5">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink/40">
                    HTML preview
                  </p>
                  <p className="truncate text-sm text-ink">{previewSubject}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPreview(false)}
                  className="shrink-0 text-xs font-semibold uppercase tracking-[0.12em] text-ink/45 hover:text-ink"
                >
                  Close
                </button>
              </div>
              <iframe
                title="Email preview"
                srcDoc={previewHtml}
                className="h-[420px] w-full bg-[#F5F5FB]"
              />
            </motion.section>
          ) : null}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease, delay: 0.1 }}
          className="mb-6 space-y-4"
        >
          <div className="flex w-full max-w-full gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap sm:overflow-visible sm:pb-0 [&::-webkit-scrollbar]:hidden">
            {(
              [
                ["all", "All"],
                ["ready", "Ready demos"],
                ["expired", "Expired demos"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setSegmentFilter(value)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition ${
                  segmentFilter === value
                    ? "bg-ink text-paper"
                    : "bg-ink/5 text-ink/55 hover:bg-ink/10"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, business, email, slug…"
              className="w-full flex-1 border-b border-ink/20 bg-transparent py-2.5 text-sm outline-none focus:border-accent"
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={selectFiltered}
                className="rounded-full bg-ink/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink/60 hover:bg-ink/10"
              >
                Select filtered ({filtered.length})
              </button>
              <button
                type="button"
                onClick={clearSelection}
                className="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink/45 hover:text-ink"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={load}
                className="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink/45 hover:text-ink"
              >
                Refresh
              </button>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <p className="text-sm text-ink/50">Loading ghost leads…</p>
        ) : error ? (
          <p className="text-sm text-red-700">{error}</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-ink/50">
            No ghost leads match this filter. Paid emails and purchased leads
            are excluded.
          </p>
        ) : (
          <div className="overflow-x-auto border border-ink/10">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-ink/10 bg-ink/[0.03] text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/45">
                <tr>
                  <th className="px-3 py-3 w-10" />
                  <th className="px-3 py-3">Lead</th>
                  <th className="px-3 py-3">Preview</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Updated</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => {
                  const checked = selectedIds.has(row.id);
                  return (
                    <tr
                      key={row.id}
                      className={`border-b border-ink/5 transition ${
                        checked ? "bg-accent/5" : "hover:bg-ink/[0.02]"
                      }`}
                    >
                      <td className="px-3 py-3 align-top">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleSelected(row.id)}
                          aria-label={`Select ${row.email}`}
                          className="mt-1"
                        />
                      </td>
                      <td className="px-3 py-3 align-top">
                        <p className="font-medium text-ink">
                          {row.businessName || "—"}
                        </p>
                        <p className="text-ink/70">
                          {row.name || "No name"} · {row.email}
                        </p>
                        <p className="text-xs text-ink/40">
                          {[row.city, row.state].filter(Boolean).join(", ") ||
                            "—"}
                          {row.phone ? ` · ${row.phone}` : ""}
                        </p>
                      </td>
                      <td className="px-3 py-3 align-top">
                        <p className="font-mono text-xs text-ink/80">
                          {row.previewSlug || "—"}
                        </p>
                        {row.previewUrl ? (
                          <a
                            href={row.previewUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-accent hover:underline"
                          >
                            Open demo
                          </a>
                        ) : (
                          <span className="text-xs text-ink/40">No live link</span>
                        )}
                      </td>
                      <td className="px-3 py-3 align-top">
                        <span
                          className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                            row.segment === "ready"
                              ? "bg-emerald-500/10 text-emerald-800"
                              : "bg-orange-500/10 text-orange-800"
                          }`}
                        >
                          {row.segment}
                        </span>
                        <p className="mt-1 text-xs text-ink/40">
                          lead: {row.leadStatus}
                          {row.previewExpiresAt
                            ? ` · exp ${formatDate(row.previewExpiresAt)}`
                            : ""}
                        </p>
                      </td>
                      <td className="px-3 py-3 align-top text-ink/55">
                        {formatDate(row.updatedAt || row.previewCreatedAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
