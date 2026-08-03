"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  revisionAfterSuccessMessage,
  stashReviseDoneNotification,
} from "@/lib/preview/revisionCopy";
import {
  REVISE_LOADING_TIPS,
  type ReviseStreamEvent,
} from "@/lib/preview/revisionProgress";

export const REVISION_CHIPS = [
  { id: "more_professional", label: "More professional" },
  { id: "more_bold", label: "More bold" },
  { id: "rewrite_headline", label: "Rewrite the headline" },
  { id: "adjust_colors", label: "Adjust colors" },
  { id: "emphasize_service", label: "Emphasize a service" },
  { id: "punchier_copy", label: "Punchier copy" },
  { id: "fix_something", label: "Fix something that looks wrong" },
] as const;

type FocusPage = "home" | "services" | "about";

type Props = {
  slug: string;
  page: FocusPage;
  open: boolean;
  remaining: number;
  used?: number;
  max?: number;
  phase: "pre" | "post";
  onClose: () => void;
  onQuotaChange: (next: {
    remaining: number;
    phase: "pre" | "post";
    purchased: boolean;
  }) => void;
};

type ProgressState = {
  message: string;
  percent: number;
  pageIndex: number;
  pageTotal: number;
  pageLabel?: string;
  stageKey: string;
};

async function readReviseStream(
  response: Response,
  onProgress: (event: Extract<ReviseStreamEvent, { type: "progress" }>) => void
): Promise<ReviseStreamEvent> {
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("ndjson")) {
    const data = await response.json().catch(() => ({}));
    const err = data?.error;
    return {
      type: "error",
      code: err?.code || "request_failed",
      message:
        err?.message ||
        data?.message ||
        (response.status === 429
          ? "Too many revisions. Try again later."
          : "We couldn’t revise your demo. Please try again."),
    };
  }

  if (!response.body) {
    return {
      type: "error",
      code: "empty_stream",
      message: "No progress stream received. Please try again.",
    };
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let lastEvent: ReviseStreamEvent | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const event = JSON.parse(trimmed) as ReviseStreamEvent;
        lastEvent = event;
        if (event.type === "progress") onProgress(event);
      } catch {
        // skip malformed
      }
    }
  }

  if (buffer.trim()) {
    try {
      const event = JSON.parse(buffer.trim()) as ReviseStreamEvent;
      lastEvent = event;
      if (event.type === "progress") onProgress(event);
    } catch {
      // ignore
    }
  }

  return (
    lastEvent || {
      type: "error",
      code: "empty_stream",
      message: "Revision ended without a result. Please try again.",
    }
  );
}

