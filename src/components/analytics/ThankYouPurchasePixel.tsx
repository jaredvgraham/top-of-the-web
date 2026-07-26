"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

declare global {
  interface Window {
    fbq?: (
      action: string,
      event: string,
      params?: Record<string, string | number>
    ) => void;
  }
}

const PURCHASE_VALUE = 84;
const PURCHASE_CURRENCY = "USD";

/**
 * Fires Meta Pixel Purchase once per Stripe checkout session
 * (deduped via sessionStorage so refresh doesn't double-count).
 */
export default function ThankYouPurchasePixel() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id") || "";

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.fbq !== "function") {
      return;
    }

    const key = sessionId
      ? `meta_purchase_${sessionId}`
      : "meta_purchase_thank_you";

    try {
      if (sessionStorage.getItem(key) === "1") return;
      sessionStorage.setItem(key, "1");
    } catch {
      // private mode — still fire once this mount
    }

    window.fbq("track", "Purchase", {
      value: PURCHASE_VALUE,
      currency: PURCHASE_CURRENCY,
      content_name: "Managed Website Plan",
      ...(sessionId ? { order_id: sessionId } : {}),
    });
  }, [sessionId]);

  return null;
}
