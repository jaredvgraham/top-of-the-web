import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import dbConnect from "@/lib/db";
import Preview, { previewExpiresAt } from "@/models/Preview";
import { validateFacebookUrl } from "@/lib/preview/validateFacebookUrl";
import {
  createPreviewBlobToken,
  createPreviewSlug,
} from "@/lib/preview/createPreviewSlug";
import { scrapeFacebookPage } from "@/lib/scrapeClient";
import {
  facebookGraphConfigured,
  fetchFacebookPageData,
  importFacebookImagesToBlob,
  type FacebookPageImportData,
} from "@/lib/facebookPageImport";
import { cleanFacebookDataForOnboarding } from "@/lib/facebookOnboardingAi";
import { analyzePreviewImages } from "@/lib/preview/analyzePreviewImages";
import { parseBrandPreferences } from "@/lib/preview/brandPreferences";
import { cleanBusinessName } from "@/lib/preview/cleanBusinessName";
import { resolvePreviewLogo } from "@/lib/preview/generateLogo";
import {
  generatePreviewHtml,
  previewPagesComplete,
} from "@/lib/preview/generatePreviewHtml";
import { generateSiteSpec } from "@/lib/preview/generateSiteSpec";
import { researchCompany } from "@/lib/preview/researchCompany";
import { websiteSafeCopy } from "@/lib/preview/sanitizeCopy";
import Lead, { type ILead } from "@/models/Lead";
import {
  isValidLeadPhone,
  normalizeLeadEmail,
  normalizeLeadPhone,
} from "@/lib/preview/lead";
import {
  sendAdminPreviewReadyEmail,
  sendPreviewReadyEmail,
} from "@/lib/mail";

export const runtime = "nodejs";
export const maxDuration = 300;

const RATE_LIMIT = 3;
const RATE_WINDOW_MS = 24 * 60 * 60 * 1000;

function normalizeEmail(email: string) {
  return normalizeLeadEmail(email);
}

function previewPublicUrl(slug: string, origin?: string) {
  const base =
    origin || process.env.NEXT_PUBLIC_SITE_URL || "https://www.bsites.io";
  return `${base.replace(/\/$/, "")}/preview/${slug}`;
}

function publicError(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}

async function ensureUniqueSlug(baseName: string) {
  for (let i = 0; i < 8; i += 1) {
    const slug = createPreviewSlug(baseName);
    const exists = await Preview.findOne({ slug }).select("_id").lean();
    if (!exists) return slug;
  }
  return `preview-${randomUUID().replace(/-/g, "").slice(0, 12)}`;
}

