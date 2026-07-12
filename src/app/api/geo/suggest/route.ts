import { NextRequest, NextResponse } from "next/server";
import { searchPlaces } from "@/lib/placeSearch";
import type { PlaceSuggestion } from "@/lib/usLocations";

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") || "").trim();
  const state = (req.nextUrl.searchParams.get("state") || "").trim();

  if (q.length < 2) {
    return NextResponse.json({ suggestions: [] as PlaceSuggestion[] });
  }

  try {
    const suggestions = searchPlaces(q, state, 12);
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Geo suggest failed", error);
    return NextResponse.json({ suggestions: [] as PlaceSuggestion[] });
  }
}
