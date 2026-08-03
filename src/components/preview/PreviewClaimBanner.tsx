"use client";

import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";
import {
  openRevisePanel,
  revisionCountBadge,
} from "@/lib/preview/revisionCopy";

type QuotaState = {
  remaining: number;
  used: number;
  phase: "pre" | "post";
  purchased: boolean;
  max: number;
};

export default function PreviewClaimBanner({ slug }: { slug: string }) {
  const [quota, setQuota] = useState<QuotaState | null>(null);

  const loadQuota = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/preview/${encodeURIComponent(slug)}/revise`,
        { cache: "no-store" }
      );
      if (!res.ok) return;
      const data = await res.json();
      const max = Number(data.max) || 2;
      const used =
        typeof data.used === "number"
          ? data.used
          : Math.max(0, max - (Number(data.remaining) || 0));
      setQuota({
        remaining: Number(data.remaining) || 0,
        used,
        phase: data.phase === "post" ? "post" : "pre",
        purchased: Boolean(data.purchased),
        max,
      });
    } catch {
      // non-blocking
    }
  }, [slug]);

  useEffect(() => {
    void loadQuota();
  }, [loadQuota]);

  const badge = quota ? revisionCountBadge(quota) : null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] w-full p-3 sm:p-5">
      <div className="pointer-events-auto mx-auto flex w-full max-w-3xl min-w-0 flex-col gap-3 rounded-2xl border border-ink/10 bg-paper/95 p-4 shadow-[0_12px_40px_rgba(26,20,51,0.18)] backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:gap-5 sm:p-5">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">
              Live in 24 hours from checkout
            </p>
            {badge ? (
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] ${
                  badge.depleted
                    ? "bg-ink/10 text-ink/55"
                    : badge.used === badge.max - 1
                      ? "bg-amber-500/15 text-amber-900"
                      : "bg-accent/15 text-accent"
                }`}
              >
                AI {badge.count}
              </span>
            ) : null}
          </div>
          <p className="mt-1 font-display text-lg font-semibold tracking-tight text-ink sm:text-xl">
            {badge?.depleted
              ? quota?.purchased
                ? "A real person finishes next — until you’re happy."
                : "Free AI used — claim for 2 more + unlimited human revisions."
              : "Want the real custom site? Lock it in now."}
          </p>
          {badge ? (
            <p className="mt-1 text-xs leading-snug text-ink/55">
              <span className="font-semibold text-ink/70">{badge.count}.</span>{" "}
              {badge.detail}
            </p>
          ) : null}
        </div>
        <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          {quota && !badge?.depleted ? (
            <button
              type="button"
              onClick={() => openRevisePanel()}
              className="inline-flex w-full items-center justify-center rounded-full border border-ink/15 bg-white/80 px-5 py-3.5 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-ink transition hover:border-accent/40 hover:text-accent sm:w-auto sm:px-5"
            >
              Refine demo ({quota.used}/{quota.max})
            </button>
          ) : null}
          <Link
            href={`/preview/${slug}/claim`}
            className="inline-flex w-full items-center justify-center rounded-full bg-accent px-5 py-3.5 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-paper transition hover:opacity-90 sm:w-auto sm:px-6"
          >
            {badge?.depleted && !quota?.purchased
              ? "Claim — 2 more AI + unlimited"
              : "Get my site live"}
          </Link>
        </div>
      </div>
    </div>
  );
}
