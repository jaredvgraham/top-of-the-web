const ALLOWED_HOSTS = new Set([
  "facebook.com",
  "www.facebook.com",
  "m.facebook.com",
  "mbasic.facebook.com",
  "web.facebook.com",
  "fb.com",
  "www.fb.com",
]);

function isIpLiteral(host: string) {
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  if (host.includes(":")) return true; // IPv6
  return false;
}

function isPrivateOrLocalHost(host: string) {
  const h = host.toLowerCase();
  if (h === "localhost" || h.endsWith(".localhost") || h === "0.0.0.0") {
    return true;
  }
  if (isIpLiteral(h)) {
    if (
      h.startsWith("10.") ||
      h.startsWith("127.") ||
      h.startsWith("192.168.") ||
      h.startsWith("169.254.") ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(h)
    ) {
      return true;
    }
    return true; // reject all IP literals for this POC
  }
  return false;
}

export type FacebookUrlValidation =
  | { ok: true; normalizedUrl: string }
  | { ok: false; code: string; message: string };

/**
 * Strict Facebook page URL validation for the preview POC.
 */
export function validateFacebookUrl(input: string): FacebookUrlValidation {
  const raw = (input || "").trim();
  if (!raw) {
    return {
      ok: false,
      code: "invalid_url",
      message: "Enter a Facebook business page URL.",
    };
  }

  let url: URL;
  try {
    const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    url = new URL(withProtocol);
  } catch {
    return {
      ok: false,
      code: "invalid_url",
      message: "That doesn’t look like a valid URL.",
    };
  }

  if (url.protocol !== "https:") {
    return {
      ok: false,
      code: "invalid_url",
      message: "Facebook page URLs must use HTTPS.",
    };
  }

  if (url.username || url.password) {
    return {
      ok: false,
      code: "invalid_url",
      message: "URLs with embedded credentials are not allowed.",
    };
  }

  const host = url.hostname.toLowerCase();

  if (isPrivateOrLocalHost(host)) {
    return {
      ok: false,
      code: "invalid_url",
      message: "That URL isn’t allowed.",
    };
  }

  // Reject lookalikes like facebook.com.evil.com
  if (!ALLOWED_HOSTS.has(host)) {
    return {
      ok: false,
      code: "invalid_url",
      message:
        "Enter a genuine Facebook page URL (facebook.com/YourPage).",
    };
  }

  // Must have a path beyond bare domain (or profile.php?id=)
  const parts = url.pathname.split("/").filter(Boolean);
  const hasProfileId =
    parts[0] === "profile.php" && Boolean(url.searchParams.get("id"));
  if (!parts.length && !hasProfileId) {
    return {
      ok: false,
      code: "invalid_url",
      message: "Include the full Facebook page path, not just facebook.com.",
    };
  }

  // Normalize
  url.hash = "";
  // Prefer www for consistency with scrapers
  if (host === "facebook.com" || host === "fb.com" || host === "www.fb.com") {
    url.hostname = "www.facebook.com";
  } else if (host === "m.facebook.com" || host === "mbasic.facebook.com") {
    // Keep mobile hosts — scraper can rewrite
  } else if (host === "web.facebook.com") {
    url.hostname = "www.facebook.com";
  }

  const normalized = url.toString().replace(/\/$/, "");
  return { ok: true, normalizedUrl: normalized };
}
