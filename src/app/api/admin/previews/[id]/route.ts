import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Lead from "@/models/Lead";
import Preview from "@/models/Preview";
import { deletePreviewBlobPrefix } from "@/lib/preview/deletePreviewAssets";

export const runtime = "nodejs";

type Params = { params: { id: string } };

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const id = (params.id || "").trim();
    if (!id) {
      return NextResponse.json({ error: "Preview id required" }, { status: 400 });
    }

    await dbConnect();
    const preview = await Preview.findById(id);
    if (!preview) {
      return NextResponse.json({ error: "Preview not found" }, { status: 404 });
    }

    const slug = preview.slug;
    const leadToken = preview.leadToken || "";
    const blobToken = preview.onboardingToken || "";

    const blobs = await deletePreviewBlobPrefix(blobToken);

    await Preview.deleteOne({ _id: preview._id });

    // Detach leads that pointed at this demo (keep the lead row)
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
      console.warn("[admin] lead detach after preview delete failed", leadError);
    }

    return NextResponse.json({
      ok: true,
      id,
      slug,
      blobsDeleted: blobs.deleted,
      blobErrors: blobs.errors,
    });
  } catch (error) {
    console.error("[admin] delete preview failed", error);
    return NextResponse.json(
      { error: "Failed to delete preview" },
      { status: 500 }
    );
  }
}
