import Lead from "@/models/Lead";
import Order from "@/models/Order";
import {
  REVISIONS_AFTER_PAY_MAX,
  REVISIONS_BEFORE_PAY_MAX,
  type PreviewRevisionPhase,
} from "@/models/Preview";

export type RevisionQuotaSnapshot = {
  phase: PreviewRevisionPhase;
  purchased: boolean;
  used: number;
  max: number;
  remaining: number;
  revisionsBeforePayUsed: number;
  revisionsAfterPayUsed: number;
};

export async function isPreviewPurchased(input: {
  leadToken?: string;
  previewSlug?: string;
  email?: string;
}): Promise<boolean> {
  const leadToken = (input.leadToken || "").trim();
  if (leadToken) {
    const lead = await Lead.findOne({ token: leadToken })
      .select("status")
      .lean();
    if (lead?.status === "purchased") return true;
  }

  const previewSlug = (input.previewSlug || "").trim();
  if (previewSlug) {
    const lead = await Lead.findOne({
      previewSlug,
      status: "purchased",
    })
      .select("_id")
      .lean();
    if (lead) return true;
  }

  const email = (input.email || "").trim().toLowerCase();
  if (email) {
    const order = await Order.findOne({ email, success: true })
      .select("_id")
      .lean();
    if (order) return true;
  }

  return false;
}

export function snapshotRevisionQuota(input: {
  purchased: boolean;
  revisionsBeforePayUsed?: number;
  revisionsAfterPayUsed?: number;
}): RevisionQuotaSnapshot {
  const before = Math.max(0, Number(input.revisionsBeforePayUsed) || 0);
  const after = Math.max(0, Number(input.revisionsAfterPayUsed) || 0);
  const phase: PreviewRevisionPhase = input.purchased ? "post" : "pre";
  const used = phase === "post" ? after : before;
  const max = phase === "post" ? REVISIONS_AFTER_PAY_MAX : REVISIONS_BEFORE_PAY_MAX;
  return {
    phase,
    purchased: input.purchased,
    used,
    max,
    remaining: Math.max(0, max - used),
    revisionsBeforePayUsed: before,
    revisionsAfterPayUsed: after,
  };
}

/** Chip ids that imply a sitewide visual/tone pass. */
const SITEWIDE_TARGETS = new Set([
  "more_professional",
  "more_bold",
  "adjust_colors",
  "punchier_copy",
]);

export function inferRevisionScope(
  targets: string[],
  note: string,
  focusPage: "home" | "services" | "about" | "all"
): "focused" | "sitewide" {
  if (focusPage === "all") return "sitewide";
  if (targets.some((t) => SITEWIDE_TARGETS.has(t))) return "sitewide";
  // Service list / offering corrections usually appear on home + services
  if (targets.includes("emphasize_service")) return "sitewide";
  const n = note.toLowerCase();
  if (
    /\b(whole site|entire site|all pages|everywhere|brand|colors?|tone|overall|vibe|throughout)\b/.test(
      n
    )
  ) {
    return "sitewide";
  }
  if (
    /\b(services? we (do|offer)|we (only |also )?(do|offer)|remove .+ service|wrong service|list of services|our services are)\b/.test(
      n
    )
  ) {
    return "sitewide";
  }
  return "focused";
}

const CUSTOM_BUILD_ONLY =
  /\b(new photo|upload photo|add photo|different photo|different image|new image|replace (the )?photo|replace (the )?image|swap (the )?photo|swap (the )?image|ecommerce|e-commerce|shop|booking|calendar|new page|dashboard|login|member)\b/i;

export function isCustomBuildOnlyRequest(targets: string[], note: string) {
  if (CUSTOM_BUILD_ONLY.test(note)) return true;
  return targets.includes("custom_build_only");
}
