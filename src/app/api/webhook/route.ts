import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
//
console.log(process.env.STRIPE_WEBHOOK_SECRET!);

export async function POST(req: NextRequest) {
  console.log("Received a webhook event");

  const payload = await req.text();
  const response = JSON.parse(payload);

  const sig = req.headers.get("Stripe-Signature") as string;
  console.log("Signature received:", sig);

  const dateTime = new Date(response.created * 1000).toLocaleDateString();
  const timeString = new Date(response.created * 1000).toLocaleDateString();
  //cm
  try {
    let event = stripe.webhooks.constructEvent(
      payload,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    console.log("email", response.data.object.billilng_details.email);

    return NextResponse.json({ status: "success", event: event.type });
  } catch (error: any) {
    console.log("Error", error.message);
    return NextResponse.json(error.message);
  }
}
