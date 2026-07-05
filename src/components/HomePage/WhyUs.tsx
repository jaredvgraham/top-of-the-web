"use client";

import React from "react";
import { motion } from "framer-motion";

const ease = [0.65, 0, 0.35, 1] as const;

const benefits = [
  {
    number: "01",
    title: "No upfront build cost",
    copy: "Skip the $3k–$10k agency bill. Your custom site is designed and built for $0, supported by one flat monthly plan.",
  },
  {
    number: "02",
    title: "Built to look premium",
    copy: "Modern layout, confident type, and content that makes your business feel established from the first scroll.",
  },
  {
    number: "03",
    title: "Launch without drag",
    copy: "A focused process keeps the project moving: offer, content, design, build, launch. No bloated agency timeline.",
  },
  {
    number: "04",
    title: "Never left alone",
    copy: "Hosting, SSL, content updates, security patches, and support stay with Bsites long after the site goes live.",
  },
];

const WhyUs = () => {
  return (
    <section className="grain relative w-full overflow-hidden bg-ink px-5 py-24 text-paper sm:px-8 sm:py-32">
      <div className="relative mx-auto max-w-[1400px]">
        <div className="mb-20 grid gap-6 lg:grid-cols-[auto_1fr] lg:items-end lg:gap-16">
          <p className="text-[13px] font-medium uppercase tracking-[0.24em] text-paper/50">
            (02) — Why it works
          </p>
          <h2 className="font-display display-tight max-w-3xl text-5xl font-medium sm:text-6xl lg:text-7xl">
            The offer removes the{" "}
            <em className="font-light italic text-accent">hard part</em>.
          </h2>
        </div>

        <div className="grid gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease }}
          >
            <p className="max-w-md text-lg leading-8 text-paper/70">
              Most businesses delay their website because the quote is too
              high, the process is too vague, or no one wants to maintain it
              afterward. Bsites fixes all three.
            </p>

            <div className="mt-12 border-t border-paper/20 pt-10">
              <p className="font-display text-[6rem] font-medium leading-none tracking-tight text-paper sm:text-[8rem]">
                $84
                <span className="font-light italic text-accent">/mo</span>
              </p>
              <p className="mt-6 max-w-sm text-[13px] uppercase leading-6 tracking-[0.18em] text-paper/60">
                Hosting · maintenance · SSL · uptime · basic updates — all
                included
              </p>
            </div>
          </motion.div>

          <div>
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.number}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.7, ease, delay: index * 0.06 }}
                className={`grid gap-3 py-8 sm:grid-cols-[64px_220px_1fr] sm:gap-8 ${
                  index > 0 ? "border-t border-paper/15" : ""
                }`}
              >
                <span className="font-display text-lg text-accent">
                  {benefit.number}
                </span>
                <h3 className="font-display text-2xl font-medium tracking-tight">
                  {benefit.title}
                </h3>
                <p className="leading-7 text-paper/60">{benefit.copy}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyUs;
