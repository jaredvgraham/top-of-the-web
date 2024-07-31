import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import Purchase from "@/models/Purchase";
import dbConnect from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

async function subscriptionScheduleExists(
  customerId: string,
  productId: string
): Promise<boolean> {
  const schedules = await stripe.subscriptionSchedules.list({
    customer: customerId,
  });

  return schedules.data.some((schedule) =>
    schedule.phases.some((phase) =>
      phase.items.some((item) => {
        const price = item.price as Stripe.Price;
        return price.product === productId;
      })
    )
  );
}

export async function POST(req: NextRequest) {
  await dbConnect();
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

      let productName = "";
      let amount = 0;
      for (const item of lineItems.data) {
        if (!item.price) return;

        const price = item.price as Stripe.Price;
        if (price.product && typeof price.product === "string") {
          const product = await stripe.products.retrieve(price.product);
          productName = product.name;
        }

        const quantity = item.quantity;
        amount = item.amount_total;

        console.log("Product Name", productName);
        console.log("Quantity", quantity);
        console.log("Amount", amount);
      }

      const email = session.customer_details?.email;
      const phoneCustomField = session.custom_fields?.find(
        (field) => field.key === "phone_number"
      );
      const phone = phoneCustomField?.text?.value;

      console.log("Customer phone: ", phone);
      console.log("Customer email: ", email);

      const purchase = new Purchase({
        email,
        phone,
        pack: productName,
        price: amount,
      });
      await purchase.save();
    }

    return NextResponse.json({ status: "success", event: event.type });
  } catch (err: any) {
    console.log("Webhook Error", err.message);
    return NextResponse.json({ status: "error", message: err.message });
  }
}
//
