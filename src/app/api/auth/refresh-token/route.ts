import { NextRequest, NextResponse } from "next/server";
import {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
  UserTokenPayload,
} from "@/utils/jwt";
import cookie from "cookie";
import dbConnect from "@/lib/db";
import { findSessionByToken, updateSessionToken } from "@/models/SessionModel";

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const cookies = cookie.parse(req.headers.get("cookie") || "");
    if (!cookies.refreshToken) {
      return NextResponse.json(
        { success: false, message: "No refresh token" },
        { status: 400 }
      );
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(cookies.refreshToken);
    } catch (error) {
      console.log("Invalid refresh token:", error);
      return NextResponse.json(
        { success: false, message: "Invalid refresh token" },
        { status: 400 }
      );
    }

    const session = await findSessionByToken(cookies.refreshToken);

    if (!session) {
      console.log("Session not found for token:", cookies.refreshToken);
      return NextResponse.json(
        { success: false, message: "Session not found" },
        { status: 404 }
      );
    }

    const userPayload: UserTokenPayload = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
    const accessToken = createAccessToken(userPayload);
    const newRefreshToken = createRefreshToken(userPayload);

    const updatedSession = await updateSessionToken(
      cookies.refreshToken,
      newRefreshToken
    );

    if (!updatedSession) {
      console.log(
        "Failed to update session token. Session not found for:",
        cookies.refreshToken
      );
      return NextResponse.json(
        { success: false, message: "Failed to update session token" },
        { status: 404 }
      );
    }

    const response = NextResponse.json(
      { accessToken, role: decoded.role },
      { status: 200 }
    );

    response.headers.set(
      "Set-Cookie",
      cookie.serialize("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      })
    );

    console.log("Session updated with new refresh token:", newRefreshToken);

    return response;
  } catch (error: any) {
    console.log("Error processing token refresh:", error.message);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
