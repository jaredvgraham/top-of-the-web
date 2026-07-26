"use client";

import React from "react";
import Link from "next/link";
import {
  BeforeAfterSection,
  BrandEyebrow,
  DynamicBody,
  DynamicHero,
  DynamicSectionTitle,
  FadeIn,
  GalleryGrid,
  PreviewContactForm,
  PreviewEmailDisplay,
  PreviewFooter,
  PreviewNav,
  PreviewPhoneDisplay,
  SectionShell,
  usePreviewPalette,
} from "./shared";
import { hasSection, type TemplateProps } from "./sectionUtils";

export default function ProfessionalTemplate({ site, basePath }: TemplateProps) {
  const { branding, content, business, assets } = site;
  const p = usePreviewPalette(site);
  const root = (basePath || "").replace(/\/$/, "");
  const hero = assets.heroImage;

  return (
    <div
      className="w-full max-w-[100vw] overflow-x-hidden"
      style={{ backgroundColor: p.surface, color: p.ink }}
    >
      <div
        className="relative min-h-[90vh] overflow-hidden"
        style={{
          background: hero
            ? `linear-gradient(120deg, rgba(0,0,0,.7) 0%, rgba(0,0,0,.5) 45%, rgba(0,0,0,.4) 100%), linear-gradient(120deg, ${p.band}aa 0%, ${p.band}66 55%, transparent 100%), url(${hero}) center/cover`
            : `linear-gradient(160deg, ${p.paper} 0%, ${p.surface} 45%, ${p.paper} 100%)`,
        }}
      >
        <PreviewNav
          site={site}
          tone={hero ? "light" : "dark"}
          basePath={root || undefined}
        />
        <div className="mx-auto flex min-h-[calc(90vh-88px)] max-w-6xl flex-col justify-center px-4 pb-16 pt-10 sm:px-8 sm:pb-20">
          <FadeIn className={`max-w-3xl ${hero ? "text-white" : ""}`}>
            {branding.logoUrl && !hero ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={branding.logoUrl}
                alt=""
                className="mb-8 h-14 w-auto object-contain"
              />
            ) : null}
            <BrandEyebrow color={hero ? "rgba(255,255,255,0.7)" : p.accent}>
              {content.trustLine || business.tagline || "Professional services"}
            </BrandEyebrow>
            <DynamicHero text={content.heroHeadline} className="mt-5">
              {content.heroHeadline}
            </DynamicHero>
            {content.heroSubheadline ? (
              <p
                className={`mt-6 max-w-xl text-base leading-relaxed sm:text-lg md:text-xl ${
                  hero ? "text-white/85" : ""
                }`}
                style={hero ? undefined : { color: p.muted }}
              >
                {content.heroSubheadline}
              </p>
            ) : null}
            <div className="mt-10 flex flex-wrap gap-3">
              <a
                href="#contact"
                className="px-7 py-3.5 text-[12px] font-semibold uppercase tracking-[0.16em]"
                style={{ backgroundColor: p.accent, color: p.accentFg }}
              >
                {content.primaryCta}
              </a>
              {business.phone ? (
                <span
                  className="border px-5 py-3.5 text-[12px] font-semibold uppercase tracking-[0.12em]"
                  style={
                    hero
                      ? { borderColor: "rgba(255,255,255,0.35)", color: "#fff" }
                      : { borderColor: `${p.ink}28`, color: p.ink }
                  }
                >
                  <PreviewPhoneDisplay phone={business.phone} />
                </span>
              ) : null}
            </div>
          </FadeIn>
        </div>
      </div>

      {hasSection(site, "services") ? (
        <SectionShell id="services" className="mx-auto max-w-6xl px-4 py-20 sm:px-8 sm:py-28">
          <FadeIn className="max-w-2xl">
            <BrandEyebrow color={p.accent}>Capabilities</BrandEyebrow>
            <DynamicSectionTitle text={content.servicesHeadline} className="mt-4">
              {content.servicesHeadline}
            </DynamicSectionTitle>
            {content.servicesSubheadline ? (
              <p className="mt-4" style={{ color: p.muted }}>
                {content.servicesSubheadline}
              </p>
            ) : null}
          </FadeIn>
          <div className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {content.services.slice(0, 6).map((service, index) => (
              <FadeIn key={`${service.name}-${index}`} delay={index * 0.04}>
                <div
                  className="mb-5 h-1 w-12"
                  style={{
                    backgroundColor: index % 2 === 0 ? p.accent : p.tertiary,
                  }}
                />
                <DynamicSectionTitle as="h3" text={service.name}>
                  {service.name}
                </DynamicSectionTitle>
                {service.description ? (
                  <DynamicBody
                    text={service.description}
                    className="mt-3"
                    style={{ color: p.muted }}
                  >
                    {service.description}
                  </DynamicBody>
                ) : null}
              </FadeIn>
            ))}
          </div>
          {root ? (
            <FadeIn className="mt-12">
              <Link
                href={`${root}/services`}
                className="inline-flex text-[12px] font-semibold uppercase tracking-[0.18em]"
                style={{ color: p.accent }}
              >
                View full services →
              </Link>
            </FadeIn>
          ) : null}
        </SectionShell>
      ) : null}

      {hasSection(site, "about") ? (
        <SectionShell id="about" style={{ backgroundColor: p.paper }}>
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:gap-12 sm:px-8 sm:py-28 lg:grid-cols-2 lg:items-center">
            <FadeIn className="min-w-0">
              <BrandEyebrow color={p.accent}>{content.about.headline}</BrandEyebrow>
              <DynamicSectionTitle
                text="A practice built on clarity"
                className="mt-4"
              >
                A practice built on clarity
              </DynamicSectionTitle>
              <DynamicBody
                text={content.about.body}
                className="mt-6"
                style={{ color: p.muted }}
              >
                {content.about.body}
              </DynamicBody>
              {business.serviceAreas.length ? (
                <p
                  className="mt-8 text-[11px] font-semibold uppercase tracking-[0.2em]"
                  style={{ color: p.muted }}
                >
                  {business.serviceAreas.join(" · ")}
                </p>
              ) : null}
            </FadeIn>
            {assets.aboutImage ? (
              <FadeIn delay={0.1} className="min-w-0">
                <div className="aspect-[5/4] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={assets.aboutImage}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              </FadeIn>
            ) : null}
          </div>
        </SectionShell>
      ) : null}

      {hasSection(site, "beforeAfter") ? (
        <BeforeAfterSection
          pairs={assets.galleryPairs}
          accent={p.accent}
          muted={p.muted}
          paper={p.paper}
        />
      ) : null}

      {hasSection(site, "gallery") ? (
        <SectionShell id="gallery" className="mx-auto max-w-6xl px-4 py-20 sm:px-8 sm:py-28">
          <FadeIn className="mb-10 text-center sm:mb-12">
            <DynamicSectionTitle text={content.galleryHeadline}>
              {content.galleryHeadline}
            </DynamicSectionTitle>
            {content.gallerySubheadline ? (
              <p className="mx-auto mt-4 max-w-xl" style={{ color: p.muted }}>
                {content.gallerySubheadline}
              </p>
            ) : null}
          </FadeIn>
          <GalleryGrid
            images={assets.galleryImages}
            accent={p.accent}
            tertiary={p.tertiary}
          />
        </SectionShell>
      ) : null}

      {hasSection(site, "testimonials") ? (
        <SectionShell id="testimonials" className="mx-auto max-w-4xl px-4 py-20 sm:px-8 sm:py-28">
          <DynamicSectionTitle text="Client feedback" className="text-center">
            Client feedback
          </DynamicSectionTitle>
          <div className="mt-12 space-y-10">
            {content.testimonials.map((t, i) => (
              <blockquote
                key={`${t.name}-${i}`}
                className="border-l-2 pl-6"
                style={{ borderColor: p.accent }}
              >
                <p className="text-lg leading-relaxed sm:text-xl" style={{ color: p.ink }}>
                  “{t.text}”
                </p>
                <footer className="mt-4 text-sm font-semibold">{t.name}</footer>
              </blockquote>
            ))}
          </div>
        </SectionShell>
      ) : null}

      {hasSection(site, "faq") ? (
        <SectionShell id="faq" className="mx-auto max-w-3xl px-4 py-20 sm:px-8 sm:py-28">
          <DynamicSectionTitle text="Questions" className="text-center">
            Questions
          </DynamicSectionTitle>
          <div
            className="mt-10 divide-y border-y"
            style={{ borderColor: `${p.ink}14` }}
          >
            {content.faqs.map((f, i) => (
              <details key={`${f.question}-${i}`} className="py-5">
                <summary className="cursor-pointer font-medium">{f.question}</summary>
                <p className="mt-3 text-sm" style={{ color: p.muted }}>
                  {f.answer}
                </p>
              </details>
            ))}
          </div>
        </SectionShell>
      ) : null}

      <SectionShell
        id="contact"
        className="w-full px-4 py-14 sm:px-8 sm:py-24"
        style={{ backgroundColor: p.band, color: p.bandFg }}
      >
        <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-2 lg:gap-12">
          <FadeIn className="min-w-0">
            <BrandEyebrow color={p.accent}>Contact</BrandEyebrow>
            <DynamicSectionTitle text={content.contactHeadline} className="mt-4">
              {content.contactHeadline}
            </DynamicSectionTitle>
            <p className="mt-5 max-w-md opacity-80 break-words">
              {content.contactSubheadline}
            </p>
            <div className="mt-8 space-y-2 text-sm opacity-90 sm:mt-10">
              {business.phone ? (
                <p className="font-display text-xl tracking-tight sm:text-2xl">
                  <PreviewPhoneDisplay phone={business.phone} />
                </p>
              ) : null}
              {business.email ? (
                <p className="break-all">
                  <PreviewEmailDisplay email={business.email} />
                </p>
              ) : null}
              {business.address ? (
                <p className="break-words">{business.address}</p>
              ) : null}
            </div>
          </FadeIn>
          <FadeIn delay={0.08} className="min-w-0 w-full">
            <PreviewContactForm
              primaryColor={p.bandFg}
              accentColor={p.accent}
              accentFg={p.accentFg}
              secondaryColor="transparent"
            />
          </FadeIn>
        </div>
      </SectionShell>

      <PreviewFooter site={site} />
    </div>
  );
}
