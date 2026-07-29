import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Lead from "@/models/Lead";
import {
  META_AD_LEAD_FILTER,
  serializeAdminLead,
} from "@/lib/adminLeads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type SourceFilter = "all" | "meta" | "organic";

function parseSource(value: string | null): SourceFilter {
  if (value === "meta" || value === "organic") return value;
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
          ? { $nor: [META_AD_LEAD_FILTER] }
          : {};

    const [total, metaCount, organicCount, docs] = await Promise.all([
      Lead.countDocuments({}),
      Lead.countDocuments(META_AD_LEAD_FILTER),
      Lead.countDocuments({ $nor: [META_AD_LEAD_FILTER] }),
      Lead.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit)
        .select(
          "name email phone businessName city state status previewSlug facebookUrl attribution createdAt updatedAt"
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
