import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Onboarding from "@/models/Onboarding";
import { serializeOnboarding } from "@/lib/onboarding";

type RouteContext = { params: { token: string } };

export async function POST(_req: NextRequest, { params }: RouteContext) {
  try {
    await dbConnect();
    const session = await Onboarding.findOne({ token: params.token });

    if (!session) {
      return NextResponse.json(
        { message: "Onboarding session not found" },
        { status: 404 }
      );
    }

    const email = (session.contact?.email || session.email || "").trim();
    if (!email) {
      return NextResponse.json(
        { message: "Add your business email before submitting" },
        { status: 400 }
      );
    }

    if (!(session.contact?.phone || "").trim()) {
      return NextResponse.json(
        { message: "Add your business phone number before submitting" },
        { status: 400 }
      );
    }

    const owners = (session.contact?.ownerNames || [])
      .map((n) => n.trim())
      .filter(Boolean);
    if (!owners.length && !(session.contact?.name || "").trim()) {
      return NextResponse.json(
        { message: "Add at least one owner name before submitting" },
        { status: 400 }
      );
    }

    if (!(session.business?.description || "").trim()) {
      return NextResponse.json(
        { message: "Tell us what the business does before submitting" },
        { status: 400 }
      );
    }

    if (
      !(session.business?.city || "").trim() ||
      !(session.business?.state || "").trim()
    ) {
      return NextResponse.json(
        { message: "Add the city and state you operate in before submitting" },
        { status: 400 }
      );
    }

    session.status = "completed";
    session.email = email.toLowerCase();
    session.currentStep = 2;
    await session.save();

    return NextResponse.json({
      session: serializeOnboarding(session),
      message: "Onboarding submitted",
    });
  } catch (error) {
    console.error("Failed to submit onboarding", error);
    return NextResponse.json(
      { message: "Unable to submit onboarding" },
      { status: 500 }
    );
  }
}
