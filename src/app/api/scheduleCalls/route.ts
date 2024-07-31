import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import ScheduledCall from "@/models/ScheduledCall";

export async function GET(req: NextRequest) {
  await dbConnect();

  const scheduledCalls = await ScheduledCall.find({});

  return NextResponse.json(scheduledCalls, { status: 200 });
}

export async function POST(req: NextRequest) {
  await dbConnect();

  const { start, end, title } = await req.json();

  const scheduledCall = new ScheduledCall({
    start: new Date(start),
    end: new Date(end),
    title,
  });

  await scheduledCall.save();

  return NextResponse.json(scheduledCall, { status: 201 });
}
