import { hasMetaAdClickAttribution } from "@/lib/preview/hasMetaAdClick";

/** Mongo filter for leads that arrived via a Meta ad click. */
export const META_AD_LEAD_FILTER = {
  $or: [
    { "attribution.fbclid": { $type: "string", $ne: "" } },
    { "attribution.fbc": { $regex: /^fb\.\d+\.\d+\./ } },
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
  previewSlug: string;
  facebookUrl: string;
  createdAt: string;
  updatedAt: string;
  fromMeta: boolean;
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
  previewSlug?: string;
  facebookUrl?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  attribution?: Partial<AdminLeadAttribution> | null;
};

function iso(value: Date | string | undefined) {
  if (value instanceof Date) return value.toISOString();
  return String(value || "");
}

export function serializeAdminLead(doc: LeanLead): AdminLeadRow {
  const attr = (doc.attribution || {}) as Partial<AdminLeadAttribution>;
  const attribution: AdminLeadAttribution = {
    fbclid: attr.fbclid || "",
    fbp: attr.fbp || "",
    fbc: attr.fbc || "",
    landingUrl: attr.landingUrl || "",
    utmSource: attr.utmSource || "",
    utmMedium: attr.utmMedium || "",
    utmCampaign: attr.utmCampaign || "",
    utmContent: attr.utmContent || "",
    utmTerm: attr.utmTerm || "",
  };

  return {
    id: String(doc._id),
    name: doc.name || "",
    email: doc.email || "",
    phone: doc.phone || "",
    businessName: doc.businessName || "",
    city: doc.city || "",
    state: doc.state || "",
    status: doc.status || "captured",
    previewSlug: doc.previewSlug || "",
    facebookUrl: doc.facebookUrl || "",
    createdAt: iso(doc.createdAt),
    updatedAt: iso(doc.updatedAt),
    fromMeta: hasMetaAdClickAttribution(attribution),
    attribution,
  };
}
