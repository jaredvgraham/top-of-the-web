import Order from "@/models/Order";
import Preview from "@/models/Preview";
import Website from "@/models/WebsiteModel";
import Lead, { isLeadExpired } from "@/models/Lead";
import { leadContinueUrl } from "@/lib/preview/lead";
import { resolveGhostUrls } from "@/lib/ghostEmailTemplates";

/** Funnel drop-off stages for unpaid leads. */
export type GhostSegment =
  | "no_facebook"
  | "ready"
  | "expired"
  | "failed"
  | "all";

export type GhostLeadRow = {
  id: string;
  leadToken: string;
  email: string;
  phone: string;
  name: string;
  businessName: string;
  city: string;
  state: string;
  leadStatus: string;
  leadExpired: boolean;
  previewId: string | null;
  previewSlug: string;
  previewStatus: string | null;
  previewExpired: boolean;
  previewExpiresAt: string | null;
  previewCreatedAt: string | null;
  facebookUrl: string;
  segment: Exclude<GhostSegment, "all">;
  previewUrl: string;
  claimUrl: string;
  continueUrl: string;
  createdAt: string | null;
  updatedAt: string | null;
};

function emailKey(value?: string | null) {
  return (value || "").trim().toLowerCase();
}

async function loadPaidEmails() {
  const [orders, websites] = await Promise.all([
    Order.find({ success: true }).select("email").lean(),
    Website.find().select("email").lean(),
  ]);

  const paid = new Set<string>();
  for (const order of orders) {
    const key = emailKey(order.email);
    if (key) paid.add(key);
  }
  for (const site of websites) {
    const key = emailKey(site.email);
    if (key) paid.add(key);
  }
  return paid;
}

function previewIsExpired(doc: {
  status?: string;
  expiresAt?: Date | string | null;
}) {
  if (doc.status === "expired") return true;
  if (!doc.expiresAt) return false;
  return new Date(doc.expiresAt).getTime() < Date.now();
}

function classifySegment(input: {
  preview: {
    status?: string;
    expiresAt?: Date | string | null;
    source?: { url?: string };
  } | null;
  facebookUrl?: string;
}): Exclude<GhostSegment, "all"> {
  const preview = input.preview;
  if (!preview) return "no_facebook";

  const expired = previewIsExpired(preview);
  if (preview.status === "ready" && !expired) return "ready";
  if (preview.status === "expired" || expired) return "expired";
  if (preview.status === "failed") return "failed";

  // queued / scraping / generating — they started Facebook upload
  if (["queued", "scraping", "generating"].includes(preview.status || "")) {
    return "failed";
  }

  // Has a facebook URL on the lead but no usable preview yet
  if (input.facebookUrl?.trim()) return "failed";

  return "no_facebook";
}

/**
 * Ghost = entered the preview funnel and never became a paying subscriber.
 *
 * Includes:
 * 1. Lead form filled, never uploaded Facebook / never generated a demo
 * 2. Uploaded Facebook / generated a demo, but never paid (Order success / Website)
 */
