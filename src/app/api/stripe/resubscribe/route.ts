import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import {
  isBillingAccountError,
  resolveWebsiteBillingAccount,
} from "@/lib/billingAccount";
import {
  getSubscriptionInfoForCustomer,
  resubscribeMode,
  syncStoredSubscription,
} from "@/lib/stripeSubscription";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

async function resumeSubscription(customerId: string) {
  const listed = await stripe.subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 20,
  });
  const target = listed.data.find(
    (subscription) =>
      (subscription.status === "active" || subscription.status === "trialing") &&
      (subscription.cancel_at_period_end ||
        (typeof subscription.cancel_at === "number" &&
          subscription.cancel_at * 1000 > Date.now()))
  );

  if (!target) return null;

  if (target.cancel_at && !target.cancel_at_period_end) {
    await stripe.subscriptions.update(target.id, { cancel_at: null });
  } else {
    await stripe.subscriptions.update(target.id, {
      cancel_at_period_end: false,
    });
  }

  await syncStoredSubscription(customerId);
  return target.id;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const websiteId =
      typeof body.websiteId === "string" ? body.websiteId.trim() : "";

    const account = await resolveWebsiteBillingAccount(websiteId);
    if (isBillingAccountError(account)) {
      return NextResponse.json(
        { error: account.error },
        { status: account.status }
      );
    }

    const info = await getSubscriptionInfoForCustomer(account.customerId);
    const mode = resubscribeMode(info.status);

    if (!mode) {
      return NextResponse.json(
        { error: "This plan is already active." },
        { status: 409 }
      );
    }

    if (mode === "resume") {
      const subscriptionId = await resumeSubscription(account.customerId);
      if (!subscriptionId) {
        return NextResponse.json(
          { error: "Could not restart that plan. Open billing and try again." },
          { status: 409 }
        );
      }
      return NextResponse.json({ resumed: true });
    }

    const priceId = process.env.FREE_PRICE_ID?.trim();
    if (!priceId) {
      return NextResponse.json(
        { error: "Checkout is not configured (FREE_PRICE_ID)" },
        { status: 500 }
      );
    }

    const origin =
      req.headers.get("origin") ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://www.bsites.io";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer: account.customerId,
      client_reference_id: websiteId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${origin}/billing?resubscribed=1`,
      cancel_url: `${origin}/billing`,
      metadata: {
        offer: "managed",
        resubscribe: "true",
        websiteId,
      },
      subscription_data: {
        metadata: {
          offer: "managed",
          resubscribe: "true",
          websiteId,
        },
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Could not start checkout" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Could not resubscribe";
    console.error("Resubscribe error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
