import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import Customer from "@/models/Customer";
import Order from "@/models/Order";
import dbConnect from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

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
//
async function getOrCreateCustomerId(email: string) {
  let customerId = await getCustomerIdByEmail(email);
  if (!customerId) {
    const customer = await stripe.customers.create({
      email,
    });
    customerId = customer.id;
    await saveCustomerId(customerId, email);
  }

  return customerId;
}
//

// Map pack names to Stripe Price IDs
function getPackPriceId(pack: string): string | null {
  const packPriceIds: Record<string, string> = {
    "Starter Website Package": process.env.STARTER_PRICE_ID as string,
    "Standard Website Package": process.env.STANDARD_PRICE_ID as string,
    "Advanced Website Package": process.env.ADVANCED_PRICE_ID as string,
    "Enterprise Website Package": process.env.ENTERPRISE_PRICE_ID as string,
    "E-commerce Website Package": process.env.ECOMMERCE_PRICE_ID as string,
    test: process.env.TEST_PRICE_ID as string, // For testing purposes
  };
  return packPriceIds[pack] || null;
}

// Map plan names to Stripe Price IDs
function getPlanPriceId(plan: string): string | null {
  const planPriceIds: Record<string, string> = {
    "Hosting / Domain": process.env.HOSTING_DOMAIN_PRICE_ID as string,
    "Hosting / Domain / SEO Updates": process.env
      .HOSTING_DOMAIN_SEO_PRICE_ID as string,
    "basic ad": process.env.BASIC_AD_PRICE_ID as string,
    "standard ad": process.env.STANDARD_AD_PRICE_ID as string,
    "advanced ad": process.env.ADVANCED_AD_PRICE_ID as string,
    "rapid growth ad": process.env.RAPID_GROWTH_AD_PRICE_ID as string,
    test: process.env.TEST_PLAN_PRICE_ID as string, // For testing purposes
  };
  return planPriceIds[plan] || null;
}

async function createOrder(email: string, pack: string, plan: string) {
  await dbConnect();
  const order = await Order.findOne({ email });
  if (order) {
    order.pack = pack;
    order.plan = plan;
    order.progress = 0;
    await order.save();
    return;
  }
  const newOrder = new Order({
    email,
    pack,
    plan,
    progress: 0,
  });
  await newOrder.save();
}

export async function POST(req: NextRequest) {
  const { email, pack, plan } = await req.json();
  console.log("email: ", email);
  console.log("pack: ", pack);
  console.log("plan: ", plan);

  try {
    // Get Stripe Price IDs from your configuration
    const oneTimePriceId = getPackPriceId(pack);
    if (!oneTimePriceId) {
      return NextResponse.json({ message: "Invalid pack" }, { status: 400 });
    }

    const recurringPriceId = getPlanPriceId(plan);
    if (!recurringPriceId) {
      return NextResponse.json({ message: "Invalid plan" }, { status: 400 });
    }

    console.log("one time price ID: ", oneTimePriceId);
    console.log("recurring price ID: ", recurringPriceId);

    // get or create customer Id
    const customerId = await getOrCreateCustomerId(email);
    await createOrder(email, pack, plan);

    // Create a checkout session for the purchase
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer: customerId,
      line_items: [
        {
          price: oneTimePriceId,
          quantity: 1,
        },
        {
          price: recurringPriceId,
          quantity: 1,
        },
      ],
      mode: "subscription",

      custom_fields: [
        {
          key: "phone_number",
          label: {
            type: "custom",
            custom: "Phone Number",
          },
          type: "text",
        },
      ],

      success_url: `https://www.bsites.io/schedule?email=${encodeURIComponent(
        email
      )}`,
      cancel_url: `https://www.bsites.io/pricing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.log(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
