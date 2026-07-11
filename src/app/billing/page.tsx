"use client";

import { FormEvent, useState } from "react";
import { motion } from "framer-motion";

const ease = [0.65, 0, 0.35, 1] as const;

export default function BillingPage() {
  const [websiteId, setWebsiteId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ websiteId: websiteId.trim() }),
      });
      const data = await res.json();

      if (!res.ok || !data.url) {
        setError(data.error || "Could not open billing portal");
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
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
            or manage your subscription.
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
            onChange={(e) => setWebsiteId(e.target.value)}
            required
            autoComplete="off"
            spellCheck={false}
            placeholder="Paste your website ID"
            className="mb-5 w-full border-b border-ink/25 bg-transparent py-3 font-mono text-base text-ink outline-none transition-colors placeholder:font-sans placeholder:text-ink/30 focus:border-accent"
          />

          {error && (
            <p className="mb-5 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink py-3.5 text-sm font-medium text-paper transition-colors hover:bg-accent disabled:opacity-55"
          >
            {loading ? "Opening…" : "Manage billing"}
          </button>
        </motion.form>
      </div>
    </div>
  );
}
