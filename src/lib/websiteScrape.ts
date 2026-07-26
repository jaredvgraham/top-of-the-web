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

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function absolutize(href: string, base: string) {
  try {
    return new URL(href, base).toString();
  } catch {
    return "";
  }
}

function normalizeSiteUrl(input: string) {
  const raw = input.trim();
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  const url = new URL(withProtocol);
  url.hash = "";
  return url.toString().replace(/\/$/, "");
}

function sameHost(a: string, b: string) {
  try {
    return (
      new URL(a).hostname.replace(/^www\./i, "") ===
      new URL(b).hostname.replace(/^www\./i, "")
    );
  } catch {
    return false;
  }
}

function pickPhone(text: string) {
  const match = text.match(
    /(?:\+?1[-.\s]*)?(?:\(?\d{3}\)?[-.\s]*)\d{3}[-.\s]*\d{4}/
  );
  return match ? match[0].trim() : "";
}

function pickEmail(text: string) {
  const match = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match ? match[0].trim().toLowerCase() : "";
}

function parseCityState(addressLine: string) {
  const match = addressLine.match(
    /([^,]+),\s*([A-Z]{2})(?:\s+\d{5}(?:-\d{4})?)?\s*$/i
  );
  if (!match) return { city: "", state: "" };
  return {
    city: match[1].trim(),
    state: match[2].trim().toUpperCase(),
  };
}

function pickAddress(text: string) {
  const match = text.match(
    /\d+\s+[A-Za-z0-9 .'-]+,\s*[A-Za-z .'-]+,\s*[A-Z]{2}\b[^\n]*/i
  );
  return match?.[0]?.trim() || "";
}

function scoreInternalLink(href: string) {
  const path = (() => {
    try {
      return new URL(href).pathname.toLowerCase();
    } catch {
      return href.toLowerCase();
    }
  })();
  let score = 0;
  if (/about|our-story|who-we-are|company/i.test(path)) score += 50;
  if (/contact|get-in-touch|reach/i.test(path)) score += 45;
  if (/service|what-we-do|offer/i.test(path)) score += 40;
  if (/gallery|portfolio|projects|work|photos/i.test(path)) score += 30;
  if (/faq/i.test(path)) score += 20;
  if (/home|^\/$|^\/index/i.test(path)) score -= 10;
  if (/blog|news|cart|checkout|wp-admin|login|privacy|terms/i.test(path)) {
    score -= 40;
  }
  return score;
}

