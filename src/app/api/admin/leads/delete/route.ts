import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import Lead from "@/models/Lead";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Permanently delete Lead document(s) by Mongo _id.
 * Does not touch paid Website/Customer records.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const ids = Array.isArray(body.ids)
      ? body.ids
          .filter((id: unknown): id is string => typeof id === "string")
          .map((id: string) => id.trim())
          .filter((id: string) => mongoose.Types.ObjectId.isValid(id))
      : [];

    if (!ids.length) {
      return NextResponse.json(
        { error: "Provide ids: string[] of lead Mongo ids" },
        { status: 400 }
      );
    }
    if (ids.length > 100) {
      return NextResponse.json(
        { error: "Max 100 leads per delete request" },
        { status: 400 }
      );
    }

    await dbConnect();
    const result = await Lead.deleteMany({
      _id: {
        $in: ids.map((id: string) => new mongoose.Types.ObjectId(id)),
      },
    });

    return NextResponse.json(
      {
        ok: true,
        deleted: result.deletedCount ?? 0,
        deletedIds: ids,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("[admin] delete leads failed", error);
    return NextResponse.json(
      { error: "Failed to delete leads" },
      { status: 500 }
    );
  }
}
