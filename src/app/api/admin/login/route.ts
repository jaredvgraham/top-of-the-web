import { NextRequest, NextResponse } from "next/server";
import {
  adminCookieOptions,
  getExpectedAdminToken,
  verifyAdminPassword,
} from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const password = typeof body.password === "string" ? body.password : "";

    if (!process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "ADMIN_PASSWORD is not configured" },
        { status: 500 }
      );
    }

    if (!verifyAdminPassword(password)) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const token = await getExpectedAdminToken();
    if (!token) {
      return NextResponse.json(
        { error: "ADMIN_PASSWORD is not configured" },
        { status: 500 }
      );
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(adminCookieOptions(token));
    return response;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
