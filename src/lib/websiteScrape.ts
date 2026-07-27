import type { OnboardingAssetKind } from "@/models/Onboarding";
import type { ImportedBlobAsset } from "@/lib/facebookPageImport";
import { put } from "@vercel/blob";

export type WebsitePageDump = {
  url: string;
  title: string;
  h1: string;
  metaDescription: string;
  bodyText: string;
  headings: string[];
};

export type WebsiteScrapeData = {
  siteUrl: string;
  name: string;
  tagline: string;
  about: string;
  description: string;
  phone: string;
  email: string;
  website: string;
  city: string;
  state: string;
  addressLine: string;
  services: string[];
  pagesVisited: string[];
  pageSummaries: WebsitePageDump[];
  logoUrl: string;
  imageUrls: string[];
  socialLinks: string[];
};

function unique(list: string[]) {
  return Array.from(new Set(list.map((item) => item.trim()).filter(Boolean)));
}

function uniqueUrls(urls: string[]) {
  return unique(urls);
}

async function downloadAndStoreSiteImage(options: {
  sourceUrl: string;
  token: string;
  kind: OnboardingAssetKind;
  filenameHint: string;
  caption?: string;
  referer: string;
}): Promise<ImportedBlobAsset | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN is required to import website photos."
    );
  }

  try {
    const response = await fetch(options.sourceUrl, {
      headers: {
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Referer: options.referer,
      },
      cache: "no-store",
      redirect: "follow",
    });
    if (!response.ok) {
      console.log(
        `[site-import] FAILED ${response.status}: ${options.sourceUrl.slice(0, 120)}`
      );
      return null;
    }
    const type = response.headers.get("content-type") || "image/jpeg";
    if (!type.startsWith("image/")) {
      console.log(
        `[site-import] not image (${type}): ${options.sourceUrl.slice(0, 80)}`
      );
      return null;
    }
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length < 4 * 1024 || bytes.length > 20 * 1024 * 1024) {
      console.log(
        `[site-import] bad size ${bytes.length}: ${options.sourceUrl.slice(0, 80)}`
      );
      return null;
    }

    const ext = type.includes("png")
      ? "png"
      : type.includes("webp")
        ? "webp"
        : type.includes("gif")
          ? "gif"
          : "jpg";
    const safe =
      options.filenameHint.replace(/[^a-zA-Z0-9._-]/g, "_") || "photo";
    const pathname = `onboarding/${options.token}/website-${options.kind}-${Date.now()}-${safe}.${ext}`;

    const blob = await put(pathname, bytes, {
      access: "public",
      contentType: type.split(";")[0].trim() || "image/jpeg",
      token: process.env.BLOB_READ_WRITE_TOKEN,
      addRandomSuffix: true,
    });

    console.log(
      `[site-import] saved ${options.kind}: ${options.sourceUrl.slice(0, 100)}`
    );
    return {
      url: blob.url,
      pathname: blob.pathname,
      filename: `${safe}.${ext}`,
      kind: options.kind,
      caption: options.caption || "",
      uploadedAt: new Date(),
    };
  } catch (error) {
    console.warn("[site-import] download error", options.sourceUrl, error);
    return null;
  }
}

export async function importWebsiteImagesToBlob(
  data: WebsiteScrapeData,
  onboardingToken: string
) {
  const assets: ImportedBlobAsset[] = [];
  const referer = data.siteUrl;

  if (data.logoUrl) {
    const logo = await downloadAndStoreSiteImage({
      sourceUrl: data.logoUrl,
      token: onboardingToken,
      kind: "logo",
      filenameHint: "logo",
      caption: "Website logo",
      referer,
    });
    if (logo) assets.push(logo);
  }

  const gallery = uniqueUrls(
    data.imageUrls.filter((url) => url !== data.logoUrl)
  ).slice(0, 24);

  for (let i = 0; i < gallery.length && assets.length < 28; i += 1) {
    const imported = await downloadAndStoreSiteImage({
      sourceUrl: gallery[i],
      token: onboardingToken,
      kind: "photo",
      filenameHint: `gallery-${i + 1}`,
      caption: "Imported from website",
      referer,
    });
    if (imported) assets.push(imported);
  }

  console.log(
    `[site-import] done — saved ${assets.length} assets from ${data.imageUrls.length} candidates`
  );
  return assets;
}

export function buildWebsiteImportNotes(data: WebsiteScrapeData) {
  return [
    "Imported from existing website",
    `Site: ${data.siteUrl}`,
    data.pagesVisited.length
      ? `Pages scraped: ${data.pagesVisited.join(", ")}`
      : "",
    data.socialLinks.length
      ? `Social: ${data.socialLinks.slice(0, 5).join(", ")}`
      : "",
    data.addressLine ? `Address: ${data.addressLine}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}
