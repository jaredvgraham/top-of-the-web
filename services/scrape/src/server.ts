import "dotenv/config";
import express from "express";
import { scrapeFacebookPage } from "./facebookScrape.js";
import { scrapeWebsite } from "./websiteScrape.js";

const PORT = Number(process.env.PORT || 8787);
const SECRET = process.env.SCRAPE_SERVICE_SECRET?.trim() || "";

const app = express();
app.use(express.json({ limit: "1mb" }));

function requireAuth(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  if (!SECRET) {
    res.status(503).json({
      error: {
        code: "misconfigured",
        message: "SCRAPE_SERVICE_SECRET is not set on the scrape service.",
      },
    });
    return;
  }
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token || token !== SECRET) {
    res.status(401).json({
      error: { code: "unauthorized", message: "Invalid scrape service credentials." },
    });
    return;
  }
  next();
}

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "bsites-scrape" });
});

app.post("/scrape/facebook", requireAuth, async (req, res) => {
  const url =
    typeof req.body?.url === "string"
      ? req.body.url.trim()
      : typeof req.body?.pageUrl === "string"
        ? req.body.pageUrl.trim()
        : typeof req.body?.facebookUrl === "string"
          ? req.body.facebookUrl.trim()
          : "";

  if (!url) {
    res.status(400).json({
      error: { code: "invalid_url", message: "Facebook page URL is required." },
    });
    return;
  }

  try {
    console.log(`[scrape-service] facebook scrape start: ${url}`);
    const started = Date.now();
    const page = await scrapeFacebookPage(url);
    console.log(
      `[scrape-service] facebook scrape done in ${Date.now() - started}ms — name=${page.name} photos=${page.photoUrls.length}`
    );
    res.json(page);
  } catch (error) {
    console.error("[scrape-service] facebook scrape failed", error);
    res.status(500).json({
      error: {
        code: "scrape_failed",
        message:
          error instanceof Error ? error.message : "Facebook scrape failed",
      },
    });
  }
});

app.post("/scrape/website", requireAuth, async (req, res) => {
  const url =
    typeof req.body?.url === "string"
      ? req.body.url.trim()
      : typeof req.body?.siteUrl === "string"
        ? req.body.siteUrl.trim()
        : typeof req.body?.websiteUrl === "string"
          ? req.body.websiteUrl.trim()
          : "";

  if (!url) {
    res.status(400).json({
      error: { code: "invalid_url", message: "Website URL is required." },
    });
    return;
  }

  try {
    console.log(`[scrape-service] website scrape start: ${url}`);
    const started = Date.now();
    const site = await scrapeWebsite(url);
    console.log(
      `[scrape-service] website scrape done in ${Date.now() - started}ms — name=${site.name} images=${site.imageUrls.length}`
    );
    res.json(site);
  } catch (error) {
    console.error("[scrape-service] website scrape failed", error);
    res.status(500).json({
      error: {
        code: "scrape_failed",
        message:
          error instanceof Error ? error.message : "Website scrape failed",
      },
    });
  }
});

app.listen(PORT, () => {
  console.log(`[scrape-service] listening on :${PORT}`);
  if (!SECRET) {
    console.warn(
      "[scrape-service] WARNING: SCRAPE_SERVICE_SECRET is empty — all scrapes will 503"
    );
  }
});
