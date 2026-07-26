import type { FacebookPageImportData } from "@/lib/facebookPageImport";
import {
  isFacebookChromeImageUrl,
  pickBestFacebookPhotoUrls,
} from "@/lib/facebookPageImport";

function normalizeFacebookUrl(input: string) {
  const raw = input.trim();
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  const url = new URL(withProtocol);
  url.hash = "";
  return url.toString().replace(/\/$/, "");
}

function unique(list: string[]) {
  return Array.from(new Set(list.map((item) => item.trim()).filter(Boolean)));
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

function toMbasic(url: string) {
  try {
    const u = new URL(url);
    u.hostname = "mbasic.facebook.com";
    return u.toString();
  } catch {
    return url;
  }
}

function toWww(url: string) {
  try {
    const u = new URL(url);
    u.hostname = "www.facebook.com";
    return u.toString();
  } catch {
    return url;
  }
}

function absolutize(href: string, base: string) {
  try {
    return new URL(href, base).toString();
  } catch {
    return "";
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function logSection(title: string, payload?: unknown) {
  console.log(`\n[fb-scrape] === ${title} ===`);
  if (payload !== undefined) {
    if (typeof payload === "string") {
      console.log(payload);
    } else {
      console.log(JSON.stringify(payload, null, 2));
    }
  }
}

function summarizeUrls(urls: string[], limit = 12) {
  const cleaned = unique(urls.map(cleanCapturedUrl).filter(Boolean));
  const kept = cleaned.filter(isUsefulPhotoUrl);
  const dropped = cleaned.filter((url) => !isUsefulPhotoUrl(url));
  return {
    total: cleaned.length,
    kept: kept.length,
    dropped: dropped.length,
    keptSample: kept.slice(0, limit),
    droppedSample: dropped.slice(0, limit),
  };
}

function cleanCapturedUrl(raw: string) {
  let url = raw.trim().replace(/&amp;/g, "&");
  // Trim trailing punctuation from HTML extraction
  url = url.replace(/[),.;]+$/g, "");
  try {
    const parsed = new URL(url);
    return parsed.toString();
  } catch {
    return "";
  }
}

function isUsefulPhotoUrl(url: string) {
  if (!url) return false;
  if (isFacebookChromeImageUrl(url)) return false;
  const lower = url.toLowerCase();
  if (/\.kf(\?|$)/i.test(lower)) return false;
  if (!/\.(jpe?g|png|webp)(\?|$)/i.test(lower) && !/stp=/i.test(lower)) {
    return false;
  }
  // Keep real CDN photos + common FB image hosts
  return (
    lower.includes("scontent") ||
    lower.includes("fbcdn.net") ||
    lower.includes("external.") ||
    /[?&]url=https?%3A%2F%2F/i.test(url)
  );
}

function isLoginWallTitle(title: string) {
  const t = title.trim().toLowerCase();
  return (
    !t ||
    t === "facebook" ||
    t === "log in" ||
    t === "log into facebook" ||
    t.startsWith("log into facebook")
  );
}

function isLoginWallText(text: string) {
  return /log into facebook|create new account|explore the things you love/i.test(
    text
  );
}

function pickWebsite(text: string) {
  const matches = text.match(
    /(?:https?:\/\/)?(?:www\.)?[a-z0-9][a-z0-9.-]*\.[a-z]{2,}(?:\/[^\s]*)?/gi
  );
  if (!matches?.length) return "";
  for (const raw of matches) {
    const lower = raw.toLowerCase();
    if (/facebook\.com|fb\.com|meta\.com|instagram\.com|messenger\.com/i.test(lower)) {
      continue;
    }
    if (/homeadvisor\.com|yelp\.com|google\.com|maps\.app/i.test(lower)) {
      continue;
    }
    return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  }
  return "";
}

function pickBusinessName(bodyText: string) {
  const followerMatch = bodyText.match(
    /([A-Z0-9][^\n]{1,80}?)\s*\n\s*\d[\d,]*\s+followers/i
  );
  if (followerMatch?.[1] && !isLoginWallTitle(followerMatch[1])) {
    return followerMatch[1].trim();
  }
  return "";
}

function pickCategory(bodyText: string) {
  const match = bodyText.match(/Page\s*[·•]\s*([^\n]+)/i);
  return match?.[1]?.trim() || "";
}

function pickAddress(bodyText: string) {
  const match = bodyText.match(
    /\d+\s+[A-Za-z0-9 .'-]+,\s*[A-Za-z .'-]+,\s*[A-Z]{2}\b[^\n]*/i
  );
  return match?.[0]?.trim() || "";
}

type MetaDump = {
  title: string;
  about: string;
  ogImage: string;
  labeled: Record<string, string>;
  aboutBlocks: string[];
  postSnippets: string[];
  bodyText: string;
  photoPageLinks: string[];
  imgSrcs: string[];
  htmlImageUrls: string[];
};

async function dismissCookieNoise(page: {
  locator: (selector: string) => {
    first: () => {
      isVisible: (opts: { timeout: number }) => Promise<boolean>;
      click: (opts: { timeout: number }) => Promise<void>;
    };
  };
}) {
  const selectors = [
    'button:has-text("Allow all cookies")',
    'button:has-text("Accept all")',
    'button:has-text("Accept All")',
    'button:has-text("Only allow essential cookies")',
    '[aria-label="Close"]',
    'div[role="button"]:has-text("Not Now")',
  ];
  for (const selector of selectors) {
    try {
      const btn = page.locator(selector).first();
      if (await btn.isVisible({ timeout: 800 })) {
        await btn.click({ timeout: 1000 }).catch(() => undefined);
      }
    } catch {
      // ignore
    }
  }
}

async function collectMeta(page: {
  evaluate: <T, A = unknown>(fn: (arg: A) => T, arg: A) => Promise<T>;
  url: () => string;
}): Promise<MetaDump> {
  return page.evaluate((currentUrl: string) => {
    const textOf = (el: Element | null | undefined) =>
      (el?.textContent || "").replace(/\s+/g, " ").trim();

    const meta = (property: string) =>
      document
        .querySelector(`meta[property="${property}"]`)
        ?.getAttribute("content") ||
      document
        .querySelector(`meta[name="${property}"]`)
        ?.getAttribute("content") ||
      "";

    const title =
      meta("og:title") ||
      document.querySelector("h1")?.textContent?.trim() ||
      document.title.replace(/\s*\|\s*Facebook\s*$/i, "").trim();

    const about = meta("og:description") || meta("description") || "";
    const ogImage = meta("og:image") || "";

    const imgSrcs = Array.from(document.querySelectorAll("img"))
      .map((img) => {
        const el = img as HTMLImageElement;
        return (
          el.currentSrc ||
          el.src ||
          el.getAttribute("data-src") ||
          el.getAttribute("src") ||
          ""
        );
      })
      .filter(Boolean);

    const html = document.documentElement.innerHTML;
    const htmlImageUrls = Array.from(
      html.matchAll(
        /https:\/\/(?:scontent|external)[^"'\\\s<>]+|https:\/\/[^"'\\\s<>]*fbcdn\.net[^"'\\\s<>]+/gi
      )
    ).map((match) => match[0]);

    const photoPageLinks = Array.from(document.querySelectorAll("a[href]"))
      .map((a) => (a as HTMLAnchorElement).getAttribute("href") || "")
      .filter((href) =>
        /photo\.php|\/photos\/|[?&]fbid=|\/photo\//i.test(href)
      )
      .map((href) => {
        try {
          return new URL(href, currentUrl).toString();
        } catch {
          return "";
        }
      })
      .filter(Boolean);

    const bodyText = document.body?.innerText || "";
    const labeled: Record<string, string> = {};
    for (const label of [
      "Phone",
      "Mobile",
      "Email",
      "Website",
      "Address",
      "Categories",
      "Category",
    ]) {
      const re = new RegExp(`${label}\\s*\\n+([^\\n]+)`, "i");
      const match = bodyText.match(re);
      if (match?.[1]) labeled[label.toLowerCase()] = match[1].trim();
    }

    const aboutBlocks = Array.from(document.querySelectorAll("div, p, span"))
      .map((el) => textOf(el))
      .filter((t) => t.length > 40 && t.length < 800)
      .slice(0, 12);

    const postSnippets = Array.from(document.querySelectorAll("p, div"))
      .map((el) => textOf(el))
      .filter((t) => t.length > 50 && t.length < 500)
      .filter(
        (t) =>
          !/log in|sign up|cookie|facebook|privacy|terms/i.test(t) &&
          t !== about
      )
      .slice(0, 10);

    return {
      title,
      about,
      ogImage,
      labeled,
      aboutBlocks,
      postSnippets,
      bodyText: bodyText.slice(0, 20000),
      photoPageLinks,
      imgSrcs,
      htmlImageUrls,
    };
  }, page.url());
}

/** Playwright scrape — intended for local `next dev` / local Node, not Vercel. */
export async function scrapeFacebookPageLocally(
  pageUrlInput: string
): Promise<FacebookPageImportData> {
  let chromium: typeof import("playwright").chromium;
  try {
    ({ chromium } = await import("playwright"));
  } catch {
    throw new Error(
      "Playwright is not installed. Run: npm i -D playwright && npx playwright install chromium"
    );
  }

  const pageUrl = normalizeFacebookUrl(pageUrlInput);
  const wwwUrl = toWww(pageUrl);
  const mbasicUrl = toMbasic(pageUrl);
  const aboutUrl = `${mbasicUrl.replace(/\/$/, "")}/about`;
  const photosUrl = `${mbasicUrl.replace(/\/$/, "")}/photos`;

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/Executable doesn't exist/i.test(message)) {
      throw new Error(
        "Playwright Chromium is not installed for this machine. In the project folder run: npx playwright install chromium"
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

  // Capture every image-like network response — most reliable on FB.
  const networkImages: string[] = [];
  page.on("response", async (response) => {
    try {
      const url = response.url();
      const type = (response.headers()["content-type"] || "").toLowerCase();
      const status = response.status();
      if (status < 200 || status >= 400) return;
      if (
        type.startsWith("image/") ||
        /scontent|fbcdn\.net|external\./i.test(url)
      ) {
        if (isUsefulPhotoUrl(url)) {
          networkImages.push(cleanCapturedUrl(url));
        }
      }
    } catch {
      // ignore
    }
  });

  const imagePool: string[] = [];
  const photoLinkPool: string[] = [];
  const postSnippets: string[] = [];
  let name = "";
  let about = "";
  let description = "";
  let phone = "";
  let email = "";
  let website = "";
  let addressLine = "";
  let category = "";
  let profilePictureUrl = "";
  let coverPhotoUrl = "";

  const pushImages = (urls: string[], source: string) => {
    const before = imagePool.length;
    for (const raw of urls) {
      const url = cleanCapturedUrl(raw);
      if (url && isUsefulPhotoUrl(url)) imagePool.push(url);
    }
    const added = imagePool.length - before;
    console.log(
      `[fb-scrape] pushImages from ${source}: input=${urls.length} added=${added} pool=${imagePool.length}`
    );
  };

  const absorb = (label: string, data: MetaDump) => {
    logSection(`PAGE: ${label}`, {
      finalUrl: page.url(),
      title: data.title,
      about: (data.about || "").slice(0, 240),
      ogImage: data.ogImage || null,
      labeled: data.labeled,
      counts: {
        imgSrcs: data.imgSrcs.length,
        htmlImageUrls: data.htmlImageUrls.length,
        photoPageLinks: data.photoPageLinks.length,
        aboutBlocks: data.aboutBlocks.length,
        postSnippets: data.postSnippets.length,
        bodyTextChars: data.bodyText.length,
      },
      imgSrcSummary: summarizeUrls(data.imgSrcs),
      htmlImageSummary: summarizeUrls(data.htmlImageUrls),
      photoPageLinksSample: unique(data.photoPageLinks).slice(0, 15),
      bodyPreview: data.bodyText.slice(0, 500),
    });

    if (!isLoginWallTitle(data.title)) {
      name = name || data.title;
    }
    const bodyName = pickBusinessName(data.bodyText);
    if (bodyName) name = isLoginWallTitle(name) ? bodyName : name || bodyName;

    if (data.about && !isLoginWallText(data.about)) {
      about = about || data.about;
    }

    phone =
      phone ||
      data.labeled.phone ||
      data.labeled.mobile ||
      pickPhone(data.bodyText);
    email = email || data.labeled.email || pickEmail(data.bodyText);
    website =
      website || data.labeled.website || pickWebsite(data.bodyText);
    addressLine =
      addressLine || data.labeled.address || pickAddress(data.bodyText);
    category =
      category ||
      data.labeled.categories ||
      data.labeled.category ||
      pickCategory(data.bodyText);

    if (!about && data.aboutBlocks.length) {
      const block = data.aboutBlocks.find((b) => !isLoginWallText(b));
      if (block) about = block;
    }
    if (!description && data.aboutBlocks.length > 1) {
      description = data.aboutBlocks
        .filter((b) => !isLoginWallText(b))
        .slice(0, 3)
        .join("\n\n");
    }

    if (data.ogImage && isUsefulPhotoUrl(data.ogImage)) {
      if (!profilePictureUrl) profilePictureUrl = data.ogImage;
      else if (!coverPhotoUrl) coverPhotoUrl = data.ogImage;
      pushImages([data.ogImage], `${label}:ogImage`);
    } else if (data.ogImage) {
      console.log(
        `[fb-scrape] og:image dropped as chrome/unuseful: ${data.ogImage}`
      );
    }
    pushImages(data.imgSrcs, `${label}:imgSrcs`);
    pushImages(data.htmlImageUrls, `${label}:htmlImageUrls`);
    photoLinkPool.push(...data.photoPageLinks);
    postSnippets.push(...data.postSnippets);
  };

  try {
    logSection("START", { pageUrl, wwwUrl, mbasicUrl, aboutUrl, photosUrl });

    // www first — login-gated mbasic often returns empty/login-wall metadata
    await page.goto(wwwUrl, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    await dismissCookieNoise(page);
    await sleep(2000);
    for (let i = 0; i < 5; i += 1) {
      await page.mouse.wheel(0, 2200);
      await sleep(800);
    }
    absorb("www/home+scroll", await collectMeta(page));

    await page.goto(aboutUrl, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    await dismissCookieNoise(page);
    await sleep(1500);
    absorb("mbasic/about", await collectMeta(page));

    await page.goto(mbasicUrl, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    await dismissCookieNoise(page);
    await sleep(1500);
    absorb("mbasic/home", await collectMeta(page));

    await page.goto(photosUrl, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    await dismissCookieNoise(page);
    await sleep(1500);
    absorb("mbasic/photos", await collectMeta(page));

    const photoLinks = unique(photoLinkPool)
      .map((href) => absolutize(href, wwwUrl))
      .filter(Boolean)
      .slice(0, 36);

    logSection("PHOTO LINKS TO FOLLOW", {
      totalFound: unique(photoLinkPool).length,
      following: photoLinks.length,
      links: photoLinks,
    });

    for (let index = 0; index < photoLinks.length; index += 1) {
      const link = photoLinks[index];
      try {
        await page.goto(link, {
          waitUntil: "domcontentloaded",
          timeout: 45000,
        });
        await sleep(900);
        absorb(`photo[${index + 1}/${photoLinks.length}] ${link}`, await collectMeta(page));
      } catch (error) {
        console.log(
          `[fb-scrape] photo page failed: ${link}`,
          error instanceof Error ? error.message : error
        );
      }
    }
  } finally {
    await browser.close();
  }

  pushImages(networkImages, "network-responses");
  logSection("NETWORK IMAGE CAPTURE", summarizeUrls(networkImages, 20));

  const { city, state } = parseCityState(addressLine);

  const photoUrls = pickBestFacebookPhotoUrls(
    [...imagePool, ...networkImages],
    60
  );

  if (profilePictureUrl && !isUsefulPhotoUrl(profilePictureUrl)) {
    console.log(`[fb-scrape] profilePictureUrl cleared: ${profilePictureUrl}`);
    profilePictureUrl = "";
  }
  if (coverPhotoUrl && !isUsefulPhotoUrl(coverPhotoUrl)) {
    console.log(`[fb-scrape] coverPhotoUrl cleared: ${coverPhotoUrl}`);
    coverPhotoUrl = "";
  }

  if (!profilePictureUrl && photoUrls.length) {
    profilePictureUrl = photoUrls[0];
  }
  if (!coverPhotoUrl && photoUrls.length > 1) {
    coverPhotoUrl = photoUrls.find((url) => url !== profilePictureUrl) || "";
  }

  const cleanedName = name.replace(/\s*\|\s*Facebook\s*$/i, "").trim();
  const cleanedAbout = isLoginWallText(about) ? "" : about;
  const cleanedDescription = isLoginWallText(description)
    ? cleanedAbout
    : description || cleanedAbout;

  const result: FacebookPageImportData = {
    pageId: "local-scrape",
    pageUrl: wwwUrl,
    name: isLoginWallTitle(cleanedName) ? "" : cleanedName,
    about: cleanedAbout,
    description: cleanedDescription,
    phone,
    email,
    website,
    city,
    state,
    addressLine,
    category,
    profilePictureUrl,
    coverPhotoUrl,
    photoUrls,
    postSnippets: unique(postSnippets)
      .filter((s) => !isLoginWallText(s))
      .slice(0, 10),
  };

  logSection("FINAL SCRAPE RESULT", {
    name: result.name,
    phone: result.phone,
    email: result.email,
    website: result.website,
    city: result.city,
    state: result.state,
    category: result.category,
    profilePictureUrl: result.profilePictureUrl,
    coverPhotoUrl: result.coverPhotoUrl,
    photoUrlCount: result.photoUrls.length,
    photoUrls: result.photoUrls,
    aboutPreview: result.about.slice(0, 300),
  });

  try {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const outDir = path.join(process.cwd(), "tmp");
    fs.mkdirSync(outDir, { recursive: true });
    const debugPath = path.join(outDir, "facebook-scrape-debug.json");
    fs.writeFileSync(
      debugPath,
      JSON.stringify(
        {
          scrapedAt: new Date().toISOString(),
          input: pageUrlInput,
          result,
          networkImageSummary: summarizeUrls(networkImages, 30),
          imagePoolSummary: summarizeUrls(imagePool, 30),
        },
        null,
        2
      )
    );
    console.log(`[fb-scrape] wrote debug file: ${debugPath}`);
  } catch (error) {
    console.warn("[fb-scrape] could not write debug file", error);
  }

  return result;
}
