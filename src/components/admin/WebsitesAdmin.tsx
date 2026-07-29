"use client";

import {
  FormEvent,
  MouseEvent,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";

type SubscriptionInfo = {
  status: "active" | "canceling" | "canceled" | "past_due" | "none" | "unknown";
  cancelAt: number | null;
  canceledAt: number | null;
  currentPeriodEnd: number | null;
};

type WebsiteRow = {
  id: string;
  name: string;
  email: string;
  url: string;
  description: string;
  pack: string;
  plan: string;
  createdAt?: string;
  subscription: SubscriptionInfo;
  customer: {
    id: string;
    email: string;
    phone: string;
    customerId: string;
  } | null;
  order: {
    id: string;
    progress: number;
    pack: string;
    plan: string;
    success: boolean;
    phone: string;
  } | null;
};

type EditForm = {
  name: string;
  email: string;
  url: string;
  description: string;
  pack: string;
  plan: string;
  phone: string;
  progress: number;
};

const emptyForm: EditForm = {
  name: "",
  email: "",
  url: "",
  description: "",
  pack: "",
  plan: "",
  phone: "",
  progress: 0,
};

const ease = [0.65, 0, 0.35, 1] as const;

function toForm(site: WebsiteRow): EditForm {
  return {
    name: site.name,
    email: site.email,
    url: site.url,
    description: site.description,
    pack: site.pack,
    plan: site.plan,
    phone: site.customer?.phone || site.order?.phone || "",
    progress: site.order?.progress ?? 0,
  };
}

function formatDate(value?: string | number | null) {
  if (!value) return null;
  try {
    const date =
      typeof value === "number" ? new Date(value * 1000) : new Date(value);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return null;
  }
}

function subscriptionLabel(status: SubscriptionInfo["status"]) {
  switch (status) {
    case "active":
      return "Active";
    case "canceling":
      return "Canceling";
    case "canceled":
      return "Canceled";
    case "past_due":
      return "Past due";
    case "none":
      return "No sub";
    default:
      return "Unknown";
  }
}

function subscriptionTone(
  status: SubscriptionInfo["status"]
): "paid" | "pending" | "muted" | "danger" | "warn" {
  switch (status) {
    case "active":
      return "paid";
    case "canceling":
      return "warn";
    case "canceled":
      return "danger";
    case "past_due":
      return "pending";
    default:
      return "muted";
  }
}

function hrefFor(url: string) {
  return url.startsWith("http") ? url : `https://${url}`;
}

export default function WebsitesAdmin() {
  const [websites, setWebsites] = useState<WebsiteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<EditForm>(emptyForm);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "canceled" | "canceling" | "past_due" | "none"
  >("all");
  const [portalLoading, setPortalLoading] = useState(false);
  const detailRef = useRef<HTMLElement | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/websites", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setWebsites(data.websites || []);
    } catch {
      setError("Could not load websites.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const selected = websites.find((w) => w.id === selectedId) || null;

  const openEdit = (site: WebsiteRow) => {
    setSelectedId(site.id);
    setForm(toForm(site));
    setMessage("");
    window.setTimeout(() => {
      detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const closeEdit = () => {
    setSelectedId(null);
    setForm(emptyForm);
    setMessage("");
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch(`/api/admin/websites/${selectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          url: form.url,
          description: form.description,
          pack: form.pack,
          plan: form.plan,
          phone: form.phone,
          progress: form.progress,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(data.error || `Save failed (${res.status})`);
        return;
      }

      const saved = data.website;
      if (!saved?.id) {
        setMessage("Save failed — empty response");
        return;
      }

      setWebsites((prev) =>
        prev.map((w) =>
          w.id === selectedId
            ? {
                ...w,
                ...saved,
                // Keep Stripe subscription + fall back if side updates omitted them
                subscription: w.subscription,
                customer: saved.customer ?? w.customer,
                order: saved.order ?? w.order,
              }
            : w
        )
      );
      setForm((f) => ({
        ...f,
        name: saved.name ?? f.name,
        email: saved.email ?? f.email,
        url: saved.url ?? f.url,
        description: saved.description ?? f.description,
        pack: saved.pack ?? f.pack,
        plan: saved.plan ?? f.plan,
        phone: saved.customer?.phone || saved.order?.phone || f.phone,
        progress: saved.order?.progress ?? f.progress,
      }));
      setMessage("Saved");
    } catch {
      setMessage("Save failed — network error");
    } finally {
      setSaving(false);
    }
  };

  const openBillingPortal = async () => {
    if (!selected?.email) return;
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: selected.email }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setMessage(data.error || "Could not open billing portal");
        return;
      }
      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch {
      setMessage("Could not open billing portal");
    } finally {
      setPortalLoading(false);
    }
  };

  const filtered = websites.filter((w) => {
    const status = w.subscription?.status || "none";
    if (statusFilter === "active") {
      if (status !== "active" && status !== "canceling") return false;
    } else if (statusFilter !== "all" && status !== statusFilter) {
      return false;
    }

    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [w.id, w.name, w.email, w.url, w.pack, w.plan, w.customer?.phone]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q));
  });

  const withUrl = websites.filter((w) => w.url).length;
  const activeSubs = websites.filter(
    (w) =>
      w.subscription?.status === "active" ||
      w.subscription?.status === "canceling"
  ).length;
  const canceledSubs = websites.filter(
    (w) => w.subscription?.status === "canceled"
  ).length;

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
            Clients
          </p>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-display text-4xl font-medium tracking-tight text-ink sm:text-5xl">
                Websites
              </h1>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-ink/55">
                Sites, URLs, and the customers behind them.
              </p>
            </div>

            {!loading && !error && (
              <div className="grid grid-cols-2 gap-4 text-sm sm:flex sm:gap-8">
                <MetaStat label="Total" value={websites.length} />
                <MetaStat label="Active" value={activeSubs} />
                <MetaStat label="Canceled" value={canceledSubs} />
                <MetaStat label="Live URL" value={withUrl} />
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
                { id: "all", label: "All" },
                { id: "active", label: "Active" },
                { id: "canceled", label: "Canceled" },
                { id: "canceling", label: "Canceling" },
                { id: "past_due", label: "Past due" },
                { id: "none", label: "No sub" },
              ] as const
            ).map((filter) => {
              const active = statusFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setStatusFilter(filter.id)}
                  className={`shrink-0 rounded-full px-4 py-2.5 text-xs font-medium uppercase tracking-[0.14em] transition-colors ${
                    active
                      ? "bg-ink text-paper"
                      : "border border-ink/10 bg-white/70 text-ink/50 hover:text-ink"
                  }`}
                >
                  {filter.label}
                  {filter.id === "canceled" && canceledSubs > 0
                    ? ` (${canceledSubs})`
                    : ""}
                  {filter.id === "active" && activeSubs > 0
                    ? ` (${activeSubs})`
                    : ""}
                </button>
              );
            })}
          </div>

          <div className="relative w-full max-w-md">
            <svg
              className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.75}
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-4.35-4.35M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z"
              />
            </svg>
            <input
              type="search"
              placeholder="Search id, name, email, url…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full border-b border-ink/20 bg-transparent py-3 pl-7 pr-3 text-sm text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-accent"
            />
          </div>
        </motion.div>

        {loading && (
          <div className="space-y-3 py-6">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-24 animate-pulse border border-ink/5 bg-white/50"
                style={{ animationDelay: `${i * 80}ms` }}
              />
            ))}
          </div>
        )}

        {error && (
          <div className="border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
            <button
              type="button"
              onClick={load}
              className="ml-3 underline underline-offset-2"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)] lg:items-start">
            <div className="min-w-0 space-y-2">
              {filtered.length === 0 && (
                <div className="border border-dashed border-ink/15 px-6 py-16 text-center">
                  <p className="font-display text-xl text-ink/70">
                    No websites found
                  </p>
                  <p className="mt-2 text-sm text-ink/40">
                    {query
                      ? "Try a different search."
                      : "New checkouts will show up here."}
                  </p>
                </div>
              )}

              {filtered.map((site, index) => {
                const progress = site.order?.progress ?? 0;
                const active = selectedId === site.id;
                return (
                  <motion.button
                    key={site.id}
                    type="button"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.45,
                      ease,
                      delay: Math.min(index * 0.04, 0.24),
                    }}
                    onClick={() => openEdit(site)}
                    className={`group w-full min-w-0 max-w-full border px-4 py-4 text-left transition-all duration-300 sm:px-5 ${
                      active
                        ? "border-accent/40 bg-white shadow-[0_0_0_1px_rgba(91,46,158,0.12)]"
                        : "border-ink/8 bg-white/70 hover:border-ink/20 hover:bg-white"
                    }`}
                  >
                    <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <div className="mb-2 flex min-w-0 items-center gap-2">
                          <span className="shrink-0 text-[10px] font-medium uppercase tracking-[0.16em] text-ink/35">
                            ID
                          </span>
                          <code className="min-w-0 truncate font-mono text-xs text-accent">
                            {site.id}
                          </code>
                        </div>

                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                          <h2 className="min-w-0 max-w-full truncate font-display text-lg font-medium text-ink">
                            {site.name || "Untitled site"}
                          </h2>
                          <StatusChip
                            tone={subscriptionTone(
                              site.subscription?.status || "none"
                            )}
                          >
                            {subscriptionLabel(
                              site.subscription?.status || "none"
                            )}
                          </StatusChip>
                          {site.order?.success ? (
                            <StatusChip tone="paid">Paid</StatusChip>
                          ) : site.order ? (
                            <StatusChip tone="pending">Pending</StatusChip>
                          ) : null}
                          {!site.url && (
                            <StatusChip tone="muted">No URL</StatusChip>
                          )}
                        </div>

                        <p className="mt-1 truncate text-sm text-ink/50">
                          {site.email || "No email"}
                        </p>

                        <div className="mt-2 flex min-w-0 flex-col items-start gap-1.5">
                          {(site.customer?.phone || site.order?.phone) ? (
                            <a
                              href={`tel:${(site.customer?.phone || site.order?.phone || "").replace(/\s+/g, "")}`}
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex max-w-full items-center gap-2 text-sm font-medium tabular-nums tracking-wide text-ink transition-colors hover:text-accent"
                            >
                              <svg
                                className="h-3.5 w-3.5 shrink-0 text-aqua"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                                aria-hidden
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
                                />
                              </svg>
                              <span className="truncate">
                                {site.customer?.phone || site.order?.phone}
                              </span>
                            </a>
                          ) : (
                            <p className="text-sm text-ink/30">No phone</p>
                          )}

                          {site.url ? (
                            <a
                              href={hrefFor(site.url)}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="block max-w-full truncate text-sm text-accent transition-opacity hover:opacity-70"
                            >
                              {site.url}
                            </a>
                          ) : (
                            <p className="text-sm italic text-ink/30">
                              Add a live URL
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex shrink-0 items-end justify-between gap-4 sm:flex-col sm:items-end sm:text-right">
                        <p className="max-w-[10rem] truncate text-[11px] uppercase tracking-[0.14em] text-ink/35 sm:max-w-[8rem]">
                          {site.pack || "—"}
                        </p>
                        {site.order && (
                          <p className="font-display text-2xl tabular-nums text-ink">
                            {progress}
                            <span className="text-sm text-ink/40">%</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {site.order && (
                      <div className="mt-4 h-[2px] w-full overflow-hidden bg-ink/8">
                        <div
                          className="h-full bg-accent transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            <aside
              ref={detailRef}
              className="min-w-0 max-w-full lg:sticky lg:top-20"
            >
              <AnimatePresence mode="wait">
                {selected ? (
                  <motion.form
                    key={selected.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.35, ease }}
                    onSubmit={handleSave}
                    className="max-w-full overflow-hidden border border-ink/10 bg-white p-5 sm:p-7"
                  >
                    <div className="mb-6 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={closeEdit}
                          className="mb-3 text-sm text-ink/45 lg:hidden"
                        >
                          ← Back to list
                        </button>
                        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-ink/40">
                          Edit
                        </p>
                        <h2 className="mt-1 break-words font-display text-2xl text-ink">
                          {form.name || "Untitled"}
                        </h2>
                        {formatDate(selected.createdAt) && (
                          <p className="mt-1 text-xs text-ink/40">
                            Created {formatDate(selected.createdAt)}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={closeEdit}
                        className="hidden text-ink/35 transition-colors hover:text-ink lg:block"
                        aria-label="Close"
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18 18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>

                    <div className="mb-6 border border-ink/8 bg-paper/80 px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-ink/40">
                          Website ID
                        </p>
                        <CopyIdButton id={selected.id} />
                      </div>
                      <p className="mt-2 break-all font-mono text-sm leading-relaxed text-ink">
                        {selected.id}
                      </p>
                    </div>

                    <div className="space-y-5">
                      <Field
                        label="Name"
                        value={form.name}
                        onChange={(v) => setForm((f) => ({ ...f, name: v }))}
                      />
                      <Field
                        label="Email"
                        value={form.email}
                        onChange={(v) => setForm((f) => ({ ...f, email: v }))}
                      />
                      <Field
                        label="Website URL"
                        value={form.url}
                        onChange={(v) => setForm((f) => ({ ...f, url: v }))}
                        placeholder="https://example.com"
                      />
                      <div>
                        <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.16em] text-ink/45">
                          Description
                        </label>
                        <textarea
                          value={form.description}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              description: e.target.value,
                            }))
                          }
                          rows={3}
                          className="w-full resize-y border-b border-ink/20 bg-transparent py-2 text-sm text-ink outline-none transition-colors placeholder:text-ink/30 focus:border-accent"
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Field
                          label="Pack"
                          value={form.pack}
                          onChange={(v) => setForm((f) => ({ ...f, pack: v }))}
                        />
                        <Field
                          label="Plan"
                          value={form.plan}
                          onChange={(v) => setForm((f) => ({ ...f, plan: v }))}
                        />
                      </div>

                      <Field
                        label="Customer phone"
                        value={form.phone}
                        onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
                      />
                    </div>

                    {selected.customer && (
                      <div className="mt-6 border-t border-ink/8 pt-5">
                        <div className="mb-4">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-ink/40">
                              Subscription
                            </p>
                            <StatusChip
                              tone={subscriptionTone(
                                selected.subscription?.status || "none"
                              )}
                            >
                              {subscriptionLabel(
                                selected.subscription?.status || "none"
                              )}
                            </StatusChip>
                          </div>
                          {selected.subscription?.status === "canceling" &&
                            formatDate(selected.subscription.cancelAt) && (
                              <p className="mt-2 text-xs text-ink/50">
                                Ends {formatDate(selected.subscription.cancelAt)}
                              </p>
                            )}
                          {selected.subscription?.status === "canceled" &&
                            formatDate(selected.subscription.canceledAt) && (
                              <p className="mt-2 text-xs text-ink/50">
                                Canceled{" "}
                                {formatDate(selected.subscription.canceledAt)}
                              </p>
                            )}
                          {selected.subscription?.status === "active" &&
                            formatDate(
                              selected.subscription.currentPeriodEnd
                            ) && (
                              <p className="mt-2 text-xs text-ink/50">
                                Renews{" "}
                                {formatDate(
                                  selected.subscription.currentPeriodEnd
                                )}
                              </p>
                            )}
                        </div>
                        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-ink/40">
                          Stripe customer
                        </p>
                        <p className="mt-2 break-all font-mono text-xs leading-relaxed text-ink/55">
                          {selected.customer.customerId}
                        </p>
                        <button
                          type="button"
                          onClick={openBillingPortal}
                          disabled={portalLoading}
                          className="mt-4 w-full border border-ink/15 py-2.5 text-sm font-medium text-ink transition-colors hover:border-accent hover:text-accent disabled:opacity-55"
                        >
                          {portalLoading
                            ? "Opening…"
                            : "Update payment method"}
                        </button>
                        <p className="mt-2 text-xs text-ink/40">
                          Opens Stripe billing portal for this customer.
                        </p>
                      </div>
                    )}

                    {!selected.customer && selected.subscription && (
                      <div className="mt-6 border-t border-ink/8 pt-5">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-ink/40">
                            Subscription
                          </p>
                          <StatusChip
                            tone={subscriptionTone(
                              selected.subscription.status
                            )}
                          >
                            {subscriptionLabel(selected.subscription.status)}
                          </StatusChip>
                        </div>
                      </div>
                    )}

                    {selected.order && (
                      <div className="mt-6 border-t border-ink/8 pt-5">
                        <div className="mb-3 flex items-center justify-between">
                          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-ink/40">
                            Build progress
                          </p>
                          <span className="font-display text-xl tabular-nums text-ink">
                            {form.progress}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={form.progress}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              progress: Number(e.target.value),
                            }))
                          }
                          className="admin-range w-full"
                        />
                        <p className="mt-2 text-xs text-ink/40">
                          {selected.order.success ? "Paid" : "Pending"} ·{" "}
                          {selected.order.pack} / {selected.order.plan}
                        </p>
                      </div>
                    )}

                    <div className="mt-8 flex items-center gap-3">
                      <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 bg-ink py-3 text-sm font-medium text-paper transition-colors hover:bg-accent disabled:opacity-55"
                      >
                        {saving ? "Saving…" : "Save changes"}
                      </button>
                      <AnimatePresence>
                        {message && (
                          <motion.p
                            initial={{ opacity: 0, x: 6 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }}
                            className={`text-sm ${
                              message === "Saved"
                                ? "text-aqua"
                                : "text-red-600"
                            }`}
                          >
                            {message}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.form>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hidden border border-dashed border-ink/12 px-6 py-16 text-center lg:block"
                  >
                    <p className="font-display text-lg text-ink/50">
                      Select a site
                    </p>
                    <p className="mt-2 text-sm text-ink/35">
                      Details and edits open here.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

function MetaStat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink/40">
        {label}
      </p>
      <p className="mt-0.5 font-display text-2xl tabular-nums text-ink">
        {value}
      </p>
    </div>
  );
}

function StatusChip({
  children,
  tone,
}: {
  children: ReactNode;
  tone: "paid" | "pending" | "muted" | "danger" | "warn";
}) {
  const styles =
    tone === "paid"
      ? "bg-aqua/15 text-aqua"
      : tone === "pending"
        ? "bg-accent/10 text-accent"
        : tone === "danger"
          ? "bg-red-500/10 text-red-600"
          : tone === "warn"
            ? "bg-amber-500/15 text-amber-700"
            : "bg-ink/5 text-ink/40";
  return (
    <span
      className={`inline-flex px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] ${styles}`}
    >
      {children}
    </span>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.16em] text-ink/45">
        {label}
      </label>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border-b border-ink/20 bg-transparent py-2 text-sm text-ink outline-none transition-colors placeholder:text-ink/30 focus:border-accent"
      />
    </div>
  );
}

function CopyIdButton({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async (e: MouseEvent) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="text-[11px] font-medium uppercase tracking-[0.14em] text-accent transition-opacity hover:opacity-70"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
