import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import Customer from "@/models/Customer";
import dbConnect from "@/lib/db";
import {
  isBillingAccountError,
  resolveWebsiteBillingAccount,
} from "@/lib/billingAccount";
import {
  getSubscriptionInfoForCustomer,
  resubscribeMode,
} from "@/lib/stripeSubscription";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const body = await req.json().catch(() => ({}));
    const websiteId =
      typeof body.websiteId === "string" ? body.websiteId.trim() : "";
    const emailInput =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    let customerId = "";

    if (websiteId) {
      const account = await resolveWebsiteBillingAccount(websiteId);
      if (isBillingAccountError(account)) {
        return NextResponse.json(
          { error: account.error },
          { status: account.status }
        );
      }
      customerId = account.customerId;
    } else if (emailInput) {
      const customer = await Customer.findOne({ email: emailInput });
      if (!customer?.customerId) {
        return NextResponse.json(
          { error: "No billing account found for that website" },
          { status: 404 }
        );
      }
      customerId = customer.customerId;
    } else {
      return NextResponse.json(
        { error: "Website ID is required" },
        { status: 400 }
      );
    }

    const info = await getSubscriptionInfoForCustomer(customerId);
    const mode = resubscribeMode(info.status);

    const origin =
      req.headers.get("origin") ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://www.bsites.io";

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/billing`,
    });

    return NextResponse.json({
      url: session.url,
      status: info.status,
      canResubscribe: mode !== null,
      mode,
      cancelAt: info.cancelAt,
      canceledAt: info.canceledAt,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to create billing portal session";
    console.error("Billing portal error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
