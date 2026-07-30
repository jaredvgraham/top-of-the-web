import { put } from "@vercel/blob";
import type { OnboardingAssetKind } from "@/models/Onboarding";

const GRAPH_VERSION = "v21.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

export type FacebookPageImportData = {
  pageId: string;
  pageUrl: string;
  name: string;
  about: string;
  description: string;
  phone: string;
  email: string;
  website: string;
  city: string;
  state: string;
  category: string;
  addressLine: string;
  profilePictureUrl: string;
  coverPhotoUrl: string;
  photoUrls: string[];
  postSnippets: string[];
  /**
   * Optional image bytes captured during Playwright (avoids re-fetching CDN
   * URLs that sometimes return 315×315 stubs to the app server).
   */
  photoBinaries?: Array<{
    url: string;
    contentType: string;
    base64: string;
  }>;
};

type GraphErrorBody = {
  error?: { message?: string; code?: number; type?: string };
};

function getFacebookAccessToken() {
  const direct = process.env.FACEBOOK_ACCESS_TOKEN?.trim();
  if (direct) return direct;

  const appId = process.env.FACEBOOK_APP_ID?.trim();
  const appSecret = process.env.FACEBOOK_APP_SECRET?.trim();
  if (appId && appSecret) return `${appId}|${appSecret}`;

  return "";
}

export function facebookImportConfigured() {
  // Local scrape JSON upload always works; Graph token is optional.
  return true;
}

export function facebookGraphConfigured() {
  return Boolean(getFacebookAccessToken());
}

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function asStringArray(value: unknown) {
  if (!Array.isArray(value)) return [] as string[];
  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

/** Accepts output from a local scrape script / uploaded JSON. */
export function normalizeScrapedFacebookPayload(
  raw: unknown,
  fallbackPageUrl = ""
): FacebookPageImportData {
  const data =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};

  const photoUrls = uniqueUrls([
    ...asStringArray(data.photoUrls),
    ...asStringArray(data.photos),
    ...asStringArray(data.images),
    asString(data.profilePictureUrl),
    asString(data.coverPhotoUrl),
    asString(data.profileImage),
    asString(data.coverImage),
  ]);

  const pageUrl =
    asString(data.pageUrl) ||
    asString(data.url) ||
    asString(data.link) ||
    fallbackPageUrl;

  return {
    pageId: asString(data.pageId) || asString(data.id) || "local-scrape",
    pageUrl,
    name: asString(data.name) || asString(data.businessName) || asString(data.title),
    about: asString(data.about),
    description: asString(data.description),
    phone: asString(data.phone),
    email: asString(data.email).toLowerCase(),
    website: asString(data.website),
    city: asString(data.city),
    state: asString(data.state),
    category: asString(data.category),
    addressLine: asString(data.addressLine) || asString(data.address),
    profilePictureUrl:
      asString(data.profilePictureUrl) || asString(data.profileImage),
    coverPhotoUrl: asString(data.coverPhotoUrl) || asString(data.coverImage),
    photoUrls,
    postSnippets: asStringArray(data.postSnippets || data.posts),
  };
}

/** Extract page username or numeric id from common Facebook URL shapes. */
export function parseFacebookPageInput(input: string) {
  const raw = input.trim();
  if (!raw) return "";

  if (/^\d+$/.test(raw)) return raw;
  if (/^[A-Za-z0-9._-]+$/.test(raw) && !raw.includes("/")) return raw;

  try {
    const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    const url = new URL(withProtocol);
    const host = url.hostname.replace(/^www\./, "");
    if (
      host !== "facebook.com" &&
      host !== "m.facebook.com" &&
      host !== "fb.com" &&
      host !== "web.facebook.com"
    ) {
      return "";
    }

    const parts = url.pathname.split("/").filter(Boolean);
    if (!parts.length) return "";

    if (parts[0] === "profile.php") {
      return url.searchParams.get("id") || "";
    }
    if (parts[0] === "pages" && parts.length >= 3) {
      const maybeId = parts[parts.length - 1];
      return /^\d+$/.test(maybeId) ? maybeId : parts[1];
    }
    if (parts[0] === "people" && parts.length >= 3) {
      return parts[parts.length - 1];
    }

    const skip = new Set([
      "photo",
      "photos",
      "posts",
      "videos",
      "about",
      "reviews",
      "events",
      "services",
      "shop",
    ]);
    for (const part of parts) {
      if (!skip.has(part.toLowerCase())) return decodeURIComponent(part);
    }
    return "";
  } catch {
    return "";
  }
}

