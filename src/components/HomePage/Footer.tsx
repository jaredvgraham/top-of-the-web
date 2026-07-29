"use client";

import React from "react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="grain relative w-full overflow-hidden bg-ink px-5 pb-10 pt-20 text-paper sm:px-8">
      <div className="relative mx-auto max-w-[1400px]">
        <div className="grid gap-12 pb-20 md:grid-cols-[1.2fr_0.6fr_0.8fr]">
          <div>
            <Link
              href="/"
              className="font-display text-3xl font-semibold tracking-tight"
            >
              Bsites<span className="text-accent">.io</span>
            </Link>
            <p className="mt-5 max-w-sm leading-7 text-paper/60">
              AI website builder and designer for US local businesses. Free demo
              from your Facebook page — $0 build, $84/mo care.
            </p>
          </div>

          <div>
            <h3 className="mb-5 text-[12px] font-semibold uppercase tracking-[0.24em] text-paper/40">
              Site
            </h3>
            <ul className="space-y-3 text-[15px] font-medium">
              {[
                ["Home", "/"],
                ["Free demo", "/#start"],
                ["How it works", "/#how"],
                ["Offer", "/#offer"],
                ["Pricing", "/pricing"],
                ["Contact", "/contact"],
                ["Privacy Policy", "/privacy"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="link-underline text-paper/80 transition-colors hover:text-paper"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-5 text-[12px] font-semibold uppercase tracking-[0.24em] text-paper/40">
              Get started
            </h3>
            <p className="text-[15px] text-paper/60">
              US-wide · Studio in Plymouth, MA
            </p>
            <a
              href="mailto:bsitesioteam@gmail.com"
              className="link-underline mt-3 block w-fit text-[15px] font-medium text-paper/80 hover:text-paper"
            >
              bsitesioteam@gmail.com
            </a>
            <a
              href="tel:+17813367274"
              className="link-underline mt-3 block w-fit text-[15px] font-medium text-paper/80 hover:text-paper"
            >
              +1 (781) 336-7274
            </a>
            <div className="mt-8 space-y-3">
              <Link
                href="/#start"
                className="block w-full rounded-full bg-accent px-7 py-4 text-center text-[12px] font-semibold uppercase tracking-[0.18em] text-paper transition-colors hover:bg-accent/90"
              >
                See my free demo
              </Link>
              <Link
                href="/contact"
                className="block w-full rounded-full border border-paper/30 px-7 py-4 text-center text-[12px] font-semibold uppercase tracking-[0.18em] text-paper transition-colors duration-300 hover:border-paper hover:bg-paper/10"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>

        <div
          aria-hidden
          className="font-display display-tight pointer-events-none select-none whitespace-nowrap text-center text-[19vw] font-medium leading-[0.8] text-paper/[0.07]"
        >
          Bsites.io
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-paper/15 pt-6 text-[13px] text-paper/40 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Bsites.io — All rights reserved.</p>
          <p className="uppercase tracking-[0.2em]">
            Free demo · $0 build · $84/mo
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
