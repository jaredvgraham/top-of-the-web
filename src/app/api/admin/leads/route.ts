import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Lead from "@/models/Lead";
import {
  CONTACT_LEAD_FILTER,
  META_AD_LEAD_FILTER,
  ORGANIC_LEAD_FILTER,
  serializeAdminLead,
} from "@/lib/adminLeads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type SourceFilter = "all" | "meta" | "organic" | "contact";

function parseSource(value: string | null): SourceFilter {
  if (value === "meta" || value === "organic" || value === "contact") {
    return value;
  }
  return "all";
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const source = parseSource(req.nextUrl.searchParams.get("source"));
    const limitRaw = Number(req.nextUrl.searchParams.get("limit") || "200");
    const limit = Math.min(
      500,
      Math.max(1, Number.isFinite(limitRaw) ? limitRaw : 200)
    );

    const filter =
      source === "meta"
        ? META_AD_LEAD_FILTER
        : source === "organic"
          ? ORGANIC_LEAD_FILTER
          : source === "contact"
            ? CONTACT_LEAD_FILTER
            : {};

    const [total, metaCount, organicCount, contactCount, docs] =
      await Promise.all([
        Lead.countDocuments({}),
        Lead.countDocuments(META_AD_LEAD_FILTER),
        Lead.countDocuments(ORGANIC_LEAD_FILTER),
        Lead.countDocuments(CONTACT_LEAD_FILTER),
        Lead.find(filter)
          .sort({ createdAt: -1 })
          .limit(limit)
          .select(
            "name email phone businessName city state status source notes onboardingToken token previewSlug facebookUrl attribution demoViewCount demoFirstViewedAt demoLastViewedAt createdAt updatedAt"
          )
          .lean(),
      ]);

    const leads = docs.map((doc) => serializeAdminLead(doc));

    return NextResponse.json(
      {
        source,
        leads,
        counts: {
          total,
          meta: metaCount,
          organic: organicCount,
          contact: contactCount,
          shown: leads.length,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("[admin] list leads failed", error);
    return NextResponse.json(
      { error: "Failed to load leads" },
      { status: 500 }
    );
  }
}
