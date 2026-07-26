"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

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
};

export default function PreviewClaimCheckout({
  slug,
  businessName,
  defaultEmail,
  defaultPhone,
  previewPath,
}: Props) {
  const router = useRouter();
  const [email, setEmail] = useState(defaultEmail);
  const [phone, setPhone] = useState(defaultPhone);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const readyToCheckout = useMemo(
    () => isValidEmail(email) && isValidPhone(phone),
    [email, phone]
  );

  const showTopCta =
    isValidEmail(defaultEmail) && isValidPhone(defaultPhone) && readyToCheckout;

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
              {loading ? "Opening…" : "Continue to checkout"}
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
            Live in 24 hours · 100% satisfaction
          </p>
          <h1 className="font-display mt-4 text-[2.35rem] font-medium leading-[1.05] tracking-tight text-ink sm:text-5xl">
            Get {name} online for real — today.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink/60">
            $0 build. $84/mo after. We call you for a quick brief, then ship
            your custom site.
          </p>

          {showTopCta ? (
            <button
              type="button"
              disabled={loading}
              onClick={() => void runCheckout()}
              className="mt-7 w-full rounded-full bg-accent px-6 py-4 text-[13px] font-semibold uppercase tracking-[0.14em] text-paper transition hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Opening checkout…" : "Continue to checkout"}
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
                — we work it until you’re happy. Cancel anytime once live.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 font-semibold text-accent">→</span>
              <span>
                <strong className="font-semibold text-ink">Email confirmation</strong>{" "}
                the second you purchase.
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
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/40">
                Build
              </p>
              <p className="font-display text-4xl font-medium text-ink">$0</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/40">
                Then
              </p>
              <p className="font-display text-4xl font-medium text-ink">
                $84<span className="text-lg text-ink/45">/mo</span>
              </p>
            </div>
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
            {loading ? "Opening checkout…" : "Claim my site — live in 24 hrs"}
          </button>

          <p className="mt-3 text-center text-xs text-ink/40">
            100% satisfaction guarantee · Secure Stripe · Cancel anytime
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
