"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Footer from "@/components/HomePage/Footer";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";
import {
  emptySession,
  type OnboardingSession,
} from "@/components/onboarding/types";

type Props = {
  token: string;
};

export default function OnboardingTokenClient({ token }: Props) {
  const [session, setSession] = useState<OnboardingSession | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/onboarding/${token}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Session not found");
        }
        if (!cancelled) {
          setSession(data.session);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load");
          setSession(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <>
      <main className="relative min-h-screen overflow-hidden px-5 pb-20 pt-28 sm:px-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 10% -10%, rgba(91,46,158,0.12), transparent 55%), radial-gradient(ellipse 60% 40% at 90% 20%, rgba(31,182,214,0.1), transparent 50%), linear-gradient(180deg, #f5f5fb 0%, #ebe8f7 100%)",
          }}
        />

        {loading && (
          <p className="mx-auto max-w-3xl text-ink/50">Loading your brief…</p>
        )}

        {!loading && error && (
          <div className="mx-auto max-w-xl rounded-3xl border border-ink/15 bg-paper p-8 text-center">
            <h1 className="font-display text-3xl text-ink">Link not found</h1>
            <p className="mt-3 text-ink/60">{error}</p>
            <Link
              href="/onboarding"
              className="mt-6 inline-block text-sm font-semibold uppercase tracking-[0.14em] text-accent"
            >
              Start or resume another brief
            </Link>
          </div>
        )}

        {!loading && session && (
          <OnboardingWizard
            initialSession={{
              ...emptySession(token),
              ...session,
            }}
          />
        )}
      </main>
      <Footer />
    </>
  );
}
