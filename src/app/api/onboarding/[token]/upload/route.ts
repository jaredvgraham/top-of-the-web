import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Onboarding from "@/models/Onboarding";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_UPLOAD_BYTES,
  serializeOnboarding,
  type OnboardingAssetKind,
} from "@/lib/onboarding";

type RouteContext = { params: { token: string } };

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        {
          message:
            "Image uploads are not configured. Add BLOB_READ_WRITE_TOKEN to the environment.",
        },
        { status: 500 }
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

    const formData = await req.formData();
    const file = formData.get("file");
    const kindRaw = formData.get("kind");
    const captionRaw = formData.get("caption");

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "File is required" }, { status: 400 });
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { message: "Only JPEG, PNG, WebP, GIF, or SVG images are allowed" },
        { status: 400 }
      );
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { message: "Images must be 8 MB or smaller" },
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

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_") || "upload";
    const pathname = `onboarding/${params.token}/${kind}-${Date.now()}-${safeName}`;

    const blob = await put(pathname, file, {
      access: "public",
      contentType: file.type,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    if (kind === "logo" || kind === "about") {
      session.assets = session.assets.filter((asset) => asset.kind !== kind);
    }

    session.assets.push({
      url: blob.url,
      pathname: blob.pathname,
      filename: file.name,
      kind,
      caption: typeof captionRaw === "string" ? captionRaw : "",
      uploadedAt: new Date(),
    });

    await session.save();

    return NextResponse.json({
      session: serializeOnboarding(session),
      asset: {
        url: blob.url,
        pathname: blob.pathname,
        filename: file.name,
        kind,
      },
    });
  } catch (error) {
    console.error("Failed to upload onboarding asset", error);
    return NextResponse.json(
      { message: "Unable to upload image" },
      { status: 500 }
    );
  }
}
