// src/pages/api/test-connection.ts

import dbConnect from "@/lib/db";
import Test from "@/models/Test";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
  await dbConnect();

  try {
    // Create a test document
    console.log("test");
    console.log("test2");
    const testDoc = await Test.create({ name: "Connection Test" });
    return NextResponse.json({ success: true, data: testDoc });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