async function graphGet<T>(
  path: string,
  searchParams: Record<string, string>
): Promise<T> {
  const token = getFacebookAccessToken();
  if (!token) {
    throw new Error(
      "Facebook import is not configured. Add FACEBOOK_ACCESS_TOKEN (or FACEBOOK_APP_ID + FACEBOOK_APP_SECRET) in Vercel env."
    );
  }

  const url = new URL(
    path.startsWith("http") ? path : `${GRAPH_BASE}/${path.replace(/^\//, "")}`
  );
  Object.entries(searchParams).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  url.searchParams.set("access_token", token);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  const data = (await response.json()) as T & GraphErrorBody;
  if (!response.ok || data.error) {
    const message =
      data.error?.message || `Facebook Graph API error (${response.status})`;
    throw new Error(message);
  }
  return data;
}

type PageGraphResponse = {
  id: string;
  name?: string;
  about?: string;
  description?: string;
  phone?: string;
  emails?: string[];
  website?: string;
  category?: string;
  link?: string;
  single_line_address?: string;
  location?: {
    city?: string;
    state?: string;
    street?: string;
    zip?: string;
    country?: string;
  };
  picture?: { data?: { url?: string } };
  cover?: { source?: string };
  photos?: {
    data?: Array<{
      id?: string;
      name?: string;
      images?: Array<{ source?: string; width?: number; height?: number }>;
    }>;
  };
  posts?: {
    data?: Array<{
      message?: string;
      full_picture?: string;
      created_time?: string;
    }>;
  };
};

function largestImageSource(
  images?: Array<{ source?: string; width?: number; height?: number }>
) {
  if (!images?.length) return "";
  const sorted = [...images].sort(
    (a, b) =>
      (b.width || 0) * (b.height || 0) - (a.width || 0) * (a.height || 0)
  );
  return sorted[0]?.source || "";
}

function uniqueUrls(urls: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const url of urls) {
    const trimmed = url.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    out.push(trimmed);
  }
  return out;
}

export async function fetchFacebookPageData(
  pageInput: string
): Promise<FacebookPageImportData> {
  const pageKey = parseFacebookPageInput(pageInput);
  if (!pageKey) {
    throw new Error(
      "Enter a valid Facebook page URL or username (example: https://www.facebook.com/YourPage)."
    );
  }

  const fields = [
    "id",
    "name",
    "about",
    "description",
    "phone",
    "emails",
    "website",
    "category",
    "link",
    "single_line_address",
    "location",
    "picture.type(large)",
    "cover",
    "photos.limit(60).type(uploaded){images,name}",
    "posts.limit(40){message,full_picture,created_time}",
  ].join(",");

  const page = await graphGet<PageGraphResponse>(pageKey, { fields });

  const photoUrls = uniqueUrls([
    ...(page.photos?.data || [])
      .map((photo) => largestImageSource(photo.images))
      .filter(Boolean),
    ...(page.posts?.data || [])
      .map((post) => post.full_picture || "")
      .filter(Boolean),
    page.cover?.source || "",
    page.picture?.data?.url || "",
  ]);

  const postSnippets = (page.posts?.data || [])
    .map((post) => (post.message || "").trim())
    .filter(Boolean)
    .slice(0, 8);

  const emailFromPage =
    Array.isArray(page.emails) && page.emails.length
      ? page.emails[0].trim().toLowerCase()
      : "";

  return {
    pageId: page.id,
    pageUrl: page.link || `https://www.facebook.com/${pageKey}`,
    name: (page.name || "").trim(),
    about: (page.about || "").trim(),
    description: (page.description || "").trim(),
    phone: (page.phone || "").trim(),
    email: emailFromPage,
    website: (page.website || "").trim(),
    city: (page.location?.city || "").trim(),
    state: (page.location?.state || "").trim(),
    category: (page.category || "").trim(),
    addressLine: (page.single_line_address || "").trim(),
    profilePictureUrl: page.picture?.data?.url || "",
    coverPhotoUrl: page.cover?.source || "",
    photoUrls,
    postSnippets,
  };
}

