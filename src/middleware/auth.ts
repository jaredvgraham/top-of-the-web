import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/utils/jwt";

const authMiddleware = (handler: Function) => {
  return async (req: NextRequest, res: NextResponse) => {
    console.log("authMiddleware hit");

    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return new NextResponse(
        JSON.stringify({ message: "No token provided" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.split(" ")[1];

    try {
      const user = verifyAccessToken(token);
      (req as any).user = user;
      return handler(req, res);
    } catch (error) {
      console.log("error", error);
      return new NextResponse(JSON.stringify({ message: "Invalid token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
  };
};

export default authMiddleware;
