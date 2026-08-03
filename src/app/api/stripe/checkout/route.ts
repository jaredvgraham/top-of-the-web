import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import Customer from "@/models/Customer";
import Order from "@/models/Order";
import dbConnect from "@/lib/db";
import {
  MANAGED_PACK,
  MANAGED_PLAN,
  ONE_TIME_PACK,
  ONE_TIME_PLAN,
  parseCheckoutOffer,
  type CheckoutOffer,
} from "@/lib/checkoutOffers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

async function getCustomerByEmail(email: string) {
  await dbConnect();
  return Customer.findOne({ email });
}

async function getOrCreateCustomerId(email: string, phone: string) {
  const existing = await getCustomerByEmail(email);
  if (existing?.customerId) {
    if (phone && existing.phone !== phone) {
      existing.phone = phone;
      await existing.save();
      try {
        await stripe.customers.update(existing.customerId, { phone });
      } catch {
        // non-fatal
      }
    }
    return existing.customerId;
  }

  const customer = await stripe.customers.create({
    email,
    ...(phone ? { phone } : {}),
  });
  await dbConnect();
  await new Customer({
    email,
    customerId: customer.id,
    phone: phone || "",
  }).save();
  return customer.id;
}

async function createOrder(
  email: string,
  phone: string,
  offer: CheckoutOffer
) {
  await dbConnect();
  const pack = offer === "one_time" ? ONE_TIME_PACK : MANAGED_PACK;
  const plan = offer === "one_time" ? ONE_TIME_PLAN : MANAGED_PLAN;
  const order = await Order.findOne({ email });
  if (order) {
    order.pack = pack;
    order.plan = plan;
    order.progress = 0;
    if (phone) order.phone = phone;
    await order.save();
    return;
  }
  const newOrder = new Order({
    email,
    phone: phone || "",
    pack,
    plan,
    progress: 0,
  });
  await newOrder.save();
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const email =
    typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
  const previewSlug =
    typeof body?.previewSlug === "string"
      ? body.previewSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "")
      : "";
  const offer = parseCheckoutOffer(body?.offer);

  if (!email) {
    return NextResponse.json({ message: "Email is required" }, { status: 400 });
  }

  const priceId =
    offer === "one_time"
      ? process.env.ONE_TIME_PRICE_ID?.trim()
      : process.env.FREE_PRICE_ID?.trim();

  if (!priceId) {
    return NextResponse.json(
      {
        message:
          offer === "one_time"
            ? "One-time checkout is not configured (ONE_TIME_PRICE_ID)"
            : "Checkout is not configured (FREE_PRICE_ID)",
      },
      { status: 500 }
    );
  }

  try {
    const customerId = await getOrCreateCustomerId(email, phone);
    await createOrder(email, phone, offer);

    const origin = req.headers.get("origin") || "https://www.bsites.io";
    const cancelUrl = previewSlug
      ? `${origin}/preview/${previewSlug}/claim`
      : `${origin}/pricing`;

    const metadata: Record<string, string> = {
      offer,
      pack: offer === "one_time" ? ONE_TIME_PACK : MANAGED_PACK,
    };
    if (previewSlug) metadata.previewSlug = previewSlug;
    if (phone) metadata.phone = phone;

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ["card"],
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: offer === "one_time" ? "payment" : "subscription",
      success_url: `${origin}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      metadata,
    };

    // Pricing-page checkouts still collect phone in Stripe when we don't have it yet
    if (!phone) {
      sessionParams.custom_fields = [
        {
          key: "phone_number",
          label: { type: "custom", custom: "Phone Number" },
          type: "text",
        },
      ];
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Checkout failed";
    console.error("Checkout error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
