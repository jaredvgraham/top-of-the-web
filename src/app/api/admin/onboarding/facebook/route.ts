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
  facebookGraphConfigured,
  fetchFacebookPageData,
  importFacebookImagesToBlob,
  normalizeScrapedFacebookPayload,
  type FacebookPageImportData,
} from "@/lib/facebookPageImport";
import { scrapeFacebookPage, scrapeServiceConfigured } from "@/lib/scrapeClient";
import {
  cleanFacebookDataForOnboarding,
  openaiConfigured,
} from "@/lib/facebookOnboardingAi";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function GET() {
  return NextResponse.json({
    configured: scrapeServiceConfigured() || facebookGraphConfigured(),
    scrapeServiceConfigured: scrapeServiceConfigured(),
    graphConfigured: facebookGraphConfigured(),
    openaiConfigured: openaiConfigured(),
    mode: "scrape-service",
  });
}

async function createSessionFromPageData(options: {
  email: string;
  page: FacebookPageImportData;
  origin?: string;
}) {
  const { email, page, origin } = options;
  const token = createOnboardingToken();

  const [{ fields, usedAi }, assets] = await Promise.all([
    cleanFacebookDataForOnboarding(page, email),
    importFacebookImagesToBlob(page, token),
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
      pageName: page.name,
      pageUrl: page.pageUrl,
      photoCount: assets.length,
      usedAi,
      fields: {
        businessName: Boolean(fields.contact.businessName),
        phone: Boolean(fields.contact.phone),
        email: Boolean(fields.contact.email),
        website: Boolean(fields.business.existingSiteUrl),
        city: Boolean(fields.business.city),
        state: Boolean(fields.business.state),
        description: Boolean(fields.business.description),
        tagline: Boolean(fields.brand.tagline),
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
    const pageUrl =
      typeof body.pageUrl === "string"
        ? body.pageUrl.trim()
        : typeof body.facebookUrl === "string"
          ? body.facebookUrl.trim()
          : "";

    if (!email) {
      return NextResponse.json(
        { message: "Client email is required" },
        { status: 400 }
      );
    }
    if (!pageUrl && !(body.scraped && typeof body.scraped === "object")) {
      return NextResponse.json(
        { message: "Facebook page URL is required" },
        { status: 400 }
      );
    }
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        {
          message:
            "BLOB_READ_WRITE_TOKEN is required to import Facebook photos.",
        },
        { status: 503 }
      );
    }

    const origin = req.headers.get("origin") || undefined;
    let page: FacebookPageImportData | null = null;

    if (body.scraped && typeof body.scraped === "object") {
      page = normalizeScrapedFacebookPayload(body.scraped, pageUrl);
    } else if (body.page && typeof body.page === "object") {
      page = normalizeScrapedFacebookPayload(body.page, pageUrl);
    } else if (pageUrl) {
      try {
        page = await scrapeFacebookPage(pageUrl);
      } catch (scrapeError) {
        if (facebookGraphConfigured()) {
          page = await fetchFacebookPageData(pageUrl);
        } else {
          throw scrapeError;
        }
      }
    }

    if (!page) {
      return NextResponse.json(
        { message: "Could not load Facebook page data" },
        { status: 400 }
      );
    }

    if (!page.name && !page.photoUrls.length && !page.about) {
      return NextResponse.json(
        {
          message:
            "Scrape returned almost nothing — the page may be blocked by a login wall. Check the URL or try Graph API credentials.",
        },
        { status: 422 }
      );
    }

    const result = await createSessionFromPageData({ email, page, origin });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to import Facebook page", error);
    const message =
      error instanceof Error
        ? error.message
        : "Unable to import Facebook page";
    return NextResponse.json({ message }, { status: 500 });
  }
}
