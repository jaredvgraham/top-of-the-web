import type { FacebookPageImportData } from "@/lib/facebookPageImport";
import type { WebsiteScrapeData } from "@/lib/websiteScrape";

export class ScrapeServiceError extends Error {
  code: string;
  status: number;

  constructor(message: string, code = "scrape_failed", status = 500) {
    super(message);
    this.name = "ScrapeServiceError";
    this.code = code;
    this.status = status;
  }
}

function scrapeServiceConfig() {
  const baseUrl = process.env.SCRAPE_SERVICE_URL?.trim().replace(/\/$/, "");
  const secret = process.env.SCRAPE_SERVICE_SECRET?.trim();
  return { baseUrl, secret };
}

export function scrapeServiceConfigured() {
  const { baseUrl, secret } = scrapeServiceConfig();
  return Boolean(baseUrl && secret);
}

async function callScrapeService<T>(path: string, body: Record<string, string>) {
  const { baseUrl, secret } = scrapeServiceConfig();
  if (!baseUrl || !secret) {
    throw new ScrapeServiceError(
      "Scrape service is not configured. Set SCRAPE_SERVICE_URL and SCRAPE_SERVICE_SECRET.",
      "misconfigured",
      503
    );
  }

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify(body),
      // Facebook photo walks can take a few minutes
      signal: AbortSignal.timeout(180_000),
      cache: "no-store",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Scrape service unreachable";
    throw new ScrapeServiceError(
      `Could not reach scrape service: ${message}`,
      "service_unreachable",
      503
    );
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = payload?.error;
    throw new ScrapeServiceError(
      typeof err?.message === "string"
        ? err.message
        : `Scrape service returned ${response.status}`,
      typeof err?.code === "string" ? err.code : "scrape_failed",
      response.status
    );
  }

  return payload as T;
}

/** Call the dedicated scrape service for a Facebook page. */
export async function scrapeFacebookPage(
  url: string
): Promise<FacebookPageImportData> {
  return callScrapeService<FacebookPageImportData>("/scrape/facebook", { url });
}

/** Call the dedicated scrape service for a public website. */
export async function scrapeWebsite(url: string): Promise<WebsiteScrapeData> {
  return callScrapeService<WebsiteScrapeData>("/scrape/website", { url });
}
