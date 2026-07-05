"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import CheckoutButton from "@/components/checkout/CheckoutButton";

const navLinks = [
  { href: "/#offer", label: "Offer" },
  { href: "/#process", label: "Process" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const isAdminPage = pathname.includes("/admin");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  if (isAdminPage) return null;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ${
          isMenuOpen
            ? "border-transparent bg-transparent"
            : scrolled
            ? "border-ink/10 bg-paper/90 backdrop-blur-md"
            : "border-transparent bg-transparent"
        }`}
      >
        <nav className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-4 sm:px-8">
          <Link
            href="/"
            className={`font-display text-2xl font-semibold tracking-tight transition-colors ${
              isMenuOpen ? "text-paper" : "text-ink"
            }`}
          >
            Bsites<span className="text-accent">.io</span>
          </Link>

          <div className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="link-underline text-[13px] font-medium uppercase tracking-[0.18em] text-ink/70 transition-colors hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
            <CheckoutButton className="group relative overflow-hidden rounded-full bg-ink px-6 py-3 text-[13px] font-semibold uppercase tracking-[0.14em] text-paper">
              <span className="absolute inset-0 translate-y-full bg-accent transition-transform duration-300 ease-out group-hover:translate-y-0" />
              <span className="relative">Start Checkout</span>
            </CheckoutButton>
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`flex h-11 w-11 flex-col items-center justify-center gap-[5px] rounded-full border transition-colors lg:hidden ${
              isMenuOpen ? "border-paper/25" : "border-ink/15"
            }`}
            aria-label="Toggle navigation menu"
          >
            <span
              className={`h-[1.5px] w-5 transition-all duration-300 ${
                isMenuOpen
                  ? "translate-y-[3.25px] rotate-45 bg-paper"
                  : "bg-ink"
              }`}
            />
            <span
              className={`h-[1.5px] w-5 transition-all duration-300 ${
                isMenuOpen
                  ? "-translate-y-[3.25px] -rotate-45 bg-paper"
                  : "bg-ink"
              }`}
            />
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col justify-between bg-ink px-6 pb-10 pt-28 text-paper lg:hidden"
            initial={{ opacity: 0, y: "-4%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "-4%" }}
            transition={{ duration: 0.35, ease: [0.65, 0, 0.35, 1] }}
          >
            <ul className="space-y-2">
              {navLinks.map((link, index) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 * index + 0.1, duration: 0.4 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="font-display block py-3 text-5xl font-medium tracking-tight transition-colors hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.4 }}
              className="space-y-4"
            >
              <CheckoutButton
                label="Start Checkout — $84/mo"
                className="block w-full rounded-full bg-accent px-6 py-5 text-center text-sm font-semibold uppercase tracking-[0.18em] text-paper"
              />
              <Link
                href="/contact"
                onClick={() => setIsMenuOpen(false)}
                className="block rounded-full border border-paper/40 px-6 py-5 text-center text-sm font-semibold uppercase tracking-[0.18em] text-paper transition-colors hover:bg-paper hover:text-ink"
              >
                Contact Us
              </Link>
              <p className="text-center text-xs uppercase tracking-[0.2em] text-paper/50">
                Checkout to subscribe · Contact for questions
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
