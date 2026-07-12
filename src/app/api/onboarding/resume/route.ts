import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Onboarding from "@/models/Onboarding";
import {
  createOnboardingToken,
  normalizeEmail,
  onboardingPublicUrl,
  serializeOnboarding,
} from "@/lib/onboarding";

export async function GET(req: NextRequest) {
  try {
    const emailParam = req.nextUrl.searchParams.get("email");
    if (!emailParam) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    const email = normalizeEmail(emailParam);
    await dbConnect();

    let session = await Onboarding.findOne({
      $or: [{ email }, { "contact.email": email }],
      status: { $in: ["not_started", "in_progress"] },
    }).sort({ updatedAt: -1 });

    if (!session) {
      session = await Onboarding.findOne({
        $or: [{ email }, { "contact.email": email }],
      }).sort({ updatedAt: -1 });
    }

    const origin = req.headers.get("origin") || undefined;

    if (!session) {
      const token = createOnboardingToken();
      session = await Onboarding.create({
        token,
        email,
        contact: { email },
        status: "not_started",
        currentStep: 0,
      });

      return NextResponse.json({
        created: true,
        token: session.token,
        url: onboardingPublicUrl(session.token, origin),
        session: serializeOnboarding(session),
      });
    }

    if (!session.email) {
      session.email = email;
      await session.save();
    }

    return NextResponse.json({
      created: false,
      token: session.token,
      url: onboardingPublicUrl(session.token, origin),
      session: serializeOnboarding(session),
    });
  } catch (error) {
    console.error("Failed to resume onboarding", error);
    return NextResponse.json(
      { message: "Unable to resume onboarding" },
      { status: 500 }
    );
  }
}
