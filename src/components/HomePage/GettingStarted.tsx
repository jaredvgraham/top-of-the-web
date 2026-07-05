"use client";

import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import CheckoutButton from "@/components/checkout/CheckoutButton";

const ease = [0.65, 0, 0.35, 1] as const;

const GettingStarted = () => {
  const Router = useRouter();

  return (
    <section className="grain relative w-full overflow-hidden bg-accent px-5 py-28 text-paper sm:px-8 sm:py-40">
      <div className="relative mx-auto max-w-[1400px] text-center">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease }}
          className="mb-8 text-[13px] font-medium uppercase tracking-[0.24em] text-paper/70"
        >
          (04) — Start your build
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease, delay: 0.1 }}
          className="font-display display-tight mx-auto max-w-5xl text-6xl font-medium sm:text-7xl lg:text-[7rem]"
        >
          Get the site you should{" "}
          <em className="font-light italic">already have</em>.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease, delay: 0.25 }}
          className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-paper/80"
        >
          No upfront build fee. No confusing package ladder. A clean, custom
          website with managed hosting and care for $84/month.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease, delay: 0.35 }}
          className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <CheckoutButton
            label="Start My Free Build"
            className="rounded-full bg-paper px-10 py-5 text-sm font-semibold uppercase tracking-[0.14em] text-ink transition-transform duration-300 hover:-translate-y-1"
          />
          <button
            onClick={() => Router.push("/pricing")}
            className="rounded-full border border-paper/40 px-10 py-5 text-sm font-semibold uppercase tracking-[0.14em] text-paper transition-colors duration-300 hover:bg-paper hover:text-ink"
          >
            See What&apos;s Included
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default GettingStarted;
