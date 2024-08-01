// website api route

import { NextRequest, NextResponse } from "next/server";
import Website from "@/models/WebsiteModel";
import dbConnect from "@/lib/db";
import { IWebsite } from "@/models/WebsiteModel";
import authMiddleware from "@/middleware/auth";
import { getDomainStatus } from "@/services/DomainService";

async function handlerPost(req: NextRequest) {
  try {
    await dbConnect();
    const { name, email, url, description } = (await req.json()) as IWebsite;
    const website = new Website({ name, email, url, description });
    await website.save();
    return NextResponse.json(website, { status: 201 });
  } catch (error: any) {
    console.log(error);

    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

async function handlerGet(req: NextRequest) {
  try {
    await dbConnect();
    const user = (req as any).user;
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const website = await Website.findOne({ email: user.email });
    if (!website) {
      return NextResponse.json(
        { message: "Website not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(website, { status: 200 });
  } catch (error: any) {
    console.log(error);

    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

async function handlerPut(req: NextRequest) {
  try {
    await dbConnect();
    const user = (req as any).user;
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const website = await Website.findOne({ email: user.email });
    if (!website) {
      return NextResponse.json(
        { message: "Website not found" },
        { status: 404 }
      );
    }
    const { name } = (await req.json()) as IWebsite;

    const status = getDomainStatus(name as string);
    if ((await status) === "AVAILABLE") {
      website.name = name;

      await website.save();
      return NextResponse.json(website, { status: 200 });
    } else {
      return NextResponse.json(
        { message: "Domain not available" },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.log(error);

    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export const POST = authMiddleware(handlerPost);
export const GET = authMiddleware(handlerGet);
export const PUT = authMiddleware(handlerPut);
