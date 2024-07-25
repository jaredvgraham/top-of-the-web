// src/pages/api/test-connection.ts
import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/db";
import Test from "@/models/Test";
import { NextResponse } from "next/server";

export async function POST(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  try {
    // Create a test document
    const testDoc = await Test.create({ name: "Connection Test" });
    return NextResponse.json({ success: true, data: testDoc });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
