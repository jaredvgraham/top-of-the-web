import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Onboarding from "@/models/Onboarding";
import {
  createOnboardingToken,
  normalizeEmail,
  onboardingPublicUrl,
  serializeOnboarding,
} from "@/lib/onboarding";
import {
  importWebsiteImagesToBlob,
  type WebsiteScrapeData,
} from "@/lib/websiteScrape";
import { scrapeWebsite, scrapeServiceConfigured } from "@/lib/scrapeClient";
import {
  cleanWebsiteDataForOnboarding,
  openaiConfigured,
} from "@/lib/facebookOnboardingAi";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function GET() {
  return NextResponse.json({
    configured: scrapeServiceConfigured(),
    scrapeServiceConfigured: scrapeServiceConfigured(),
    openaiConfigured: openaiConfigured(),
    mode: "scrape-service",
  });
}

async function createSessionFromWebsite(options: {
  email: string;
  site: WebsiteScrapeData;
  origin?: string;
}) {
  const { email, site, origin } = options;
  const token = createOnboardingToken();

  const [{ fields, usedAi }, assets] = await Promise.all([
    cleanWebsiteDataForOnboarding(site, email),
    importWebsiteImagesToBlob(site, token),
  ]);

  await dbConnect();
  const session = await Onboarding.create({
    token,
    email: fields.contact.email || email,
    status: "in_progress",
    currentStep: 0,
    contact: fields.contact,
    business: fields.business,
    brand: fields.brand,
    content: fields.content,
    extras: fields.extras,
    assets,
  });

  return {
    token: session.token,
    url: onboardingPublicUrl(session.token, origin),
    session: serializeOnboarding(session),
    imported: {
      siteName: site.name,
      siteUrl: site.siteUrl,
      photoCount: assets.length,
      pagesScraped: site.pagesVisited.length,
      usedAi,
      fields: {
        businessName: Boolean(fields.contact.businessName),
        phone: Boolean(fields.contact.phone),
        email: Boolean(fields.contact.email),
        website: Boolean(fields.business.existingSiteUrl),
        city: Boolean(fields.business.city),
        state: Boolean(fields.business.state),
        description: Boolean(fields.business.description),
        services: Boolean(fields.content.servicesProducts),
      },
    },
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email =
      typeof body.email === "string" ? normalizeEmail(body.email) : "";
    const siteUrl =
      typeof body.siteUrl === "string"
        ? body.siteUrl.trim()
        : typeof body.websiteUrl === "string"
          ? body.websiteUrl.trim()
          : typeof body.url === "string"
            ? body.url.trim()
            : "";

    if (!email) {
      return NextResponse.json(
        { message: "Client email is required" },
        { status: 400 }
      );
    }
    if (!siteUrl) {
      return NextResponse.json(
        { message: "Website URL is required" },
        { status: 400 }
      );
    }
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        {
          message:
            "BLOB_READ_WRITE_TOKEN is required to import website photos.",
        },
        { status: 503 }
      );
    }

    const origin = req.headers.get("origin") || undefined;
    const site = await scrapeWebsite(siteUrl);

    if (!site.name && !site.imageUrls.length && !site.about && !site.description) {
      return NextResponse.json(
        {
          message:
            "Scrape returned almost nothing — the site may be blocked or down. Check the URL and try again.",
        },
        { status: 422 }
      );
    }

    const result = await createSessionFromWebsite({ email, site, origin });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to import website", error);
    const message =
      error instanceof Error ? error.message : "Unable to import website";
    return NextResponse.json({ message }, { status: 500 });
  }
}
