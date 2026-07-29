"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const ease = [0.65, 0, 0.35, 1] as const;

export default function GettingStarted() {
  return (
    <section className="relative overflow-hidden bg-accent px-5 py-16 text-paper sm:px-8 sm:py-20">
      <div className="relative mx-auto flex max-w-[1400px] flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.65, ease }}
          className="max-w-2xl"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-paper/70">
            Ready when you are
          </p>
          <h2 className="mt-3 font-display text-3xl font-medium tracking-tight sm:text-4xl lg:text-5xl">
            Your free demo is one answer away.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-paper/75 sm:text-lg">
            Start the Facebook demo on this page — or message us if you’d rather
            talk first.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease, delay: 0.1 }}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <a
            href="#start"
            className="inline-flex min-h-14 items-center justify-center rounded-full bg-ink px-9 text-sm font-semibold uppercase tracking-[0.14em] text-paper"
          >
            See my free demo
          </a>
          <Link
            href="/contact"
            className="inline-flex min-h-14 items-center justify-center rounded-full border border-paper/40 px-9 text-sm font-semibold uppercase tracking-[0.14em] text-paper transition hover:bg-paper hover:text-ink"
          >
            Contact us
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
