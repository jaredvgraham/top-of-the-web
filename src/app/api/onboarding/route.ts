import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Onboarding from "@/models/Onboarding";
import {
  createOnboardingToken,
  normalizeEmail,
  onboardingPublicUrl,
  serializeOnboarding,
} from "@/lib/onboarding";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email =
      typeof body.email === "string" ? normalizeEmail(body.email) : "";

    await dbConnect();

    const origin = req.headers.get("origin") || undefined;

    if (email) {
      const existing = await Onboarding.findOne({
        $or: [{ email }, { "contact.email": email }],
        status: { $in: ["not_started", "in_progress"] },
      }).sort({ updatedAt: -1 });

      if (existing) {
        return NextResponse.json({
          token: existing.token,
          url: onboardingPublicUrl(existing.token, origin),
          session: serializeOnboarding(existing),
          resumed: true,
        });
      }
    }

    const token = createOnboardingToken();
    const session = await Onboarding.create({
      token,
      email,
      contact: { email },
      status: "not_started",
      currentStep: 0,
    });

    return NextResponse.json({
      token: session.token,
      url: onboardingPublicUrl(session.token, origin),
      session: serializeOnboarding(session),
      resumed: false,
    });
  } catch (error) {
    console.error("Failed to create onboarding session", error);
    return NextResponse.json(
      { message: "Unable to start onboarding" },
      { status: 500 }
    );
  }
}
