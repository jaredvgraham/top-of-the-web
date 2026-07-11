import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import Customer from "@/models/Customer";
import { findWebsiteById } from "@/models/WebsiteModel";
import dbConnect from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const body = await req.json().catch(() => ({}));
    const websiteId =
      typeof body.websiteId === "string" ? body.websiteId.trim() : "";
    const emailInput =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    let email = emailInput;

    if (websiteId) {
      const website = await findWebsiteById(websiteId);
      if (!website?.email) {
        return NextResponse.json(
          { error: "No website found for that ID" },
          { status: 404 }
        );
      }
      email = website.email.toLowerCase();
    }

    if (!email) {
      return NextResponse.json(
        { error: "Website ID is required" },
        { status: 400 }
      );
    }

    const customer = await Customer.findOne({ email });
    if (!customer?.customerId) {
      return NextResponse.json(
        { error: "No billing account found for that website" },
        { status: 404 }
      );
    }

    const origin =
      req.headers.get("origin") ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://www.bsites.io";

    const session = await stripe.billingPortal.sessions.create({
      customer: customer.customerId,
      return_url: `${origin}/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Billing portal error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create billing portal session" },
      { status: 500 }
    );
  }
}
