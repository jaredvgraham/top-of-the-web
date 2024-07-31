import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import Customer from "@/models/Customer";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

async function getCustomerIdByEmail(email: string) {
  const customer = await Customer.findOne({ email });
  if (!customer) {
    return null;
  }
  return customer.customerId;
}

async function saveCustomerId(customerId: string, email: string) {
  const customer = new Customer({
    email,
    customerId,
  });
  await customer.save();
}

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

async function createPrice(pack: string) {
  let price: number;
  switch (pack) {
    case "basic":
      price = 3000;
      break;
    case "standard":
      price = 15000;
      break;
    case "premium":
      price = 50000;
      break;
    case "enterprise":
      price = 100000;
      break;
    case "super":
      price = 250000;
      break;
    case "mega":
      price = 500000;
      break;
    default:
      price = 0;
      break;
  }
  return price;
}

export async function POST(req: NextRequest) {
  const { email, pack } = await req.json();
  try {
    // create price
    const price = await createPrice(pack);
    if (price === 0) {
      return NextResponse.json({ message: "Invalid pack" }, { status: 400 });
    }

    console.log("price created: ", price);

    const stripePrice = await stripe.prices.create({
      unit_amount: price,
      currency: "usd",
      recurring: {
        interval: "month",
      },
      product_data: {
        name: pack,
      },
    });

    // get or create customer Id
    const customerId = await getOrCreateCustomerId(email);

    // Create a checkout session for the purchase
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer: customerId,
      line_items: [
        {
          price: stripePrice.id,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_DOMAIN}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_DOMAIN}/cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
