import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Lead, { leadExpiresAt } from "@/models/Lead";
import {
  sendAdminLeadCapturedEmail,
  sendLeadContinueEmail,
} from "@/lib/mail";
import {
  buildFbcFromFbclid,
  createLeadToken,
  isValidLeadPhone,
  leadContinueUrl,
  normalizeLeadEmail,
  normalizeLeadPhone,
} from "@/lib/preview/lead";

export const runtime = "nodejs";

const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 24 * 60 * 60 * 1000;

function publicError(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}

function clientIp(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "";
  return req.headers.get("x-real-ip") || "";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email =
      typeof body.email === "string" ? normalizeLeadEmail(body.email) : "";
    const phoneRaw = typeof body.phone === "string" ? body.phone : "";
    const phone = normalizeLeadPhone(phoneRaw);
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const businessName =
      typeof body.businessName === "string" ? body.businessName.trim() : "";
    const city = typeof body.city === "string" ? body.city.trim() : "";
    const stateRaw = typeof body.state === "string" ? body.state.trim() : "";
    const state = stateRaw.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 2);
    const authorized = body.authorized === true || body.authorized === "true";

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return publicError("invalid_email", "Enter a valid business email.", 400);
    }
    if (!isValidLeadPhone(phone)) {
      return publicError(
        "invalid_phone",
        "Enter a valid business phone number (at least 10 digits).",
        400
      );
    }
    if (!name || name.length < 2) {
      return publicError("invalid_name", "Enter your name.", 400);
    }
    if (!businessName || businessName.length < 2) {
      return publicError(
        "invalid_business_name",
        "Enter your business name.",
        400
      );
    }
    if (!city || city.length < 2) {
      return publicError("invalid_city", "Enter your city.", 400);
    }
    if (!state || state.length !== 2) {
      return publicError(
        "invalid_state",
        "Enter your 2-letter state (e.g. TX).",
        400
      );
    }
    if (!authorized) {
      return publicError(
        "authorization_required",
        "Confirm that we can contact you about your website preview.",
        400
      );
    }

    if (!process.env.EMAIL || !process.env.EMAIL_PASS) {
      return publicError(
        "email_unavailable",
        "Email is not configured. Please try again later.",
        503
      );
    }

    await dbConnect();

    const since = new Date(Date.now() - RATE_WINDOW_MS);
    const recentCount = await Lead.countDocuments({
      email,
      createdAt: { $gte: since },
    });
    if (recentCount >= RATE_LIMIT) {
      return publicError(
        "rate_limited",
        "Too many requests for this email today. Check your inbox for the continue link, or try again tomorrow.",
        429
      );
    }

    const fbclid =
      typeof body.fbclid === "string" ? body.fbclid.trim().slice(0, 512) : "";
    const fbp =
      typeof body.fbp === "string" ? body.fbp.trim().slice(0, 256) : "";
    let fbc =
      typeof body.fbc === "string" ? body.fbc.trim().slice(0, 512) : "";
    if (!fbc && fbclid) {
      fbc = buildFbcFromFbclid(fbclid);
    }

    const str = (key: string, max: number) =>
      typeof body[key] === "string" ? body[key].trim().slice(0, max) : "";

    const landingUrl = str("landingUrl", 2000);
    let campaignId = str("campaignId", 64);
    let adsetId = str("adsetId", 64);
    let adId = str("adId", 64);
    if (landingUrl && (!campaignId || !adsetId || !adId)) {
      try {
        const url = new URL(landingUrl);
        campaignId =
          campaignId ||
          (url.searchParams.get("campaign_id") ||
            url.searchParams.get("campaignId") ||
            ""
          ).trim();
        adsetId =
          adsetId ||
          (
            url.searchParams.get("adset_id") ||
            url.searchParams.get("adsetId") ||
            ""
          ).trim();
        adId =
          adId ||
          (url.searchParams.get("ad_id") || url.searchParams.get("adId") || "")
            .trim();
      } catch {
        // ignore
      }
    }

    const token = createLeadToken();
    const origin = req.headers.get("origin") || undefined;
    const continueUrl = leadContinueUrl(token, origin);

    const lead = await Lead.create({
      token,
      email,
      phone,
      name: name.slice(0, 80),
      businessName: businessName.slice(0, 120),
      city: city.slice(0, 80),
      state,
      status: "captured",
      authorized: true,
      attribution: {
        fbclid,
        fbp,
        fbc,
        landingUrl,
        userAgent: (req.headers.get("user-agent") || "").slice(0, 500),
        ip: clientIp(req).slice(0, 64),
        utmSource: str("utmSource", 200),
        utmMedium: str("utmMedium", 200),
        utmCampaign: str("utmCampaign", 200),
        utmContent: str("utmContent", 200),
        utmTerm: str("utmTerm", 200),
        campaignId,
        adsetId,
        adId,
      },
      expiresAt: leadExpiresAt(),
    });

    try {
      await sendLeadContinueEmail({
        to: email,
        continueUrl,
        name,
        phone,
      });
    } catch (mailError) {
      console.error("[lead] continue email failed", mailError);
      // Keep the lead — they can still use the URL if we surface it, but for ads we rely on email.
      return publicError(
        "email_failed",
        "We saved your info but couldn’t send the email. Please try again in a moment.",
        502
      );
    }

    try {
      await sendAdminLeadCapturedEmail({
        name,
        businessName,
        city,
        state,
        email,
        phone,
        continueUrl,
        token: lead.token,
        fbclid,
        fbp,
        fbc,
        utmSource:
          typeof body.utmSource === "string" ? body.utmSource.trim() : "",
        utmMedium:
          typeof body.utmMedium === "string" ? body.utmMedium.trim() : "",
        utmCampaign:
          typeof body.utmCampaign === "string" ? body.utmCampaign.trim() : "",
        landingUrl,
        ip: clientIp(req),
      });
    } catch (adminMailError) {
      console.error("[lead] admin notify failed", adminMailError);
    }

    console.log("[lead] captured", {
      token: lead.token.slice(0, 8),
      email,
      hasFbclid: Boolean(fbclid),
    });

    return NextResponse.json({
      ok: true,
      token: lead.token,
      // Helpful in local/dev; production email is the primary path
      continueUrl,
    });
  } catch (error) {
    console.error("[lead] capture failed", error);
    return publicError(
      "lead_failed",
      "We couldn’t save your info. Please try again.",
      500
    );
  }
}
