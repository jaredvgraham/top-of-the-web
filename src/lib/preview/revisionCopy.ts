import type { RevisionQuotaSnapshot } from "@/lib/preview/revisionQuota";

type QuotaLabel = Pick<
  RevisionQuotaSnapshot,
  "remaining" | "used" | "phase" | "purchased" | "max"
>;

/** Compact badge: "0/2 used" → "1/2 used" → "2/2 used". */
export function revisionCountBadge(quota: QuotaLabel): {
  count: string;
  detail: string;
  depleted: boolean;
  used: number;
  max: number;
} {
  const used = Math.max(0, Number(quota.used) || 0);
  const max = Math.max(1, Number(quota.max) || 2);
  const depleted = quota.remaining <= 0;
  const count = `${used}/${max} used`;

  if (quota.purchased) {
    if (depleted) {
      return {
        count,
        detail:
          "A real person takes over next — we revise with you until you’re happy",
        depleted: true,
        used,
        max,
      };
    }
    return {
      count,
      detail:
        used === max - 1
          ? "Last quick AI polish — then a human finishes with you"
          : "Quick AI polish included — then unlimited human revisions",
      depleted: false,
      used,
      max,
    };
  }
  if (depleted) {
    return {
      count,
      detail: "Claim for 2 more AI + unlimited human revisions",
      depleted: true,
      used,
      max,
    };
  }
  return {
    count,
    detail:
      used === max - 1
        ? "Last free AI pass — claim for 2 more AI + unlimited human revisions"
        : "Free AI on the demo — claim for 2 more AI + unlimited human revisions",
    depleted: false,
    used,
    max,
  };
}

/** Short line for ribbon / banner based on remaining + phase. */
export function revisionRemainingLabel(quota: QuotaLabel): string {
  return revisionCountBadge(quota).detail;
}

export function revisionAfterSuccessMessage(
  remaining: number,
  phase: "pre" | "post",
  used?: number,
  max = 2
): string {
  const usedLabel =
    typeof used === "number" ? `${used}/${max} used` : null;
  if (phase === "post") {
    if (remaining <= 0) {
      return "AI polish done — a real person takes it from here until you’re happy";
    }
    return usedLabel
      ? `Looking sharper — ${usedLabel}. Then a human finishes with you.`
      : "Looking sharper — you still have a quick AI polish left, then we hand-finish with you";
  }
  if (remaining <= 0) {
    return "Free AI used. Claim for 2 more AI + unlimited human revisions";
  }
  if (remaining === 1) {
    return usedLabel
      ? `Looking sharper — ${usedLabel}. Last free AI pass before claiming.`
      : "Looking sharper — last free AI pass before claiming";
  }
  return usedLabel
    ? `Looking sharper — ${usedLabel}. Claim for 2 more AI + unlimited human revisions when you’re ready.`
    : "Looking sharper — claim for 2 more AI + unlimited human revisions when you’re ready";
}

export function claimPageRevisionBlurb(
  quota: Pick<RevisionQuotaSnapshot, "remaining" | "used" | "purchased" | "max">
): string {
  const used = Math.max(0, Number(quota.used) || 0);
  const max = Math.max(1, Number(quota.max) || 2);
  if (quota.purchased) {
    if (quota.remaining <= 0) {
      return `Quick AI polish is done (${used}/${max} used). Next a real person custom-builds with you — revise as many times as it takes until you’re happy.`;
    }
    return `You’re in. AI polish ${used}/${max} used — then a human finishes with you (unlimited human revisions).`;
  }
  if (quota.remaining <= 0) {
    return `Free AI demo revisions are used (${used}/${max}). Claim for 2 more AI polish passes + unlimited human revisions until you’re happy.`;
  }
  if (quota.remaining === 1) {
    return `AI revisions ${used}/${max} used on the demo. Claim for 2 more AI + unlimited human revisions.`;
  }
  return `AI revisions ${used}/${max} used on the demo. Claim for 2 more AI + unlimited human revisions.`;
}

export const REVISE_OPEN_EVENT = "bsites:open-revise";
export const REVISE_DONE_STORAGE_KEY = "bsites:revision-done";

export type ReviseDonePayload = {
  slug: string;
  message: string;
  used: number;
  max: number;
  at: number;
};

export function openRevisePanel() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(REVISE_OPEN_EVENT));
}

export function stashReviseDoneNotification(payload: ReviseDonePayload) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(REVISE_DONE_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // private mode
  }
}

export function consumeReviseDoneNotification(
  slug: string
): ReviseDonePayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(REVISE_DONE_STORAGE_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(REVISE_DONE_STORAGE_KEY);
    const parsed = JSON.parse(raw) as ReviseDonePayload;
    if (!parsed?.slug || parsed.slug !== slug) return null;
    // Ignore stale payloads older than 10 minutes
    if (parsed.at && Date.now() - parsed.at > 10 * 60 * 1000) return null;
    return parsed;
  } catch {
    return null;
  }
}
