"use client";

import React from "react";
import { motion } from "framer-motion";

const ease = [0.65, 0, 0.35, 1] as const;

const services = [
  {
    title: "Custom Design",
    description:
      "A sharp, modern site designed around your brand, your offer, and the customer you actually want.",
    tag: "No templates",
  },
  {
    title: "Mobile-First Build",
    description:
      "Pages look clean and load fast on the phones your customers are actually holding.",
    tag: "Every screen",
  },
  {
    title: "Conversion Copy",
    description:
      "Clear headlines, benefit-driven sections, and calls to action built to turn visits into leads.",
    tag: "Words that sell",
  },
  {
    title: "Fast Launch",
    description:
      "Most sites go from kickoff to live in about a week once your content is ready.",
    tag: "~7 days",
  },
  {
    title: "Hosting & Security",
    description:
      "Hosting, SSL, updates, backups, and technical upkeep — handled for you, permanently.",
    tag: "Fully managed",
  },
  {
    title: "Simple Monthly Care",
    description:
      "No big upfront invoice. One predictable $84/month plan keeps the site online and current.",
    tag: "$84/mo",
  },
];

const Services = () => {
  return (
    <section id="offer" className="w-full bg-paper px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-16 grid gap-6 lg:grid-cols-[auto_1fr] lg:items-end lg:gap-16">
          <p className="text-[13px] font-medium uppercase tracking-[0.24em] text-ink/50">
            (01) — What you get
          </p>
          <h2 className="font-display display-tight max-w-3xl text-5xl font-medium text-ink sm:text-6xl lg:text-7xl">
            A real website, not a rented{" "}
            <em className="font-light italic text-accent">template</em>.
          </h2>
        </div>

        <div className="rule" />
        {services.map((service, index) => (
          <motion.div
            key={service.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease, delay: (index % 2) * 0.08 }}
            className="group border-b border-ink/15"
          >
            <div className="grid items-baseline gap-3 py-8 transition-colors duration-300 sm:grid-cols-[80px_1fr_1.2fr_auto] sm:gap-8 sm:py-10">
              <span className="font-display text-lg text-ink/40 transition-colors duration-300 group-hover:text-accent">
                0{index + 1}
              </span>
              <h3 className="font-display text-3xl font-medium tracking-tight text-ink transition-transform duration-300 group-hover:translate-x-2 sm:text-4xl">
                {service.title}
              </h3>
              <p className="max-w-md leading-7 text-ink/60">
                {service.description}
              </p>
              <span className="hidden rounded-full border border-ink/20 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/60 transition-colors duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-paper lg:inline-block">
                {service.tag}
              </span>
            </div>
          </motion.div>
        ))}

        <p className="mt-10 max-w-2xl text-lg leading-8 text-ink/60">
          The build is free because the relationship is ongoing — you get the
          launch, the tech stack, and the upkeep in one clean offer.
        </p>
      </div>
    </section>
  );
};

export default Services;
