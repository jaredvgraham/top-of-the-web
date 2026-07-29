import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { deleteGhostLeadsByIds } from "@/lib/ghostLeads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const ids = Array.isArray(body.ids)
      ? body.ids
          .filter((id: unknown): id is string => typeof id === "string")
          .map((id: string) => id.trim())
          .filter(Boolean)
      : [];

    if (!ids.length) {
      return NextResponse.json(
        { error: "Provide ids: string[]" },
        { status: 400 }
      );
    }
    if (ids.length > 100) {
      return NextResponse.json(
        { error: "Max 100 ghost leads per request" },
        { status: 400 }
      );
    }

    await dbConnect();
    const result = await deleteGhostLeadsByIds(ids);

    return NextResponse.json(
      {
        ok: true,
        ...result,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("[admin] bulk delete ghost leads failed", error);
    return NextResponse.json(
      { error: "Failed to delete ghost leads" },
      { status: 500 }
    );
  }
}
