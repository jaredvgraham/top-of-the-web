import { put } from "@vercel/blob";
import type { PreviewImageAnalysis } from "@/lib/preview/analyzePreviewImages";

function initialsFromName(name: string): string {
  const words = name
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !/^(the|and|of|for|a|an)$/i.test(w));
  if (!words.length) return "B";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Prefer a vision-confirmed logo mark.
 * Never treat a Facebook profile portrait as a logo.
 * Otherwise generate a branded initials SVG and upload it.
 */
export async function resolvePreviewLogo(options: {
  businessName: string;
  existingLogoUrl?: string;
  analyses: PreviewImageAnalysis[];
  primaryColor: string;
  accentColor: string;
  token: string;
}): Promise<string> {
  const {
    businessName,
    existingLogoUrl,
    analyses,
    primaryColor,
    accentColor,
    token,
  } = options;

  const visionLogo = analyses.find((a) => {
    if (a.roleSuggestion !== "logo" || a.quality === "low") return false;
    const hay = `${a.subject} ${a.classification} ${a.notes}`;
    return !/profile|portrait|selfie|headshot|person|people/i.test(hay);
  })?.url;

  if (visionLogo) return visionLogo;

  if (existingLogoUrl) {
    const meta = analyses.find((a) => a.url === existingLogoUrl);
    if (
      meta?.roleSuggestion === "logo" &&
      !/profile|portrait|selfie|headshot|person/i.test(
        `${meta.subject} ${meta.classification} ${meta.notes}`
      )
    ) {
      return existingLogoUrl;
    }
  }

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (!blobToken) return "";

  try {
    const initials = initialsFromName(businessName);
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128" fill="none">
  <rect width="128" height="128" rx="28" fill="${primaryColor || "#1A1433"}"/>
  <rect width="128" height="128" rx="28" fill="${accentColor || "#5B2E9E"}" fill-opacity="0.28"/>
  <text x="64" y="82" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="52" font-weight="600" fill="#FFFFFF">${escapeXml(
    initials
  )}</text>
</svg>`;

    const pathname = `onboarding/${token}/generated-logo-${Date.now()}.svg`;
    const blob = await put(pathname, Buffer.from(svg, "utf8"), {
      access: "public",
      contentType: "image/svg+xml",
      token: blobToken,
      addRandomSuffix: true,
    });
    console.log(
      `[preview-logo] generated mark for "${businessName}" → ${blob.url}`
    );
    return blob.url;
  } catch (error) {
    console.warn(
      "[preview-logo] generate failed",
      error instanceof Error ? error.message : error
    );
    return "";
  }
}
