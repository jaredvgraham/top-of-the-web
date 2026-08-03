"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  consumeReviseDoneNotification,
  type ReviseDonePayload,
} from "@/lib/preview/revisionCopy";

/** Celebratory toast after a revision reload lands on the updated demo. */
export default function PreviewRevisionDoneToast({ slug }: { slug: string }) {
  const [payload, setPayload] = useState<ReviseDonePayload | null>(null);

  useEffect(() => {
    const next = consumeReviseDoneNotification(slug);
    if (next) setPayload(next);
  }, [slug]);

  useEffect(() => {
    if (!payload) return;
    const id = window.setTimeout(() => setPayload(null), 8000);
    return () => window.clearTimeout(id);
  }, [payload]);

  return (
    <AnimatePresence>
      {payload ? (
        <motion.div
          key="revise-done"
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 28, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          transition={{ duration: 0.45, ease: [0.65, 0, 0.35, 1] }}
          className="pointer-events-auto fixed inset-x-0 bottom-24 z-[80] flex justify-center px-4 sm:bottom-28"
        >
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-accent/25 bg-paper/95 p-4 shadow-[0_18px_50px_rgba(26,20,51,0.22)] backdrop-blur-md sm:p-5">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-50"
              style={{
                background:
                  "radial-gradient(circle, rgba(91,46,158,0.28), transparent 70%)",
              }}
            />
            <div className="relative flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-paper">
                ✓
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">
                  Revision done
                </p>
                <p className="font-display mt-1 text-lg font-semibold tracking-tight text-ink">
                  Your demo is updated
                </p>
                <p className="mt-1 text-sm leading-relaxed text-ink/60">
                  {payload.message}
                </p>
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink/40">
                  AI {payload.used}/{payload.max} used
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPayload(null)}
                className="shrink-0 rounded-full px-2 py-1 text-sm text-ink/40 hover:text-ink"
                aria-label="Dismiss"
              >
                ✕
              </button>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
