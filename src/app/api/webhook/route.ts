// import Stripe from "stripe";
// import { NextRequest, NextResponse } from "next/server";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
// //
// const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
// console.log(process.env.STRIPE_WEBHOOK_SECRET!);
// //

// export async function POST(req: NextRequest) {
//   console.log("Received a webhook event");

//   const payload = await req.text();
//   const response = JSON.parse(payload);

//   const sig = req.headers.get("stripe-signature") as string;
//   console.log("Signature received:", sig);

//   if (!sig || !webhookSecret) {
//     console.log("no sig or webhook secret");

//     return NextResponse.json({ status: 400, message: "Invalid signature" });
//   }

//   const dateTime = new Date(response.created * 1000).toLocaleDateString();
//   const timeString = new Date(response.created * 1000).toLocaleDateString();
//   //cm
//   try {
//     let event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
//     console.log("email", response.data.object.billilng_details.email);

//     return NextResponse.json({ status: 200, event: event.type });
//   } catch (error: any) {
//     console.log("Error", error.message);
//     return NextResponse.json({ status: 400, error: error.message });
//   }
// }

import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const sig = req.headers.get("Stripe-Signature") as string;

  try {
    const event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      // Fetch line items for the session
      const lineItems = await stripe.checkout.sessions.listLineItems(
        session.id,
        {
          limit: 100,
        }
      );

      for (const item of lineItems.data) {
        if (!item.price) return;
        const product = await stripe.products.retrieve(
          item.price.product as string
        );
        const productName = product.name;
        const quantity = item.quantity;
        const amount = item.amount_total;

        console.log("Product Name", productName);
        console.log("Quantity", quantity);
        console.log("Amount", amount);
      }

      const email = session.customer_details?.email;
      console.log("Customer email: ", email);
    }

    return NextResponse.json({ status: "success", event: event.type });
  } catch (err: any) {
    console.log("Webhook Error", err.message);
    return NextResponse.json({ status: "error", message: err.message });
  }
}
