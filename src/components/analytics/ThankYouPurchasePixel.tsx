"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  hasMetaAdClickAttribution,
  readMetaAttributionFromBrowser,
} from "@/lib/preview/metaAttribution";

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

async function shouldCreditMeta(sessionId: string) {
  // Fast path: cookies still have an ad-click signal
  if (hasMetaAdClickAttribution(readMetaAttributionFromBrowser())) {
    return true;
  }

  // Durable path: Lead stored fbclid/fbc when they entered via Meta
  if (!sessionId.startsWith("cs_")) return false;
  try {
    const res = await fetch(
      `/api/stripe/meta-credit?session_id=${encodeURIComponent(sessionId)}`,
      { cache: "no-store" }
    );
    if (!res.ok) return false;
    const data = (await res.json()) as { creditMeta?: boolean };
    return Boolean(data.creditMeta);
  } catch {
    return false;
  }
}

/**
 * Fires Meta Pixel Purchase once per Stripe checkout session —
 * only when the buyer has Meta ad-click attribution (cookies or stored Lead).
 * Organic purchases must not inflate Meta conversion counts.
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

    let cancelled = false;

    (async () => {
      try {
        if (sessionStorage.getItem(key) === "1") return;
      } catch {
        // private mode — continue
      }

      const creditMeta = await shouldCreditMeta(sessionId);
      if (cancelled || !creditMeta) return;

      try {
        sessionStorage.setItem(key, "1");
      } catch {
        // private mode — still fire once this mount
      }

      window.fbq?.("track", "Purchase", {
        value: PURCHASE_VALUE,
        currency: PURCHASE_CURRENCY,
        content_name: "Managed Website Plan",
        ...(sessionId ? { order_id: sessionId } : {}),
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return null;
}
