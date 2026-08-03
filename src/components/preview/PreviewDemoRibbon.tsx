"use client";

import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";
import PreviewViewTracker from "@/components/preview/PreviewViewTracker";
import PreviewRevisePanel from "@/components/preview/PreviewRevisePanel";
import {
  REVISE_OPEN_EVENT,
  revisionCountBadge,
} from "@/lib/preview/revisionCopy";

type FocusPage = "home" | "services" | "about";

type QuotaState = {
  remaining: number;
  used: number;
  phase: "pre" | "post";
  purchased: boolean;
  max: number;
};

/** Persistent top ribbon on rendered demos. */
export default function PreviewDemoRibbon({
  slug,
  page = "home",
}: {
  slug: string;
  page?: FocusPage;
}) {
  const [open, setOpen] = useState(false);
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

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(REVISE_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(REVISE_OPEN_EVENT, onOpen);
  }, []);

  const badge = quota ? revisionCountBadge(quota) : null;

  return (
    <>
      <div
        className="sticky top-0 z-[55] w-full border-b border-ink/10 px-3 py-2.5 backdrop-blur-md sm:px-4"
        style={{ backgroundColor: "rgba(245,245,251,0.94)" }}
      >
        <PreviewViewTracker slug={slug} />
        <div className="mx-auto flex max-w-5xl flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-left text-[11px] leading-snug text-ink/70 break-words sm:text-[13px]">
              <span className="font-semibold text-ink">Demo only.</span> Your
              real custom site can be live in 24 hours.{" "}
              <Link
                href={`/preview/${slug}/claim`}
                className="font-semibold text-accent underline-offset-2 hover:underline"
              >
                Claim it now
              </Link>
            </p>
            {badge ? (
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] ${
                    badge.depleted
                      ? "bg-ink/10 text-ink/55"
                      : badge.used === badge.max - 1
                        ? "bg-amber-500/15 text-amber-900"
                        : "bg-accent/15 text-accent"
                  }`}
                >
                  AI {badge.count}
                </span>
                <span className="text-[11px] leading-snug text-ink/50 sm:text-xs">
                  {badge.detail}
                </span>
              </div>
            ) : (
              <p className="mt-1.5 text-[11px] text-ink/35">
                Checking revision balance…
              </p>
            )}
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2 self-start sm:self-auto">
            {quota && !badge?.depleted ? (
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="rounded-full bg-accent px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-paper transition hover:opacity-90"
              >
                Request changes
                <span className="ml-1.5 tabular-nums opacity-80">
                  ({quota.used}/{quota.max})
                </span>
              </button>
            ) : quota && badge?.depleted ? (
              <Link
                href={`/preview/${slug}/claim`}
                className="rounded-full border border-ink/15 bg-white/80 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink transition hover:border-accent/40 hover:text-accent"
              >
                {quota.purchased
                  ? "Human build next"
                  : "Claim — 2 more AI + unlimited"}
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      <PreviewRevisePanel
        slug={slug}
        page={page}
        open={open}
        remaining={quota?.remaining ?? 0}
        used={quota?.used ?? 0}
        phase={quota?.phase ?? "pre"}
        max={quota?.max ?? 2}
        onClose={() => setOpen(false)}
        onQuotaChange={(next) =>
          setQuota((prev) => {
            const max = prev?.max ?? 2;
            return {
              remaining: next.remaining,
              used: Math.max(0, max - next.remaining),
              phase: next.phase,
              purchased: next.purchased,
              max,
            };
          })
        }
      />
    </>
  );
}
