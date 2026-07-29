import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Lead from "@/models/Lead";
import Preview from "@/models/Preview";
import { deletePreviewBlobPrefix } from "@/lib/preview/deletePreviewAssets";

export const runtime = "nodejs";
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
        { error: "Max 100 previews per request" },
        { status: 400 }
      );
    }

    await dbConnect();
    const previews = await Preview.find({ _id: { $in: ids } });

    let deleted = 0;
    let blobsDeleted = 0;
    let blobErrors = 0;
    const missing: string[] = [];
    const failed: string[] = [];

    const foundIds = new Set(previews.map((p) => String(p._id)));
    for (const id of ids) {
      if (!foundIds.has(id)) missing.push(id);
    }

    for (const preview of previews) {
      try {
        const slug = preview.slug;
        const leadToken = preview.leadToken || "";
        const blobToken = preview.onboardingToken || "";

        const blobs = await deletePreviewBlobPrefix(blobToken);
        blobsDeleted += blobs.deleted;
        blobErrors += blobs.errors;

        await Preview.deleteOne({ _id: preview._id });
        deleted += 1;

        try {
          if (leadToken) {
            await Lead.updateMany(
              { token: leadToken },
              { $unset: { previewSlug: 1 } }
            );
          } else if (slug) {
            await Lead.updateMany(
              { previewSlug: slug },
              { $unset: { previewSlug: 1 } }
            );
          }
        } catch (leadError) {
          console.warn(
            "[admin] lead detach after bulk preview delete failed",
            leadError
          );
        }
      } catch (error) {
        console.error("[admin] bulk delete one preview failed", preview._id, error);
        failed.push(String(preview._id));
      }
    }

    return NextResponse.json({
      ok: true,
      deleted,
      blobsDeleted,
      blobErrors,
      missing,
      failed,
    });
  } catch (error) {
    console.error("[admin] bulk delete previews failed", error);
    return NextResponse.json(
      { error: "Failed to bulk delete previews" },
      { status: 500 }
    );
  }
}
