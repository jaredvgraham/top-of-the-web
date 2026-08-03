"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const ease = [0.65, 0, 0.35, 1] as const;

const marqueeItems = [
  "AI website builder",
  "Website designer",
  "Free Facebook demo",
  "Just $495 once",
  "Hosting included",
  "1 customer pays for the life of your website",
  "Built for US businesses",
];

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-ink text-paper">
      {/* Full-bleed visual */}
      <div className="absolute inset-0">
        <Image
          src="/stock/working-together.jpg"
          alt="Designers collaborating on a custom business website"
          fill
          priority
          className="object-cover object-center opacity-[0.5] saturate-[0.35]"
          sizes="100vw"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(100deg, rgba(26,20,51,0.94) 0%, rgba(26,20,51,0.86) 38%, rgba(26,20,51,0.5) 68%, rgba(26,20,51,0.42) 100%), radial-gradient(ellipse 60% 55% at 82% 28%, rgba(122,72,206,0.28), transparent 60%), linear-gradient(180deg, rgba(26,20,51,0.5) 0%, transparent 30%, rgba(26,20,51,0.8) 100%)",
          }}
        />
      </div>

      <div className="relative mx-auto flex min-h-[100svh] max-w-[1400px] flex-col justify-between px-5 pb-10 pt-28 sm:px-8 sm:pt-32">
        {/* Context line */}
        <div className="flex items-start justify-end gap-6">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.1 }}
            className="text-right text-[11px] font-medium uppercase tracking-[0.28em] text-paper/65 sm:text-[12px]"
          >
            US local businesses
            <span className="mx-2 text-accentSoft">✺</span>
            Facebook demo
          </motion.p>
        </div>

        {/* Core statement */}
        <div className="my-auto max-w-5xl py-12 sm:py-16">
          {/* The keyword line lives inside the h1 so the heading carries the
              search terms while reading as a kicker above the statement. */}
          <h1 className="font-display display-tight text-[13vw] font-medium leading-[0.95] tracking-tight sm:text-[9vw] lg:text-[6.4rem] xl:text-[7rem]">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease, delay: 0.2 }}
              className="font-sans mb-8 block text-[11px] font-semibold uppercase leading-normal tracking-[0.28em] text-accentSoft sm:text-[12px]"
            >
              AI website builder &amp; website designer for US businesses
            </motion.span>
            <motion.span
              className="block"
              initial={{ opacity: 0, y: 44 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease, delay: 0.3 }}
            >
              Your business,
            </motion.span>
            <motion.span
              className="block"
              initial={{ opacity: 0, y: 44 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease, delay: 0.42 }}
            >
              designed like it{" "}
              <em className="font-light italic text-accentSoft">matters</em>.
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease, delay: 0.55 }}
            className="mt-8 max-w-[36rem] text-[17px] leading-8 text-paper/80 sm:text-lg sm:leading-9"
          >
            Free private demo from your Facebook page. Then go live for just
            $495 — custom site + hosting. One customer pays for the life of your
            website.
          </motion.p>
        </div>

        {/* Action row */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.68 }}
          className="flex flex-col gap-6 border-t border-paper/15 pt-8 lg:flex-row lg:items-end lg:justify-between"
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href="#start"
              className="inline-flex min-h-14 items-center justify-center rounded-full bg-accentSoft px-9 text-sm font-semibold uppercase tracking-[0.14em] text-ink transition hover:bg-paper"
            >
              See my free demo
            </a>
            <Link
              href="/contact"
              className="inline-flex min-h-14 items-center justify-center rounded-full border border-paper/30 px-9 text-sm font-semibold uppercase tracking-[0.14em] text-paper transition hover:border-paper hover:bg-paper hover:text-ink"
            >
              Contact us
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-6 text-sm sm:gap-10 lg:text-right">
            {[
              ["$495", "once · hosting in"],
              ["1 customer", "pays for life"],
              ["~24h", "after claim"],
            ].map(([value, label]) => (
              <div key={label}>
                <p className="font-display text-2xl font-medium text-paper sm:text-3xl">
                  {value}
                </p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-paper/60">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="relative border-t border-paper/10 bg-ink py-4 sm:py-5">
        <div className="flex w-max animate-marquee items-center gap-10 whitespace-nowrap pr-10">
          {[...marqueeItems, ...marqueeItems, ...marqueeItems, ...marqueeItems].map(
            (item, i) => (
              <React.Fragment key={`${item}-${i}`}>
                <span className="text-sm font-medium uppercase tracking-[0.22em] text-paper/90">
                  {item}
                </span>
                <span className="text-accentSoft">✺</span>
              </React.Fragment>
            )
          )}
        </div>
      </div>
    </section>
  );
}
