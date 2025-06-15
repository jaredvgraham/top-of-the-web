import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
import Customer from "@/models/Customer";
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  await dbConnect();
  const customer = await Customer.findOne({ email });
  if (!customer) {
    return NextResponse.json(
      { status: "error", message: "Customer not found." },
      { status: 404 }
    );
  }

  const subscriptions = await stripe.subscriptions.list({
    customer: customer.customerId,
  });

  const subscriptionData = subscriptions.data.map((subscription) => ({
    subscriptionId: subscription.id,
    items: subscription.items.data.map((item) => ({
      productId: item.price.product,
      metadata: item.price.metadata,
    })),
  }));

  // Check for duplicate installment charges
  let installmentCount = 0;
  subscriptionData.forEach((subscription) => {
    subscription.items.forEach((item) => {
      if (item.metadata.type === "installment") {
        installmentCount++;
      }
    });
  });

  const isDoubleCharged = installmentCount > 1;

  return NextResponse.json(
    {
      status: "success",
      data: subscriptionData,
      isDoubleCharged,
      message: isDoubleCharged
        ? "You are being charged twice for test-installment."
        : "You are not being charged twice for test-installment.",
    },
    { status: 200 }
  );
}
