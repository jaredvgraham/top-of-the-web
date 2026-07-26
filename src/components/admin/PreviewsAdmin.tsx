"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type PreviewRow = {
  id: string;
  slug: string;
  email: string;
  status: string;
  facebookUrl: string;
  generation: { engine?: string; model?: string } | null;
  error: { code: string; message: string } | null;
  expiresAt?: string;
  createdAt?: string;
  updatedAt?: string;
  downloadable: boolean;
  paid: boolean;
  payment: {
    paid: boolean;
    orderSuccess: boolean;
    hasWebsite: boolean;
    pack: string;
    plan: string;
    websiteName: string;
    websiteUrl: string;
  };
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

function statusTone(status: string): "paid" | "pending" | "muted" | "danger" | "warn" {
  switch (status) {
    case "ready":
      return "paid";
    case "generating":
    case "scraping":
    case "queued":
      return "pending";
    case "failed":
      return "danger";
    case "expired":
      return "warn";
    default:
      return "muted";
  }
}

const toneClass: Record<ReturnType<typeof statusTone>, string> = {
  paid: "bg-emerald-500/10 text-emerald-800",
  pending: "bg-amber-500/10 text-amber-800",
  muted: "bg-ink/5 text-ink/50",
  danger: "bg-red-500/10 text-red-700",
  warn: "bg-orange-500/10 text-orange-800",
};

