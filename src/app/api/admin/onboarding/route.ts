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
    await dbConnect();
    const status = req.nextUrl.searchParams.get("status");
    const query =
      status === "in_progress" || status === "completed"
        ? { status }
        : {};

    const sessions = await Onboarding.find(query)
      .sort({ updatedAt: -1 })
      .limit(200);

    return NextResponse.json({
      sessions: sessions.map((session) => ({
        ...serializeOnboarding(session),
        url: onboardingPublicUrl(
          session.token,
          req.headers.get("origin") || undefined
        ),
      })),
    });
  } catch (error) {
    console.error("Failed to list onboarding sessions", error);
    return NextResponse.json(
      { message: "Unable to load onboarding sessions" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email =
      typeof body.email === "string" ? normalizeEmail(body.email) : "";

    if (!email) {
      return NextResponse.json(
        { message: "Client email is required" },
        { status: 400 }
      );
    }

    await dbConnect();
    const token = createOnboardingToken();
    const session = await Onboarding.create({
      token,
      email,
      contact: {
        email,
      },
      status: "in_progress",
      currentStep: 0,
    });

    const origin = req.headers.get("origin") || undefined;

    return NextResponse.json({
      token: session.token,
      url: onboardingPublicUrl(session.token, origin),
      session: serializeOnboarding(session),
    });
  } catch (error) {
    console.error("Failed to create admin onboarding link", error);
    return NextResponse.json(
      { message: "Unable to create onboarding link" },
      { status: 500 }
    );
  }
}
