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
        { status: 401 }
      );
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(cookies.refreshToken);
    } catch (error) {
      return NextResponse.json(
        { success: false, message: "Invalid refresh token" },
        { status: 401 }
      );
    }

    const session = await findSessionByToken(cookies.refreshToken);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Session not found" },
        { status: 401 }
      );
    }

    const userPayload: UserTokenPayload = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
    const accessToken = createAccessToken(userPayload);
    const newRefreshToken = createRefreshToken(userPayload);

    await updateSessionToken(session.id, newRefreshToken);

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

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
