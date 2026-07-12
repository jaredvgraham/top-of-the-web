import { del } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Onboarding from "@/models/Onboarding";
import {
  markOnboardingStarted,
  serializeOnboarding,
  type OnboardingAssetKind,
} from "@/lib/onboarding";

type RouteContext = { params: { token: string } };

function isVercelBlobUrl(url: string) {
  try {
    const host = new URL(url).hostname;
    return (
      host === "blob.vercel-storage.com" ||
      host.endsWith(".blob.vercel-storage.com") ||
      host.endsWith(".public.blob.vercel-storage.com")
    );
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const body = await req.json().catch(() => ({}));
    const url = typeof body.url === "string" ? body.url.trim() : "";
    const pathname =
      typeof body.pathname === "string" ? body.pathname.trim() : "";
    const filename =
      typeof body.filename === "string" ? body.filename.trim() : "upload";
    const kindRaw = typeof body.kind === "string" ? body.kind : "photo";
    const caption = typeof body.caption === "string" ? body.caption : "";

    if (!url || !pathname) {
      return NextResponse.json(
        { message: "url and pathname are required" },
        { status: 400 }
      );
    }

    const prefix = `onboarding/${params.token}/`;
    if (!pathname.startsWith(prefix)) {
      return NextResponse.json(
        { message: "Invalid asset pathname" },
        { status: 400 }
      );
    }

    if (!isVercelBlobUrl(url)) {
      return NextResponse.json(
        { message: "Invalid asset URL" },
        { status: 400 }
      );
    }

    const kind: OnboardingAssetKind =
      kindRaw === "logo" ||
      kindRaw === "about" ||
      kindRaw === "photo" ||
      kindRaw === "other"
        ? kindRaw
        : "photo";

    await dbConnect();
    const session = await Onboarding.findOne({ token: params.token });
    if (!session) {
      return NextResponse.json(
        { message: "Onboarding session not found" },
        { status: 404 }
      );
    }

    if (session.assets.some((asset) => asset.url === url)) {
      return NextResponse.json({ session: serializeOnboarding(session) });
    }

    if (kind === "logo" || kind === "about") {
      session.assets = session.assets.filter((asset) => asset.kind !== kind);
    }

    session.assets.push({
      url,
      pathname,
      filename,
      kind,
      caption,
      uploadedAt: new Date(),
    });

    markOnboardingStarted(session);
    await session.save();

    return NextResponse.json({ session: serializeOnboarding(session) });
  } catch (error) {
    console.error("Failed to register onboarding asset", error);
    return NextResponse.json(
      { message: "Unable to save uploaded image" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const body = await req.json().catch(() => ({}));
    const assetId = typeof body.assetId === "string" ? body.assetId : "";
    const url = typeof body.url === "string" ? body.url : "";

    if (!assetId && !url) {
      return NextResponse.json(
        { message: "assetId or url is required" },
        { status: 400 }
      );
    }

    await dbConnect();
    const session = await Onboarding.findOne({ token: params.token });
    if (!session) {
      return NextResponse.json(
        { message: "Onboarding session not found" },
        { status: 404 }
      );
    }

    const asset = session.assets.find((item) => {
      const id = String((item as { _id?: unknown })._id ?? "");
      return (assetId && id === assetId) || (url && item.url === url);
    });

    if (!asset) {
      return NextResponse.json({ message: "Asset not found" }, { status: 404 });
    }

    try {
      if (process.env.BLOB_READ_WRITE_TOKEN) {
        await del(asset.url, { token: process.env.BLOB_READ_WRITE_TOKEN });
      }
    } catch (error) {
      console.warn("Failed to delete blob object", error);
    }

    session.assets = session.assets.filter((item) => {
      const id = String((item as { _id?: unknown })._id ?? "");
      if (assetId) return id !== assetId;
      return item.url !== url;
    });

    await session.save();

    return NextResponse.json({ session: serializeOnboarding(session) });
  } catch (error) {
    console.error("Failed to delete onboarding asset", error);
    return NextResponse.json(
      { message: "Unable to delete image" },
      { status: 500 }
    );
  }
}
