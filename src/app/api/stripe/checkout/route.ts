import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import Customer from "@/models/Customer";
import Order from "@/models/Order";
import dbConnect from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

const PACK_NAME = "Managed Website Plan";
const PLAN_NAME = "Managed Website Plan";

async function getCustomerIdByEmail(email: string) {
  await dbConnect();
  const customer = await Customer.findOne({ email });
  if (!customer) {
    return null;
  }
  return customer.customerId;
}

async function saveCustomerId(customerId: string, email: string) {
  await dbConnect();
  const customer = new Customer({
    email,
    customerId,
  });
  await customer.save();
}

async function getOrCreateCustomerId(email: string) {
  let customerId = await getCustomerIdByEmail(email);
  if (!customerId) {
    const customer = await stripe.customers.create({ email });
    customerId = customer.id;
    await saveCustomerId(customerId, email);
  }
  return customerId;
}

async function createOrder(email: string) {
  await dbConnect();
  const order = await Order.findOne({ email });
  if (order) {
    order.pack = PACK_NAME;
    order.plan = PLAN_NAME;
    order.progress = 0;
    await order.save();
    return;
  }
  const newOrder = new Order({
    email,
    pack: PACK_NAME,
    plan: PLAN_NAME,
    progress: 0,
  });
  await newOrder.save();
}

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email || typeof email !== "string") {
    return NextResponse.json({ message: "Email is required" }, { status: 400 });
  }

  const freePriceId = process.env.FREE_PRICE_ID;

  if (!freePriceId) {
    return NextResponse.json(
      { message: "Checkout is not configured" },
      { status: 500 }
    );
  }

  try {
    const customerId = await getOrCreateCustomerId(email);
    await createOrder(email);

    const origin = req.headers.get("origin") || "https://www.bsites.io";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer: customerId,
      line_items: [{ price: freePriceId, quantity: 1 }],
      mode: "subscription",
      custom_fields: [
        {
          key: "phone_number",
          label: { type: "custom", custom: "Phone Number" },
          type: "text",
        },
      ],
      success_url: `${origin}/thank-you`,
      cancel_url: `${origin}/pricing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Checkout failed";
    console.error("Checkout error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
