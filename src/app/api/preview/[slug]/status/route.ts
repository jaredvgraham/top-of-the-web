import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { previewPagesComplete } from "@/lib/preview/generatePreviewHtml";
import Preview, { isPreviewExpired, type PreviewPages } from "@/models/Preview";

export const runtime = "nodejs";

type Params = { params: { slug: string } };

function previewPublicUrl(slug: string, origin?: string) {
  const base =
    origin || process.env.NEXT_PUBLIC_SITE_URL || "https://www.bsites.io";
  return `${base.replace(/\/$/, "")}/preview/${slug}`;
}

export async function GET(req: NextRequest, { params }: Params) {
  const slug = (params.slug || "").trim().toLowerCase();
  if (!slug) {
    return NextResponse.json(
      { error: { code: "not_found", message: "Preview not found." } },
      { status: 404 }
    );
  }

  await dbConnect();
  const doc = await Preview.findOne({ slug }).lean();
  if (!doc) {
    return NextResponse.json(
      { error: { code: "not_found", message: "Preview not found." } },
      { status: 404 }
    );
  }

  let status = doc.status;
  if (isPreviewExpired(doc) && status !== "failed") {
    status = "expired";
    if (doc.status !== "expired") {
      await Preview.updateOne({ _id: doc._id }, { status: "expired" });
    }
  }

  const origin = req.headers.get("origin") || undefined;
  const pagesComplete = previewPagesComplete(doc.pages as PreviewPages | undefined);
  const effectiveStatus =
    status === "ready" && !pagesComplete ? "generating" : status;

  const body: {
    slug: string;
    status: string;
    pagesComplete: boolean;
    previewUrl?: string;
    error?: { code: string; message: string };
  } = {
    slug: doc.slug,
    status: effectiveStatus,
    pagesComplete,
  };

  if (effectiveStatus === "ready" && pagesComplete) {
    body.previewUrl = previewPublicUrl(doc.slug, origin);
  }

  if (status === "failed" && doc.error?.code) {
    body.error = {
      code: doc.error.code,
      message:
        doc.error.message ||
        "We couldn’t finish generating this preview.",
    };
  }

  if (status === "expired") {
    body.error = {
      code: "expired",
      message: "This preview has expired.",
    };
  }

  return NextResponse.json(body);
}
