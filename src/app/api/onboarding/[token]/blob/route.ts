import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Onboarding from "@/models/Onboarding";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_UPLOAD_BYTES,
} from "@/lib/onboardingConstants";

type RouteContext = { params: { token: string } };

/**
 * Token exchange for browser → Vercel Blob uploads.
 * Files never pass through this serverless function (avoids 4.5MB limit).
 */
export async function POST(request: NextRequest, { params }: RouteContext) {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        await dbConnect();
        const session = await Onboarding.findOne({ token: params.token }).select(
          "_id token"
        );
        if (!session) {
          throw new Error("Onboarding session not found");
        }

        const prefix = `onboarding/${params.token}/`;
        if (!pathname.startsWith(prefix)) {
          throw new Error("Invalid upload path");
        }

        return {
          allowedContentTypes: [...ALLOWED_IMAGE_TYPES],
          maximumSizeInBytes: MAX_UPLOAD_BYTES,
          addRandomSuffix: true,
        };
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("Failed to authorize onboarding blob upload", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to authorize image upload",
      },
      { status: 400 }
    );
  }
}
