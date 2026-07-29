"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const ease = [0.65, 0, 0.35, 1] as const;

const audiences = [
  {
    title: "US local businesses",
    body: "Contractors, salons, clinics, shops across America — if your best proof lives on Facebook, we’ll turn it into a site that converts.",
  },
  {
    title: "Website builder shoppers",
    body: "Tired of dragging Wix blocks? Get a guided demo instead of starting from zero in a DIY builder.",
  },
  {
    title: "AI website generator seekers",
    body: "Want AI speed without a generic template smell. We draft from your real Page, then a human finishes the live site.",
  },
];

export default function WhoItsFor() {
  return (
    <section className="border-t border-ink/10 bg-ink px-5 py-16 text-paper sm:px-8 sm:py-24">
      <div className="mx-auto max-w-[1400px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.65, ease }}
          className="max-w-2xl"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
            Who it’s for
          </p>
          <h2 className="mt-3 font-display text-3xl font-medium tracking-tight sm:text-4xl">
            Built for US businesses hunting builders, designers, and AI
            generators.
          </h2>
        </motion.div>

        <div className="mt-12 grid gap-10 md:grid-cols-3">
          {audiences.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, ease, delay: i * 0.07 }}
            >
              <h3 className="font-display text-xl font-medium">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-paper/60">
                {item.body}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:items-center">
          <a
            href="#start"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-8 text-sm font-semibold uppercase tracking-[0.14em] text-paper"
          >
            See my free demo
          </a>
          <Link
            href="/contact"
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-paper/30 px-8 text-sm font-semibold uppercase tracking-[0.14em] text-paper transition hover:bg-paper/10"
          >
            Talk to a human
          </Link>
        </div>
      </div>
    </section>
  );
}
