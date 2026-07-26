"use client";

import React from "react";

const STAGES = [
  "Collecting business information",
  "Researching your company",
  "Understanding photos",
  "Writing conversion copy",
  "Designing the custom site",
  "Building home, services & about",
] as const;

type Props = {
  active: boolean;
  /** Elapsed ms since request started — used only for ambient messaging, not fake completion. */
  elapsedMs: number;
};

export default function PreviewLoadingState({ active, elapsedMs }: Props) {
  if (!active) return null;

  // Ambient stage index based on time — never claims a stage is "done"
  const stageIndex = Math.min(
    STAGES.length - 1,
    Math.floor(elapsedMs / 22000)
  );

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/70 px-5 backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="w-full max-w-md rounded-3xl border border-paper/10 bg-paper p-8 text-ink shadow-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
          Generating your demo
        </p>
        <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight">
          Building a taste of what’s possible
        </h2>
        <p className="mt-3 text-sm text-ink/60">
          Custom demos take a few minutes. Keep this tab open until it opens
          itself — leaving early can show an unfinished site.
        </p>

        <ul className="mt-8 space-y-3">
          {STAGES.map((label, index) => {
            const isCurrent = index === stageIndex;
            const isPast = index < stageIndex;
            return (
              <li
                key={label}
                className={`flex items-center gap-3 text-sm ${
                  isCurrent
                    ? "font-semibold text-ink"
                    : isPast
                      ? "text-ink/45"
                      : "text-ink/30"
                }`}
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] ${
                    isCurrent
                      ? "bg-accent text-paper"
                      : isPast
                        ? "bg-ink/10 text-ink/50"
                        : "bg-ink/5 text-ink/30"
                  }`}
                >
                  {isCurrent ? (
                    <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-paper" />
                  ) : (
                    index + 1
                  )}
                </span>
                <span>
                  {label}
                  {isCurrent ? "…" : ""}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
