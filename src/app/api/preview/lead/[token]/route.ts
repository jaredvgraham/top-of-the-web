import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Lead, { isLeadExpired } from "@/models/Lead";

export const runtime = "nodejs";

type Params = { params: { token: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  const token = (params.token || "").trim();
  if (!token || token.length < 16) {
    return NextResponse.json(
      { error: { code: "invalid_token", message: "Invalid link." } },
      { status: 400 }
    );
  }

  await dbConnect();
  const lead = await Lead.findOne({ token }).lean();
  if (!lead) {
    return NextResponse.json(
      {
        error: {
          code: "not_found",
          message: "This link is invalid or has expired.",
        },
      },
      { status: 404 }
    );
  }

  if (isLeadExpired(lead)) {
    return NextResponse.json(
      {
        error: {
          code: "expired",
          message: "This link has expired. Start again from the preview page.",
        },
      },
      { status: 410 }
    );
  }

  return NextResponse.json({
    token: lead.token,
    email: lead.email,
    phone: lead.phone,
    name: lead.name || "",
    businessName: lead.businessName || "",
    city: lead.city || "",
    state: lead.state || "",
    status: lead.status,
    previewSlug: lead.previewSlug || "",
  });
}
