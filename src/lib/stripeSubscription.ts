import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export type SubscriptionStatus =
  | "active"
  | "canceling"
  | "canceled"
  | "past_due"
  | "none"
  | "unknown";

export type SubscriptionInfo = {
  status: SubscriptionStatus;
  cancelAt: number | null;
  canceledAt: number | null;
  currentPeriodEnd: number | null;
};

export function emptySubscriptionInfo(): SubscriptionInfo {
  return {
    status: "none",
    cancelAt: null,
    canceledAt: null,
    currentPeriodEnd: null,
  };
}

export function summarizeSubscriptions(
  subscriptions: Stripe.Subscription[]
): SubscriptionInfo {
  if (!subscriptions.length) return emptySubscriptionInfo();

  const active = subscriptions.find(
    (s) => s.status === "active" || s.status === "trialing"
  );
  if (active) {
    if (active.cancel_at_period_end) {
      return {
        status: "canceling",
        cancelAt: active.cancel_at ?? active.current_period_end ?? null,
        canceledAt: null,
        currentPeriodEnd: active.current_period_end ?? null,
      };
    }
    return {
      status: "active",
      cancelAt: null,
      canceledAt: null,
      currentPeriodEnd: active.current_period_end ?? null,
    };
  }

  const pastDue = subscriptions.find(
    (s) => s.status === "past_due" || s.status === "unpaid"
  );
  if (pastDue) {
    return {
      status: "past_due",
      cancelAt: null,
      canceledAt: null,
      currentPeriodEnd: pastDue.current_period_end ?? null,
    };
  }

  const canceled = subscriptions.find((s) => s.status === "canceled");
  if (canceled) {
    return {
      status: "canceled",
      cancelAt: null,
      canceledAt: canceled.canceled_at ?? null,
      currentPeriodEnd: canceled.current_period_end ?? null,
    };
  }

  return {
    status: "unknown",
    cancelAt: null,
    canceledAt: null,
    currentPeriodEnd: subscriptions[0].current_period_end ?? null,
  };
}

export async function getSubscriptionInfoForCustomer(
  customerId: string
): Promise<SubscriptionInfo> {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      limit: 20,
    });
    return summarizeSubscriptions(subscriptions.data);
  } catch (error) {
    console.error("Failed to fetch Stripe subscriptions:", error);
    return { ...emptySubscriptionInfo(), status: "unknown" };
  }
}

export async function getSubscriptionInfoMap(
  customerIds: string[]
): Promise<Map<string, SubscriptionInfo>> {
  const unique = Array.from(new Set(customerIds.filter(Boolean)));
  const entries = await Promise.all(
    unique.map(async (id) => {
      const info = await getSubscriptionInfoForCustomer(id);
      return [id, info] as const;
    })
  );
  return new Map(entries);
}
