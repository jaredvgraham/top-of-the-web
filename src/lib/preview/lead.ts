import { randomUUID } from "crypto";
import { siteOrigin } from "@/lib/mail";

export function createLeadToken() {
  return randomUUID().replace(/-/g, "") + randomUUID().replace(/-/g, "").slice(0, 16);
}

export function normalizeLeadEmail(email: string) {
  return email.trim().toLowerCase();
}

/** Keep digits and leading + for display/storage. */
export function normalizeLeadPhone(phone: string) {
  const raw = phone.trim();
  const digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) {
    return "+" + digits.slice(1).replace(/\D/g, "");
  }
  return digits.replace(/\D/g, "");
}

export function isValidLeadPhone(phone: string) {
  const digits = normalizeLeadPhone(phone).replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

export function leadContinueUrl(token: string, origin?: string) {
  const base = (origin || siteOrigin()).replace(/\/$/, "");
  return `${base}/preview/continue/${token}`;
}

export function buildFbcFromFbclid(fbclid: string, createdAt = new Date()) {
  const cleaned = fbclid.trim();
  if (!cleaned) return "";
  // Meta fbc format: fb.1.<timestamp_ms>.<fbclid>
  return `fb.1.${createdAt.getTime()}.${cleaned}`;
}

/**
 * True only with evidence of a Meta ad click.
 * `_fbp` alone does not count — the pixel sets that on any organic visit.
 */
export function hasMetaAdClickAttribution(attr?: {
  fbclid?: string;
  fbc?: string;
}) {
  const fbclid = attr?.fbclid?.trim() || "";
  const fbc = attr?.fbc?.trim() || "";
  // fbc looks like: fb.1.<timestamp>.<fbclid>
  return Boolean(fbclid || /^fb\.\d+\.\d+\./.test(fbc));
}