function isUsefulSiteImage(url: string) {
  const lower = url.toLowerCase();
  if (!/^https?:\/\//i.test(lower)) return false;
  if (/data:|svg\+xml|sprite|icon|favicon|logo-mark|1x1|pixel|tracking/i.test(lower)) {
    // still allow obvious logos later via logoUrl
    if (!/logo/i.test(lower)) return false;
  }
  if (/\.(svg)(\?|$)/i.test(lower) && !/logo/i.test(lower)) return false;
  if (/\.(gif)(\?|$)/i.test(lower)) return false;
  return (
    /\.(jpe?g|png|webp|avif)(\?|$)/i.test(lower) ||
    /\/uploads\/|\/media\/|\/images\/|\/img\//i.test(lower) ||
    /logo/i.test(lower)
  );
}

type CollectedPage = {
  url: string;
  title: string;
  h1: string;
  metaDescription: string;
  bodyText: string;
  headings: string[];
  imgSrcs: string[];
  logoCandidates: string[];
  links: string[];
  socialLinks: string[];
};

async function collectPage(page: {
  evaluate: <T>(fn: () => T) => Promise<T>;
  url: () => string;
}): Promise<CollectedPage> {
  return page.evaluate(() => {
    const textOf = (el: Element | null | undefined) =>
      (el?.textContent || "").replace(/\s+/g, " ").trim();

    const meta = (name: string) =>
      document
        .querySelector(`meta[name="${name}"]`)
        ?.getAttribute("content") ||
      document
        .querySelector(`meta[property="${name}"]`)
        ?.getAttribute("content") ||
      "";

    const title =
      meta("og:site_name") ||
      meta("og:title") ||
      document.title.replace(/\s*[|\-–—].*$/, "").trim();

    const h1 = textOf(document.querySelector("h1"));
    const metaDescription =
      meta("og:description") || meta("description") || "";

    const headings = Array.from(
      document.querySelectorAll("h1, h2, h3")
    )
      .map((el) => textOf(el))
      .filter((t) => t.length > 1 && t.length < 120)
      .slice(0, 30);

    const imgSrcs = Array.from(document.querySelectorAll("img"))
      .map((img) => {
        const el = img as HTMLImageElement;
        return (
          el.currentSrc ||
          el.src ||
          el.getAttribute("data-src") ||
          el.getAttribute("data-lazy-src") ||
          ""
        );
      })
      .filter(Boolean);

    const logoCandidates = Array.from(
      document.querySelectorAll(
        'img[alt*="logo" i], img[class*="logo" i], img[id*="logo" i], a[class*="logo" i] img, header img, .logo img'
      )
    )
      .map((img) => (img as HTMLImageElement).currentSrc || (img as HTMLImageElement).src || "")
      .filter(Boolean);

    const ogImage = meta("og:image");
    if (ogImage) logoCandidates.unshift(ogImage);

    const links = Array.from(document.querySelectorAll("a[href]"))
      .map((a) => (a as HTMLAnchorElement).href)
      .filter(Boolean);

    const socialLinks = links.filter((href) =>
      /facebook\.com|instagram\.com|linkedin\.com|yelp\.com|tiktok\.com|youtube\.com|x\.com|twitter\.com/i.test(
        href
      )
    );

    // Prefer main content; fall back to body
    const main =
      document.querySelector("main") ||
      document.querySelector('[role="main"]') ||
      document.body;
    const bodyText = (main?.innerText || "").slice(0, 25000);

    return {
      url: location.href,
      title,
      h1,
      metaDescription,
      bodyText,
      headings,
      imgSrcs,
      logoCandidates,
      links,
      socialLinks,
    };
  });
}

/** Playwright scrape of a public website — intended for local `next dev`. */
export async function scrapeWebsiteLocally(
  siteUrlInput: string
): Promise<WebsiteScrapeData> {
  let chromium: typeof import("playwright").chromium;
  try {
    ({ chromium } = await import("playwright"));
  } catch {
    throw new Error(
      "Playwright is not installed. Run: npm i -D playwright && npx playwright install chromium"
    );
  }

  const siteUrl = normalizeSiteUrl(siteUrlInput);
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/Executable doesn't exist/i.test(message)) {
      throw new Error(
        "Playwright Chromium is not installed. Run: npx playwright install chromium"
      );
    }
    throw error;
  }

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    viewport: { width: 1280, height: 1600 },
    locale: "en-US",
  });
  const page = await context.newPage();

  const imagePool: string[] = [];
  const logoPool: string[] = [];
  const socialPool: string[] = [];
  const pageSummaries: WebsitePageDump[] = [];
  const pagesVisited: string[] = [];
  const linkPool: string[] = [];

  let name = "";
  let tagline = "";
  let about = "";
  let description = "";
  let phone = "";
  let email = "";
  let addressLine = "";

  const absorb = (data: CollectedPage) => {
    console.log(`\n[site-scrape] === PAGE: ${data.url} ===`);
    console.log(
      JSON.stringify(
        {
          title: data.title,
          h1: data.h1,
          metaDescription: data.metaDescription.slice(0, 200),
          headings: data.headings.slice(0, 12),
          imgCount: data.imgSrcs.length,
          bodyPreview: data.bodyText.slice(0, 400),
        },
        null,
        2
      )
    );

    pagesVisited.push(data.url);
    name = name || data.title;
    if (!tagline && data.h1 && data.h1.toLowerCase() !== name.toLowerCase()) {
      tagline = data.h1;
    }
    if (!about && data.metaDescription) about = data.metaDescription;
    phone = phone || pickPhone(data.bodyText);
    email = email || pickEmail(data.bodyText);
    addressLine = addressLine || pickAddress(data.bodyText);

    pageSummaries.push({
      url: data.url,
      title: data.title,
      h1: data.h1,
      metaDescription: data.metaDescription,
      bodyText: data.bodyText.slice(0, 6000),
      headings: data.headings,
    });

    for (const raw of data.imgSrcs) {
      const url = absolutize(raw, data.url);
      if (url && isUsefulSiteImage(url)) imagePool.push(url);
    }
    for (const raw of data.logoCandidates) {
      const url = absolutize(raw, data.url);
      if (url) logoPool.push(url);
    }
    socialPool.push(...data.socialLinks);

    for (const href of data.links) {
      const abs = absolutize(href, data.url);
      if (abs && sameHost(abs, siteUrl)) linkPool.push(abs.split("#")[0]);
    }
  };

  try {
    console.log(`[site-scrape] START ${siteUrl}`);
    await page.goto(siteUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
    await sleep(1500);
    for (let i = 0; i < 3; i += 1) {
      await page.mouse.wheel(0, 1800);
      await sleep(500);
    }
    absorb(await collectPage(page));

    const candidates = unique(linkPool)
      .filter((href) => sameHost(href, siteUrl))
      .filter((href) => !pagesVisited.includes(href.replace(/\/$/, "")))
      .sort((a, b) => scoreInternalLink(b) - scoreInternalLink(a))
      .slice(0, 5);

    console.log(
      `[site-scrape] following ${candidates.length} internal pages`,
      candidates
    );

    for (const href of candidates) {
      try {
        await page.goto(href, {
          waitUntil: "domcontentloaded",
          timeout: 45000,
        });
        await sleep(1000);
        absorb(await collectPage(page));
      } catch (error) {
        console.log(
          `[site-scrape] page failed: ${href}`,
          error instanceof Error ? error.message : error
        );
      }
    }
  } finally {
    await browser.close();
  }

  // Pull a longer description from about-ish pages
  const aboutPage = pageSummaries.find((p) =>
    /about|our-story|who-we-are|company/i.test(p.url)
  );
  if (aboutPage?.bodyText) {
    description = aboutPage.bodyText.slice(0, 1800);
  } else if (pageSummaries[0]?.bodyText) {
    description = pageSummaries[0].bodyText.slice(0, 1200);
  }

  const services: string[] = [];
  for (const summary of pageSummaries) {
    for (const heading of summary.headings) {
      if (
        /service|paint|wash|repair|install|clean|design|remodel|roof|plumb|electric/i.test(
          heading
        ) &&
        heading.length < 80
      ) {
        services.push(heading);
      }
    }
  }

  const { city, state } = parseCityState(addressLine);
  const imageUrls = unique(imagePool).slice(0, 40);
  const logoUrl = unique(logoPool).find((url) => isUsefulSiteImage(url)) || "";

  const result: WebsiteScrapeData = {
    siteUrl,
    name: name.replace(/\s*[|\-–—]\s*(Home|Welcome).*$/i, "").trim(),
    tagline,
    about,
    description,
    phone,
    email,
    website: siteUrl,
    city,
    state,
    addressLine,
    services: unique(services).slice(0, 20),
    pagesVisited: unique(pagesVisited),
    pageSummaries: pageSummaries.map((p) => ({
      ...p,
      bodyText: p.bodyText.slice(0, 3500),
    })),
    logoUrl,
    imageUrls,
    socialLinks: unique(socialPool).slice(0, 12),
  };

  console.log("[site-scrape] FINAL", {
    name: result.name,
    phone: result.phone,
    email: result.email,
    city: result.city,
    state: result.state,
    pages: result.pagesVisited.length,
    images: result.imageUrls.length,
    services: result.services.slice(0, 8),
  });

  try {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const outDir = path.join(process.cwd(), "tmp");
    fs.mkdirSync(outDir, { recursive: true });
    const debugPath = path.join(outDir, "website-scrape-debug.json");
    fs.writeFileSync(debugPath, JSON.stringify(result, null, 2));
    console.log(`[site-scrape] wrote debug file: ${debugPath}`);
  } catch (error) {
    console.warn("[site-scrape] could not write debug file", error);
  }

  return result;
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
      console.log(`[site-import] not image (${type}): ${options.sourceUrl.slice(0, 80)}`);
      return null;
    }
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length < 4 * 1024 || bytes.length > 20 * 1024 * 1024) {
      console.log(`[site-import] bad size ${bytes.length}: ${options.sourceUrl.slice(0, 80)}`);
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

    console.log(`[site-import] saved ${options.kind}: ${options.sourceUrl.slice(0, 100)}`);
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
