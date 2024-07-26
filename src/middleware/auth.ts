import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken, verifyRefreshToken } from "@/utils/jwt";

const authMiddleware = async (handler: Function) => {
  console.log("authMiddleware hit");

  return async (req: NextRequest, res: NextResponse) => {
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { message: "no token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    try {
      const user = verifyAccessToken(token);
      (req as any).user = user;
      return handler(req, res);
    } catch (error) {
      console.log("error", error);
      return NextResponse.json({ message: "invalid token" }, { status: 401 });
    }
  };
};
export default authMiddleware;
