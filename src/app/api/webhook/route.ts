// import Stripe from "stripe";
// import { NextRequest, NextResponse } from "next/server";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
// const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// export async function POST(req: NextRequest) {
//   const payload = await req.text();
//   const sig = req.headers.get("Stripe-Signature") as string;

//   try {
//     const event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);

//     if (event.type === "checkout.session.completed") {
//       const session = event.data.object as Stripe.Checkout.Session;

//       // Fetch line items for the session
//       const lineItems = await stripe.checkout.sessions.listLineItems(
//         session.id,
//         {
//           limit: 100,
//         }
//       );

//       for (const item of lineItems.data) {
//         if (!item.price) return;
//         const product = await stripe.products.retrieve(
//           item.price.product as string
//         );
//         const productName = product.name;
//         const quantity = item.quantity;
//         const amount = item.amount_total;

//         console.log("Product Name", productName);
//         console.log("Quantity", quantity);
//         console.log("Amount", amount);
//       }

//       const email = session.customer_details?.email;
//       const phone = session.customer_details?.phone;
//       console.log("Customer phone: ", phone);

//       console.log("Customer email: ", email);
//     }

//     return NextResponse.json({ status: "success", event: event.type });
//   } catch (err: any) {
//     console.log("Webhook Error", err.message);
//     return NextResponse.json({ status: "error", message: err.message });
//   }
// }

import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const webhookSecret = process.env.test!;

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
      const phone = session.customer_details?.phone;
      console.log("Customer phone: ", phone);

      console.log("Customer email: ", email);
    }

    return NextResponse.json({ status: "success", event: event.type });
  } catch (err: any) {
    console.log("Webhook Error", err.message);
    return NextResponse.json({ status: "error", message: err.message });
  }
}
///
