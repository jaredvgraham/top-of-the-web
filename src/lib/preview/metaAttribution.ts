/** Client helpers for Meta click + cookie attribution. */

import { hasMetaAdClickAttribution } from "@/lib/preview/hasMetaAdClick";

export { hasMetaAdClickAttribution };

export function getCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]*)`)
  );
  return match ? decodeURIComponent(match[1]) : "";
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
