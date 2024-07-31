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
    case "Starter Website Package":
      price = 20000;
      break;
    case "Standard Website Package":
      price = 35000;
      break;
    case "Advanced Website Package":
      price = 75000;
      break;
    case "Enterprise Website Package":
      price = 250000;
      break;
    case "E-Commerce Website Package":
      price = 125000;
      break;
    case "test-installment":
      price = 100;
      break;
    default:
      price = 0;
      break;
  }
  return price;
}

async function createRecurringPrice(plan: string) {
  let price: number;
  switch (plan) {
    case "hosting":
      price = 3000;
      break;
    case "hosting seo":
      price = 6000;
      break;
    case "basic ad":
      price = 50000;
      break;
    case "standard ad":
      price = 120000;
      break;
    case "advanced ad":
      price = 300000;
      break;
    case "rapid growth ad":
      price = 500000;
      break;
    case "test":
      price = 100;
      break;
    default:
      price = 0;
  }
  return price;
}

export async function POST(req: NextRequest) {
  const { email, pack, plan } = await req.json();
  try {
    // create price
    const websitePrice = await createPrice(pack);
    if (websitePrice === 0) {
      return NextResponse.json({ message: "Invalid pack" }, { status: 400 });
    }

    const recurringPrice = await createRecurringPrice(plan);
    if (recurringPrice === 0) {
      return NextResponse.json({ message: "Invalid plan" }, { status: 400 });
    }

    console.log("website price created: ", websitePrice);
    console.log("recurring price created: ", recurringPrice);

    const stripePrice = await stripe.prices.create({
      unit_amount: websitePrice,
      currency: "usd",
      recurring: {
        interval: "month",
      },
      metadata: {
        type: "installment",
      },
      product_data: {
        name: pack,
      },
    });
    const recurringStripePrice = await stripe.prices.create({
      unit_amount: recurringPrice,
      currency: "usd",
      recurring: {
        interval: "month",
      },
      metadata: {
        type: "indefinite",
      },
      product_data: {
        name: plan,
      },
    });

    // get or create customer Id
    const customerId = await getOrCreateCustomerId(email);

    const schedule = await stripe.subscriptionSchedules.create({
      customer: customerId,
      start_date: "now",
      end_behavior: "release",
      phases: [
        {
          items: [
            {
              price: stripePrice.id,
              quantity: 1,
            },
          ],
          iterations: 4,
        },
      ],
    });

    // Create a checkout session for the purchase
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer: customerId,
      line_items: [
        // {
        //   price: stripePrice.id,
        //   quantity: 1,
        // },
        {
          price: recurringStripePrice.id,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `http://localhost:3000/schedule`,
      cancel_url: `http://localhost:3000/pricing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
