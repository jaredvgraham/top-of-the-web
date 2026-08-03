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

/**
 * Every revision is sitewide so home / services / about stay consistent.
 * The HTML prompt enforces surgical edits — only change what they asked for.
 */
export function inferRevisionScope(
  _targets: string[],
  _note: string,
  _focusPage: "home" | "services" | "about" | "all"
): "focused" | "sitewide" {
  return "sitewide";
}

const CUSTOM_BUILD_ONLY =
  /\b(new photo|upload photo|add photo|different photo|different image|new image|replace (the )?photo|replace (the )?image|swap (the )?photo|swap (the )?image|ecommerce|e-commerce|shop|booking|calendar|new page|dashboard|login|member)\b/i;

export function isCustomBuildOnlyRequest(targets: string[], note: string) {
  if (CUSTOM_BUILD_ONLY.test(note)) return true;
  return targets.includes("custom_build_only");
}
