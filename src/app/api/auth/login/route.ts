import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import dbConnect from "@/lib/db";
import User from "@/models/UserModel";
import Session, { addSession } from "@/models/SessionModel";
import {
  createAccessToken,
  createRefreshToken,
  UserTokenPayload,
} from "@/utils/jwt";

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const { email, password } = await req.json();
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const userPayload: UserTokenPayload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };
    const accessToken = createAccessToken(userPayload);
    const refreshToken = createRefreshToken(userPayload);

    const session = new Session({
      userId: user._id.toString(),
      refreshToken,
      createdAt: new Date(),
    });
    await addSession(session);

    const response = NextResponse.json({ accessToken });
    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      sameSite: "strict",
      path: "/",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.status || 500 }
    );
  }
}
