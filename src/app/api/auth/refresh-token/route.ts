import { NextRequest, NextResponse } from "next/server";
import {
  createAccessToken,
  verifyRefreshToken,
  UserTokenPayload,
} from "@/utils/jwt";
import cookie from "cookie";
import dbConnect from "@/lib/db";
import { findSessionByToken } from "@/models/SessionModel";

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const cookies = cookie.parse(req.headers.get("cookie") || "");
    console.log("cookies", cookies);
    if (!cookies.refreshToken) {
      return NextResponse.json(
        { success: false, message: "No refresh token" },
        { status: 401 }
      );
    }

    const decoded = verifyRefreshToken(cookies.refreshToken);
    console.log("decoded", decoded);
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

    return NextResponse.json(
      { accessToken, role: decoded.role },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
