import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import Customer from "@/models/Customer";
import dbConnect from "@/lib/db";
import authMiddleware from "@/middleware/auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

async function handler(req: NextRequest) {
  await dbConnect();
  try {
    const user = (req as any).user;

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const customer = await Customer.findOne({ email: user.email });
    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    const customerId = customer.customerId;

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: "https://bsites.io/",
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error(error);
    return NextResponse.error();
  }
}

export const POST = authMiddleware(handler);
