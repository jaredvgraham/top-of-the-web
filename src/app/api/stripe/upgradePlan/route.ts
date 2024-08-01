import { NextRequest, NextResponse } from "next/server";
import Customer from "@/models/Customer";
import Order from "@/models/Order";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

async function POST(req: NextRequest) {
  try {
    const { plan } = await req.json();
    const price = await getPlanPrice(plan);
    const stripePrice = await stripe.prices.create({
      unit_amount: price,
      currency: "usd",
      recurring: { interval: "month" },
      product_data: {
        name: plan,
      },
    });
    const user = (req as any).user;
    const customer = await Customer.findOne({ email: user.email });
    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }
    const customerId = customer.customerId;
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
    });
    if (subscriptions.data.length === 0) {
      return NextResponse.json(
        { error: "Customer has no subscription" },
        { status: 400 }
      );
    }
    const subscription = subscriptions.data[0];
    const subscriptionId = subscription.items.data[0].id;

    // Update the subscription
    const updatedSubscription = await stripe.subscriptions.update(
      subscriptionId,
      {
        items: [
          {
            id: subscriptionId,
            price: stripePrice.id,
          },
        ],
      }
    );

    console.log("Subscription updated: ", updatedSubscription);

    // Update the order
    const updatedOrder = await updateOrderDoc(user.email, plan);
    if (!updatedOrder) {
      return NextResponse.json(
        { message: "failed to update order" },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

async function getPlanPrice(plan: string) {
  let price: number;
  switch (plan) {
    case "hosting":
      price = 3000;
      break;
    case "hosting seo":
      price = 100;
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
    default:
      price = 0;
  }
  return price;
}

async function updateOrderDoc(email: string, plan: string) {
  try {
    const order = await Order.findOne({ email });
    if (!order) {
      return false;
    }
    order.plan = plan;
    await order.save();
    return true;
  } catch (error: any) {
    return false;
  }
}
