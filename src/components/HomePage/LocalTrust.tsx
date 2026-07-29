"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const ease = [0.65, 0, 0.35, 1] as const;

export default function LocalTrust() {
  return (
    <section
      id="local"
      className="scroll-mt-24 border-t border-ink/10 bg-paper px-5 py-16 sm:px-8 sm:py-20"
    >
      <div className="mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.65, ease }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink/45">
            Nationwide · US studio
          </p>
          <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
            Built for businesses across the United States.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-ink/60 sm:text-lg">
            Whether you’re in a big city or a small town, start your free demo
            online. We’re a real US studio you can call — based in Plymouth,
            Massachusetts — and we work with local businesses nationwide.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.65, ease, delay: 0.08 }}
          className="space-y-3 text-sm text-ink/70"
        >
          <p className="font-medium text-ink">Bsites</p>
          <p>75 Raymond Road, Plymouth, MA 02360</p>
          <p className="text-ink/45">Serving the United States</p>
          <a
            href="tel:+17813367274"
            className="block text-accent underline-offset-2 hover:underline"
          >
            +1 (781) 336-7274
          </a>
          <a
            href="mailto:bsitesioteam@gmail.com"
            className="block text-accent underline-offset-2 hover:underline"
          >
            bsitesioteam@gmail.com
          </a>
          <div className="flex flex-col gap-3 pt-4 sm:flex-row">
            <a
              href="#start"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-ink px-7 text-xs font-semibold uppercase tracking-[0.14em] text-paper"
            >
              Free demo
            </a>
            <Link
              href="/contact"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-ink/20 px-7 text-xs font-semibold uppercase tracking-[0.14em] text-ink"
            >
              Contact
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
