"use client";

import React from "react";
import { motion } from "framer-motion";
import Footer from "@/components/HomePage/Footer";
import CheckoutButton from "@/components/checkout/CheckoutButton";

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

const Pricing = () => {
  return (
    <>
      <main className="grain relative min-h-screen overflow-hidden bg-paper px-5 pb-24 pt-36 sm:px-8 sm:pt-44">
        <div className="relative mx-auto max-w-[1400px]">
          {/* Header */}
          <div className="mb-16 sm:mb-24">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease }}
              className="mb-8 text-[13px] font-medium uppercase tracking-[0.24em] text-ink/50"
            >
              Pricing — One simple offer
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 48 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease, delay: 0.1 }}
              className="font-display display-tight max-w-5xl text-6xl font-medium text-ink sm:text-8xl lg:text-[8.5rem]"
            >
              Free website.{" "}
              <em className="font-light italic text-accent">$84/mo</em> care.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease, delay: 0.3 }}
              className="mt-8 max-w-xl text-lg leading-8 text-ink/70"
            >
              Bsites removes the upfront build cost and keeps your site live,
              maintained, and ready to convert. No tiers, no add-on maze.
            </motion.p>
          </div>

          {/* Plan */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.4 }}
            className="grid overflow-hidden rounded-3xl border border-ink/15 lg:grid-cols-[0.9fr_1.1fr]"
          >
            {/* Left: the price */}
            <div className="grain relative flex flex-col justify-between bg-ink p-8 text-paper sm:p-12">
              <div className="relative">
                <span className="inline-block rounded-full border border-paper/25 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-paper/70">
                  Managed Website Plan
                </span>
                <p className="font-display mt-10 text-[6rem] font-medium leading-none tracking-tight sm:text-[8rem]">
                  $84
                  <span className="font-light italic text-accent">/mo</span>
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
                <CheckoutButton className="group relative mt-10 w-full overflow-hidden rounded-full bg-paper px-8 py-5 text-sm font-semibold uppercase tracking-[0.14em] text-ink">
                  <span className="absolute inset-0 translate-y-full bg-accent transition-transform duration-300 ease-out group-hover:translate-y-0" />
                  <span className="relative transition-colors duration-300 group-hover:text-paper">
                    Claim Your Free Website
                  </span>
                </CheckoutButton>
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

          {/* Larger builds note */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease }}
            className="mt-20 grid gap-6 border-t border-ink/15 pt-12 lg:grid-cols-[auto_1fr] lg:gap-16"
          >
            <p className="text-[13px] font-medium uppercase tracking-[0.24em] text-ink/50">
              Have a larger build?
            </p>
            <p className="max-w-2xl text-lg leading-8 text-ink/70">
              If you need ecommerce, dashboards, booking systems, or custom app
              functionality, Bsites can scope that separately. The core offer
              stays simple:{" "}
              <span className="font-semibold text-ink">
                free build plus $84/month hosting and care.
              </span>
            </p>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Pricing;
