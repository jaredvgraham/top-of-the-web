import Preview from "@/models/Preview";
import type { PreviewRevisionStats } from "@/lib/adminLeads";

/** Batch-load AI revision usage for admin lead cards. */
export async function loadRevisionStatsForSlugs(
  slugs: string[]
): Promise<Map<string, PreviewRevisionStats>> {
  const unique = Array.from(
    new Set(slugs.map((s) => s.trim()).filter(Boolean))
  );
  const map = new Map<string, PreviewRevisionStats>();
  if (!unique.length) return map;

  const docs = await Preview.find({ slug: { $in: unique } })
    .select("slug revisionsBeforePayUsed revisionsAfterPayUsed revisionLog")
    .lean();

  for (const doc of docs) {
    const log = Array.isArray(doc.revisionLog) ? doc.revisionLog : [];
    const last = log.length ? log[log.length - 1] : null;
    map.set(doc.slug, {
      revisionsBeforePayUsed: Number(doc.revisionsBeforePayUsed) || 0,
      revisionsAfterPayUsed: Number(doc.revisionsAfterPayUsed) || 0,
      lastRevisionNote: (last?.note || "").trim(),
    });
  }

  return map;
}
