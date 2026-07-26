import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { previewPagesComplete } from "@/lib/preview/generatePreviewHtml";
import { createZipBuffer } from "@/lib/zipStore";
import Preview, { type PreviewPages } from "@/models/Preview";

export const runtime = "nodejs";

type Params = { params: { id: string } };

function safeFilename(value: string) {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "preview"
  );
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const id = (params.id || "").trim();
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    await dbConnect();
    const doc = await Preview.findById(id).lean();
    if (!doc) {
      return NextResponse.json({ error: "Preview not found" }, { status: 404 });
    }

    const pages = doc.pages as PreviewPages | undefined;
    if (!previewPagesComplete(pages)) {
      return NextResponse.json(
        { error: "This preview has no complete website code to download yet." },
        { status: 422 }
      );
    }

    const slug = doc.slug || String(doc._id);
    const folder = safeFilename(slug);
    const readme = [
      `Bsites preview export`,
      `=====================`,
      ``,
      `Slug: ${slug}`,
      `Email: ${doc.email || ""}`,
      `Facebook: ${doc.source?.url || ""}`,
      `Status: ${doc.status}`,
      `Model: ${doc.generation?.model || "unknown"}`,
      `Engine: ${doc.generation?.engine || "unknown"}`,
      `Generated: ${doc.createdAt ? new Date(doc.createdAt).toISOString() : ""}`,
      ``,
      `Files`,
      `-----`,
      `index.html     Home`,
      `services.html  Services`,
      `about.html     About`,
      `site-spec.json Structured brief (if available)`,
      ``,
      `Images are remote URLs embedded in the HTML (Vercel Blob / Facebook).`,
      `Use this as the starting template when building their custom site.`,
      ``,
    ].join("\n");

    const entries = [
      { name: `${folder}/README.txt`, data: readme },
      { name: `${folder}/index.html`, data: pages!.home },
      { name: `${folder}/services.html`, data: pages!.services },
      { name: `${folder}/about.html`, data: pages!.about },
    ];

    if (doc.siteSpec) {
      entries.push({
        name: `${folder}/site-spec.json`,
        data: JSON.stringify(doc.siteSpec, null, 2),
      });
    }

    const zip = createZipBuffer(entries);
    const filename = `${folder}-website.zip`;

    return new NextResponse(new Uint8Array(zip), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[admin] preview download failed", error);
    return NextResponse.json(
      { error: "Failed to download preview code" },
      { status: 500 }
    );
  }
}
