"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PREVIEW_GENERATE_STAGES } from "@/lib/preview/generateProgress";

const TIPS = [
  "We’re pulling real photos and copy from your Facebook page — not stock filler.",
  "A real person at Bsites custom-builds the final site. This demo is just a taste.",
  "Your demo stays private. It won’t show up on Google.",
  "Like the demo? You can lock in a live custom site in under 24 hours.",
  "Brand colors you picked are being tuned for contrast so text stays readable.",
  "If you leave this tab, we’ll email the demo link when it’s ready.",
  "Most demos finish in a few minutes. Bigger photo libraries take a little longer.",
  "We’ll open the demo here automatically the second it’s finished.",
] as const;

type Props = {
  active: boolean;
  /** Real percent from generate stream (0–100). */
  progressPercent: number;
  /** Current stage index from generate stream. */
  stageIndex: number;
};

export default function PreviewLoadingState({
  active,
  progressPercent,
  stageIndex,
}: Props) {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    if (!active) return;
    setTipIndex(0);
    const id = window.setInterval(() => {
      setTipIndex((i) => (i + 1) % TIPS.length);
    }, 7000);
    return () => window.clearInterval(id);
  }, [active]);

  if (!active) return null;

  const clampedStage = Math.max(
    0,
    Math.min(PREVIEW_GENERATE_STAGES.length - 1, stageIndex)
  );
  const percent = Math.max(0, Math.min(100, Math.round(progressPercent)));

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/75 px-5 backdrop-blur-md"
      role="status"
      aria-live="polite"
      aria-busy={percent < 100}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative w-full max-w-lg overflow-hidden rounded-[1.75rem] border border-paper/10 bg-paper p-7 text-ink shadow-2xl sm:p-9"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-40"
          style={{
            background:
              "radial-gradient(circle, rgba(91,46,158,0.28), transparent 70%)",
          }}
        />

        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
              Generating your demo
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-[1.75rem]">
              {percent >= 100
                ? "Demo ready — opening…"
                : "Stay with us — this is the hard part"}
            </h2>
          </div>
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ink/10 bg-ink/[0.03]"
            aria-hidden
          >
            {percent >= 100 ? (
              <span className="text-sm font-semibold text-accent">✓</span>
            ) : (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-ink/15 border-t-accent" />
            )}
          </div>
        </div>

        <p className="relative mt-3 text-sm leading-relaxed text-ink/60">
          Progress updates as each real build step finishes. Keep this tab open
          — if you leave, we’ll email the link when it’s ready.
        </p>

        <div className="relative mt-6">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/40">
            <span>Progress</span>
            <span>{percent}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink/10">
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-500 ease-out"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        <ul className="relative mt-7 space-y-2.5">
          {PREVIEW_GENERATE_STAGES.map((stage, index) => {
            const isCurrent = percent < 100 && index === clampedStage;
            const isPast = percent >= 100 || index < clampedStage;
            return (
              <li
                key={stage.key}
                className={`flex items-center gap-3 text-sm transition-colors duration-300 ${
                  isCurrent
                    ? "font-semibold text-ink"
                    : isPast
                      ? "text-ink/45"
                      : "text-ink/28"
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] transition-colors duration-300 ${
                    isCurrent
                      ? "bg-accent text-paper"
                      : isPast
                        ? "bg-accent/15 text-accent"
                        : "bg-ink/5 text-ink/30"
                  }`}
                >
                  {isCurrent ? (
                    <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-paper" />
                  ) : isPast ? (
                    "✓"
                  ) : (
                    index + 1
                  )}
                </span>
                <span>
                  {stage.label}
                  {isCurrent ? "…" : ""}
                </span>
              </li>
            );
          })}
        </ul>

        <div className="relative mt-7 min-h-[5.5rem] rounded-2xl border border-accent/15 bg-accent/[0.07] px-4 py-3.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">
            While you wait
          </p>
          <AnimatePresence mode="wait">
            <motion.p
              key={tipIndex}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.35 }}
              className="mt-1.5 text-sm leading-relaxed text-ink/75"
            >
              {TIPS[tipIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
