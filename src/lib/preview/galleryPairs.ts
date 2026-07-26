import type { PreviewImageAnalysis } from "@/lib/preview/analyzePreviewImages";

export type GalleryPair = {
  beforeUrl: string;
  afterUrl: string;
  caption: string;
};

function tokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

function overlapScore(a: string, b: string): number {
  const ta = new Set(tokens(a));
  const tb = tokens(b);
  if (!ta.size || !tb.length) return 0;
  return tb.reduce((sum, t) => sum + (ta.has(t) ? 1 : 0), 0);
}

function analysisText(a: PreviewImageAnalysis) {
  return `${a.subject} ${a.classification} ${a.notes}`;
}

/**
 * Build before/after pairs from vision tags.
 * Prefers shared pairId; falls back to subject overlap between before + after shots.
 */
export function buildGalleryPairs(
  analyses: PreviewImageAnalysis[]
): GalleryPair[] {
  const befores = analyses.filter(
    (a) => a.isBefore && a.roleSuggestion !== "skip" && a.roleSuggestion !== "logo"
  );
  const afters = analyses.filter(
    (a) =>
      (a.isAfter || (!a.isBefore && a.flattering)) &&
      a.roleSuggestion !== "skip" &&
      a.roleSuggestion !== "logo"
  );

  const pairs: GalleryPair[] = [];
  const usedBefore = new Set<string>();
  const usedAfter = new Set<string>();

  // 1) Explicit pairId matches
  const byPair = new Map<string, PreviewImageAnalysis[]>();
  for (const a of analyses) {
    const id = (a.pairId || "").trim();
    if (!id) continue;
    const list = byPair.get(id) || [];
    list.push(a);
    byPair.set(id, list);
  }

  for (const [pairId, group] of Array.from(byPair.entries())) {
    const before = group.find((g) => g.isBefore);
    const after = group.find((g) => g.isAfter || (!g.isBefore && g.flattering));
    if (!before || !after || before.url === after.url) continue;
    usedBefore.add(before.url);
    usedAfter.add(after.url);
    pairs.push({
      beforeUrl: before.url,
      afterUrl: after.url,
      caption:
        after.classification ||
        before.classification ||
        `Project ${pairId}`,
    });
  }

  // 2) Heuristic: match leftover befores to best-overlap afters
  for (const before of befores) {
    if (usedBefore.has(before.url)) continue;
    let best: PreviewImageAnalysis | null = null;
    let bestScore = 0;
    for (const after of afters) {
      if (usedAfter.has(after.url) || after.url === before.url) continue;
      const score =
        overlapScore(analysisText(before), analysisText(after)) +
        (after.isAfter ? 2 : 0) +
        (after.flattering ? 1 : 0);
      if (score > bestScore) {
        bestScore = score;
        best = after;
      }
    }
    if (best && bestScore >= 1) {
      usedBefore.add(before.url);
      usedAfter.add(best.url);
      pairs.push({
        beforeUrl: before.url,
        afterUrl: best.url,
        caption: best.classification || before.classification || "Before & after",
      });
    }
  }

  return pairs.slice(0, 8);
}

/** Single gallery images that are not part of a before/after pair (prefer afters). */
export function unpairedGalleryImages(
  analyses: PreviewImageAnalysis[],
  pairs: GalleryPair[],
  limit = 12
): string[] {
  const paired = new Set(
    pairs.flatMap((p) => [p.beforeUrl, p.afterUrl])
  );
  return analyses
    .filter(
      (a) =>
        !paired.has(a.url) &&
        a.roleSuggestion !== "skip" &&
        a.roleSuggestion !== "logo" &&
        !a.isBefore
    )
    .map((a) => a.url)
    .slice(0, limit);
}

/**
 * Pick the best AFTER / finished image for a service name.
 * Never returns a lone before shot.
 */
export function matchServiceImage(
  serviceName: string,
  analyses: PreviewImageAnalysis[],
  usedUrls: Set<string>
): string {
  const candidates = analyses.filter(
    (a) =>
      a.roleSuggestion !== "skip" &&
      a.roleSuggestion !== "logo" &&
      !a.isBefore &&
      a.quality !== "low"
  );

  let bestUrl = "";
  let bestScore = -1;

  for (const a of candidates) {
    const already = usedUrls.has(a.url) ? -1.5 : 0;
    const score =
      already +
      overlapScore(serviceName, analysisText(a)) * 3 +
      (a.roleSuggestion === "service" ? 2 : 0) +
      (a.isAfter ? 2 : 0) +
      (a.flattering ? 1 : 0) +
      (a.quality === "high" ? 1 : 0);

    if (score > bestScore) {
      bestScore = score;
      bestUrl = a.url;
    }
  }

  // Require some topical overlap when we have classification text;
  // otherwise still allow a strong after/service candidate.
  if (bestScore < 1 && candidates.length) {
    const fallback = candidates.find(
      (a) => !usedUrls.has(a.url) && (a.isAfter || a.roleSuggestion === "service")
    );
    return fallback?.url || "";
  }

  return bestUrl;
}

export function assignServiceImages<T extends { name: string; imageUrl?: string }>(
  services: T[],
  analyses: PreviewImageAnalysis[]
): T[] {
  if (!analyses.length) return services;

  const used = new Set<string>();
  return services.map((service) => {
    const current = service.imageUrl || "";
    const currentMeta = analyses.find((a) => a.url === current);
    const currentOk =
      current &&
      currentMeta &&
      !currentMeta.isBefore &&
      overlapScore(service.name, analysisText(currentMeta)) >= 1;

    if (currentOk) {
      used.add(current);
      return service;
    }

    const matched = matchServiceImage(service.name, analyses, used);
    if (matched) used.add(matched);
    return { ...service, imageUrl: matched || (currentMeta?.isBefore ? "" : current) };
  });
}
