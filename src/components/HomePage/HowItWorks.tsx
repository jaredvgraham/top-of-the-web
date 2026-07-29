"use client";

import { motion } from "framer-motion";

const ease = [0.65, 0, 0.35, 1] as const;

const steps = [
  {
    n: "01",
    title: "Start from Facebook",
    body: "Tell us you have a business Page. We email a private link so you can paste the URL and kick off your demo.",
  },
  {
    n: "02",
    title: "AI drafts your site",
    body: "Our builder pulls photos, copy, and services from your Page into a custom layout — faster than a traditional website designer kickoff.",
  },
  {
    n: "03",
    title: "Claim and go live",
    body: "Like the demo? Claim it for $0 build. We polish and launch while you pay $84/mo for hosting, security, and care.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how"
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
            How it works
          </p>
          <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
            Website builder speed. Designer finish.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink/60 sm:text-lg">
            Skip the blank canvas and the agency proposal. Bsites is built for
            people comparing AI website generators and local web designers who
            still want something that looks custom.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, ease, delay: i * 0.08 }}
              className="border-t border-ink/15 pt-6"
            >
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
                {step.n}
              </p>
              <h3 className="mt-3 font-display text-2xl font-medium text-ink">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink/60">
                {step.body}
              </p>
            </motion.div>
          ))}
        </div>

        <p className="mt-10">
          <a
            href="#start"
            className="text-sm font-semibold uppercase tracking-[0.14em] text-accent underline-offset-4 hover:underline"
          >
            Start your free demo
          </a>
        </p>
      </div>
    </section>
  );
}
