"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import type { SiteSpec } from "@/lib/preview/siteSpecSchema";
import { resolveBrandPalette } from "@/lib/preview/brandColors";
import { hasSection } from "./sectionUtils";

export function PreviewPhoneDisplay({ phone }: { phone?: string }) {
  if (!phone) return null;
  return <span>{phone}</span>;
}

export function PreviewEmailDisplay({ email }: { email?: string }) {
  if (!email) return null;
  return <span>{email}</span>;
}

/** Scale display type down when copy is long so mobile doesn't explode. */
export function fluidHeroClass(text: string) {
  const len = (text || "").trim().length;
  if (len > 90) return "text-[clamp(1.65rem,5.2vw,2.85rem)] leading-[1.08]";
  if (len > 60) return "text-[clamp(1.9rem,5.8vw,3.6rem)] leading-[1.05]";
  if (len > 36) return "text-[clamp(2.15rem,6.4vw,4.4rem)] leading-[1.03]";
  return "text-[clamp(2.45rem,7.2vw,5.2rem)] leading-[0.98]";
}

export function fluidSectionClass(text: string) {
  const len = (text || "").trim().length;
  if (len > 70) return "text-[clamp(1.55rem,4vw,2.4rem)] leading-[1.12]";
  if (len > 40) return "text-[clamp(1.75rem,4.5vw,2.85rem)] leading-[1.1]";
  return "text-[clamp(1.95rem,5vw,3.25rem)] leading-[1.08]";
}

export function fluidBodyClass(text: string) {
  const len = (text || "").trim().length;
  if (len > 900) return "text-[0.95rem] sm:text-base leading-relaxed";
  if (len > 450) return "text-base sm:text-[1.05rem] leading-relaxed";
  return "text-base sm:text-lg leading-relaxed";
}

export function DynamicHero({
  children,
  text,
  className = "",
}: {
  children: React.ReactNode;
  text: string;
  className?: string;
}) {
  return (
    <h1
      className={`font-display font-medium tracking-tight break-words ${fluidHeroClass(
        text
      )} ${className}`}
    >
      {children}
    </h1>
  );
}

export function DynamicSectionTitle({
  children,
  text,
  className = "",
  as: Tag = "h2",
}: {
  children: React.ReactNode;
  text: string;
  className?: string;
  as?: "h2" | "h3";
}) {
  return (
    <Tag
      className={`font-display font-medium tracking-tight break-words ${fluidSectionClass(
        text
      )} ${className}`}
    >
      {children}
    </Tag>
  );
}

export function DynamicBody({
  children,
  text,
  className = "",
  style,
}: {
  children: React.ReactNode;
  text: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <p
      className={`whitespace-pre-line break-words ${fluidBodyClass(
        text
      )} ${className}`}
      style={style}
    >
      {children}
    </p>
  );
}

/** Disabled preview-only quote form — never submits. */
export function PreviewContactForm({
  primaryColor,
  accentColor,
  secondaryColor,
  accentFg,
}: {
  primaryColor: string;
  accentColor: string;
  secondaryColor?: string;
  accentFg?: string;
}) {
  const surface = secondaryColor || "#fff";
  const label = accentFg || "#fff";
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <p
        className="rounded-xl px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.16em]"
        style={{
          backgroundColor: `${accentColor}14`,
          color: primaryColor,
          border: `1px solid ${accentColor}33`,
        }}
      >
        Not functional in demo preview
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <input
          disabled
          placeholder="Your name"
          className="w-full rounded-none border-b bg-transparent px-0 py-3 text-sm opacity-70 outline-none"
          style={{ borderColor: `${primaryColor}33`, color: primaryColor }}
        />
        <input
          disabled
          placeholder="Phone"
          className="w-full rounded-none border-b bg-transparent px-0 py-3 text-sm opacity-70 outline-none"
          style={{ borderColor: `${primaryColor}33`, color: primaryColor }}
        />
      </div>
      <input
        disabled
        placeholder="Email"
        className="w-full rounded-none border-b bg-transparent px-0 py-3 text-sm opacity-70 outline-none"
        style={{ borderColor: `${primaryColor}33`, color: primaryColor }}
      />
      <input
        disabled
        placeholder="Service needed"
        className="w-full rounded-none border-b bg-transparent px-0 py-3 text-sm opacity-70 outline-none"
        style={{ borderColor: `${primaryColor}33`, color: primaryColor }}
      />
      <textarea
        disabled
        placeholder="Project details / what do you need done?"
        rows={4}
        className="w-full rounded-none border-b bg-transparent px-0 py-3 text-sm opacity-70 outline-none"
        style={{
          borderColor: `${primaryColor}33`,
          color: primaryColor,
          background: surface,
        }}
      />
      <button
        type="button"
        disabled
        className="w-full px-8 py-4 text-[12px] font-semibold uppercase tracking-[0.18em] opacity-70 sm:w-auto"
        style={{ backgroundColor: accentColor || primaryColor, color: label }}
      >
        Request a free quote
      </button>
    </form>
  );
}

