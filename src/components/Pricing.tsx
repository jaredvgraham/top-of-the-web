"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Footer from "@/components/HomePage/Footer";
import CheckoutButton from "@/components/checkout/CheckoutButton";
import { PRICING_FAQS } from "@/components/pricing/faqs";

const ease = [0.65, 0, 0.35, 1] as const;

const features = [
  "Free custom website build",
  "Responsive design for mobile, tablet, desktop",
  "SEO foundation for local discovery",
  "Contact form or lead capture CTA",
  "Managed hosting, SSL, and uptime monitoring",
  "Security updates and technical maintenance",
  "Basic content updates included",
  "Performance-focused launch setup",
];

const assurances = [
  ["$0", "to design and build"],
  ["~24 hrs", "to launch after you claim"],
  ["Cancel", "anytime, no contract"],
  ["$0", "setup or hidden fees"],
];

const faqs = PRICING_FAQS;

const CTA_COPY = {
  modalEyebrow: "Secure checkout",
  modalTitle: "Start your $84/mo plan",
  modalDescription:
    "Enter your email to continue to Stripe. $0 for the build today, then $84/mo for hosting and care. Cancel anytime.",
  submitLabel: "Continue to Stripe",
};

const Pricing = () => {
  const [heroCtaVisible, setHeroCtaVisible] = useState(true);
  const [finalCtaVisible, setFinalCtaVisible] = useState(false);
  const heroCtaRef = useRef<HTMLDivElement>(null);
  const finalCtaRef = useRef<HTMLDivElement>(null);

  // The sticky buy bar only earns its space between the two real CTAs.
  useEffect(() => {
    const observed: Array<[HTMLDivElement, (v: boolean) => void]> = [];
    if (heroCtaRef.current) observed.push([heroCtaRef.current, setHeroCtaVisible]);
    if (finalCtaRef.current)
      observed.push([finalCtaRef.current, setFinalCtaVisible]);

    const observers = observed.map(([el, setter]) => {
      const observer = new IntersectionObserver(
        ([entry]) => setter(entry.isIntersecting),
        { rootMargin: "-80px 0px -80px 0px" }
      );
      observer.observe(el);
      return observer;
    });

    return () => observers.forEach((observer) => observer.disconnect());
  }, []);

  const showStickyBar = !heroCtaVisible && !finalCtaVisible;

  return (
    <>
      <main className="grain relative min-h-screen overflow-hidden bg-paper px-5 pb-24 pt-32 sm:px-8 sm:pt-40">
        <div className="relative mx-auto max-w-[1400px]">
          {/* Header + primary CTA, all above the fold */}
          <div className="mb-14 grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease }}
                className="mb-6 text-[13px] font-medium uppercase tracking-[0.24em] text-ink/50"
              >
                Pricing — One simple offer
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease, delay: 0.1 }}
                className="font-display display-tight max-w-4xl text-5xl font-medium text-ink sm:text-7xl lg:text-[5.5rem]"
              >
                <span className="block">Free website.</span>
                <span className="block">
                  <em className="font-light italic text-accent">$84/mo</em>{" "}
                  care.
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease, delay: 0.22 }}
                className="mt-7 max-w-xl text-lg leading-8 text-ink/70"
              >
                No upfront build cost, no tiers, no add-on maze. One monthly
                plan that keeps your site live, maintained, and ready to
                convert.
              </motion.p>
            </div>

            {/* Buy box */}
            <motion.div
              ref={heroCtaRef}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease, delay: 0.3 }}
              className="min-w-0 rounded-3xl border border-ink/15 bg-white/70 p-6 shadow-[0_18px_60px_-30px_rgba(26,20,51,0.5)] sm:p-8"
            >
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="font-display text-5xl font-medium leading-none tracking-tight text-ink sm:text-6xl">
                    $84
                    <span className="font-light italic text-accent">/mo</span>
                  </p>
                  <p className="mt-3 text-[13px] uppercase tracking-[0.18em] text-ink/55">
                    Build included for $0
                  </p>
                </div>
                <span className="whitespace-nowrap rounded-full bg-accent/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
                  Cancel anytime
                </span>
              </div>

              <div className="mt-8 space-y-3">
                <CheckoutButton
                  {...CTA_COPY}
                  className="group relative w-full overflow-hidden rounded-full bg-ink px-8 py-5 text-sm font-semibold uppercase tracking-[0.14em] text-paper"
                >
                  <span className="absolute inset-0 translate-y-full bg-accent transition-transform duration-300 ease-out group-hover:translate-y-0" />
                  <span className="relative">Buy now — $84/mo</span>
                </CheckoutButton>
                <Link
                  href="/#start"
                  className="block w-full rounded-full border border-ink/20 px-8 py-5 text-center text-sm font-semibold uppercase tracking-[0.14em] text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper"
                >
                  See a free demo first
                </Link>
              </div>

              <p className="mt-5 text-center text-[13px] leading-6 text-ink/50">
                Secure Stripe checkout · $0 due for the build · Live in about 24
                hours
              </p>
            </motion.div>
          </div>

          {/* Assurances */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.42 }}
            className="mb-20 grid gap-px overflow-hidden rounded-2xl border border-ink/10 bg-ink/10 sm:grid-cols-4"
          >
            {assurances.map(([value, label]) => (
              <div key={label} className="bg-paper px-6 py-6">
                <p className="font-display text-2xl font-medium tracking-tight text-ink">
                  {value}
                </p>
                <p className="mt-1 text-[12px] uppercase tracking-[0.16em] text-ink/50">
                  {label}
                </p>
              </div>
            ))}
          </motion.div>

          {/* Plan detail */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease }}
            className="grid overflow-hidden rounded-3xl border border-ink/15 lg:grid-cols-[0.9fr_1.1fr]"
          >
            {/* Left: the price */}
            <div className="grain relative flex flex-col justify-between bg-ink p-8 text-paper sm:p-12">
              <div className="relative">
                <span className="inline-block rounded-full border border-paper/25 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-paper/70">
                  Managed Website Plan
                </span>
                <p className="font-display mt-10 text-[5rem] font-medium leading-none tracking-tight sm:text-[7rem]">
                  $84
                  <span className="font-light italic text-accentSoft">/mo</span>
                </p>
                <p className="mt-4 text-[13px] uppercase tracking-[0.18em] text-paper/60">
                  Website build included for $0
                </p>
              </div>

              <div className="relative mt-12">
                <div className="space-y-4 border-t border-paper/15 pt-8 text-[15px] text-paper/70">
                  <p>— No large upfront website invoice</p>
                  <p>— One clear monthly care plan</p>
                  <p>— Built for service businesses, creators, startups</p>
                </div>
                <CheckoutButton
                  {...CTA_COPY}
                  className="group relative mt-10 w-full overflow-hidden rounded-full bg-accentSoft px-8 py-5 text-sm font-semibold uppercase tracking-[0.14em] text-ink"
                >
                  <span className="absolute inset-0 translate-y-full bg-paper transition-transform duration-300 ease-out group-hover:translate-y-0" />
                  <span className="relative">Buy now — $84/mo</span>
                </CheckoutButton>
                <Link
                  href="/contact"
                  className="mt-4 block w-full rounded-full border border-paper/25 px-8 py-5 text-center text-sm font-semibold uppercase tracking-[0.14em] text-paper/80 transition-colors hover:border-paper/50 hover:text-paper"
                >
                  Questions? Contact us
                </Link>
              </div>
            </div>

            {/* Right: what's included */}
            <div className="bg-paper p-8 sm:p-12">
              <h2 className="font-display mb-2 text-3xl font-medium tracking-tight text-ink sm:text-4xl">
                Included every month
              </h2>
              <p className="mb-8 text-ink/50">
                Everything a working business site needs, handled.
              </p>
              <div>
                {features.map((feature, index) => (
                  <div
                    key={feature}
                    className={`flex items-center gap-5 py-4 ${
                      index > 0 ? "border-t border-ink/10" : ""
                    }`}
                  >
                    <span className="font-display w-8 shrink-0 text-sm text-accent">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <p className="font-medium text-ink/80">{feature}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* FAQ — objection handling right before the last ask */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease }}
            className="mt-24 grid gap-10 lg:grid-cols-[auto_1fr] lg:gap-16"
          >
            <p className="text-[13px] font-medium uppercase tracking-[0.24em] text-ink/50">
              Before you buy
            </p>
            <div className="max-w-3xl">
              {faqs.map((faq, index) => (
                <details
                  key={faq.q}
                  className={`group py-5 ${
                    index > 0 ? "border-t border-ink/10" : ""
                  }`}
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-medium text-ink marker:hidden">
                    {faq.q}
                    <span className="shrink-0 text-2xl font-light text-accent transition-transform duration-300 group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 max-w-2xl text-[15px] leading-7 text-ink/65">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </motion.div>

          {/* Closing ask */}
          <motion.div
            ref={finalCtaRef}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease }}
            className="grain mt-24 overflow-hidden rounded-3xl bg-ink px-8 py-14 text-paper sm:px-14"
          >
            <div className="relative flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="font-display display-tight max-w-2xl text-4xl font-medium sm:text-5xl">
                  Ready when you are — $0 to build, $84/mo to keep it running.
                </h2>
                <p className="mt-5 max-w-xl text-paper/65">
                  Buy now and we start your build, or see a free private demo
                  first. Larger builds like ecommerce and booking get scoped
                  separately —{" "}
                  <Link
                    href="/contact"
                    className="font-semibold text-paper underline decoration-accentSoft/60 underline-offset-4"
                  >
                    contact us
                  </Link>
                  .
                </p>
              </div>
              <div className="flex w-full shrink-0 flex-col gap-3 sm:flex-row lg:w-auto">
                <div className="w-full sm:w-[260px]">
                  <CheckoutButton
                    {...CTA_COPY}
                    className="group relative w-full overflow-hidden rounded-full bg-accentSoft px-8 py-5 text-sm font-semibold uppercase tracking-[0.14em] text-ink"
                  >
                    <span className="absolute inset-0 translate-y-full bg-paper transition-transform duration-300 ease-out group-hover:translate-y-0" />
                    <span className="relative">Buy now — $84/mo</span>
                  </CheckoutButton>
                </div>
                <Link
                  href="/#start"
                  className="inline-flex min-h-14 items-center justify-center rounded-full border border-paper/30 px-8 text-sm font-semibold uppercase tracking-[0.14em] text-paper transition-colors hover:bg-paper hover:text-ink"
                >
                  Free demo
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Sticky buy bar */}
      <div
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-paper/95 backdrop-blur-md transition-all duration-300 ${
          showStickyBar
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-full opacity-0"
        }`}
      >
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-8 sm:py-4">
          <div className="min-w-0">
            <p className="font-display text-xl font-medium leading-none text-ink sm:text-2xl">
              $84<span className="font-light italic text-accent">/mo</span>
            </p>
            <p className="mt-1 truncate text-[10px] uppercase tracking-[0.14em] text-ink/50 sm:text-[11px] sm:tracking-[0.16em]">
              $0 build · Cancel anytime
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <Link
              href="/#start"
              className="hidden min-h-12 items-center rounded-full border border-ink/20 px-6 text-[13px] font-semibold uppercase tracking-[0.14em] text-ink transition-colors hover:border-ink sm:inline-flex"
            >
              Free demo
            </Link>
            <div className="w-[150px] sm:w-[240px]">
              <CheckoutButton
                {...CTA_COPY}
                className="group relative w-full overflow-hidden rounded-full bg-ink px-6 py-4 text-[13px] font-semibold uppercase tracking-[0.14em] text-paper"
              >
                <span className="absolute inset-0 translate-y-full bg-accent transition-transform duration-300 ease-out group-hover:translate-y-0" />
                <span className="relative">Buy now</span>
              </CheckoutButton>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Pricing;
