import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: NextRequest) {
  console.log("Received a webhook event");

  const payload = await req.text();
  console.log("Payload received:", payload);

  const sig = req.headers.get("Stripe-Signature") as string;
  console.log("Signature received:", sig);

  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
    console.log("Event constructed:", event);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("Checkout session completed:", session);

      // Fetch line items for the session
      const lineItems = await stripe.checkout.sessions.listLineItems(
        session.id,
        {
          limit: 100,
        }
      );
      console.log("Line items fetched:", lineItems);

      for (const item of lineItems.data) {
        if (!item.price) return;
        const product = await stripe.products.retrieve(
          item.price.product as string
        );
        const productName = product.name;
        const quantity = item.quantity;
        const amount = item.amount_total;

        console.log(`Product Name: ${productName}`);
        console.log(`Quantity: ${quantity}`);
        console.log(`Amount: ${amount}`);
      }

      const email = session.customer_details?.email;
      console.log("Customer email: ", email);
    }

    return NextResponse.json({ status: "success", event: event.type });
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return NextResponse.json({ status: "error", message: err.message });
  }
}
