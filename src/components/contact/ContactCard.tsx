"use client";

import React from "react";
import { motion } from "framer-motion";

const ease = [0.65, 0, 0.35, 1] as const;

const steps = [
  {
    title: "We review your business",
    copy: "Your offer, your customers, and what the site needs to accomplish.",
  },
  {
    title: "We confirm the scope",
    copy: "Pages, content, and lead capture — mapped before anything is built.",
  },
  {
    title: "We launch in about a week",
    copy: "Design, build, polish, and go live on managed hosting.",
  },
];

const ContactCard = () => {
  return (
    <motion.div
      id="contact"
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease, delay: 0.1 }}
    >
      <h2 className="font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
        What happens next?
      </h2>

      <div className="mt-10">
        {steps.map((step, index) => (
          <div
            key={step.title}
            className={`grid grid-cols-[48px_1fr] gap-4 py-6 ${
              index > 0 ? "border-t border-ink/10" : ""
            }`}
          >
            <span className="font-display text-lg text-accent">
              0{index + 1}
            </span>
            <div>
              <h3 className="font-display text-xl font-medium tracking-tight text-ink">
                {step.title}
              </h3>
              <p className="mt-2 leading-7 text-ink/60">{step.copy}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-3xl bg-ink p-8 text-paper">
        <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-paper/50">
          Prefer to talk first?
        </p>
        <a
          href="tel:+17813367274"
          className="link-underline mt-5 block w-fit font-display text-2xl font-medium tracking-tight hover:text-accent"
        >
          (781) 336-7274
        </a>
        <a
          href="mailto:bsitesioteam@gmail.com"
          className="link-underline mt-3 block w-fit text-lg text-paper/80 hover:text-paper"
        >
          bsitesioteam@gmail.com
        </a>
        <p className="mt-6 border-t border-paper/15 pt-5 text-sm text-paper/50">
          Plymouth, Massachusetts — replies usually within one business day.
        </p>
      </div>
    </motion.div>
  );
};

export default ContactCard;