export function buildBusinessDescription(data: FacebookPageImportData) {
  const chunks: string[] = [];
  if (data.about) chunks.push(data.about);
  if (data.description && data.description !== data.about) {
    chunks.push(data.description);
  }
  if (data.category) chunks.push(`Category: ${data.category}`);
  if (data.postSnippets.length) {
    chunks.push(
      `Recent Facebook posts:\n${data.postSnippets
        .map((snippet) => `• ${snippet}`)
        .join("\n")}`
    );
  }
  return chunks.join("\n\n").trim();
}

export function buildFacebookImportNotes(data: FacebookPageImportData) {
  return [
    "Imported from Facebook page",
    `Page: ${data.pageUrl}`,
    data.category ? `Category: ${data.category}` : "",
    data.addressLine ? `Address: ${data.addressLine}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export type ImportedBlobAsset = {
  url: string;
  pathname: string;
  filename: string;
  kind: OnboardingAssetKind;
  caption: string;
  uploadedAt: Date;
};

/**
 * FB CDN URLs are signed (oh/oe). Rewriting the path / `_n`→`_o` breaks auth.
 * Safe upgrade: when `cstp=mxWxH` advertises a larger max than `ctp=`, bump `ctp`
 * to that max via string replace (preserve query order / signature params).
 */
export function upgradeFacebookImageUrl(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;

  const mx = trimmed.match(/[?&]cstp=mx(\d+)x(\d+)/i);
  if (!mx) return trimmed;
  const maxW = Number(mx[1]);
  const maxH = Number(mx[2]);
  if (!maxW || !maxH) return trimmed;

  const targetCtp = `ctp=s${maxW}x${maxH}`;
  const ctpMatch = trimmed.match(/[?&]ctp=((?:s|p)(\d+)x(\d+))/i);
  if (ctpMatch) {
    const curW = Number(ctpMatch[2]);
    const curH = Number(ctpMatch[3]);
    if (Math.min(curW, curH) >= Math.min(maxW, maxH)) return trimmed;
    return trimmed.replace(/ctp=(?:s|p)\d+x\d+/i, targetCtp);
  }

  // No ctp yet — insert after cstp without reshuffling other params.
  return trimmed.replace(/(cstp=mx\d+x\d+)/i, `$1&${targetCtp}`);
}

/** Min edge implied by ctp/stp size tokens; 0 if unknown. */
export function facebookPhotoMinEdge(url: string) {
  const lower = url.toLowerCase();
  const ctp = lower.match(/ctp=(?:s|p)(\d+)x(\d+)/);
  if (ctp) return Math.min(Number(ctp[1]), Number(ctp[2]));
  const stpSize = lower.match(/_(?:fb\d+_)?s(\d+)x(\d+)/);
  if (stpSize) return Math.min(Number(stpSize[1]), Number(stpSize[2]));
  const cstp = lower.match(/cstp=mx(\d+)x(\d+)/);
  if (cstp) return Math.min(Number(cstp[1]), Number(cstp[2]));
  return 0;
}

/** Stable id for deduping the same photo at many sizes. */
export function facebookImageAssetId(url: string) {
  try {
    const path = new URL(url).pathname;
    const match =
      path.match(/\/(\d+_\d+_\d+)_[a-z]\./i) ||
      path.match(/\/(\d+_\d+_\d+)\./i);
    return match?.[1] || path;
  } catch {
    return url;
  }
}

/** Prefer larger already-signed variants; never rewrite the signed path. */
export function scoreFacebookPhotoUrl(url: string) {
  const lower = url.toLowerCase();
  if (/\.kf(\?|$)/i.test(lower)) return -10000;
  if (/hads-ak|\/ads\//i.test(lower)) return -10000;
  if (!/\.(jpe?g|png|webp)(\?|$)/i.test(lower)) return -5000;

  let score = 0;
  const edge = facebookPhotoMinEdge(url);
  if (edge) score += edge;
  const ctp = lower.match(/ctp=(?:s|p)(\d+)x(\d+)/);
  if (ctp) score += Math.min(Number(ctp[1]), Number(ctp[2])) * 0.25;
  const stpSize = lower.match(/_(?:fb\d+_)?s(\d+)x(\d+)/);
  if (stpSize) score += Math.min(Number(stpSize[1]), Number(stpSize[2])) * 0.5;
  if (/ctp=s2048|ctp=p960|ctp=s960|ctp=s1536/i.test(lower)) score += 200;
  if (/ctp=s(?:64|80|100|120|200)x/i.test(lower)) score -= 800;
  if (/t39\.30808-6\//i.test(lower)) score += 80; // feed/album photos
  if (/t39\.30808-1\//i.test(lower)) score += 40; // profile-ish
  // Prefer URLs already bumped toward cstp max
  const mx = lower.match(/cstp=mx(\d+)x(\d+)/);
  const ctpExact = lower.match(/ctp=s(\d+)x(\d+)/);
  if (
    mx &&
    ctpExact &&
    mx[1] === ctpExact[1] &&
    mx[2] === ctpExact[2]
  ) {
    score += 400;
  }
  return score;
}

export function pickBestFacebookPhotoUrls(urls: string[], limit = 40) {
  const bestById = new Map<string, string>();
  for (const url of urls) {
    const trimmed = url.trim();
    if (!trimmed || isFacebookChromeImageUrl(trimmed)) continue;
    if (scoreFacebookPhotoUrl(trimmed) < 0) continue;
    // Prefer upgraded CDN size when cstp advertises a larger max.
    const upgraded = upgradeFacebookImageUrl(trimmed);
    const candidate =
      scoreFacebookPhotoUrl(upgraded) > scoreFacebookPhotoUrl(trimmed)
        ? upgraded
        : trimmed;
    const id = facebookImageAssetId(candidate);
    const prev = bestById.get(id);
    if (!prev || scoreFacebookPhotoUrl(candidate) > scoreFacebookPhotoUrl(prev)) {
      bestById.set(id, candidate);
    }
  }
  return Array.from(bestById.values())
    .sort((a, b) => scoreFacebookPhotoUrl(b) - scoreFacebookPhotoUrl(a))
    .slice(0, limit);
}

/** Facebook UI chrome / icons / emoji / ads / video fragments — not client photos. */
export function isFacebookChromeImageUrl(url: string) {
  const lower = url.toLowerCase();
  return (
    lower.includes("static.xx.fbcdn.net") ||
    lower.includes("static.facebook.com") ||
    lower.includes("/rsrc.php") ||
    lower.includes("emoji.php") ||
    lower.includes("/images/emoji") ||
    lower.includes("/images/icons") ||
    lower.includes("/images/fb_icon") ||
    lower.includes("fb_favicon") ||
    lower.includes("/images/messaging/") ||
    lower.includes("facebook.com/images/") ||
    lower.includes("hads-ak") ||
    /\.kf(\?|$)/i.test(lower) ||
    /\.css(\?|$)/i.test(lower) ||
    /\.js(\?|$)/i.test(lower) ||
    // Path-style size folders under 600px are thumbs / icons (incl. s315x315)
    (() => {
      const pathSize = url.match(/\/s(\d+)x(\d+)\//i);
      if (!pathSize) return false;
      return Math.min(Number(pathSize[1]), Number(pathSize[2])) < 600;
    })()
  );
}

function isTinyFacebookVariant(url: string) {
  const edge = facebookPhotoMinEdge(url);
  return (
    /\/s(?:5|6|7|8|9|\d{2}|1\d{2}|2\d{2}|3\d{2}|4\d{2}|5\d{2})x(?:5|6|7|8|9|\d{2}|1\d{2}|2\d{2}|3\d{2}|4\d{2}|5\d{2})\//i.test(
      url
    ) ||
    /_[sp]\.(jpe?g|png|webp)(?:\?|$)/i.test(url) ||
    /stp=[^&]*p(?:5|6|7|8|9|\d{2}|1\d{2}|2\d{2}|3\d{2}|4\d{2}|5\d{2})x/i.test(
      url
    ) ||
    (edge > 0 && edge < 600)
  );
}

/** Read pixel size from JPEG/PNG/WebP headers. Returns 0×0 if unknown. */
export function readImageDimensions(buffer: Buffer): {
  width: number;
  height: number;
} {
  if (!buffer?.length) return { width: 0, height: 0 };

  // JPEG
  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    let i = 2;
    while (i < buffer.length - 9) {
      if (buffer[i] !== 0xff) {
        i += 1;
        continue;
      }
      const marker = buffer[i + 1];
      if (marker === 0xc0 || marker === 0xc2) {
        return {
          height: buffer.readUInt16BE(i + 5),
          width: buffer.readUInt16BE(i + 7),
        };
      }
      const len = buffer.readUInt16BE(i + 2);
      i += 2 + len;
    }
  }

  // PNG
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return {
      width: buffer.readUInt32BE(16),
      height: buffer.readUInt32BE(20),
    };
  }

  // WebP (VP8X / VP8 / VP8L)
  if (
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    const chunk = buffer.toString("ascii", 12, 16);
    if (chunk === "VP8X" && buffer.length >= 30) {
      const width =
        1 + buffer[24] + (buffer[25] << 8) + ((buffer[26] & 0xff) << 16);
      const height =
        1 + buffer[27] + (buffer[28] << 8) + ((buffer[29] & 0xff) << 16);
      return { width, height };
    }
    if (chunk === "VP8 " && buffer.length >= 30) {
      return {
        width: buffer.readUInt16LE(26) & 0x3fff,
        height: buffer.readUInt16LE(28) & 0x3fff,
      };
    }
    if (chunk === "VP8L" && buffer.length >= 25) {
      const b0 = buffer[21];
      const b1 = buffer[22];
      const b2 = buffer[23];
      const b3 = buffer[24];
      const width = 1 + (((b1 & 0x3f) << 8) | b0);
      const height =
        1 + (((b3 & 0xf) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6));
      return { width, height };
    }
  }

  return { width: 0, height: 0 };
}

async function downloadAndStoreImage(options: {
  sourceUrl: string;
  token: string;
  kind: OnboardingAssetKind;
  filenameHint: string;
  caption?: string;
  /** Prefer these bytes (from Playwright) over re-fetching the CDN. */
  binary?: { contentType: string; base64: string } | null;
  /** Minimum acceptable short edge in pixels (profile can be lower). */
  minEdge?: number;
}): Promise<ImportedBlobAsset | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN is required to import Facebook photos."
    );
  }

  const minEdge = options.minEdge ?? 700;
  const upgraded = upgradeFacebookImageUrl(options.sourceUrl);
  if (
    isFacebookChromeImageUrl(options.sourceUrl) ||
    scoreFacebookPhotoUrl(options.sourceUrl) < 0
  ) {
    console.log(
      `[fb-import] skip junk/non-photo: ${options.sourceUrl.slice(0, 120)}`
    );
    return null;
  }

  const urlEdge = facebookPhotoMinEdge(options.sourceUrl);
  if (urlEdge > 0 && urlEdge < minEdge && !options.binary) {
    console.log(
      `[fb-import] skip small URL (${urlEdge}px): ${options.sourceUrl.slice(0, 120)}`
    );
    return null;
  }

  // Largest first: upgraded ctp (when cstp allows) before the thumbnail URL.
  const candidates = uniqueUrls(
    [upgraded, options.sourceUrl].filter(
      (url) =>
        url && !isFacebookChromeImageUrl(url) && scoreFacebookPhotoUrl(url) >= 0
    )
  ).sort((a, b) => scoreFacebookPhotoUrl(b) - scoreFacebookPhotoUrl(a));

  try {
    let buffer: Buffer | null = null;
    let contentType = "image/jpeg";
    const failReasons: string[] = [];

    if (options.binary?.base64) {
      try {
        const bytes = Buffer.from(options.binary.base64, "base64");
        const { width, height } = readImageDimensions(bytes);
        const edge = Math.min(width, height);
        if (
          bytes.length >= 8 * 1024 &&
          bytes.length <= 20 * 1024 * 1024 &&
          (edge === 0 || edge >= minEdge)
        ) {
          buffer = bytes;
          contentType =
            options.binary.contentType.split(";")[0].trim() || "image/jpeg";
          console.log(
            `[fb-import] using scrape binary ${width || "?"}x${height || "?"} (${bytes.length}b)`
          );
        } else {
          failReasons.push(
            `binary-too-small:${width}x${height}:${bytes.length}`
          );
        }
      } catch (error) {
        failReasons.push(
          `binary-err:${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    for (const candidate of candidates) {
      if (buffer) break;
      try {
        const response = await fetch(candidate, {
          headers: {
            Accept: "image/jpeg,image/png,image/webp,image/*,*/*;q=0.8",
            "User-Agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            Referer: "https://www.facebook.com/",
          },
          cache: "no-store",
          redirect: "follow",
        });
        if (!response.ok) {
          failReasons.push(`${response.status} ${candidate.slice(0, 80)}`);
          continue;
        }

        const type = response.headers.get("content-type") || "image/jpeg";
        if (!type.startsWith("image/")) {
          failReasons.push(`not-image:${type}`);
          continue;
        }

        const bytes = Buffer.from(await response.arrayBuffer());
        if (!bytes.length || bytes.length > 20 * 1024 * 1024) continue;
        if (bytes.length < 8 * 1024) continue;
        if (bytes.length < 20 * 1024 && isTinyFacebookVariant(candidate)) {
          continue;
        }

        const { width, height } = readImageDimensions(bytes);
        const edge = Math.min(width, height);
        if (width && height && edge < minEdge) {
          failReasons.push(`too-small:${width}x${height}`);
          console.log(
            `[fb-import] reject ${width}x${height} from ${candidate.slice(0, 100)}`
          );
          continue;
        }

        buffer = bytes;
        contentType = type.split(";")[0].trim() || "image/jpeg";
        if (width && height) {
          console.log(
            `[fb-import] fetched ${width}x${height} (${bytes.length}b)`
          );
        }
        break;
      } catch (error) {
        failReasons.push(
          `err:${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    if (!buffer) {
      if (failReasons.length) {
        console.log(
          `[fb-import] download failed: ${failReasons.slice(0, 4).join(" | ")}`
        );
      }
      return null;
    }

    const ext = contentType.includes("png")
      ? "png"
      : contentType.includes("webp")
        ? "webp"
        : contentType.includes("gif")
          ? "gif"
          : "jpg";
    const safe =
      options.filenameHint.replace(/[^a-zA-Z0-9._-]/g, "_") || "photo";
    const pathname = `onboarding/${options.token}/facebook-${options.kind}-${Date.now()}-${safe}.${ext}`;

    const blob = await put(pathname, buffer, {
      access: "public",
      contentType,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      addRandomSuffix: true,
    });

    return {
      url: blob.url,
      pathname: blob.pathname,
      filename: `${safe}.${ext}`,
      kind: options.kind,
      caption: options.caption || "",
      uploadedAt: new Date(),
    };
  } catch (error) {
    console.warn("Failed to import Facebook image", options.sourceUrl, error);
    return null;
  }
}

export async function importFacebookImagesToBlob(
  data: FacebookPageImportData,
  onboardingToken: string
) {
  const assets: ImportedBlobAsset[] = [];
  const binariesById = new Map<
    string,
    { url: string; contentType: string; base64: string }
  >();
  for (const binary of data.photoBinaries || []) {
    if (!binary?.url || !binary.base64) continue;
    binariesById.set(facebookImageAssetId(binary.url), binary);
  }

  const findBinary = (url: string) =>
    binariesById.get(facebookImageAssetId(url)) || null;

  if (data.profilePictureUrl) {
    // Save as photo — vision decides if it's a real logo. Profile portraits
    // must not auto-become the site logo.
    const profile = await downloadAndStoreImage({
      sourceUrl: data.profilePictureUrl,
      token: onboardingToken,
      kind: "photo",
      filenameHint: "profile",
      caption: "Facebook profile picture",
      binary: findBinary(data.profilePictureUrl),
      minEdge: 200,
    });
    if (profile) {
      console.log(`[fb-import] saved profile photo`);
      assets.push(profile);
    } else {
      console.log(`[fb-import] FAILED profile: ${data.profilePictureUrl}`);
    }
  }

  if (data.coverPhotoUrl) {
    const about = await downloadAndStoreImage({
      sourceUrl: data.coverPhotoUrl,
      token: onboardingToken,
      kind: "about",
      filenameHint: "cover",
      caption: "Facebook cover photo",
      binary: findBinary(data.coverPhotoUrl),
      minEdge: 600,
    });
    if (about) {
      console.log(`[fb-import] saved cover`);
      assets.push(about);
    } else {
      console.log(`[fb-import] FAILED cover: ${data.coverPhotoUrl}`);
    }
  }

  const gallerySources = pickBestFacebookPhotoUrls(
    data.photoUrls.filter(
      (url) => url !== data.profilePictureUrl && url !== data.coverPhotoUrl
    ),
    16
  ).filter((url) => {
    const edge = facebookPhotoMinEdge(url);
    // Keep unknown-size URLs (edge=0); drop known thumbs under 700px.
    return edge === 0 || edge >= 700 || Boolean(findBinary(url));
  });

  const galleryResults = await mapPool(gallerySources, 3, async (sourceUrl, i) => {
    const imported = await downloadAndStoreImage({
      sourceUrl,
      token: onboardingToken,
      kind: "photo",
      filenameHint: `gallery-${i + 1}`,
      caption: "Imported from Facebook",
      binary: findBinary(sourceUrl),
      minEdge: 700,
    });
    if (imported) {
      console.log(
        `[fb-import] saved photo: ${sourceUrl.slice(0, 120)}`
      );
    } else {
      console.log(`[fb-import] FAILED photo: ${sourceUrl.slice(0, 160)}`);
    }
    return imported;
  });

  for (const imported of galleryResults) {
    if (imported && assets.length < 18) assets.push(imported);
  }

  console.log(
    `[fb-import] done — saved ${assets.length} assets from ${data.photoUrls.length} candidate URLs` +
      (binariesById.size ? ` (${binariesById.size} scrape binaries)` : "")
  );

  return assets;
}

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await fn(items[index], index);
    }
  }
  const workers = Array.from(
    { length: Math.min(concurrency, Math.max(items.length, 1)) },
    () => worker()
  );
  await Promise.all(workers);
  return results;
}
