import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Lead from "@/models/Lead";
import { ADMIN_COOKIE, isValidAdminToken } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: { slug: string } };

/**
 * Record a client demo page view for the lead tied to this preview slug.
 * Skips when the request carries a valid admin_session cookie.
 */
export async function POST(req: NextRequest, { params }: Params) {
  const slug = (params.slug || "").trim().toLowerCase();
  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  const adminToken = req.cookies.get(ADMIN_COOKIE)?.value;
  if (await isValidAdminToken(adminToken)) {
    return NextResponse.json({ recorded: false, reason: "admin" });
  }

  try {
    await dbConnect();
    const now = new Date();
    const lead = await Lead.findOne({ previewSlug: slug })
      .select("_id demoFirstViewedAt")
      .lean();

    if (!lead) {
      return NextResponse.json({ recorded: false, reason: "no_lead" });
    }

    const $set: { demoLastViewedAt: Date; demoFirstViewedAt?: Date } = {
      demoLastViewedAt: now,
    };
    if (!lead.demoFirstViewedAt) {
      $set.demoFirstViewedAt = now;
    }

    await Lead.updateOne({ _id: lead._id }, { $inc: { demoViewCount: 1 }, $set });

    return NextResponse.json({ recorded: true });
  } catch (error) {
    console.error("[preview] demo view track failed", error);
    return NextResponse.json(
      { error: "Failed to record view" },
      { status: 500 }
    );
  }
}