export async function listGhostLeads(
  segment: GhostSegment = "all"
): Promise<GhostLeadRow[]> {
  const paidEmails = await loadPaidEmails();

  const [leads, previews] = await Promise.all([
    Lead.find({ status: { $nin: ["purchased"] } })
      .sort({ updatedAt: -1 })
      .lean(),
    Preview.find()
      .select("slug email leadToken status expiresAt createdAt source")
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  const previewByLeadToken = new Map<string, (typeof previews)[number]>();
  const previewBySlug = new Map<string, (typeof previews)[number]>();
  const previewsByEmail = new Map<string, (typeof previews)[number][]>();

  for (const preview of previews) {
    if (preview.leadToken && !previewByLeadToken.has(preview.leadToken)) {
      previewByLeadToken.set(preview.leadToken, preview);
    }
    if (preview.slug) previewBySlug.set(preview.slug, preview);
    const key = emailKey(preview.email);
    if (!key) continue;
    const list = previewsByEmail.get(key) || [];
    list.push(preview);
    previewsByEmail.set(key, list);
  }

  const rows: GhostLeadRow[] = [];
  const seenEmails = new Set<string>();

  for (const lead of leads) {
    const email = emailKey(lead.email);
    if (!email || paidEmails.has(email)) continue;
    if (lead.status === "purchased") continue;

    // Prefer the newest lead per email
    if (seenEmails.has(email)) continue;
    seenEmails.add(email);

    let preview =
      (lead.token && previewByLeadToken.get(lead.token)) ||
      (lead.previewSlug && previewBySlug.get(lead.previewSlug)) ||
      null;

    if (!preview) {
      preview = previewsByEmail.get(email)?.[0] || null;
    }

    const facebookUrl = preview?.source?.url || lead.facebookUrl || "";
    const rowSegment = classifySegment({ preview, facebookUrl });

    if (segment !== "all" && rowSegment !== segment) continue;

    const expired = preview ? previewIsExpired(preview) : false;
    const ready = Boolean(preview && preview.status === "ready" && !expired);
    const urls = resolveGhostUrls({
      previewSlug: preview?.slug,
      previewReady: ready,
      previewExpired: expired,
    });

    const continueUrl =
      lead.token && !isLeadExpired(lead) ? leadContinueUrl(lead.token) : "";

    rows.push({
      id: String(lead._id),
      leadToken: lead.token,
      email: lead.email,
      phone: lead.phone || "",
      name: lead.name || "",
      businessName: lead.businessName || "",
      city: lead.city || "",
      state: lead.state || "",
      leadStatus: lead.status,
      leadExpired: isLeadExpired(lead),
      previewId: preview?._id ? String(preview._id) : null,
      previewSlug: preview?.slug || lead.previewSlug || "",
      previewStatus: preview?.status || null,
      previewExpired: expired,
      previewExpiresAt: preview?.expiresAt
        ? new Date(preview.expiresAt).toISOString()
        : null,
      previewCreatedAt: preview?.createdAt
        ? new Date(preview.createdAt).toISOString()
        : null,
      facebookUrl,
      segment: rowSegment,
      previewUrl: urls.previewUrl,
      claimUrl: urls.claimUrl,
      continueUrl,
      createdAt: lead.createdAt
        ? new Date(lead.createdAt).toISOString()
        : null,
      updatedAt: lead.updatedAt
        ? new Date(lead.updatedAt).toISOString()
        : null,
    });
  }

  // Unpaid previews with no matching Lead record
  for (const preview of previews) {
    const email = emailKey(preview.email);
    if (!email || paidEmails.has(email) || seenEmails.has(email)) continue;

    const facebookUrl = preview.source?.url || "";
    const rowSegment = classifySegment({ preview, facebookUrl });
    if (segment !== "all" && rowSegment !== segment) continue;
    if (rowSegment === "no_facebook") continue;

    seenEmails.add(email);
    const expired = previewIsExpired(preview);
    const ready = preview.status === "ready" && !expired;
    const urls = resolveGhostUrls({
      previewSlug: preview.slug,
      previewReady: ready,
      previewExpired: expired,
    });

    rows.push({
      id: `preview:${String(preview._id)}`,
      leadToken: preview.leadToken || "",
      email: preview.email,
      phone: "",
      name: "",
      businessName: "",
      city: "",
      state: "",
      leadStatus: "preview_only",
      leadExpired: false,
      previewId: String(preview._id),
      previewSlug: preview.slug,
      previewStatus: preview.status,
      previewExpired: expired,
      previewExpiresAt: preview.expiresAt
        ? new Date(preview.expiresAt).toISOString()
        : null,
      previewCreatedAt: preview.createdAt
        ? new Date(preview.createdAt).toISOString()
        : null,
      facebookUrl,
      segment: rowSegment,
      previewUrl: urls.previewUrl,
      claimUrl: urls.claimUrl,
      continueUrl: "",
      createdAt: preview.createdAt
        ? new Date(preview.createdAt).toISOString()
        : null,
      updatedAt: null,
    });
  }

  rows.sort((a, b) => {
    const aTime = a.updatedAt || a.previewCreatedAt || a.createdAt || "";
    const bTime = b.updatedAt || b.previewCreatedAt || b.createdAt || "";
    return bTime.localeCompare(aTime);
  });

  return rows;
}

export async function getGhostLeadsByIds(ids: string[]) {
  const all = await listGhostLeads("all");
  const wanted = new Set(ids);
  return all.filter((row) => wanted.has(row.id));
}
