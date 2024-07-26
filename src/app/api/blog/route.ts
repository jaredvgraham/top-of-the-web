import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/db";
import Blog from "@/models/Blog";
import authMiddleware from "@/middleware/auth";

const handlerPost = async (req: NextRequest, res: NextResponse) => {
  await dbConnect();

  try {
    const { title, content } = await req.json();
    const blog = await Blog.create({ title, content });
    return new NextResponse(
      JSON.stringify({
        success: true,
        data: blog,
        message: "Blog created successfully",
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new NextResponse(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: error.status || 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

export const POST = authMiddleware(handlerPost);

export async function GET(req: NextRequest, res: NextResponse) {
  await dbConnect();

  try {
    const blogs = await Blog.find();
    return new NextResponse(JSON.stringify({ success: true, data: blogs }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new NextResponse(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: error.status || 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
