import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import Customer from "@/models/Customer";
import Order from "@/models/Order";
import dbConnect from "@/lib/db";
import { findCustomerByEmail } from "@/models/Customer";
import Website from "@/models/WebsiteModel";
import Preview from "@/models/Preview";
import Lead from "@/models/Lead";
import { sendPurchaseConfirmationEmail } from "@/lib/mail";
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
        if (!item.price) continue;

        const price = item.price as Stripe.Price;
        if (price.product && typeof price.product === "string") {
          const product = await stripe.products.retrieve(price.product);
          productName = product.name;
        }

        amount = item.amount_total || 0;

        console.log("Product Name", productName);
        console.log("Quantity", item.quantity);
        console.log("Amount", amount);
      }

      const email = (
        session.customer_details?.email ||
        session.customer_email ||
        ""
      )
        .trim()
        .toLowerCase();
      const phoneCustomField = session.custom_fields?.find(
        (field) => field.key === "phone_number"
      );
      const phoneFromCheckout =
        session.metadata?.phone ||
        phoneCustomField?.text?.value ||
        session.customer_details?.phone ||
        "";
      const previewSlug = (session.metadata?.previewSlug || "").trim();

      console.log("Customer phone: ", phoneFromCheckout);
      console.log("Customer email: ", email);

      if (!email) {
        return NextResponse.json({
          status: "error",
          message: "Checkout session missing email",
        });
      }

      const order = await Order.findOne({ email });
      if (!order) {
        return NextResponse.json({
          status: "error",
          message: "Order not found",
        });
      }
      const phone = (phoneFromCheckout || order.phone || "").trim();
      if (phone) order.phone = phone;

      let website = await Website.findOne({ email }).sort({ createdAt: -1 });
      if (!website) {
        website = await Website.create({
          email,
          pack: order.pack,
          plan: order.plan,
          name: "",
          description: "",
          url: "",
        });
      }

      order.success = true;
      await order.save();

      const customer = await findCustomerByEmail(email);
      if (!customer) {
        return NextResponse.json({
          status: "error",
          message: "Customer not found",
        });
      }
      if (phone) customer.phone = phone;
      customer.subscriptionStatus = "active";
      await customer.save();

      if (customer.customerId) {
        await syncCustomerSubscription(customer.customerId);
      }

      if (!order.confirmationEmailSent) {
        let businessName = "";
        if (previewSlug) {
          const preview = await Preview.findOne({ slug: previewSlug })
            .select("siteSpec leadToken email")
            .lean();
          const siteSpec = preview?.siteSpec as
            | { business?: { name?: string } }
            | undefined;
          businessName = siteSpec?.business?.name || "";

          try {
            if (preview?.leadToken) {
              await Lead.findOneAndUpdate(
                { token: preview.leadToken },
                { $set: { status: "purchased" } }
              );
            } else if (preview?.email || email) {
              await Lead.findOneAndUpdate(
                {
                  email: preview?.email || email,
                  status: { $in: ["preview_ready", "generating", "continued"] },
                },
                { $set: { status: "purchased", previewSlug } },
                { sort: { createdAt: -1 } }
              );
            }
          } catch (leadError) {
            console.warn("[webhook] lead purchase update failed", leadError);
          }
        }

        try {
          await sendPurchaseConfirmationEmail({
            to: email,
            websiteId: String(website._id),
            pack: order.pack,
            plan: order.plan || productName || "Managed Website Plan",
            phone,
            businessName,
            previewSlug: previewSlug || undefined,
          });
          order.confirmationEmailSent = true;
          await order.save();
          console.log("[webhook] confirmation email sent", email);
        } catch (mailError) {
          console.error("[webhook] confirmation email failed", mailError);
        }
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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Webhook error";
    console.log("Webhook Error", message);
    return NextResponse.json({ status: "error", message });
  }
}
