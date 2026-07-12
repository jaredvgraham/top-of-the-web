import { del } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Onboarding from "@/models/Onboarding";

type RouteContext = { params: { token: string } };

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    const token = params.token?.trim();
    if (!token) {
      return NextResponse.json({ message: "Token is required" }, { status: 400 });
    }

    await dbConnect();
    const session = await Onboarding.findOne({ token });
    if (!session) {
      return NextResponse.json(
        { message: "Onboarding session not found" },
        { status: 404 }
      );
    }

    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    if (blobToken && session.assets.length > 0) {
      await Promise.all(
        session.assets.map(async (asset) => {
          try {
            await del(asset.url, { token: blobToken });
          } catch (error) {
            console.warn("Failed to delete onboarding blob", asset.url, error);
          }
        })
      );
    }

    await Onboarding.deleteOne({ _id: session._id });

    return NextResponse.json({ ok: true, token });
  } catch (error) {
    console.error("Failed to delete onboarding session", error);
    return NextResponse.json(
      { message: "Unable to delete onboarding session" },
      { status: 500 }
    );
  }
}
