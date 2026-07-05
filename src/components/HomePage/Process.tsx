"use client";

import React from "react";
import { motion } from "framer-motion";

const ease = [0.65, 0, 0.35, 1] as const;

const steps = [
  {
    title: "Kickoff",
    description:
      "Tell us what you sell, who you serve, and what action you want visitors to take.",
    duration: "Day 1",
  },
  {
    title: "Direction",
    description:
      "We shape the page flow, positioning, and content so the site has one clear job.",
    duration: "Days 1–2",
  },
  {
    title: "Build",
    description:
      "Your site is designed, built, optimized for mobile, and wired with lead capture.",
    duration: "Days 2–5",
  },
  {
    title: "Polish",
    description:
      "We review speed, responsiveness, forms, copy, and final details before launch.",
    duration: "Day 6",
  },
  {
    title: "Launch",
    description:
      "The site goes live on managed hosting and stays maintained under the $84/month plan.",
    duration: "Day 7",
  },
];

const Process = () => {
  return (
    <section
      id="process"
      className="w-full bg-paper px-5 py-24 sm:px-8 sm:py-32"
    >
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-16 grid gap-6 lg:grid-cols-[auto_1fr] lg:items-end lg:gap-16">
          <p className="text-[13px] font-medium uppercase tracking-[0.24em] text-ink/50">
            (03) — How it works
          </p>
          <h2 className="font-display display-tight max-w-3xl text-5xl font-medium text-ink sm:text-6xl lg:text-7xl">
            Idea to live site, without the{" "}
            <em className="font-light italic text-accent">agency circus</em>.
          </h2>
        </div>

        <div className="grid gap-px overflow-hidden rounded-3xl border border-ink/15 bg-ink/15 lg:grid-cols-5">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, ease, delay: index * 0.08 }}
              className="group flex min-h-[280px] flex-col justify-between bg-paper p-7 transition-colors duration-300 hover:bg-ink lg:min-h-[340px]"
            >
              <div className="flex items-start justify-between">
                <span className="font-display text-5xl font-light text-ink/25 transition-colors duration-300 group-hover:text-accent">
                  {index + 1}
                </span>
                <span className="rounded-full border border-ink/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink/50 transition-colors duration-300 group-hover:border-paper/25 group-hover:text-paper/60">
                  {step.duration}
                </span>
              </div>
              <div>
                <h3 className="font-display mb-3 text-2xl font-medium tracking-tight text-ink transition-colors duration-300 group-hover:text-paper">
                  {step.title}
                </h3>
                <p className="text-[15px] leading-6 text-ink/60 transition-colors duration-300 group-hover:text-paper/60">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Process;
