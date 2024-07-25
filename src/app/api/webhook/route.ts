import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: NextRequest, res: NextResponse) {
  const payload = await req.text();
  const response = JSON.parse(payload);

  const sig = req.headers.get("Stripe-Signature") as string;

  const date = new Date();
  const timestamp = date.getTime();

  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );

    console.log("Event.type: ", event.type);
    return NextResponse.json({ status: "success", event: event.type });
  } catch (err: any) {
    console.log(`Webhook Error: ${err.message}`);
    return NextResponse.json({ status: "error", message: err.message });
  }
}
