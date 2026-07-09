import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import Review from "@/models/Review";
import { findWebsiteById } from "@/models/WebsiteModel";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function jsonResponse(body: object, status: number) {
  return new NextResponse(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { websiteId: string } }
) {
  await dbConnect();

  try {
    const { websiteId } = params;

    if (!mongoose.Types.ObjectId.isValid(websiteId)) {
      return jsonResponse(
        { success: false, error: "Invalid website id" },
        400
      );
    }

    const website = await findWebsiteById(websiteId);
    if (!website) {
      return jsonResponse({ success: false, error: "Website not found" }, 404);
    }

    const reviews = await Review.find({ websiteId }).sort({ createdAt: -1 });

    return jsonResponse({ success: true, data: reviews }, 200);
  } catch (error: any) {
    return jsonResponse(
      { success: false, error: error.message },
      error.status || 500
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { websiteId: string } }
) {
  await dbConnect();

  try {
    const { websiteId } = params;

    if (!mongoose.Types.ObjectId.isValid(websiteId)) {
      return jsonResponse(
        { success: false, error: "Invalid website id" },
        400
      );
    }

    const website = await findWebsiteById(websiteId);
    if (!website) {
      return jsonResponse({ success: false, error: "Website not found" }, 404);
    }

    const { author, rating, content } = await req.json();

    if (!author || typeof author !== "string" || !author.trim()) {
      return jsonResponse(
        { success: false, error: "author is required" },
        400
      );
    }

    if (!content || typeof content !== "string" || !content.trim()) {
      return jsonResponse(
        { success: false, error: "content is required" },
        400
      );
    }

    const numericRating = Number(rating);
    if (
      !Number.isFinite(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return jsonResponse(
        { success: false, error: "rating must be a number between 1 and 5" },
        400
      );
    }

    const review = await Review.create({
      websiteId,
      author: author.trim(),
      rating: numericRating,
      content: content.trim(),
    });

    return jsonResponse(
      {
        success: true,
        data: review,
        message: "Review created successfully",
      },
      201
    );
  } catch (error: any) {
    return jsonResponse(
      { success: false, error: error.message },
      error.status || 500
    );
  }
}
