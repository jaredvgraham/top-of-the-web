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

const PURCHASE_CURRENCY = "USD";

async function loadPurchaseMeta(sessionId: string) {
  // Fast path: cookies still have an ad-click signal
  const browserHasClick = hasMetaAdClickAttribution(
    readMetaAttributionFromBrowser()
  );

  if (!sessionId.startsWith("cs_")) {
    return {
      creditMeta: browserHasClick,
      value: 84,
      contentName: "Managed Website Plan",
    };
  }

  try {
    const res = await fetch(
      `/api/stripe/meta-credit?session_id=${encodeURIComponent(sessionId)}`,
      { cache: "no-store" }
    );
    if (!res.ok) {
      return {
        creditMeta: browserHasClick,
        value: 84,
        contentName: "Managed Website Plan",
      };
    }
    const data = (await res.json()) as {
      creditMeta?: boolean;
      value?: number;
      contentName?: string;
    };
    return {
      creditMeta: browserHasClick || Boolean(data.creditMeta),
      value:
        typeof data.value === "number" && Number.isFinite(data.value)
          ? data.value
          : 84,
      contentName: data.contentName || "Managed Website Plan",
    };
  } catch {
    return {
      creditMeta: browserHasClick,
      value: 84,
      contentName: "Managed Website Plan",
    };
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

      const purchase = await loadPurchaseMeta(sessionId);
      if (cancelled || !purchase.creditMeta) return;

      try {
        sessionStorage.setItem(key, "1");
      } catch {
        // private mode — still fire once this mount
      }

      window.fbq?.("track", "Purchase", {
        value: purchase.value,
        currency: PURCHASE_CURRENCY,
        content_name: purchase.contentName,
        ...(sessionId ? { order_id: sessionId } : {}),
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return null;
}
