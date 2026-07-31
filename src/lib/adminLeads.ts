import { hasMetaAdClickAttribution } from "@/lib/preview/hasMetaAdClick";
import { siteOrigin } from "@/lib/siteOrigin";
import { onboardingPublicUrl } from "@/lib/onboarding";

/** Mongo filter for leads that arrived via a Meta ad click. */
export const META_AD_LEAD_FILTER = {
  $or: [
    { "attribution.fbclid": { $type: "string", $ne: "" } },
    { "attribution.fbc": { $regex: /^fb\.\d+\.\d+\./ } },
  ],
};

/** Contact-form inquiries written into the Lead collection. */
export const CONTACT_LEAD_FILTER = { source: "contact" as const };

/** Preview-capture leads that are not Meta-attributed. */
export const ORGANIC_LEAD_FILTER = {
  $and: [
    { $nor: [META_AD_LEAD_FILTER] },
    { source: { $ne: "contact" } },
  ],
};

export type AdminLeadAttribution = {
  fbclid: string;
  fbp: string;
  fbc: string;
  landingUrl: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  utmTerm: string;
  campaignId: string;
  adsetId: string;
  adId: string;
};

export type AdminLeadRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  businessName: string;
  city: string;
  state: string;
  status: string;
  source: "preview" | "contact";
  notes: string;
  onboardingToken: string;
  /** Brief URL when this lead came from the contact form. */
  onboardingUrl: string;
  token: string;
  previewSlug: string;
  /** Live demo when preview exists; otherwise empty. */
  demoUrl: string;
  /** Continue / generate demo when no preview yet; otherwise empty. */
  continueUrl: string;
  facebookUrl: string;
  createdAt: string;
  updatedAt: string;
  fromMeta: boolean;
  /** Client demo views (admin sessions excluded). */
  demoViewCount: number;
  demoFirstViewedAt: string;
  demoLastViewedAt: string;
  attribution: AdminLeadAttribution;
};

type LeanLead = {
  _id: unknown;
  name?: string;
  email?: string;
  phone?: string;
  businessName?: string;
  city?: string;
  state?: string;
  status?: string;
  source?: string;
  notes?: string;
  onboardingToken?: string;
  token?: string;
  previewSlug?: string;
  facebookUrl?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  demoViewCount?: number;
  demoFirstViewedAt?: Date | string;
  demoLastViewedAt?: Date | string;
  attribution?: Partial<AdminLeadAttribution> | null;
};

function iso(value: Date | string | undefined) {
  if (value instanceof Date) return value.toISOString();
  return String(value || "");
}

function paramFromLandingUrl(landingUrl: string, keys: string[]) {
  if (!landingUrl) return "";
  try {
    const url = new URL(landingUrl);
    for (const key of keys) {
      const value = (url.searchParams.get(key) || "").trim();
      if (value) return value;
    }
  } catch {
    // ignore invalid URLs
  }
  return "";
}

function normalizeCampaignLabel(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[_\s-]+/g, " ");
}

/** Resolve campaign id / utm campaign, including values buried in landingUrl. */
export function resolveLeadCampaignTags(lead: Pick<AdminLeadRow, "attribution">) {
  const attr = lead.attribution;
  const campaignId =
    attr.campaignId ||
    paramFromLandingUrl(attr.landingUrl, ["campaign_id", "campaignId"]);
  const adsetId =
    attr.adsetId ||
    paramFromLandingUrl(attr.landingUrl, ["adset_id", "adsetId"]);
  const adId =
    attr.adId || paramFromLandingUrl(attr.landingUrl, ["ad_id", "adId"]);
  const utmCampaign =
    attr.utmCampaign ||
    paramFromLandingUrl(attr.landingUrl, ["utm_campaign"]);
  return { campaignId, adsetId, adId, utmCampaign };
}

export function leadMatchesCampaign(
  lead: Pick<AdminLeadRow, "attribution">,
  campaignId: string,
  campaignName: string
) {
  if (!campaignId && !campaignName) return true;
  const tags = resolveLeadCampaignTags(lead);
  if (tags.campaignId && campaignId && tags.campaignId === campaignId) {
    return true;
  }
  if (tags.utmCampaign && campaignName) {
    const a = normalizeCampaignLabel(tags.utmCampaign);
    const b = normalizeCampaignLabel(campaignName);
    if (a && b && (a === b || a.includes(b) || b.includes(a))) return true;
  }
  return false;
}

export function leadHasCampaignTag(lead: Pick<AdminLeadRow, "attribution">) {
  const tags = resolveLeadCampaignTags(lead);
  return Boolean(tags.campaignId || tags.utmCampaign);
}

export function serializeAdminLead(doc: LeanLead): AdminLeadRow {
  const attr = (doc.attribution || {}) as Partial<AdminLeadAttribution>;
  const landingUrl = attr.landingUrl || "";
  const attribution: AdminLeadAttribution = {
    fbclid: attr.fbclid || "",
    fbp: attr.fbp || "",
    fbc: attr.fbc || "",
    landingUrl,
    utmSource: attr.utmSource || "",
    utmMedium: attr.utmMedium || "",
    utmCampaign:
      attr.utmCampaign ||
      paramFromLandingUrl(landingUrl, ["utm_campaign"]) ||
      "",
    utmContent: attr.utmContent || "",
    utmTerm: attr.utmTerm || "",
    campaignId:
      attr.campaignId ||
      paramFromLandingUrl(landingUrl, ["campaign_id", "campaignId"]) ||
      "",
    adsetId:
      attr.adsetId ||
      paramFromLandingUrl(landingUrl, ["adset_id", "adsetId"]) ||
      "",
    adId:
      attr.adId || paramFromLandingUrl(landingUrl, ["ad_id", "adId"]) || "",
  };

  const token = doc.token || "";
  const previewSlug = doc.previewSlug || "";
  const origin = siteOrigin();
  const demoUrl = previewSlug ? `${origin}/preview/${previewSlug}` : "";
  const source = doc.source === "contact" ? "contact" : "preview";
  const onboardingToken = doc.onboardingToken || "";
  const onboardingUrl = onboardingToken
    ? onboardingPublicUrl(onboardingToken, origin)
    : "";
  // Contact leads use the onboarding brief, not the preview continue flow.
  const continueUrl =
    source === "contact"
      ? ""
      : !previewSlug && token
        ? `${origin}/preview/continue/${token}`
        : "";

  return {
    id: String(doc._id),
    name: doc.name || "",
    email: doc.email || "",
    phone: doc.phone || "",
    businessName: doc.businessName || "",
    city: doc.city || "",
    state: doc.state || "",
    status: doc.status || "captured",
    source,
    notes: doc.notes || "",
    onboardingToken,
    onboardingUrl,
    token,
    previewSlug,
    demoUrl,
    continueUrl,
    facebookUrl: doc.facebookUrl || "",
    createdAt: iso(doc.createdAt),
    updatedAt: iso(doc.updatedAt),
    fromMeta: hasMetaAdClickAttribution(attribution),
    demoViewCount:
      typeof doc.demoViewCount === "number" && Number.isFinite(doc.demoViewCount)
        ? doc.demoViewCount
        : 0,
    demoFirstViewedAt: iso(doc.demoFirstViewedAt),
    demoLastViewedAt: iso(doc.demoLastViewedAt),
    attribution,
  };
}