export function PreviewNav({
  site,
  tone = "dark",
  basePath,
}: {
  site: SiteSpec;
  tone?: "dark" | "light";
  basePath?: string;
}) {
  const [open, setOpen] = useState(false);
  const root = basePath?.replace(/\/$/, "") || "";
  const palette = resolveBrandPalette(site.branding);

  const links: { href: string; label: string }[] = [
    { href: root ? `${root}/services` : "#services", label: "Services" },
    { href: root ? `${root}/about` : "#about", label: "About" },
  ];
  if (!root && hasSection(site, "beforeAfter")) {
    links.push({ href: "#before-after", label: "Before & After" });
  }
  if (!root && hasSection(site, "gallery")) {
    links.push({ href: "#gallery", label: "Work" });
  }
  if (!root && hasSection(site, "testimonials")) {
    links.push({ href: "#testimonials", label: "Reviews" });
  }
  links.push({
    href: root ? `${root}#contact` : "#contact",
    label: "Contact",
  });

  const color = tone === "light" ? "#fff" : palette.ink;
  const muted = tone === "light" ? "text-white/70" : "";
  const homeHref = root || "#";

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [basePath]);

  return (
    <header className="relative z-30 w-full">
      <div className="mx-auto flex w-full max-w-6xl min-w-0 items-center justify-between gap-3 px-4 py-5 sm:gap-4 sm:px-8 sm:py-6">
        <Link href={homeHref} className="flex min-w-0 items-center gap-2 sm:gap-3">
          {site.branding.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={site.branding.logoUrl}
              alt=""
              className="h-9 w-auto max-w-[120px] object-contain sm:h-11 sm:max-w-[150px]"
            />
          ) : null}
          <span
            className="truncate font-display text-lg font-medium tracking-tight sm:text-xl"
            style={{ color }}
          >
            {site.business.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${muted} transition hover:opacity-100`}
              style={{ color }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={root ? `${root}#contact` : "#contact"}
            className="hidden px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] sm:inline-flex sm:text-[11px]"
            style={{ backgroundColor: palette.accent, color: palette.accentFg }}
          >
            {site.content.primaryCta.split(" ").slice(0, 2).join(" ")}
          </Link>

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="relative z-[80] flex h-11 w-11 items-center justify-center md:hidden"
            onClick={() => setOpen((v) => !v)}
            style={{ color }}
          >
            <span className="sr-only">Menu</span>
            <span className="relative block h-4 w-5">
              <span
                className={`absolute left-0 top-0 block h-[1.5px] w-full transition ${
                  open ? "translate-y-[7px] rotate-45" : ""
                }`}
                style={{ backgroundColor: open ? palette.ink : color }}
              />
              <span
                className={`absolute left-0 top-[7px] block h-[1.5px] w-full transition ${
                  open ? "opacity-0" : ""
                }`}
                style={{ backgroundColor: open ? palette.ink : color }}
              />
              <span
                className={`absolute left-0 top-[14px] block h-[1.5px] w-full transition ${
                  open ? "-translate-y-[7px] -rotate-45" : ""
                }`}
                style={{ backgroundColor: open ? palette.ink : color }}
              />
            </span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-[70] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/45"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            />
            <motion.nav
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="absolute inset-y-0 right-0 flex w-[min(100%,22rem)] flex-col px-6 pb-10 pt-24"
              style={{ backgroundColor: palette.paper, color: palette.ink }}
            >
              <div className="flex flex-col gap-1">
                {links.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.04 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="block border-b py-4 font-display text-3xl font-medium tracking-tight"
                      style={{ borderColor: `${palette.ink}14` }}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </div>
              <Link
                href={root ? `${root}#contact` : "#contact"}
                onClick={() => setOpen(false)}
                className="mt-8 inline-flex items-center justify-center px-6 py-4 text-[12px] font-semibold uppercase tracking-[0.16em]"
                style={{
                  backgroundColor: palette.accent,
                  color: palette.accentFg,
                }}
              >
                {site.content.primaryCta}
              </Link>
            </motion.nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

export type GalleryPairDisplay = {
  beforeUrl: string;
  afterUrl: string;
  caption?: string;
};

export function BeforeAfterSection({
  pairs,
  accent,
  muted,
  paper,
}: {
  pairs: GalleryPairDisplay[];
  accent: string;
  muted: string;
  paper?: string;
}) {
  const pairList = (pairs || []).filter((p) => p.beforeUrl && p.afterUrl);
  if (!pairList.length) return null;

  return (
    <SectionShell
      id="before-after"
      className="mx-auto max-w-6xl px-4 py-20 sm:px-8 sm:py-28"
    >
      <FadeIn className="mb-10 max-w-2xl sm:mb-14">
        <BrandEyebrow color={accent}>Results</BrandEyebrow>
        <DynamicSectionTitle text="Before & after" className="mt-3">
          Before &amp; after
        </DynamicSectionTitle>
        <p className="mt-4 text-base leading-relaxed" style={{ color: muted }}>
          Real jobs — same angle, same surface, cleaned up.
        </p>
      </FadeIn>
      <div className="space-y-10">
        {pairList.map((pair, i) => (
          <motion.div
            key={`${pair.beforeUrl}-${pair.afterUrl}-${i}`}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: i * 0.04 }}
            className="space-y-3"
          >
            {pair.caption ? (
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.16em]"
                style={{ color: accent }}
              >
                {pair.caption}
              </p>
            ) : null}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div
                className="relative aspect-[4/3] overflow-hidden"
                style={{ backgroundColor: paper || "#f3f3f3" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={pair.beforeUrl}
                  alt="Before"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <span className="absolute left-3 top-3 bg-black/75 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white">
                  Before
                </span>
              </div>
              <div
                className="relative aspect-[4/3] overflow-hidden"
                style={{ boxShadow: `inset 0 0 0 1px ${accent}55` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={pair.afterUrl}
                  alt="After"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <span
                  className="absolute left-3 top-3 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white"
                  style={{ backgroundColor: accent }}
                >
                  After
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}

export function GalleryGrid({
  images,
  accent,
  tertiary,
}: {
  images: string[];
  accent: string;
  tertiary?: string;
}) {
  const list = images.slice(0, 16);
  if (!list.length) return null;

  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
      {list.map((src, i) => {
        const featured = i === 0 || i === 3;
        return (
          <motion.div
            key={`${src}-${i}`}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: i * 0.04 }}
            className={`relative overflow-hidden bg-black/5 ${
              featured
                ? "aspect-[4/3] md:col-span-2 md:row-span-2 md:aspect-auto md:min-h-[340px]"
                : "aspect-[4/3]"
            }`}
            style={{
              boxShadow:
                i === 0
                  ? `inset 0 0 0 1px ${accent}55`
                  : tertiary
                    ? `inset 0 0 0 1px ${tertiary}22`
                    : undefined,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              className="h-full w-full object-cover transition duration-700 hover:scale-[1.03]"
              loading="lazy"
            />
          </motion.div>
        );
      })}
    </div>
  );
}

export function SectionShell({
  id,
  children,
  className = "",
  style,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <section id={id} className={`scroll-mt-24 ${className}`} style={style}>
      {children}
    </section>
  );
}

export function FadeIn({
  children,
  className = "",
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function BrandEyebrow({
  children,
  color,
}: {
  children: React.ReactNode;
  color: string;
}) {
  return (
    <p
      className="text-[11px] font-semibold uppercase tracking-[0.24em]"
      style={{ color }}
    >
      {children}
    </p>
  );
}

export function PreviewFooter({ site }: { site: SiteSpec }) {
  const palette = resolveBrandPalette(site.branding);
  return (
    <footer
      className="px-5 py-10 text-center text-xs sm:px-8"
      style={{
        borderTop: `1px solid ${palette.ink}14`,
        color: palette.muted,
        backgroundColor: palette.paper,
      }}
    >
      © {new Date().getFullYear()} {site.business.name}. Auto-generated demo by
      Bsites — your real site is custom-built by a person.
    </footer>
  );
}

export function usePreviewPalette(site: SiteSpec) {
  return resolveBrandPalette(site.branding);
}
