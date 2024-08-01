import { NextResponse, NextRequest } from "next/server";
import Order from "@/models/Order";
import { findOrderByEmail } from "@/models/Order";
import dbConnect from "@/lib/db";
import authMiddleware from "@/middleware/auth";

async function handler(req: NextRequest) {
  await dbConnect();
  try {
    const user = (req as any).user;
    const order = await findOrderByEmail(user.email);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json(order, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: "error" }, { status: 500 });
  }
}

export const GET = authMiddleware(handler);
