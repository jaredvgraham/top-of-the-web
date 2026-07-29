import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import dbConnect from "@/lib/db";
import Lead from "@/models/Lead";
import Preview from "@/models/Preview";
import { hasMetaAdClickAttribution } from "@/lib/preview/lead";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

/**
 * Decide whether to fire Meta Pixel Purchase for this checkout.
 * Credits Meta only when the buyer's Lead (or linked preview lead)
 * stored an ad-click signal (fbclid / fbc) — not for organic purchases.
 */
export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id")?.trim() || "";
  if (!sessionId.startsWith("cs_")) {
    return NextResponse.json({ creditMeta: false });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const email = (
      session.customer_details?.email ||
      session.customer_email ||
      ""
    )
      .trim()
      .toLowerCase();
    const previewSlug = (session.metadata?.previewSlug || "").trim();

    await dbConnect();

    let lead: {
      attribution?: { fbclid?: string; fbc?: string };
    } | null = null;

    if (previewSlug) {
      const preview = await Preview.findOne({ slug: previewSlug })
        .select("leadToken email")
        .lean();
      if (preview?.leadToken) {
        lead = await Lead.findOne({ token: preview.leadToken })
          .select("attribution")
          .lean();
      }
      if (!lead && preview?.email) {
        lead = await Lead.findOne({ email: preview.email.toLowerCase() })
          .sort({ createdAt: -1 })
          .select("attribution")
          .lean();
      }
    }

    if (!lead && email) {
      lead = await Lead.findOne({ email })
        .sort({ createdAt: -1 })
        .select("attribution")
        .lean();
    }

    const attr = lead?.attribution || {};
    const creditMeta = hasMetaAdClickAttribution({
      fbclid: attr.fbclid || "",
      fbc: attr.fbc || "",
    });

    return NextResponse.json(
      { creditMeta },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("meta-credit lookup failed:", error);
    return NextResponse.json({ creditMeta: false });
  }
}
