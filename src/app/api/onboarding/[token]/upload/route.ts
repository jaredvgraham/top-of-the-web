import { NextResponse } from "next/server";

/**
 * Legacy server-side upload path (hits Vercel’s 4.5MB body limit).
 * Prefer client uploads via /api/onboarding/[token]/blob.
 */
export async function POST() {
  return NextResponse.json(
    {
      message:
        "Please refresh the page and try again — image uploads now go directly to storage.",
    },
    { status: 410 }
  );
}
