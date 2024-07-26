import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
//
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
console.log(process.env.STRIPE_WEBHOOK_SECRET!);
//

export async function POST(req: NextRequest) {
  console.log("Received a webhook event");

  const payload = await req.text();
  const response = JSON.parse(payload);

  const sig = req.headers.get("stripe-signature") as string;
  console.log("Signature received:", sig);

  if (!sig || !webhookSecret) {
    console.log("no sig or webhook secret");

    return NextResponse.json({ status: 400, message: "Invalid signature" });
  }

  const dateTime = new Date(response.created * 1000).toLocaleDateString();
  const timeString = new Date(response.created * 1000).toLocaleDateString();
  //cm
  try {
    let event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
    console.log("email", response.data.object.billilng_details.email);

    return NextResponse.json({ status: "success", event: event.type });
  } catch (error: any) {
    console.log("Error", error.message);
    return NextResponse.json({ status: 400, error: error.message });
  }
}
