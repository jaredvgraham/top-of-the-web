"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const ease = [0.65, 0, 0.35, 1] as const;

const steps = [
  {
    title: "We read it personally",
    copy: "A real reply from us, usually within one business day — not an autoresponder sequence.",
  },
  {
    title: "We confirm the scope",
    copy: "Pages, content, and lead capture — mapped and agreed before anything gets built.",
  },
  {
    title: "We build and launch",
    copy: "Standard sites go live about 24 hours after you approve. Larger custom builds get a scheduled timeline.",
  },
];

const ContactCard = () => {
  return (
    <motion.section
      id="contact"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease }}
      className="mt-24 border-t border-ink/10 pt-14"
    >
      <h2 className="font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
        What happens next
      </h2>

      <div className="mt-10 grid gap-px overflow-hidden rounded-3xl border border-ink/10 bg-ink/10 sm:grid-cols-3">
        {steps.map((step, index) => (
          <div key={step.title} className="min-w-0 bg-paper p-7 sm:p-8">
            <span className="font-display text-lg text-accent">
              0{index + 1}
            </span>
            <h3 className="font-display mt-4 text-xl font-medium tracking-tight text-ink">
              {step.title}
            </h3>
            <p className="mt-2 leading-7 text-ink/60">{step.copy}</p>
          </div>
        ))}
      </div>

      <div className="relative mt-10 overflow-hidden rounded-3xl">
        <Image
          src="/stock/client-meeting.jpg"
          alt="A client and designer celebrating a successful website launch"
          width={1600}
          height={1067}
          className="h-[240px] w-full object-cover sm:h-[360px]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
        <p className="absolute bottom-5 left-5 max-w-sm text-[12px] font-medium uppercase leading-5 tracking-[0.2em] text-paper/90 sm:bottom-7 sm:left-7">
          A real conversation, not a sales funnel — we reply personally
        </p>
      </div>
    </motion.section>
  );
};

export default ContactCard;
