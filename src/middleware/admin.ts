import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/utils/jwt";

const adminMiddleware = (handler: Function) => {
  return async (req: NextRequest, res: NextResponse) => {
    console.log("adminMiddleware hit");

    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return new NextResponse(
        JSON.stringify({ message: "No token provided" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = verifyAccessToken(token);

      if (decoded.role !== "admin") {
        return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }

      return handler(req, res);
    } catch (error: any) {
      return new NextResponse(JSON.stringify({ message: "Invalid token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
  };
};

export default adminMiddleware;
