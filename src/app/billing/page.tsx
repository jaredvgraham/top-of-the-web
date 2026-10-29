"use client";

import { FormEvent, useEffect, useState } from "react";
import { motion } from "framer-motion";

const ease = [0.65, 0, 0.35, 1] as const;
const WEBSITE_ID_KEY = "bsites-billing-website-id";

type ResubscribeMode = "checkout" | "resume";

type BillingAccount = {
  url: string;
  status: string;
  canResubscribe: boolean;
  mode: ResubscribeMode | null;
  cancelAt: number | null;
  canceledAt: number | null;
};

function formatUnixDate(unix: number | null) {
  if (!unix) return null;
  return new Date(unix * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function planMessage(account: BillingAccount) {
  if (account.mode === "resume") {
    const when = formatUnixDate(account.cancelAt);
    return when
      ? `Your monthly plan is set to end on ${when}. Resubscribe to keep hosting, updates, and monitoring. You won’t be charged again until the next renewal.`
      : "Your monthly plan is set to cancel. Resubscribe to keep it going. You won’t be charged again until the next renewal.";
  }

  const when = formatUnixDate(account.canceledAt);
  return when
    ? `Your monthly plan was canceled on ${when}. Resubscribe for $84/month to turn hosting and care back on. Your website stays as it is.`
    : "Your monthly plan is canceled. Resubscribe for $84/month to turn hosting and care back on. Your website stays as it is.";
}

export default function BillingPage() {
  const [websiteId, setWebsiteId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [resubscribeLoading, setResubscribeLoading] = useState(false);
  const [account, setAccount] = useState<BillingAccount | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("resubscribed") === "1") {
      setNotice("You’re subscribed again. Hosting and care are back on.");
    }
    const saved = window.sessionStorage.getItem(WEBSITE_ID_KEY);
    if (saved) setWebsiteId(saved);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");
    setAccount(null);

    const id = websiteId.trim();
    window.sessionStorage.setItem(WEBSITE_ID_KEY, id);

    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ websiteId: id }),
      });
      const data = await res.json();

      if (!res.ok || !data.url) {
        setError(data.error || "Could not open billing portal");
        return;
      }

      if (data.canResubscribe) {
        setAccount({
          url: data.url,
          status: data.status,
          canResubscribe: true,
          mode: data.mode === "resume" ? "resume" : "checkout",
          cancelAt: typeof data.cancelAt === "number" ? data.cancelAt : null,
          canceledAt:
            typeof data.canceledAt === "number" ? data.canceledAt : null,
        });
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResubscribe = async () => {
    if (!account) return;
    setResubscribeLoading(true);
    setError("");
    setNotice("");

    const id = websiteId.trim();
    window.sessionStorage.setItem(WEBSITE_ID_KEY, id);

    try {
      const res = await fetch("/api/stripe/resubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ websiteId: id }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Could not resubscribe");
        return;
      }

      if (data.resumed) {
        setAccount(null);
        setNotice("You’re subscribed again. This plan will keep renewing.");
        return;
      }

      if (!data.url) {
        setError("Could not start checkout");
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setResubscribeLoading(false);
    }
  };

  return (
    <div className="grain relative min-h-[100dvh] overflow-hidden bg-paper">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 20% -10%, rgba(91,46,158,0.14), transparent 55%), radial-gradient(ellipse 60% 40% at 90% 100%, rgba(31,182,214,0.1), transparent 50%)",
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-[100dvh] max-w-lg flex-col justify-center px-5 py-24 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease }}
        >
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.24em] text-ink/45">
            Account
          </p>
          <h1 className="font-display text-4xl font-medium tracking-tight text-ink sm:text-5xl">
            Billing
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-ink/55">
            Enter your website ID to update your payment method, view invoices,
            or manage your subscription. If you canceled, you can resubscribe
            here.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.08 }}
          onSubmit={handleSubmit}
          className="mt-10 border border-ink/10 bg-white/80 p-7 backdrop-blur-sm sm:p-8"
        >
          <label
            htmlFor="websiteId"
            className="mb-2 block text-[11px] font-medium uppercase tracking-[0.18em] text-ink/50"
          >
            Website ID
          </label>
          <input
            id="websiteId"
            type="text"
            value={websiteId}
            onChange={(e) => {
              setWebsiteId(e.target.value);
              setAccount(null);
            }}
            required
            autoComplete="off"
            spellCheck={false}
            placeholder="Paste your website ID"
            className="mb-5 w-full border-b border-ink/25 bg-transparent py-3 font-mono text-base text-ink outline-none transition-colors placeholder:font-sans placeholder:text-ink/30 focus:border-accent"
          />

          {notice && (
            <p className="mb-5 text-sm text-accent" role="status">
              {notice}
            </p>
          )}

          {error && (
            <p className="mb-5 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          {account?.canResubscribe ? (
            <div>
              <p className="mb-5 text-sm leading-relaxed text-ink/70">
                {planMessage(account)}
              </p>
              <button
                type="button"
                onClick={handleResubscribe}
                disabled={resubscribeLoading}
                className="w-full bg-ink py-3.5 text-sm font-medium text-paper transition-colors hover:bg-accent disabled:opacity-55"
              >
                {resubscribeLoading
                  ? account.mode === "resume"
                    ? "Resubscribing…"
                    : "Opening checkout…"
                  : "Resubscribe"}
              </button>
              <button
                type="button"
                onClick={() => {
                  window.location.href = account.url;
                }}
                className="mt-3 w-full border border-ink/15 py-3.5 text-sm font-medium text-ink/70 transition-colors hover:border-ink/30 hover:text-ink"
              >
                View invoices
              </button>
            </div>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ink py-3.5 text-sm font-medium text-paper transition-colors hover:bg-accent disabled:opacity-55"
            >
              {loading ? "Opening…" : "Manage billing"}
            </button>
          )}
        </motion.form>
      </div>
    </div>
  );
}
