"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const STAGES = [
  "Collecting business information",
  "Researching your company",
  "Understanding your photos",
  "Writing conversion copy",
  "Designing the custom layout",
  "Building home, services & about",
] as const;

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
  /** Elapsed ms since request started — used only for ambient messaging, not fake completion. */
  elapsedMs: number;
};

function formatElapsed(ms: number) {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function PreviewLoadingState({ active, elapsedMs }: Props) {
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

  // Ambient stage index based on time — never claims a stage is "done"
  const stageIndex = Math.min(
    STAGES.length - 1,
    Math.floor(elapsedMs / 22000)
  );

  // Soft progress that asymptotes (~90%) so we never imply 100% before ready
  const progressPct = Math.min(
    92,
    Math.round(8 + (84 * elapsedMs) / (elapsedMs + 90_000))
  );

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/75 px-5 backdrop-blur-md"
      role="status"
      aria-live="polite"
      aria-busy="true"
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
              Stay with us — this is the hard part
            </h2>
          </div>
          <div className="shrink-0 rounded-full border border-ink/10 bg-ink/[0.03] px-3 py-1.5 font-mono text-sm tabular-nums text-ink/70">
            {formatElapsed(elapsedMs)}
          </div>
        </div>

        <p className="relative mt-3 text-sm leading-relaxed text-ink/60">
          Custom demos take a few minutes. Keep this tab open and we’ll open
          the site when it’s ready. If you leave, we’ll email the link.
        </p>

        <div className="relative mt-6">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/40">
            <span>Progress</span>
            <span>{progressPct}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink/10">
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-700 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <ul className="relative mt-7 space-y-2.5">
          {STAGES.map((label, index) => {
            const isCurrent = index === stageIndex;
            const isPast = index < stageIndex;
            return (
              <li
                key={label}
                className={`flex items-center gap-3 text-sm transition-colors duration-500 ${
                  isCurrent
                    ? "font-semibold text-ink"
                    : isPast
                      ? "text-ink/45"
                      : "text-ink/28"
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] transition-colors duration-500 ${
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
                  {label}
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
