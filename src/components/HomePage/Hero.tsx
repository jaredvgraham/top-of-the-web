"use client";
import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import CheckoutButton from "@/components/checkout/CheckoutButton";

const ease = [0.65, 0, 0.35, 1] as const;

const marqueeItems = [
  "Free custom build",
  "$84/mo hosting + care",
  "Launch in about a week",
  "Designed to convert",
  "Maintained for you",
];

const Hero = () => {
  const Router = useRouter();

  return (
    <section className="grain relative w-full overflow-hidden bg-paper pt-32 sm:pt-40">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        {/* Kicker */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
          className="mb-10 flex flex-wrap items-center gap-4 text-[12px] font-medium uppercase tracking-[0.24em] text-ink/60 sm:text-[13px]"
        >
          <span className="inline-block h-2 w-2 rounded-full bg-accent" />
          Web design studio — Plymouth, MA
          <span className="hidden sm:inline text-ink/30">/</span>
          <span className="hidden sm:inline">Now taking new builds</span>
        </motion.div>

        {/* Headline */}
        <h1 className="font-display display-tight text-[13.5vw] font-medium text-ink sm:text-[11vw] lg:text-[8.6rem]">
          <motion.span
            className="block"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.05 }}
          >
            Your business,
          </motion.span>
          <motion.span
            className="block"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.18 }}
          >
            looking <em className="font-light italic text-accent">expensive</em>
          </motion.span>
          <motion.span
            className="block"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.31 }}
          >
            — built for free.
          </motion.span>
        </h1>

        {/* Sub + CTAs */}
        <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-[1fr_auto] lg:items-end">
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.45 }}
            className="max-w-xl text-lg leading-8 text-ink/70 sm:text-xl"
          >
            Bsites designs and builds your custom website for{" "}
            <span className="font-semibold text-ink">$0 upfront</span>, then
            hosts, secures, and maintains it for one flat monthly price. No
            agency invoice. No template smell.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.55 }}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <CheckoutButton className="group relative overflow-hidden rounded-full bg-ink px-9 py-5 text-sm font-semibold uppercase tracking-[0.14em] text-paper">
              <span className="absolute inset-0 translate-y-full bg-accent transition-transform duration-300 ease-out group-hover:translate-y-0" />
              <span className="relative">Start Checkout — $84/mo</span>
            </CheckoutButton>
            <button
              onClick={() => Router.push("/contact")}
              className="rounded-full border border-ink/20 px-9 py-5 text-sm font-semibold uppercase tracking-[0.14em] text-ink transition-colors duration-300 hover:border-ink hover:bg-ink hover:text-paper"
            >
              Contact Us
            </button>
          </motion.div>
        </div>

        {/* Stat rules */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease, delay: 0.7 }}
          className="mt-16 lg:mt-24"
        >
          <div className="rule" />
          <div className="grid sm:grid-cols-3">
            {[
              ["$0", "to design + build your site"],
              ["$84/mo", "hosting, security, updates"],
              ["~7 days", "from kickoff to launch"],
            ].map(([value, label], i) => (
              <div
                key={label}
                className={`flex items-baseline justify-between gap-4 py-6 sm:block sm:py-8 ${
                  i > 0 ? "border-t border-ink/15 sm:border-l sm:border-t-0 sm:pl-8" : ""
                }`}
              >
                <p className="font-display text-4xl font-medium tracking-tight text-ink sm:text-5xl">
                  {value}
                </p>
                <p className="mt-0 text-right text-[13px] uppercase tracking-[0.18em] text-ink/50 sm:mt-3 sm:text-left">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Marquee */}
      <div className="mt-4 border-y border-ink/15 bg-ink py-4 sm:py-5">
        <div className="flex w-max animate-marquee items-center gap-10 whitespace-nowrap pr-10">
          {[...marqueeItems, ...marqueeItems, ...marqueeItems, ...marqueeItems].map(
            (item, i) => (
              <React.Fragment key={i}>
                <span className="text-sm font-medium uppercase tracking-[0.22em] text-paper/90">
                  {item}
                </span>
                <span className="text-accent">✺</span>
              </React.Fragment>
            )
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;
