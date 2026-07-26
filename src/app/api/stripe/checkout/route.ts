import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import Customer from "@/models/Customer";
import Order from "@/models/Order";
import dbConnect from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

const PACK_NAME = "Managed Website Plan";
const PLAN_NAME = "Managed Website Plan";

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

async function createOrder(email: string, phone: string) {
  await dbConnect();
  const order = await Order.findOne({ email });
  if (order) {
    order.pack = PACK_NAME;
    order.plan = PLAN_NAME;
    order.progress = 0;
    if (phone) order.phone = phone;
    await order.save();
    return;
  }
  const newOrder = new Order({
    email,
    phone: phone || "",
    pack: PACK_NAME,
    plan: PLAN_NAME,
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

  if (!email) {
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
    const customerId = await getOrCreateCustomerId(email, phone);
    await createOrder(email, phone);

    const origin = req.headers.get("origin") || "https://www.bsites.io";
    const cancelUrl = previewSlug
      ? `${origin}/preview/${previewSlug}/claim`
      : `${origin}/pricing`;

    const metadata: Record<string, string> = {};
    if (previewSlug) metadata.previewSlug = previewSlug;
    if (phone) metadata.phone = phone;

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ["card"],
      customer: customerId,
      line_items: [{ price: freePriceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${origin}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
    };

    if (Object.keys(metadata).length) {
      sessionParams.metadata = metadata;
    }

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
