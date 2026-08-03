/** Shared claim / Stripe checkout offer definitions. */

export type CheckoutOffer = "managed" | "one_time";

export const MANAGED_PACK = "Managed Website Plan";
export const MANAGED_PLAN = "Managed Website Plan";
export const ONE_TIME_PACK = "One-Time Website";
export const ONE_TIME_PLAN = "One-Time Website";

export function parseCheckoutOffer(value: unknown): CheckoutOffer {
  return value === "one_time" ? "one_time" : "managed";
}

export function isOneTimeOffer(
  offer?: string | null,
  pack?: string | null,
  plan?: string | null
) {
  if (offer === "one_time") return true;
  const label = `${pack || ""} ${plan || ""}`.toLowerCase();
  return label.includes("one-time") || label.includes("one time");
}

export function offerPurchaseValue(offer: CheckoutOffer) {
  return offer === "one_time" ? 495 : 84;
}

export function offerContentName(offer: CheckoutOffer) {
  return offer === "one_time" ? ONE_TIME_PACK : MANAGED_PACK;
}