export async function POST(req: NextRequest) {
  let previewId: string | null = null;

  try {
    const body = await req.json().catch(() => ({}));
    const email =
      typeof body.email === "string" ? normalizeEmail(body.email) : "";
    const phoneRaw = typeof body.phone === "string" ? body.phone : "";
    const phone = phoneRaw ? normalizeLeadPhone(phoneRaw) : "";
    const leadToken =
      typeof body.leadToken === "string" ? body.leadToken.trim() : "";
    const facebookUrlRaw =
      typeof body.facebookUrl === "string"
        ? body.facebookUrl
        : typeof body.pageUrl === "string"
          ? body.pageUrl
          : "";
    const authorized = body.authorized === true || body.authorized === "true";
    const brandPreferences = parseBrandPreferences(
      body && typeof body === "object" ? body : {}
    );

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return publicError(
        "invalid_email",
        "Enter a valid email address.",
        400
      );
    }

    if (phone && !isValidLeadPhone(phone)) {
      return publicError(
        "invalid_phone",
        "Enter a valid phone number (at least 10 digits).",
        400
      );
    }
    if (leadToken && !phone) {
      return publicError(
        "invalid_phone",
        "Enter a valid phone number.",
        400
      );
    }

    if (!authorized) {
      return publicError(
        "authorization_required",
        "Confirm that you own or represent this business to continue.",
        400
      );
    }

    const urlCheck = validateFacebookUrl(facebookUrlRaw);
    if (!urlCheck.ok) {
      return publicError(urlCheck.code, urlCheck.message, 400);
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return publicError(
        "storage_unavailable",
        "Preview image storage is not configured. Please try again later.",
        503
      );
    }

    await dbConnect();

    let leadDoc: ILead | null = null;
    if (leadToken) {
      leadDoc = await Lead.findOne({ token: leadToken });
      if (!leadDoc) {
        return publicError(
          "invalid_lead",
          "This continue link is invalid. Start again from the preview page.",
          400
        );
      }
      leadDoc.status = "generating";
      leadDoc.email = email;
      if (phone) leadDoc.phone = phone;
      leadDoc.facebookUrl = urlCheck.normalizedUrl;
      leadDoc.authorized = true;
      await leadDoc.save();
    }

    const since = new Date(Date.now() - RATE_WINDOW_MS);
    const recentCount = await Preview.countDocuments({
      email,
      createdAt: { $gte: since },
    });
    if (recentCount >= RATE_LIMIT) {
      return publicError(
        "rate_limited",
        "You’ve reached the limit of 3 website previews per email in 24 hours. Try again tomorrow.",
        429
      );
    }

    const blobToken = createPreviewBlobToken();
    const slug = await ensureUniqueSlug("preview");
    const origin = req.headers.get("origin") || undefined;

    const preview = await Preview.create({
      slug,
      email,
      phone: phone || leadDoc?.phone || "",
      leadToken: leadToken || "",
      onboardingToken: blobToken,
      status: "queued",
      source: { type: "facebook", url: urlCheck.normalizedUrl },
      expiresAt: previewExpiresAt(),
    });
    previewId = String(preview._id);

    preview.status = "scraping";
    await preview.save();

    const startedAt = Date.now();
    const mark = (label: string) =>
      console.log(`[preview] ${label} +${Date.now() - startedAt}ms`);

    let page: FacebookPageImportData;
    try {
      page = await scrapeFacebookPage(urlCheck.normalizedUrl);
      mark(`scrape done (${page.photoUrls.length} photos)`);
    } catch (scrapeError) {
      console.error("[preview] scrape failed", scrapeError);
      if (facebookGraphConfigured()) {
        try {
          page = await fetchFacebookPageData(urlCheck.normalizedUrl);
        } catch (graphError) {
          console.error("[preview] graph fallback failed", graphError);
          preview.status = "failed";
          preview.error = {
            code: "scrape_failed",
            message:
              "We couldn’t access that Facebook page. Check the URL and try again.",
          };
          await preview.save();
          return publicError(
            "scrape_failed",
            preview.error.message,
            422
          );
        }
      } else {
        preview.status = "failed";
        preview.error = {
          code: "scrape_failed",
          message:
            "We couldn’t access that Facebook page. It may be blocked or unavailable.",
        };
        await preview.save();
        return publicError("scrape_failed", preview.error.message, 422);
      }
    }

    if (!page.name && !page.photoUrls.length && !page.about) {
      preview.status = "failed";
      preview.error = {
        code: "insufficient_data",
        message:
          "Not enough public business information was found on that page to build a preview.",
      };
      await preview.save();
      return publicError("insufficient_data", preview.error.message, 422);
    }

    // Prefer a nicer slug once we know the name
    if (page.name) {
      const nicer = await ensureUniqueSlug(page.name);
      if (nicer !== preview.slug) {
        preview.slug = nicer;
      }
    }

    const { fields } = await cleanFacebookDataForOnboarding(page, email);
    mark("onboarding clean done");

    let assets: Awaited<ReturnType<typeof importFacebookImagesToBlob>> = [];
    try {
      assets = await importFacebookImagesToBlob(page, blobToken);
      mark(`image import done (${assets.length} assets)`);
    } catch (assetError) {
      console.warn("[preview] image import failed — continuing", assetError);
    }

    preview.status = "generating";
    await preview.save();

    const businessName = cleanBusinessName(
      fields.contact.businessName || page.name || "Business",
      fields.business.city || page.city,
      fields.business.state || page.state
    );
    fields.contact.businessName = businessName;

    const safeDescription = websiteSafeCopy(
      fields.business.description || "",
      websiteSafeCopy(page.about || "", websiteSafeCopy(page.description || "", ""))
    );

    // Never let Facebook chrome leak into cleaned fields used downstream
    fields.business.description = safeDescription;
    fields.content.aboutCopy = websiteSafeCopy(fields.content.aboutCopy || "", "");

    const [imageAnalyses, research] = await Promise.all([
      analyzePreviewImages(assets, {
        name: businessName,
        category: page.category,
        description: safeDescription,
        city: fields.business.city || page.city,
        state: fields.business.state || page.state,
        servicesHint: fields.content.servicesProducts || page.category,
      }),
      researchCompany({
        businessName,
        category: page.category,
        city: fields.business.city || page.city,
        state: fields.business.state || page.state,
        website: fields.business.existingSiteUrl || page.website,
        facebookUrl: urlCheck.normalizedUrl,
        about: safeDescription,
        phone: fields.contact.phone || page.phone,
      }),
    ]);
    mark(
      `vision+research done (analyzed=${imageAnalyses.length}, web=${research.usedWeb})`
    );

    const { siteSpec, usedAi: usedSiteSpecAi } = await generateSiteSpec({
      fields,
      page,
      assets,
      fallbackEmail: email,
      brandPreferences,
      imageAnalyses,
      research,
    });
    mark("siteSpec done");

    // Prefer contact email from form for the preview owner
    if (!siteSpec.business.email) {
      siteSpec.business.email = email;
    }

    siteSpec.business.name = cleanBusinessName(
      siteSpec.business.name,
      siteSpec.business.city || fields.business.city || page.city,
      siteSpec.business.state || fields.business.state || page.state
    );

    // Real logo from vision, or generate a branded initials mark — never FB profile
    siteSpec.branding.logoUrl = await resolvePreviewLogo({
      businessName: siteSpec.business.name,
      existingLogoUrl: siteSpec.branding.logoUrl,
      analyses: imageAnalyses,
      primaryColor: siteSpec.branding.primaryColor,
      accentColor: siteSpec.branding.accentColor,
      token: blobToken,
    });
    mark("logo done");

    let pages: Awaited<ReturnType<typeof generatePreviewHtml>>["pages"] | null =
      null;
    let htmlModel = "";
    let usedHtmlAi = false;
    try {
      const htmlResult = await generatePreviewHtml({
        fields,
        page,
        assets,
        imageAnalyses,
        research,
        brandPreferences,
        businessName: siteSpec.business.name,
        fallbackEmail: email,
      });
      pages = htmlResult.pages;
      htmlModel = htmlResult.model;
      usedHtmlAi = htmlResult.usedAi;
      mark("html pages done");
    } catch (htmlError) {
      console.error("[preview] custom HTML generation failed", htmlError);
      preview.status = "failed";
      preview.error = {
        code: "html_generation_failed",
        message:
          "We couldn’t finish the custom website demo. Please try again in a moment.",
      };
      await preview.save();
      return publicError(
        "html_generation_failed",
        preview.error.message,
        500
      );
    }

    if (!previewPagesComplete(pages)) {
      preview.status = "failed";
      preview.error = {
        code: "html_incomplete",
        message:
          "The website demo finished incompletely. Please try generating again.",
      };
      await preview.save();
      return publicError(
        "html_incomplete",
        preview.error.message,
        500
      );
    }

    preview.siteSpec = siteSpec;
    preview.pages = pages;
    preview.generation = {
      engine: "openai-html",
      model: htmlModel,
    };
    preview.status = "ready";
    preview.error = { code: "", message: "" };
    await preview.save();

    if (leadDoc) {
      leadDoc.status = "preview_ready";
      leadDoc.previewSlug = preview.slug;
      leadDoc.email = email;
      if (phone) leadDoc.phone = phone;
      await leadDoc.save();
    }

    const previewUrl = previewPublicUrl(preview.slug, origin);

    try {
      if (process.env.EMAIL && process.env.EMAIL_PASS) {
        await sendPreviewReadyEmail({
          to: email,
          previewUrl,
          businessName: siteSpec.business.name,
          name: leadDoc?.name || "",
        });
        console.log("[preview] ready email sent", email);
      }
    } catch (mailError) {
      console.error("[preview] ready email failed", mailError);
    }

    try {
      if (process.env.EMAIL && process.env.EMAIL_PASS) {
        await sendAdminPreviewReadyEmail({
          email,
          phone: phone || leadDoc?.phone || "",
          name: leadDoc?.name || "",
          businessName: siteSpec.business.name,
          city: siteSpec.business.city || leadDoc?.city || "",
          state: siteSpec.business.state || leadDoc?.state || "",
          facebookUrl: urlCheck.normalizedUrl,
          previewUrl,
          slug: preview.slug,
          leadToken: leadToken || leadDoc?.token || "",
          previewId: String(preview._id),
          elapsedMs: Date.now() - startedAt,
          assetCount: assets.length,
        });
        console.log("[preview] admin notify sent");
      }
    } catch (adminMailError) {
      console.error("[preview] admin notify failed", adminMailError);
    }

    console.log("[preview] ready", {
      slug: preview.slug,
      elapsedMs: Date.now() - startedAt,
      usedSiteSpecAi,
      usedHtmlAi,
      htmlModel,
      assetCount: assets.length,
      analyzedImages: imageAnalyses.length,
      researchedWeb: research.usedWeb,
      brandPreferences,
    });

    return NextResponse.json({
      slug: preview.slug,
      previewUrl,
      status: "ready" as const,
      pagesComplete: true,
      usedAi: usedHtmlAi || usedSiteSpecAi,
    });
  } catch (error) {
    console.error("[preview] generate failed", error);
    if (previewId) {
      try {
        await Preview.findByIdAndUpdate(previewId, {
          status: "failed",
          error: {
            code: "generation_failed",
            message:
              "We couldn’t finish generating your website preview. Please try again.",
          },
        });
      } catch {
        // ignore
      }
    }
    return publicError(
      "generation_failed",
      "We couldn’t finish generating your website preview. Please try again.",
      500
    );
  }
}
