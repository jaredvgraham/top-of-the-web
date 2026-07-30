/** Client helpers for Meta click + cookie attribution. */

import { hasMetaAdClickAttribution } from "@/lib/preview/hasMetaAdClick";

export { hasMetaAdClickAttribution };

export type MetaClickAttribution = {
  fbclid?: string;
  fbp?: string;
  fbc?: string;
};

export function getCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]*)`)
  );
  return match ? decodeURIComponent(match[1]) : "";
}

function setCookie(name: string, value: string, maxAgeSeconds = 90 * 24 * 60 * 60) {
  if (typeof document === "undefined" || !value) return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
}

/**
 * When someone returns via email continue link, fbclid is gone from the URL and
 * iOS / Facebook in-app browsers often drop `_fbc` / `_fbp`. Re-seed cookies from
 * the Lead record so pixel events (InitiateCheckout, Purchase) can still attribute.
 */
export function restoreMetaClickCookies(attr?: MetaClickAttribution | null) {
  if (typeof document === "undefined" || !attr) return;
  const fbc = (attr.fbc || "").trim();
  const fbp = (attr.fbp || "").trim();
  const fbclid = (attr.fbclid || "").trim();

  if (fbc && !getCookie("_fbc")) {
    setCookie("_fbc", fbc);
  } else if (!getCookie("_fbc") && fbclid) {
    setCookie("_fbc", `fb.1.${Date.now()}.${fbclid}`);
  }

  if (fbp && !getCookie("_fbp")) {
    setCookie("_fbp", fbp);
  }
}

export function readMetaAttributionFromBrowser() {
  const params =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();

  const fbclid = (params.get("fbclid") || "").trim();
  const fbp = getCookie("_fbp");
  let fbc = getCookie("_fbc");
  if (!fbc && fbclid) {
    fbc = `fb.1.${Date.now()}.${fbclid}`;
  }

  return {
    fbclid,
    fbp,
    fbc,
    landingUrl: typeof window !== "undefined" ? window.location.href : "",
    utmSource: (params.get("utm_source") || "").trim(),
    utmMedium: (params.get("utm_medium") || "").trim(),
    utmCampaign: (params.get("utm_campaign") || "").trim(),
    utmContent: (params.get("utm_content") || "").trim(),
    utmTerm: (params.get("utm_term") || "").trim(),
    // Meta URL macros: campaign_id={{campaign.id}} etc.
    campaignId: (
      params.get("campaign_id") ||
      params.get("campaignId") ||
      ""
    ).trim(),
    adsetId: (params.get("adset_id") || params.get("adsetId") || "").trim(),
    adId: (params.get("ad_id") || params.get("adId") || "").trim(),
  };
}

declare global {
  interface Window {
    fbq?: (
      action: string,
      event: string,
      params?: Record<string, string | number>
    ) => void;
  }
}

export function trackMetaEvent(
  event: string,
  params?: Record<string, string | number>
) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  window.fbq("track", event, params);
}

/** Browser cookies/URL, or durable Lead-stored click ids. */
export function shouldCreditMetaClick(
  leadAttr?: MetaClickAttribution | null
) {
  if (hasMetaAdClickAttribution(readMetaAttributionFromBrowser())) return true;
  return hasMetaAdClickAttribution({
    fbclid: leadAttr?.fbclid || "",
    fbc: leadAttr?.fbc || "",
  });
}
