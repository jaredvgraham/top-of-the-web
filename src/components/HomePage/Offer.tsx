"use client";

import { motion } from "framer-motion";

const ease = [0.65, 0, 0.35, 1] as const;

const points = [
  {
    title: "Just $495 once",
    body: "Custom website + hosting for one small payment. No monthly subscription.",
  },
  {
    title: "1 customer pays for the life of your website",
    body: "Get one job or sale from the site and it’s covered — that’s the whole point.",
  },
  {
    title: "Live in about 24 hours",
    body: "After you claim, we polish and launch fast. Your private demo stays available for 30 days.",
  },
  {
    title: "Or go $84/mo if you prefer",
    body: "$0 build today, then hosting, security, and care for $84/mo. Cancel anytime once live.",
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
            Free to try. Just $495 to keep.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink/60 sm:text-lg">
            See the demo first. When you claim, most people choose $495 once —
            one customer pays for the life of your website.
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
