"use client";

import React from "react";
import Image from "next/image";
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

        {/* Behind the scenes */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease }}
          className="mt-16 grid gap-6 lg:grid-cols-[1.4fr_1fr]"
        >
          <div className="relative overflow-hidden rounded-3xl">
            <Image
              src="/stock/laptop-discussion.jpg"
              alt="Team discussing a client project in the studio"
              width={1600}
              height={1200}
              className="h-[300px] w-full object-cover sm:h-[400px]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
            <p className="absolute bottom-5 left-5 text-[12px] font-medium uppercase tracking-[0.2em] text-paper/90 sm:bottom-7 sm:left-7">
              Behind the scenes — every project gets talked through
            </p>
          </div>
          <div className="flex flex-col justify-between rounded-3xl bg-ink p-8 text-paper sm:p-10">
            <p className="text-[13px] font-medium uppercase tracking-[0.24em] text-paper/50">
              Who you&apos;re working with
            </p>
            <div>
              <p className="font-display mt-8 text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
                You talk to the people who actually{" "}
                <em className="font-light italic text-accent">
                  design and build
                </em>{" "}
                your site.
              </p>
              <p className="mt-6 leading-7 text-paper/60">
                No account managers, no ticket queues. Questions during your
                build get answered by the person with your project open on
                their screen.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Process;