export default function PreviewRevisePanel({
  slug,
  page,
  open,
  remaining,
  used: usedProp,
  max = 2,
  phase,
  onClose,
  onQuotaChange,
}: Props) {
  const used = usedProp ?? Math.max(0, max - remaining);
  const [targets, setTargets] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [displayPercent, setDisplayPercent] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const targetPercentRef = useRef(0);
  const wasOpenRef = useRef(false);
  const reloadTimerRef = useRef<number | null>(null);

  // Reset form state only when the panel newly opens — not when submit ends
  useEffect(() => {
    if (open && !wasOpenRef.current) {
      setError("");
      setSuccess("");
      setProgress(null);
      setDisplayPercent(0);
      if (reloadTimerRef.current) {
        window.clearTimeout(reloadTimerRef.current);
        reloadTimerRef.current = null;
      }
    }
    wasOpenRef.current = open;
  }, [open]);

  // Soft progress creep so long model waits don’t feel frozen
  useEffect(() => {
    if (!submitting || success) return;
    const id = window.setInterval(() => {
      setDisplayPercent((prev) => {
        const target = targetPercentRef.current;
        const ceiling = Math.min(96, target + 7);
        if (prev >= ceiling) return prev;
        const step = prev < target ? 1.8 : 0.35;
        return Math.min(ceiling, prev + step);
      });
    }, 400);
    return () => window.clearInterval(id);
  }, [submitting, success]);

  useEffect(() => {
    if (!submitting || success) return;
    setTipIndex(0);
    const id = window.setInterval(() => {
      setTipIndex((i) => (i + 1) % REVISE_LOADING_TIPS.length);
    }, 6500);
    return () => window.clearInterval(id);
  }, [submitting, success]);

  // Auto-open the updated demo after a short celebration beat
  useEffect(() => {
    if (!success) return;
    reloadTimerRef.current = window.setTimeout(() => {
      window.location.reload();
    }, 2200);
    return () => {
      if (reloadTimerRef.current) {
        window.clearTimeout(reloadTimerRef.current);
        reloadTimerRef.current = null;
      }
    };
  }, [success]);

  const toggleChip = useCallback((id: string) => {
    setTargets((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  }, []);

  const canSubmit =
    (targets.length > 0 || note.trim().length > 0) &&
    remaining > 0 &&
    !submitting;

  const applyProgress = useCallback(
    (event: Extract<ReviseStreamEvent, { type: "progress" }>) => {
      targetPercentRef.current = event.percent;
      setProgress({
        message: event.message,
        percent: event.percent,
        pageIndex: event.pageIndex,
        pageTotal: event.pageTotal,
        pageLabel: event.pageLabel,
        stageKey: event.stageKey,
      });
      setDisplayPercent((prev) => Math.max(prev, Math.min(event.percent, 99)));
    },
    []
  );

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");
    setSuccess("");
    targetPercentRef.current = 4;
    setDisplayPercent(3);
    setProgress({
      message: "Reading your feedback",
      percent: 4,
      pageIndex: -1,
      pageTotal: 0,
      stageKey: "reading",
    });

    try {
      const response = await fetch(
        `/api/preview/${encodeURIComponent(slug)}/revise`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/x-ndjson, application/json",
          },
          body: JSON.stringify({
            targets,
            note: note.trim().slice(0, 800),
            page,
          }),
        }
      );

      const result = await readReviseStream(response, applyProgress);

      if (result.type === "error") {
        setError(result.message);
        setProgress(null);
        return;
      }

      if (result.type === "done") {
        const nextUsed = Math.max(0, max - result.revisionsRemaining);
        const message = revisionAfterSuccessMessage(
          result.revisionsRemaining,
          result.phase,
          nextUsed,
          max
        );
        targetPercentRef.current = 100;
        setDisplayPercent(100);
        setProgress({
          message: "Ready",
          percent: 100,
          pageIndex: -1,
          pageTotal: result.pagesUpdated.length,
          stageKey: "ready",
        });
        onQuotaChange({
          remaining: result.revisionsRemaining,
          phase: result.phase,
          purchased: result.purchased,
        });
        setSuccess(message);
        setTargets([]);
        setNote("");
        stashReviseDoneNotification({
          slug,
          message,
          used: nextUsed,
          max,
          at: Date.now(),
        });
      }
    } catch {
      setError(
        "Unable to revise right now. Check your connection and try again."
      );
      setProgress(null);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  const showLoading = submitting || Boolean(success);
  const percent = success ? 100 : Math.round(displayPercent);

  return (
    <div className="fixed inset-0 z-[70] flex justify-end">
      <button
        type="button"
        aria-label="Close request changes"
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        onClick={() => {
          if (success) {
            window.location.reload();
            return;
          }
          if (!submitting) onClose();
        }}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="revise-panel-title"
        aria-busy={submitting && !success}
        className="relative flex h-full w-full max-w-md flex-col border-l border-ink/10 bg-paper shadow-[-12px_0_40px_rgba(26,20,51,0.18)]"
      >
        <div className="flex items-start justify-between gap-3 border-b border-ink/10 px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">
              Designer pass
            </p>
            <h2
              id="revise-panel-title"
              className="font-display mt-1 text-2xl font-semibold tracking-tight text-ink"
            >
              {success
                ? "Revision done"
                : showLoading
                  ? "Refreshing your demo"
                  : "Request changes"}
            </h2>
            {!showLoading ? (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] ${
                    remaining <= 0
                      ? "bg-ink/10 text-ink/55"
                      : used === max - 1
                        ? "bg-amber-500/15 text-amber-900"
                        : "bg-accent/15 text-accent"
                  }`}
                >
                  AI {used}/{max} used
                </span>
                <span className="text-sm text-ink/55">
                  {remaining <= 0
                    ? phase === "post"
                      ? "A human finishes with you until you’re happy."
                      : "Claim for 2 more AI + unlimited human revisions."
                    : used === max - 1
                      ? "Last quick AI pass — humans revise beyond this."
                      : "AI demo passes only — human revisions aren’t capped."}
                </span>
              </div>
            ) : (
              <p className="mt-1 text-sm text-ink/55">
                {success
                  ? "Opening your updated demo…"
                  : "Premium rewrite in progress — keep this open"}
              </p>
            )}
          </div>
          <button
            type="button"
            disabled={submitting && !success}
            onClick={() => {
              if (success) {
                window.location.reload();
                return;
              }
              onClose();
            }}
            className="rounded-full px-2 py-1 text-sm text-ink/45 hover:text-ink disabled:opacity-40"
          >
            {success ? "View" : "Close"}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {success ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.65, 0, 0.35, 1] }}
              className="flex h-full flex-col"
              role="status"
              aria-live="polite"
            >
              <div className="relative overflow-hidden rounded-3xl border border-accent/20 bg-gradient-to-b from-accent/[0.08] to-transparent px-5 py-8 text-center">
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.08, duration: 0.4, ease: "easeOut" }}
                  className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent text-2xl font-semibold text-paper shadow-[0_10px_30px_rgba(91,46,158,0.35)]"
                  aria-hidden
                >
                  ✓
                </motion.div>
                <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
                  Revision done
                </p>
                <h3 className="font-display mt-2 text-2xl font-semibold tracking-tight text-ink">
                  Your demo is updated
                </h3>
                <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink/60">
                  {success}
                </p>
                <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/40">
                  AI {used}/{max} used
                </p>
              </div>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-6 w-full rounded-full bg-accent px-5 py-3.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-paper transition hover:opacity-90"
              >
                View updated demo
              </button>
              <p className="mt-3 text-center text-[11px] text-ink/40">
                Refreshing automatically in a moment…
              </p>
            </motion.div>
          ) : showLoading ? (
            <div className="space-y-6" role="status" aria-live="polite">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-xl font-medium leading-snug text-ink">
                    {progress?.stageKey === "reading"
                      ? "Reading your feedback"
                      : "Updating and redesigning your website"}
                  </p>
                  <p className="mt-2 text-sm text-ink/50">
                    This can take a few minutes — keep this open.
                  </p>
                </div>
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ink/10 bg-ink/[0.03]"
                  aria-hidden
                >
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-ink/15 border-t-accent" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/40">
                  <span>Progress</span>
                  <span className="tabular-nums">{percent}%</span>
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-ink/10">
                  <motion.div
                    className="h-full rounded-full bg-accent"
                    initial={false}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                  />
                </div>
              </div>

              <ul className="space-y-2.5 text-sm">
                {[
                  {
                    key: "reading",
                    label: "Reading your feedback",
                    done:
                      progress?.stageKey !== "reading" && Boolean(progress),
                    current: progress?.stageKey === "reading",
                  },
                  {
                    key: "redesigning",
                    label: "Updating and redesigning your website",
                    done:
                      progress?.stageKey === "updating" ||
                      progress?.stageKey === "ready",
                    current:
                      progress?.stageKey === "redesigning" ||
                      progress?.stageKey === "updating",
                  },
                ].map((step) => (
                  <li
                    key={step.key}
                    className={`flex items-center gap-3 ${
                      step.current
                        ? "font-semibold text-ink"
                        : step.done
                          ? "text-ink/45"
                          : "text-ink/28"
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] ${
                        step.current
                          ? "bg-accent text-paper"
                          : step.done
                            ? "bg-accent/15 text-accent"
                            : "bg-ink/5 text-ink/30"
                      }`}
                    >
                      {step.current ? (
                        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-paper" />
                      ) : step.done ? (
                        "✓"
                      ) : (
                        "·"
                      )}
                    </span>
                    <span>
                      {step.label}
                      {step.current ? "…" : ""}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="min-h-[5.5rem] rounded-2xl border border-accent/15 bg-accent/[0.07] px-4 py-3.5">
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
                    {REVISE_LOADING_TIPS[tipIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm leading-relaxed text-ink/60">
                Pick what to fix and leave a real note. We’ll redesign with a
                premium pass using your full demo as context — same URL, no
                scrape.
              </p>

              <div className="mt-4 rounded-2xl border border-ink/10 bg-ink/[0.03] px-3.5 py-3 text-xs leading-relaxed text-ink/55">
                <span className="font-semibold text-ink/70">Images:</span> New
                or different photos aren’t part of AI revisions. Tell us what
                you want swapped — we handle that in your custom build after
                you claim.
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {REVISION_CHIPS.map((chip) => {
                  const on = targets.includes(chip.id);
                  return (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => toggleChip(chip.id)}
                      className={`rounded-full border px-3 py-1.5 text-left text-[12px] font-medium transition ${
                        on
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-ink/15 text-ink/70 hover:border-ink/30"
                      }`}
                    >
                      {chip.label}
                    </button>
                  );
                })}
              </div>

              <label
                htmlFor="revise-note"
                className="mt-6 mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/45"
              >
                Your note
              </label>
              <textarea
                id="revise-note"
                value={note}
                onChange={(e) => setNote(e.target.value.slice(0, 800))}
                rows={5}
                maxLength={800}
                placeholder="e.g. We only do exterior painting, interior painting, and soft washing — remove power washing from the services list."
                className="w-full resize-none rounded-2xl border border-ink/15 bg-white/70 px-4 py-3 text-sm leading-relaxed text-ink outline-none focus:border-accent"
              />
              <p className="mt-1.5 text-right text-[11px] text-ink/35">
                {note.length}/800
              </p>
              <p className="mt-3 text-[11px] leading-relaxed text-ink/40">
                Tip: Name the exact services or fixes you want. Vague notes are
                easier for the model to miss.
              </p>
            </>
          )}

          {error ? (
            <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}
        </div>

        {!showLoading ? (
          <div className="border-t border-ink/10 px-5 py-4">
            <button
              type="button"
              disabled={!canSubmit}
              onClick={() => void submit()}
              className="w-full rounded-full bg-accent px-5 py-3.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-paper transition hover:opacity-90 disabled:opacity-40"
            >
              Apply designer pass
            </button>
            <p className="mt-2 text-center text-[11px] text-ink/40">
              Uses 1 AI pass → {Math.min(max, used + 1)}/{max} used after this ·
              usually a few minutes
            </p>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
