import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/db";
import Blog from "@/models/Blog";
import { BiLogoSlackOld } from "react-icons/bi";

export async function POST(req: NextRequest, res: NextResponse) {
  await dbConnect();

  try {
    const { title, content } = await req.json();
    const blog = await Blog.create({ title, content });
    return NextResponse.json(
      { success: true, data: blog, message: "Blog created successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.status || 500 }
    );
  }
}

export async function GET(req: NextRequest, res: NextResponse) {
  await dbConnect();

  try {
    const blogs = await Blog.find();
    return NextResponse.json({ success: true, data: blogs }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.status || 500 }
    );
  }
}
