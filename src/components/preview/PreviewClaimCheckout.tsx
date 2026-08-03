"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  restoreMetaClickCookies,
  shouldCreditMetaClick,
  trackMetaEvent,
  type MetaClickAttribution,
} from "@/lib/preview/metaAttribution";
import type { CheckoutOffer } from "@/lib/checkoutOffers";
import {
  claimPageRevisionBlurb,
  revisionCountBadge,
} from "@/lib/preview/revisionCopy";

const ease = [0.65, 0, 0.35, 1] as const;

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function isValidPhone(value: string) {
  return value.replace(/\D/g, "").length >= 10;
}

type Props = {
  slug: string;
  businessName: string;
  defaultEmail: string;
  defaultPhone: string;
  previewPath: string;
  leadMetaAttribution?: MetaClickAttribution | null;
};

export default function PreviewClaimCheckout({
  slug,
  businessName,
  defaultEmail,
  defaultPhone,
  previewPath,
  leadMetaAttribution,
}: Props) {
  const router = useRouter();
  const [email, setEmail] = useState(defaultEmail);
  const [phone, setPhone] = useState(defaultPhone);
  const [offer, setOffer] = useState<CheckoutOffer>("one_time");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [revisionBlurb, setRevisionBlurb] = useState("");
  const [revisionBadge, setRevisionBadge] = useState<{
    count: string;
    depleted: boolean;
  } | null>(null);

  useEffect(() => {
    restoreMetaClickCookies(leadMetaAttribution);
  }, [leadMetaAttribution]);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(
          `/api/preview/${encodeURIComponent(slug)}/revise`,
          { cache: "no-store" }
        );
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (cancelled) return;
        const max = Number(data.max) || 2;
        const used =
          typeof data.used === "number"
            ? data.used
            : Math.max(0, max - (Number(data.remaining) || 0));
        const quota = {
          remaining: Number(data.remaining) || 0,
          used,
          purchased: Boolean(data.purchased),
          max,
          phase: (data.phase === "post" ? "post" : "pre") as "pre" | "post",
        };
        const badge = revisionCountBadge(quota);
        setRevisionBadge({
          count: `AI ${badge.count}`,
          depleted: badge.depleted,
        });
        setRevisionBlurb(claimPageRevisionBlurb(quota));
      } catch {
        // non-blocking
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  // Meta InitiateCheckout = viewing the claim page (not demo generation).
  useEffect(() => {
    if (!slug) return;

    const key = `meta_initiate_checkout_${slug}`;
    try {
      if (sessionStorage.getItem(key) === "1") return;
    } catch {
      // private mode — continue
    }

    if (!shouldCreditMetaClick(leadMetaAttribution)) return;

    try {
      sessionStorage.setItem(key, "1");
    } catch {
      // private mode — still fire once this mount
    }

    trackMetaEvent("InitiateCheckout", {
      content_name: "Website Claim Page",
      content_category: "website_preview",
    });
  }, [slug, leadMetaAttribution]);

  const readyToCheckout = useMemo(
    () => isValidEmail(email) && isValidPhone(phone),
    [email, phone]
  );

  const showTopCta =
    isValidEmail(defaultEmail) && isValidPhone(defaultPhone) && readyToCheckout;

  const ctaLabel =
    offer === "one_time"
      ? "Get my site — just $495"
      : "Claim my site — $84/mo";

  const runCheckout = async () => {
    const checkoutEmail = email.trim().toLowerCase();
    const checkoutPhone = phone.trim();
    if (!isValidEmail(checkoutEmail)) {
      setError("Enter the email for this order.");
      return;
    }
    if (!isValidPhone(checkoutPhone)) {
      setError("Enter a phone number so we can call for your custom brief.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: checkoutEmail,
          phone: checkoutPhone,
          previewSlug: slug,
          offer,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || data.error || "Something went wrong");
        return;
      }
      if (data.url) {
        router.push(data.url);
        return;
      }
      setError("Checkout didn’t return a link. Please try again.");
    } catch {
      setError("Unable to start checkout. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const startCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    await runCheckout();
  };

  const name = businessName.trim() || "your business";

  return (
    <main
      className={`grain relative min-h-[100dvh] overflow-hidden bg-paper px-5 pb-16 sm:px-8 ${
        showTopCta ? "pt-28 sm:pt-32" : "pt-24 sm:pt-28"
      }`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 55% at 50% -10%, rgba(91,46,158,0.16), transparent 55%), linear-gradient(180deg, rgba(31,182,214,0.06), transparent 40%)",
        }}
      />

      {showTopCta ? (
        <div className="fixed inset-x-0 top-0 z-40 border-b border-ink/10 bg-paper/95 px-4 py-3 backdrop-blur-md sm:px-6">
          <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
                Ready to claim
              </p>
              <p className="truncate text-sm text-ink/60">
                {email} · {phone}
              </p>
            </div>
            <button
              type="button"
              disabled={loading}
              onClick={() => void runCheckout()}
              className="shrink-0 rounded-full bg-accent px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-paper transition hover:opacity-90 disabled:opacity-60 sm:px-5"
            >
              {loading ? "Opening…" : "Continue"}
            </button>
          </div>
          {error ? (
            <p className="mx-auto mt-2 max-w-lg text-center text-xs text-red-600">
              {error}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="relative mx-auto flex min-h-[calc(100dvh-8rem)] max-w-lg flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
            Live in 24 hours · Hosting included
          </p>
          <h1 className="font-display mt-4 text-[2.35rem] font-medium leading-[1.05] tracking-tight text-ink sm:text-5xl">
            Get {name} online for just $495.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink/60">
            One customer pays for the life of your website. Custom site +
            hosting included.
          </p>
          {revisionBadge || revisionBlurb ? (
            <div className="mt-4 rounded-2xl border border-accent/20 bg-accent/[0.06] px-4 py-3">
              {revisionBadge ? (
                <p
                  className={`text-[11px] font-bold uppercase tracking-[0.12em] ${
                    revisionBadge.depleted ? "text-ink/50" : "text-accent"
                  }`}
                >
                  {revisionBadge.count}
                </p>
              ) : null}
              {revisionBlurb ? (
                <p className="mt-1 text-sm leading-relaxed text-ink/70">
                  {revisionBlurb}
                </p>
              ) : null}
            </div>
          ) : null}

          <div
            className="mt-7 grid gap-3"
            role="radiogroup"
            aria-label="Choose a plan"
          >
            <button
              type="button"
              role="radio"
              aria-checked={offer === "one_time"}
              onClick={() => setOffer("one_time")}
              className={`relative rounded-2xl border px-4 py-4 text-left transition ${
                offer === "one_time"
                  ? "border-accent bg-accent/[0.07] shadow-[0_0_0_1px_rgba(91,46,158,0.4)]"
                  : "border-accent/35 bg-accent/[0.03] hover:border-accent/55"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
                    Most popular
                  </p>
                  <p className="font-display text-3xl font-medium leading-none text-ink">
                    Just $495
                    <span className="text-base font-normal text-ink/45">
                      {" "}
                      total
                    </span>
                  </p>
                  <p className="mt-1.5 text-xs font-medium text-accent">
                    1 customer pays for the life of your website
                  </p>
                </div>
                <span
                  className={`mt-1 h-4 w-4 shrink-0 rounded-full border-2 ${
                    offer === "one_time"
                      ? "border-accent bg-accent"
                      : "border-ink/25"
                  }`}
                />
              </div>
              <p className="mt-2 text-sm leading-relaxed text-ink/65">
                Custom website + hosting for one small payment. No monthly
                subscription.
              </p>
            </button>

            <button
              type="button"
              role="radio"
              aria-checked={offer === "managed"}
              onClick={() => setOffer("managed")}
              className={`rounded-2xl border px-4 py-4 text-left transition ${
                offer === "managed"
                  ? "border-accent bg-accent/[0.06] shadow-[0_0_0_1px_rgba(91,46,158,0.35)]"
                  : "border-ink/12 bg-white/50 hover:border-ink/25"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/40">
                    Or go monthly
                  </p>
                  <p className="font-display mt-1 text-2xl font-medium text-ink">
                    $0 today · $84
                    <span className="text-base text-ink/45">/mo</span>
                  </p>
                </div>
                <span
                  className={`mt-1 h-4 w-4 shrink-0 rounded-full border-2 ${
                    offer === "managed"
                      ? "border-accent bg-accent"
                      : "border-ink/25"
                  }`}
                />
              </div>
              <p className="mt-2 text-sm leading-relaxed text-ink/65">
                Custom build included. Hosting, SSL, care, and basic updates for
                $84/mo. Cancel anytime once you’re live.
              </p>
            </button>
          </div>

          {showTopCta ? (
            <button
              type="button"
              disabled={loading}
              onClick={() => void runCheckout()}
              className="mt-7 w-full rounded-full bg-accent px-6 py-4 text-[13px] font-semibold uppercase tracking-[0.14em] text-paper transition hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Opening checkout…" : ctaLabel}
            </button>
          ) : null}

          <ul className="mt-7 space-y-3 text-sm text-ink/75">
            <li className="flex gap-3">
              <span className="mt-0.5 font-semibold text-accent">→</span>
              <span>
                <strong className="font-semibold text-ink">Live in 24 hours</strong>{" "}
                from checkout.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 font-semibold text-accent">→</span>
              <span>
                <strong className="font-semibold text-ink">Phone call brief</strong>{" "}
                so we nail your custom updates — not a form dump.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 font-semibold text-accent">→</span>
              <span>
                <strong className="font-semibold text-ink">
                  100% satisfaction guarantee
                </strong>{" "}
                — we work it until you’re happy.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 font-semibold text-accent">→</span>
              <span>
                <strong className="font-semibold text-ink">
                  2 more AI + unlimited human revisions
                </strong>{" "}
                — quick AI polish after checkout, then a person revises with
                you until you’re happy.
              </span>
            </li>
          </ul>
        </motion.div>

        <motion.form
          onSubmit={startCheckout}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease, delay: 0.08 }}
          className="mt-10 border-t border-ink/10 pt-8"
        >
          <div className="mb-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/40">
              {offer === "one_time" ? "Best value selected" : "Selected"}
            </p>
            <p className="font-display mt-1 text-3xl font-medium text-ink">
              {offer === "one_time" ? (
                <>
                  Just $495
                  <span className="ml-2 text-sm font-normal text-accent">
                    all-in
                  </span>
                </>
              ) : (
                <>
                  $84<span className="text-lg text-ink/45">/mo</span>
                  <span className="ml-2 text-base font-normal text-ink/45">
                    ($0 build)
                  </span>
                </>
              )}
            </p>
          </div>

          <label
            htmlFor="claim-email"
            className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/45"
          >
            Email
          </label>
          <input
            id="claim-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            inputMode="email"
            placeholder="you@business.com"
            className="w-full border-b border-ink/20 bg-transparent py-3 text-lg text-ink outline-none focus:border-accent"
          />

          <label
            htmlFor="claim-phone"
            className="mb-2 mt-5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/45"
          >
            Phone for your brief call
          </label>
          <input
            id="claim-phone"
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
            inputMode="tel"
            placeholder="(555) 555-5555"
            className="w-full border-b border-ink/20 bg-transparent py-3 text-lg text-ink outline-none focus:border-accent"
          />
          <p className="mt-2 text-xs text-ink/40">
            We’ll text/call to collect the custom updates you want before launch.
          </p>

          {error ? (
            <p className="mt-3 text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-full bg-accent px-6 py-4 text-[13px] font-semibold uppercase tracking-[0.14em] text-paper transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Opening checkout…" : ctaLabel}
          </button>

          <p className="mt-3 text-center text-xs text-ink/40">
            100% satisfaction guarantee · Secure Stripe
            {offer === "managed" ? " · Cancel anytime" : ""}
          </p>

          <Link
            href={previewPath}
            className="mt-5 block text-center text-sm text-ink/45 underline-offset-2 hover:text-ink hover:underline"
          >
            Back to demo
          </Link>
        </motion.form>
      </div>
    </main>
  );
}
