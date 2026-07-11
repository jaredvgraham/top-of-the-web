import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import Customer from "@/models/Customer";
import Order from "@/models/Order";
import dbConnect from "@/lib/db";
import { findCustomerByEmail } from "@/models/Customer";
import Website from "@/models/WebsiteModel";
import {
  getSubscriptionInfoForCustomer,
  summarizeSubscriptions,
} from "@/lib/stripeSubscription";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

async function syncCustomerSubscription(stripeCustomerId: string) {
  const customer = await Customer.findOne({ customerId: stripeCustomerId });
  if (!customer) return;

  const info = await getSubscriptionInfoForCustomer(stripeCustomerId);
  customer.subscriptionStatus = info.status;
  customer.subscriptionCancelAt = info.cancelAt
    ? new Date(info.cancelAt * 1000)
    : null;
  customer.subscriptionCanceledAt = info.canceledAt
    ? new Date(info.canceledAt * 1000)
    : null;
  await customer.save();
}

export async function POST(req: NextRequest) {
  console.log("Webhook received");
  await dbConnect();
  const payload = await req.text();
  const sig = req.headers.get("Stripe-Signature") as string;

  try {
    const event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

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

      const order = await Order.findOne({ email });
      if (!order) {
        return NextResponse.json({
          status: "error",
          message: "Order not found",
        });
      }
      order.phone = phone as string;
      order.success = true;
      await order.save();

      const website = new Website({
        email,
        pack: order.pack,
        plan: order.plan,
        name: "",
        description: "",
        url: "",
      });
      await website.save();

      const customer = await findCustomerByEmail(email as string);
      if (!customer) {
        return NextResponse.json({
          status: "error",
          message: "Customer not found",
        });
      }
      customer.phone = phone as string;
      customer.subscriptionStatus = "active";
      await customer.save();

      if (customer.customerId) {
        await syncCustomerSubscription(customer.customerId);
      }
    }

    if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted" ||
      event.type === "customer.subscription.created"
    ) {
      const subscription = event.data.object as Stripe.Subscription;
      const stripeCustomerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;

      await syncCustomerSubscription(stripeCustomerId);

      const info = summarizeSubscriptions([subscription]);
      console.log(
        `Subscription ${event.type} for ${stripeCustomerId}: ${info.status}`
      );
    }

    return NextResponse.json({ status: "success", event: event.type });
  } catch (err: any) {
    console.log("Webhook Error", err.message);
    return NextResponse.json({ status: "error", message: err.message });
  }
}
