export type ReviseStageKey =
  | "reading"
  | "redesigning"
  | "updating"
  | "ready";

export type ReviseProgressEvent = {
  type: "progress";
  stageKey: ReviseStageKey;
  message: string;
  percent: number;
  /** 0-based page index while redesigning; -1 otherwise */
  pageIndex: number;
  pageTotal: number;
  pageLabel?: string;
};

export type ReviseDoneEvent = {
  type: "done";
  ok: true;
  pagesUpdated: string[];
  revisionsRemaining: number;
  phase: "pre" | "post";
  purchased: boolean;
  percent: 100;
};

export type ReviseErrorEvent = {
  type: "error";
  code: string;
  message: string;
};

export type ReviseStreamEvent =
  | ReviseProgressEvent
  | ReviseDoneEvent
  | ReviseErrorEvent;

export const REVISE_LOADING_TIPS = [
  "This is a real designer-quality rewrite — not a quick find-and-replace.",
  "We keep your photos, logo, and contact info. Only copy and polish change.",
  "Sitewide passes touch all three pages so brand and tone stay consistent.",
  "Most single-page refreshes finish in about 1–3 minutes.",
  "You can leave this open — we’ll reload the demo when it’s ready.",
  "After free AI passes, claim for a human custom build — we revise until you’re happy.",
] as const;

export function reviseProgressEvent(input: {
  stageKey: ReviseStageKey;
  message: string;
  percent: number;
  pageIndex?: number;
  pageTotal?: number;
  pageLabel?: string;
}): ReviseProgressEvent {
  return {
    type: "progress",
    stageKey: input.stageKey,
    message: input.message,
    percent: Math.max(0, Math.min(99, Math.round(input.percent))),
    pageIndex: input.pageIndex ?? -1,
    pageTotal: input.pageTotal ?? 0,
    pageLabel: input.pageLabel,
  };
}

export function pageProgressPercent(
  pageIndex: number,
  pageTotal: number
): number {
  if (pageTotal <= 0) return 18;
  // Reserve ~8% for reading, ~12% for saving; middle band for page rewrites
  const start = 10;
  const end = 88;
  const span = end - start;
  return start + (pageIndex / pageTotal) * span;
}
