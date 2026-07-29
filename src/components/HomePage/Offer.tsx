"use client";

import { motion } from "framer-motion";

const ease = [0.65, 0, 0.35, 1] as const;

const points = [
  {
    title: "$0 custom build",
    body: "No agency invoice to get online. You claim the demo; we build the real site.",
  },
  {
    title: "$84/mo hosting + care",
    body: "Hosting, security, maintenance, and basic updates — one flat monthly price.",
  },
  {
    title: "Live in about 24 hours",
    body: "After you claim, we push toward launch fast. Your private demo stays available for 30 days.",
  },
  {
    title: "Cancel anytime once live",
    body: "Manage billing with your Website ID. Satisfaction-focused — we work it until you’re happy.",
  },
];

export default function Offer() {
  return (
    <section
      id="offer"
      className="scroll-mt-24 border-t border-ink/10 bg-paper px-5 py-16 sm:px-8 sm:py-24"
    >
      <div className="mx-auto max-w-[1400px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.65, ease }}
          className="max-w-2xl"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink/45">
            The offer
          </p>
          <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
            Free to try. Simple to keep.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink/60 sm:text-lg">
            See the demo first. Checkout only happens when you claim — not from
            this page.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2">
          {points.map((point, i) => (
            <motion.div
              key={point.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, ease, delay: i * 0.05 }}
              className="border-t border-ink/15 pt-5"
            >
              <h3 className="font-display text-xl font-medium text-ink">
                {point.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/60">
                {point.body}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-4 text-sm">
          <a
            href="#start"
            className="font-semibold uppercase tracking-[0.14em] text-accent underline-offset-4 hover:underline"
          >
            Start free demo
          </a>
          <a
            href="/pricing"
            className="font-semibold uppercase tracking-[0.14em] text-ink/45 underline-offset-4 hover:text-ink/70 hover:underline"
          >
            See pricing details
          </a>
        </div>
      </div>
    </section>
  );
}
