import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Website from "@/models/WebsiteModel";
import Customer from "@/models/Customer";
import Order from "@/models/Order";
import {
  emptySubscriptionInfo,
  getSubscriptionInfoMap,
} from "@/lib/stripeSubscription";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    await dbConnect();

    const [websites, customers, orders] = await Promise.all([
      Website.find().sort({ createdAt: -1 }).lean(),
      Customer.find().lean(),
      Order.find().sort({ createdAt: -1 }).lean(),
    ]);

    const customersByEmail = new Map(
      customers.map((c) => [c.email?.toLowerCase(), c])
    );
    const ordersByEmail = new Map(
      orders.map((o) => [o.email?.toLowerCase(), o])
    );

    const stripeIds = customers
      .map((c) => c.customerId)
      .filter((id): id is string => Boolean(id));
    const subscriptionMap = await getSubscriptionInfoMap(stripeIds);

    // Keep local cache in sync with live Stripe status
    await Promise.all(
      customers.map(async (c) => {
        if (!c.customerId) return;
        const info = subscriptionMap.get(c.customerId);
        if (!info) return;
        const cancelAt = info.cancelAt ? new Date(info.cancelAt * 1000) : null;
        const canceledAt = info.canceledAt
          ? new Date(info.canceledAt * 1000)
          : null;
        await Customer.updateOne(
          { _id: c._id },
          {
            subscriptionStatus: info.status,
            subscriptionCancelAt: cancelAt,
            subscriptionCanceledAt: canceledAt,
          }
        );
      })
    );

    const data = websites.map((site) => {
      const emailKey = site.email?.toLowerCase();
      const customer = emailKey ? customersByEmail.get(emailKey) : undefined;
      const order = emailKey ? ordersByEmail.get(emailKey) : undefined;
      const subscription = customer?.customerId
        ? subscriptionMap.get(customer.customerId) || emptySubscriptionInfo()
        : emptySubscriptionInfo();

      return {
        id: String(site._id),
        name: site.name || "",
        email: site.email || "",
        url: site.url || "",
        description: site.description || "",
        pack: site.pack || "",
        plan: site.plan || "",
        createdAt: site.createdAt,
        subscription,
        customer: customer
          ? {
              id: String(customer._id),
              email: customer.email,
              phone: customer.phone || "",
              customerId: customer.customerId,
              createdAt: (customer as { createdAt?: Date }).createdAt,
              updatedAt: (customer as { updatedAt?: Date }).updatedAt,
            }
          : null,
        order: order
          ? {
              id: String(order._id),
              progress: order.progress ?? 0,
              pack: order.pack,
              plan: order.plan,
              success: order.success,
              phone: order.phone || "",
            }
          : null,
      };
    });

    return NextResponse.json(
      { websites: data },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Failed to list websites:", error);
    return NextResponse.json(
      { error: "Failed to load websites" },
      { status: 500 }
    );
  }
}
