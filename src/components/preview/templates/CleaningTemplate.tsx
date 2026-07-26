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

export default function CleaningTemplate({ site, basePath }: TemplateProps) {
  const { content, business, assets } = site;
  const p = usePreviewPalette(site);
  const root = (basePath || "").replace(/\/$/, "");
  const hero = assets.heroImage;

  return (
    <div
      className="w-full max-w-[100vw] overflow-x-hidden"
      style={{ backgroundColor: p.paper, color: p.ink }}
    >
      {/* Full-bleed cinematic hero */}
      <div className="relative min-h-[100svh] overflow-hidden">
        <div
          className="absolute inset-0"
          style={
            hero
              ? {
                  // Darken toward the bottom where white headline text sits —
                  // never fade to paper/white or the copy disappears.
                  backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.28) 0%, rgba(0,0,0,.42) 45%, rgba(0,0,0,.78) 100%), url(${hero})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : {
                  background: `radial-gradient(900px 520px at 90% -10%, ${p.accent}55, transparent), radial-gradient(700px 420px at 0% 30%, ${p.tertiary}33, transparent), ${p.paper}`,
                }
          }
        />
        <div className="relative flex min-h-[100svh] flex-col">
          <PreviewNav
            site={site}
            tone={hero ? "light" : "dark"}
            basePath={root || undefined}
          />
          <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-end px-4 pb-16 pt-10 sm:px-8 sm:pb-24">
            <FadeIn className={`max-w-3xl ${hero ? "text-white" : ""}`}>
              <BrandEyebrow color={hero ? "rgba(255,255,255,0.75)" : p.accent}>
                {content.trustLine ||
                  (business.city && business.state
                    ? `${business.city}, ${business.state}`
                    : business.tagline || "Fresh results, every visit")}
              </BrandEyebrow>
              <DynamicHero
                text={content.heroHeadline}
                className="mt-5"
              >
                {content.heroHeadline}
              </DynamicHero>
              {content.heroSubheadline ? (
                <p
                  className={`mt-5 max-w-xl ${
                    hero ? "text-white/85" : ""
                  }`}
                  style={hero ? undefined : { color: p.muted }}
                >
                  <span className={fluidSub(content.heroSubheadline)}>
                    {content.heroSubheadline}
                  </span>
                </p>
              ) : null}
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <a
                  href="#contact"
                  className="px-7 py-3.5 text-[12px] font-semibold uppercase tracking-[0.16em] transition hover:brightness-110"
                  style={{
                    backgroundColor: p.accent,
                    color: p.accentFg,
                  }}
                >
                  {content.primaryCta}
                </a>
                {business.phone ? (
                  <span
                    className="border px-5 py-3.5 text-[12px] font-semibold uppercase tracking-[0.12em]"
                    style={
                      hero
                        ? {
                            borderColor: "rgba(255,255,255,0.35)",
                            color: "#fff",
                          }
                        : {
                            borderColor: `${p.ink}22`,
                            background: p.surface,
                            color: p.ink,
                          }
                    }
                  >
                    <PreviewPhoneDisplay phone={business.phone} />
                  </span>
                ) : null}
              </div>
            </FadeIn>
          </div>
        </div>
      </div>

      {hasSection(site, "services") ? (
        <SectionShell id="services" className="mx-auto max-w-6xl px-4 py-20 sm:px-8 sm:py-28">
          <FadeIn className="max-w-2xl">
            <BrandEyebrow color={p.accent}>Services</BrandEyebrow>
            <DynamicSectionTitle text={content.servicesHeadline} className="mt-4">
              {content.servicesHeadline}
            </DynamicSectionTitle>
            {content.servicesSubheadline ? (
              <p className="mt-4" style={{ color: p.muted }}>
                {content.servicesSubheadline}
              </p>
            ) : null}
          </FadeIn>

          <div className="mt-14 space-y-8 sm:mt-16">
            {content.services.slice(0, 3).map((service, index) => (
              <FadeIn
                key={`${service.name}-${index}`}
                delay={index * 0.05}
                className={`grid items-stretch gap-0 overflow-hidden lg:grid-cols-2 ${
                  index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
                }`}
                style={{ backgroundColor: p.surface }}
              >
                <div className="flex flex-col justify-center p-6 sm:p-10">
                  <p
                    className="font-display text-4xl font-light opacity-25 sm:text-5xl"
                    style={{ color: p.tertiary }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <DynamicSectionTitle
                    as="h3"
                    text={service.name}
                    className="mt-2"
                  >
                    {service.name}
                  </DynamicSectionTitle>
                  {service.description ? (
                    <DynamicBody
                      text={service.description}
                      className="mt-4"
                      style={{ color: p.muted }}
                    >
                      {service.description}
                    </DynamicBody>
                  ) : null}
                </div>
                {service.imageUrl ? (
                  <div className="min-h-[220px] sm:min-h-[280px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={service.imageUrl}
                      alt={service.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div
                    className="flex min-h-[220px] items-end p-8 sm:min-h-[280px]"
                    style={{
                      background: `linear-gradient(135deg, ${p.accent}, ${p.tertiary})`,
                      color: p.accentFg,
                    }}
                  >
                    <span className="font-display text-3xl opacity-80">
                      {service.name}
                    </span>
                  </div>
                )}
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
        <SectionShell
          id="about"
          style={{ backgroundColor: p.band, color: p.bandFg }}
        >
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:gap-12 sm:px-8 sm:py-28 lg:grid-cols-2 lg:items-center">
            <FadeIn className="min-w-0">
              <BrandEyebrow color={p.accent}>About</BrandEyebrow>
              <DynamicSectionTitle
                text={content.about.headline}
                className="mt-4"
              >
                {content.about.headline}
              </DynamicSectionTitle>
              <DynamicBody
                text={content.about.body}
                className="mt-6 opacity-85"
              >
                {content.about.body}
              </DynamicBody>
              {business.serviceAreas.length ? (
                <div className="mt-8 flex flex-wrap gap-2">
                  {business.serviceAreas.map((area) => (
                    <span
                      key={area}
                      className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em]"
                      style={{
                        backgroundColor: `${p.accent}33`,
                        color: p.bandFg,
                      }}
                    >
                      {area}
                    </span>
                  ))}
                </div>
              ) : null}
              {root ? (
                <Link
                  href={`${root}/about`}
                  className="mt-8 inline-flex text-[12px] font-semibold uppercase tracking-[0.16em]"
                  style={{ color: p.accent }}
                >
                  More about us →
                </Link>
              ) : null}
            </FadeIn>
            {assets.aboutImage || assets.heroImage ? (
              <FadeIn delay={0.08} className="min-w-0">
                <div className="aspect-[4/5] overflow-hidden sm:aspect-[5/6]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={assets.aboutImage || assets.heroImage}
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
          <FadeIn className="mb-10 max-w-2xl sm:mb-12">
            <DynamicSectionTitle text={content.galleryHeadline}>
              {content.galleryHeadline}
            </DynamicSectionTitle>
            {content.gallerySubheadline ? (
              <p className="mt-4" style={{ color: p.muted }}>
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
        <SectionShell
          id="testimonials"
          className="px-4 py-20 sm:px-8 sm:py-28"
          style={{ backgroundColor: p.tertiarySoft }}
        >
          <div className="mx-auto max-w-6xl">
            <DynamicSectionTitle
              text="Client feedback"
              className="text-center"
            >
              Client feedback
            </DynamicSectionTitle>
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {content.testimonials.map((t, i) => (
                <blockquote
                  key={`${t.name}-${i}`}
                  className="p-6 sm:p-8"
                  style={{ backgroundColor: p.surface }}
                >
                  <p className="text-base leading-relaxed sm:text-lg" style={{ color: p.ink }}>
                    “{t.text}”
                  </p>
                  <footer
                    className="mt-5 text-sm font-semibold"
                    style={{ color: p.accent }}
                  >
                    {t.name}
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </SectionShell>
      ) : null}

      {hasSection(site, "faq") ? (
        <SectionShell id="faq" className="mx-auto max-w-3xl px-4 py-20 sm:px-8 sm:py-28">
          <DynamicSectionTitle text="FAQ" className="text-center">
            FAQ
          </DynamicSectionTitle>
          <div className="mt-10 space-y-2">
            {content.faqs.map((f, i) => (
              <details
                key={`${f.question}-${i}`}
                className="px-5 py-4"
                style={{ backgroundColor: p.surface }}
              >
                <summary className="cursor-pointer font-medium">{f.question}</summary>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: p.muted }}>
                  {f.answer}
                </p>
              </details>
            ))}
          </div>
        </SectionShell>
      ) : null}

      <SectionShell id="contact" className="w-full px-4 py-16 sm:px-8 sm:py-24">
        <div
          className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-10 sm:gap-12 sm:px-10 sm:py-14 lg:grid-cols-2"
          style={{ backgroundColor: p.band, color: p.bandFg }}
        >
          <FadeIn className="min-w-0">
            <BrandEyebrow color={p.accent}>Next step</BrandEyebrow>
            <DynamicSectionTitle
              text={content.contactHeadline}
              className="mt-4"
            >
              {content.contactHeadline}
            </DynamicSectionTitle>
            <p className="mt-5 max-w-md opacity-80 break-words">
              {content.contactSubheadline}
            </p>
            <div className="mt-8 space-y-2 text-sm sm:mt-10">
              {business.phone ? (
                <p className="font-display text-xl sm:text-2xl">
                  <PreviewPhoneDisplay phone={business.phone} />
                </p>
              ) : null}
              {business.email ? (
                <p className="break-all">
                  <PreviewEmailDisplay email={business.email} />
                </p>
              ) : null}
              {business.address ? (
                <p className="break-words opacity-80">{business.address}</p>
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

function fluidSub(text: string) {
  const len = (text || "").length;
  if (len > 180) return "text-base sm:text-lg leading-relaxed";
  return "text-lg sm:text-xl leading-relaxed";
}
