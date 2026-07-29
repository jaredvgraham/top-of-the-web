import Order from "@/models/Order";
import Preview from "@/models/Preview";
import Website from "@/models/WebsiteModel";
import Lead, { isLeadExpired } from "@/models/Lead";
import { resolveGhostUrls } from "@/lib/ghostEmailTemplates";

export type GhostSegment = "ready" | "expired" | "all";

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
  segment: "ready" | "expired";
  previewUrl: string;
  claimUrl: string;
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

/**
 * Ghost = became a lead, generated a preview, did not purchase.
 * Paid exclusion matches admin previews: successful Order OR any Website on email.
 */
export async function listGhostLeads(
  segment: GhostSegment = "all"
): Promise<GhostLeadRow[]> {
  const paidEmails = await loadPaidEmails();

  const [leads, previews] = await Promise.all([
    Lead.find({
      status: { $nin: ["purchased"] },
      $or: [
        { previewSlug: { $exists: true, $nin: ["", null] } },
        { status: { $in: ["preview_ready", "generating"] } },
      ],
    })
      .sort({ updatedAt: -1 })
      .lean(),
    Preview.find({
      status: { $in: ["ready", "expired"] },
    })
      .select("slug email leadToken status expiresAt createdAt source")
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  const previewByLeadToken = new Map<string, (typeof previews)[number]>();
  const previewBySlug = new Map<string, (typeof previews)[number]>();
  const readyPreviewsByEmail = new Map<string, (typeof previews)[number][]>();

  for (const preview of previews) {
    if (preview.leadToken) {
      if (!previewByLeadToken.has(preview.leadToken)) {
        previewByLeadToken.set(preview.leadToken, preview);
      }
    }
    if (preview.slug) previewBySlug.set(preview.slug, preview);
    const key = emailKey(preview.email);
    if (!key) continue;
    const list = readyPreviewsByEmail.get(key) || [];
    list.push(preview);
    readyPreviewsByEmail.set(key, list);
  }

  const rows: GhostLeadRow[] = [];
  const seenEmails = new Set<string>();

  for (const lead of leads) {
    const email = emailKey(lead.email);
    if (!email || paidEmails.has(email)) continue;
    if (lead.status === "purchased") continue;

    let preview =
      (lead.token && previewByLeadToken.get(lead.token)) ||
      (lead.previewSlug && previewBySlug.get(lead.previewSlug)) ||
      null;

    // Fall back to newest preview on same email if lead link is missing
    if (!preview) {
      const byEmail = readyPreviewsByEmail.get(email);
      preview = byEmail?.[0] || null;
    }

    // Must have generated a usable/expired demo
    if (!preview) continue;
    if (preview.status !== "ready" && preview.status !== "expired") continue;

    const expired = previewIsExpired(preview);
    const ready = preview.status === "ready" && !expired;
    const rowSegment: "ready" | "expired" = ready ? "ready" : "expired";

    if (segment === "ready" && rowSegment !== "ready") continue;
    if (segment === "expired" && rowSegment !== "expired") continue;

    // Deduplicate by email — keep most recently updated lead
    if (seenEmails.has(email)) continue;
    seenEmails.add(email);

    const urls = resolveGhostUrls({
      previewSlug: preview.slug,
      previewReady: ready,
      previewExpired: expired,
    });

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
      previewSlug: preview.slug || lead.previewSlug || "",
      previewStatus: preview.status || null,
      previewExpired: expired,
      previewExpiresAt: preview.expiresAt
        ? new Date(preview.expiresAt).toISOString()
        : null,
      previewCreatedAt: preview.createdAt
        ? new Date(preview.createdAt).toISOString()
        : null,
      facebookUrl: preview.source?.url || lead.facebookUrl || "",
      segment: rowSegment,
      previewUrl: urls.previewUrl,
      claimUrl: urls.claimUrl,
      createdAt: lead.createdAt
        ? new Date(lead.createdAt).toISOString()
        : null,
      updatedAt: lead.updatedAt
        ? new Date(lead.updatedAt).toISOString()
        : null,
    });
  }

  // Also catch ready/expired unpaid previews that have no lead record
  for (const preview of previews) {
    const email = emailKey(preview.email);
    if (!email || paidEmails.has(email) || seenEmails.has(email)) continue;
    if (preview.status !== "ready" && preview.status !== "expired") continue;

    const expired = previewIsExpired(preview);
    const ready = preview.status === "ready" && !expired;
    const rowSegment: "ready" | "expired" = ready ? "ready" : "expired";
    if (segment === "ready" && rowSegment !== "ready") continue;
    if (segment === "expired" && rowSegment !== "expired") continue;

    seenEmails.add(email);
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
      facebookUrl: preview.source?.url || "",
      segment: rowSegment,
      previewUrl: urls.previewUrl,
      claimUrl: urls.claimUrl,
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
