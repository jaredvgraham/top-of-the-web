"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ease, inputClasses, labelClasses } from "./types";

export default function OnboardingStart() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"start" | "resume">("start");

  const handleStart = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() || undefined }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Could not start onboarding");
      }
      router.push(`/onboarding/${data.token}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start");
      setLoading(false);
    }
  };

  const handleResume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Enter the email you used on your brief.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `/api/onboarding/resume?email=${encodeURIComponent(email.trim())}`
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Could not resume");
      }
      router.push(`/onboarding/${data.token}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not resume");
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease }}
      className="mx-auto max-w-xl"
    >
      <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-ink/45">
        Short brief
      </p>
      <h1 className="font-display mt-3 text-4xl font-medium tracking-tight text-ink sm:text-5xl">
        A little info is enough
      </h1>
      <p className="mt-4 text-[16px] leading-7 text-ink/60">
        Tell us what your business does. We&apos;ll handle the rest. Takes a
        couple minutes, auto-saves if you need a break.
      </p>

      <div className="mt-8 flex gap-2">
        <button
          type="button"
          onClick={() => setMode("start")}
          className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] ${
            mode === "start"
              ? "bg-ink text-paper"
              : "bg-ink/5 text-ink/50 hover:text-ink"
          }`}
        >
          Start new
        </button>
        <button
          type="button"
          onClick={() => setMode("resume")}
          className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] ${
            mode === "resume"
              ? "bg-ink text-paper"
              : "bg-ink/5 text-ink/50 hover:text-ink"
          }`}
        >
          Resume with email
        </button>
      </div>

      <div className="mt-8 rounded-3xl border border-ink/15 bg-paper p-6 sm:p-8">
        {mode === "start" ? (
          <div className="space-y-6">
            <div>
              <label className={labelClasses} htmlFor="start-email">
                Email (optional)
              </label>
              <input
                id="start-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClasses}
                placeholder="you@business.com"
              />
              <p className="mt-2 text-sm text-ink/45">
                Adding email now makes it easier to resume later if you lose the
                private link.
              </p>
            </div>
            <button
              type="button"
              disabled={loading}
              onClick={() => void handleStart()}
              className="group relative w-full overflow-hidden rounded-full bg-ink px-8 py-5 text-sm font-semibold uppercase tracking-[0.14em] text-paper disabled:opacity-60"
            >
              <span className="absolute inset-0 translate-y-full bg-accent transition-transform duration-300 ease-out group-hover:translate-y-0" />
              <span className="relative">
                {loading ? "Starting…" : "Start your site brief"}
              </span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleResume} className="space-y-6">
            <div>
              <label className={labelClasses} htmlFor="resume-email">
                Email
              </label>
              <input
                id="resume-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClasses}
                placeholder="you@business.com"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full overflow-hidden rounded-full bg-ink px-8 py-5 text-sm font-semibold uppercase tracking-[0.14em] text-paper disabled:opacity-60"
            >
              <span className="absolute inset-0 translate-y-full bg-accent transition-transform duration-300 ease-out group-hover:translate-y-0" />
              <span className="relative">
                {loading ? "Looking up…" : "Resume brief"}
              </span>
            </button>
          </form>
        )}

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
      </div>
    </motion.div>
  );
}
