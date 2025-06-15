// src/app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from "next/server";
import cookie from "cookie";

export async function POST(req: NextRequest) {
  // Clear the refresh token cookie
  const response = NextResponse.json({ message: "Logged out" });
  response.headers.set(
    "Set-Cookie",
    cookie.serialize("refreshToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: new Date(0),
      path: "/",
    })
  );
  return response;
}
