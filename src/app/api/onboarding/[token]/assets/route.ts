import { del } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Onboarding from "@/models/Onboarding";
import { serializeOnboarding } from "@/lib/onboarding";

type RouteContext = { params: { token: string } };

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
