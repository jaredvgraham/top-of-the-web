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

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Enter your email to start or resume your brief.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      // Looks up an existing session for this email first; creates one only if none.
      const response = await fetch(
        `/api/onboarding/resume?email=${encodeURIComponent(email.trim())}`
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Could not open your brief");
      }
      router.push(`/onboarding/${data.token}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not open your brief"
      );
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

      <form
        onSubmit={handleContinue}
        className="mt-8 rounded-3xl border border-ink/15 bg-paper p-6 sm:p-8"
      >
        <div className="space-y-6">
          <div>
            <label className={labelClasses} htmlFor="onboarding-email">
              Email
            </label>
            <input
              id="onboarding-email"
              type="email"
              required
              autoComplete="email"
              inputMode="email"
              autoCapitalize="none"
              autoCorrect="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClasses}
              placeholder="you@business.com"
            />
            <p className="mt-2 text-sm text-ink/45">
              If you already started a brief with this email, we&apos;ll take you
              back to it.
            </p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full overflow-hidden rounded-full bg-ink px-8 py-5 text-sm font-semibold uppercase tracking-[0.14em] text-paper disabled:opacity-60"
          >
            <span className="absolute inset-0 translate-y-full bg-accent transition-transform duration-300 ease-out group-hover:translate-y-0" />
            <span className="relative">
              {loading ? "Opening…" : "Continue to your brief"}
            </span>
          </button>
        </div>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
      </form>
    </motion.div>
  );
}
