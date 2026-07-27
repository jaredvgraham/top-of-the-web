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
 * FB CDN URLs are signed (oh/oe). Changing `_n` → `_o` or stripping path
 * segments invalidates the signature and downloads 404. Keep the URL as-is;
 * pick the best already-signed size via `pickBestFacebookPhotoUrls`.
 */
export function upgradeFacebookImageUrl(url: string) {
  return url;
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
  const ctp = lower.match(/ctp=(?:s|p)(\d+)x(\d+)/);
  if (ctp) score += Math.min(Number(ctp[1]), Number(ctp[2]));
  const stpSize = lower.match(/_(?:fb\d+_)?s(\d+)x(\d+)/);
  if (stpSize) score += Math.min(Number(stpSize[1]), Number(stpSize[2])) * 0.5;
  if (/ctp=s2048|ctp=p960|ctp=s960/i.test(lower)) score += 200;
  if (/ctp=s(?:64|80|100|120|200)x/i.test(lower)) score -= 800;
  if (/t39\.30808-6\//i.test(lower)) score += 80; // feed/album photos
  if (/t39\.30808-1\//i.test(lower)) score += 40; // profile-ish
  return score;
}

export function pickBestFacebookPhotoUrls(urls: string[], limit = 40) {
  const bestById = new Map<string, string>();
  for (const url of urls) {
    const trimmed = url.trim();
    if (!trimmed || isFacebookChromeImageUrl(trimmed)) continue;
    if (scoreFacebookPhotoUrl(trimmed) < 0) continue;
    const id = facebookImageAssetId(trimmed);
    const prev = bestById.get(id);
    if (!prev || scoreFacebookPhotoUrl(trimmed) > scoreFacebookPhotoUrl(prev)) {
      bestById.set(id, trimmed);
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
    // tiny icon size folders only (not all sNNNxNNN — those can be real photos)
    /\/s(?:[1-9]|[1-4]\d)x(?:[1-9]|[1-4]\d)\//i.test(url)
  );
}

function isTinyFacebookVariant(url: string) {
  return (
    /\/s(?:5|6|7|8|9|\d{2}|1\d{2}|2\d{2})x(?:5|6|7|8|9|\d{2}|1\d{2}|2\d{2})\//i.test(
      url
    ) ||
    /_[sp]\.(jpe?g|png|webp)(?:\?|$)/i.test(url) ||
    /stp=[^&]*p(?:5|6|7|8|9|\d{2}|1\d{2})x/i.test(url)
  );
}

async function downloadAndStoreImage(options: {
  sourceUrl: string;
  token: string;
  kind: OnboardingAssetKind;
  filenameHint: string;
  caption?: string;
}): Promise<ImportedBlobAsset | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN is required to import Facebook photos."
    );
  }

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

  // Prefer the original signed URL first — rewriting path breaks CDN auth.
  const candidates = uniqueUrls(
    [options.sourceUrl, upgraded].filter(
      (url) =>
        url && !isFacebookChromeImageUrl(url) && scoreFacebookPhotoUrl(url) >= 0
    )
  );

  try {
    let buffer: Buffer | null = null;
    let contentType = "image/jpeg";
    const failReasons: string[] = [];

    for (const candidate of candidates) {
      try {
        const response = await fetch(candidate, {
          headers: {
            Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
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

        buffer = bytes;
        contentType = type.split(";")[0].trim() || "image/jpeg";
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
          `[fb-import] download failed: ${failReasons.slice(0, 3).join(" | ")}`
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

  if (data.profilePictureUrl) {
    // Save as photo — vision decides if it's a real logo. Profile portraits
    // must not auto-become the site logo.
    const profile = await downloadAndStoreImage({
      sourceUrl: data.profilePictureUrl,
      token: onboardingToken,
      kind: "photo",
      filenameHint: "profile",
      caption: "Facebook profile picture",
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
  );

  const galleryResults = await mapPool(gallerySources, 6, async (sourceUrl, i) => {
    const imported = await downloadAndStoreImage({
      sourceUrl,
      token: onboardingToken,
      kind: "photo",
      filenameHint: `gallery-${i + 1}`,
      caption: "Imported from Facebook",
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
    `[fb-import] done — saved ${assets.length} assets from ${data.photoUrls.length} candidate URLs`
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