export default function PreviewsAdmin() {
  const [previews, setPreviews] = useState<PreviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [paidFilter, setPaidFilter] = useState<"all" | "paid" | "unpaid">("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "ready" | "generating" | "failed" | "expired"
  >("all");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const detailRef = useRef<HTMLElement | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/previews");
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setPreviews(data.previews || []);
    } catch {
      setError("Could not load preview generations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const selected = previews.find((p) => p.id === selectedId) || null;

  const openDetail = (row: PreviewRow) => {
    setSelectedId(row.id);
    setMessage("");
    window.setTimeout(() => {
      detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const downloadZip = async (row: PreviewRow) => {
    if (!row.downloadable) return;
    setDownloadingId(row.id);
    setMessage("");
    try {
      const res = await fetch(`/api/admin/previews/${row.id}/download`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMessage(data.error || "Download failed");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${row.slug || row.id}-website.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setMessage("Download started");
    } catch {
      setMessage("Download failed");
    } finally {
      setDownloadingId(null);
    }
  };

  const filtered = useMemo(() => {
    return previews.filter((p) => {
      if (paidFilter === "paid" && !p.paid) return false;
      if (paidFilter === "unpaid" && p.paid) return false;

      if (statusFilter !== "all") {
        if (statusFilter === "generating") {
          if (!["queued", "scraping", "generating"].includes(p.status)) {
            return false;
          }
        } else if (p.status !== statusFilter) {
          return false;
        }
      }

      const q = query.trim().toLowerCase();
      if (!q) return true;
      return [
        p.id,
        p.slug,
        p.email,
        p.facebookUrl,
        p.payment.websiteName,
        p.generation?.model,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [previews, paidFilter, statusFilter, query]);

  const paidCount = previews.filter((p) => p.paid).length;
  const unpaidCount = previews.length - paidCount;
  const readyCount = previews.filter((p) => p.status === "ready").length;

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
            Generations
          </p>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-display text-4xl font-medium tracking-tight text-ink sm:text-5xl">
                Previews
              </h1>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-ink/55">
                Facebook → website demos. Download the HTML as your build
                template. Paid = matching order or website on that email.
              </p>
            </div>

            {!loading && !error && (
              <div className="grid grid-cols-2 gap-4 text-sm sm:flex sm:gap-8">
                <MetaStat label="Total" value={previews.length} />
                <MetaStat label="Ready" value={readyCount} />
                <MetaStat label="Paid" value={paidCount} />
                <MetaStat label="Unpaid" value={unpaidCount} />
              </div>
            )}
          </div>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease, delay: 0.08 }}
          className="mb-6 space-y-4"
        >
          <div className="flex w-full max-w-full gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap sm:overflow-visible sm:pb-0 [&::-webkit-scrollbar]:hidden">
            {(
              [
                ["all", "All"],
                ["paid", "Paid"],
                ["unpaid", "Unpaid"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setPaidFilter(value)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition ${
                  paidFilter === value
                    ? "bg-ink text-paper"
                    : "bg-ink/5 text-ink/55 hover:bg-ink/10"
                }`}
              >
                {label}
              </button>
            ))}
            <span className="mx-1 hidden h-8 w-px bg-ink/10 sm:inline-block" />
            {(
              [
                ["all", "Any status"],
                ["ready", "Ready"],
                ["generating", "Building"],
                ["failed", "Failed"],
                ["expired", "Expired"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setStatusFilter(value)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition ${
                  statusFilter === value
                    ? "bg-accent text-paper"
                    : "bg-ink/5 text-ink/55 hover:bg-ink/10"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search slug, email, Facebook URL…"
            className="w-full max-w-md border-b border-ink/20 bg-transparent py-2 text-sm text-ink outline-none focus:border-accent"
          />
        </motion.div>

        {loading ? (
          <p className="text-sm text-ink/50">Loading previews…</p>
        ) : error ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-ink/50">No preview generations match.</p>
        ) : (
          <ul className="divide-y divide-ink/10 overflow-hidden rounded-3xl border border-ink/10 bg-white/70">
            {filtered.map((row) => (
              <li key={row.id}>
                <button
                  type="button"
                  onClick={() => openDetail(row)}
                  className={`flex w-full flex-col gap-2 px-4 py-4 text-left transition hover:bg-ink/[0.03] sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5 ${
                    selectedId === row.id ? "bg-accent/5" : ""
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-ink">{row.slug}</span>
                      <Chip
                        label={row.paid ? "Paid" : "Not paid"}
                        tone={row.paid ? "paid" : "muted"}
                      />
                      <Chip label={row.status} tone={statusTone(row.status)} />
                    </div>
                    <p className="mt-1 truncate text-sm text-ink/55">
                      {row.email}
                      {row.facebookUrl ? ` · ${row.facebookUrl}` : ""}
                    </p>
                  </div>
                  <div className="shrink-0 text-xs text-ink/40">
                    {formatDate(row.createdAt)}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}

        <AnimatePresence>
          {selected ? (
            <motion.aside
              ref={detailRef}
              key={selected.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.35, ease }}
              className="mt-8 rounded-3xl border border-ink/10 bg-white/80 p-5 sm:p-8"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/40">
                    Preview
                  </p>
                  <h2 className="mt-1 font-display text-2xl font-medium text-ink">
                    {selected.slug}
                  </h2>
                  <p className="mt-1 text-sm text-ink/55">{selected.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="self-start text-sm text-ink/45 hover:text-ink"
                >
                  Close
                </button>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <Chip
                  label={selected.paid ? "Paid" : "Not paid"}
                  tone={selected.paid ? "paid" : "muted"}
                />
                <Chip
                  label={selected.status}
                  tone={statusTone(selected.status)}
                />
                {selected.payment.pack ? (
                  <Chip
                    label={`${selected.payment.pack}${
                      selected.payment.plan
                        ? ` / ${selected.payment.plan}`
                        : ""
                    }`}
                    tone="muted"
                  />
                ) : null}
                {selected.generation?.model ? (
                  <Chip label={selected.generation.model} tone="muted" />
                ) : null}
              </div>

              <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
                <Field label="Facebook" value={selected.facebookUrl || "—"} />
                <Field label="Created" value={formatDate(selected.createdAt)} />
                <Field label="Expires" value={formatDate(selected.expiresAt)} />
                <Field
                  label="Client site"
                  value={
                    selected.payment.websiteName ||
                    selected.payment.websiteUrl ||
                    (selected.payment.hasWebsite ? "Linked website" : "None yet")
                  }
                />
                <Field
                  label="Payment source"
                  value={
                    selected.paid
                      ? [
                          selected.payment.orderSuccess ? "successful order" : null,
                          selected.payment.hasWebsite ? "website record" : null,
                        ]
                          .filter(Boolean)
                          .join(" + ") || "Paid"
                      : "No paid order or website for this email"
                  }
                />
                <Field label="Preview ID" value={selected.id} mono />
              </dl>

              {selected.error ? (
                <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {selected.error.message || selected.error.code}
                </p>
              ) : null}

              {message ? (
                <p className="mt-4 text-sm text-ink/60">{message}</p>
              ) : null}

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={`/preview/${selected.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex rounded-full border border-ink/15 px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-ink transition hover:border-ink/30"
                >
                  Open demo
                </a>
                <button
                  type="button"
                  disabled={!selected.downloadable || downloadingId === selected.id}
                  onClick={() => downloadZip(selected)}
                  className="inline-flex rounded-full bg-accent px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-paper transition hover:opacity-90 disabled:opacity-40"
                >
                  {downloadingId === selected.id
                    ? "Preparing…"
                    : "Download website code"}
                </button>
                {selected.facebookUrl ? (
                  <a
                    href={selected.facebookUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex rounded-full border border-ink/15 px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-ink/70 transition hover:border-ink/30"
                  >
                    Facebook page
                  </a>
                ) : null}
              </div>

              <p className="mt-4 text-xs leading-relaxed text-ink/40">
                ZIP includes index.html, services.html, about.html, site-spec.json,
                and a README — use it as the starting template for their custom
                build. Image URLs stay remote in the HTML.
              </p>
            </motion.aside>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

function MetaStat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/40">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl font-medium text-ink">{value}</p>
    </div>
  );
}

function Chip({
  label,
  tone,
}: {
  label: string;
  tone: keyof typeof toneClass;
}) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${toneClass[tone]}`}
    >
      {label}
    </span>
  );
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/40">
        {label}
      </dt>
      <dd
        className={`mt-1 break-all text-ink/80 ${mono ? "font-mono text-xs" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}
