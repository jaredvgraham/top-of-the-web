"use client";

import { motion } from "framer-motion";
import PreviewLeadCaptureForm from "@/components/preview/PreviewLeadCaptureForm";

const ease = [0.65, 0, 0.35, 1] as const;

/**
 * Impulse conversion — same preview funnel as /preview, embedded on the homepage.
 */
export default function HomeStart() {
  return (
    <section
      id="start"
      className="relative scroll-mt-24 border-t border-ink/10 bg-paper px-5 py-16 sm:px-8 sm:py-24"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(700px 320px at 90% 0%, rgba(91,46,158,0.1), transparent), radial-gradient(560px 280px at 0% 40%, rgba(31,182,214,0.08), transparent)",
        }}
      />

      <div className="relative mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16 lg:items-start">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
            Free website demo
          </p>
          <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl lg:text-5xl">
            Start here — see your site before you pay.
          </h2>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-ink/60 sm:text-lg">
            Answer one question, leave your details, and we’ll email a private
            link. Paste your Facebook business Page and our AI-assisted builder
            drafts a custom demo. Like it? Claim it — we finish the real site.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-ink/65">
            {[
              "Built from your real Facebook photos and About",
              "Private demo — not published to Google",
              "Go live with a custom site in about 24 hours after you claim",
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.75, ease, delay: 0.08 }}
          className="border border-ink/10 bg-white/80 p-6 backdrop-blur sm:p-8"
        >
          <h3 className="font-display text-2xl font-medium tracking-tight text-ink">
            Start your free demo
          </h3>
          <p className="mt-2 text-sm text-ink/50">
            Same funnel as our ads — no checkout until you love the preview.
          </p>
          <div className="mt-8">
            <PreviewLeadCaptureForm />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
