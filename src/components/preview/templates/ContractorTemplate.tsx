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

export default function ContractorTemplate({ site, basePath }: TemplateProps) {
  const { content, business, assets, layout } = site;
  const p = usePreviewPalette(site);
  const heroBg = assets.heroImage;
  const root = (basePath || "").replace(/\/$/, "");

  return (
    <div className="w-full max-w-[100vw] overflow-x-hidden" style={{ backgroundColor: p.paper, color: p.ink }}>
      <div
        className="relative min-h-[92vh] overflow-hidden"
        style={
          heroBg
            ? {
                // Black scrim under brand tint so white hero copy stays readable
                // even when band/brand colors are light.
                backgroundImage: `linear-gradient(105deg, rgba(0,0,0,.72) 0%, rgba(0,0,0,.55) 40%, rgba(0,0,0,.4) 100%), linear-gradient(105deg, ${p.band}99 0%, ${p.band}55 50%, transparent 100%), url(${heroBg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : {
                background: `linear-gradient(145deg, ${p.band} 0%, ${p.tertiary} 100%)`,
              }
        }
      >
        <PreviewNav site={site} tone="light" basePath={root || undefined} />
        <div className="mx-auto flex min-h-[calc(92vh-88px)] max-w-6xl flex-col justify-end px-4 pb-16 pt-10 sm:px-8 sm:pb-24 lg:pb-28">
          <FadeIn className="max-w-3xl text-white">
            <BrandEyebrow color="rgba(255,255,255,0.72)">
              {content.trustLine || business.tagline || "Local professionals"}
            </BrandEyebrow>
            <DynamicHero text={content.heroHeadline} className="mt-5">
              {content.heroHeadline}
            </DynamicHero>
            {content.heroSubheadline ? (
              <p className="mt-6 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg md:text-xl">
                {content.heroSubheadline}
              </p>
            ) : null}
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <a
                href="#contact"
                className="px-7 py-3.5 text-[12px] font-semibold uppercase tracking-[0.16em] transition hover:brightness-110"
                style={{ backgroundColor: p.accent, color: p.accentFg }}
              >
                {content.primaryCta}
              </a>
              {business.phone ? (
                <span className="border border-white/35 px-5 py-3.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-white/90">
                  <PreviewPhoneDisplay phone={business.phone} />
                </span>
              ) : null}
            </div>
          </FadeIn>
        </div>
        {!heroBg && layout.heroVariant !== "background" && assets.galleryImages[0] ? (
          <div className="pointer-events-none absolute bottom-0 right-0 hidden w-[42%] lg:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={assets.galleryImages[0]}
              alt=""
              className="h-[70vh] w-full object-cover opacity-90"
            />
          </div>
        ) : null}
      </div>

      {hasSection(site, "services") ? (
        <SectionShell id="services" className="mx-auto max-w-6xl px-4 py-20 sm:px-8 sm:py-28">
          <FadeIn>
            <BrandEyebrow color={p.accent}>What we do</BrandEyebrow>
            <DynamicSectionTitle text={content.servicesHeadline} className="mt-4 max-w-3xl">
              {content.servicesHeadline}
            </DynamicSectionTitle>
            {content.servicesSubheadline ? (
              <p className="mt-4 max-w-2xl text-base leading-relaxed" style={{ color: p.muted }}>
                {content.servicesSubheadline}
              </p>
            ) : null}
          </FadeIn>
          <div className="mt-14 space-y-14 sm:mt-16 sm:space-y-16">
            {content.services.slice(0, 3).map((service, index) => (
              <FadeIn
                key={`${service.name}-${index}`}
                delay={index * 0.05}
                className={`grid items-center gap-8 md:grid-cols-2 ${
                  index % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""
                }`}
              >
                <div className="min-w-0">
                  <p
                    className="font-display text-4xl font-light opacity-25 sm:text-5xl"
                    style={{ color: p.tertiary }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <DynamicSectionTitle as="h3" text={service.name} className="mt-2">
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
                  <div className="aspect-[16/10] overflow-hidden">
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
                    className="flex aspect-[16/10] items-end p-8"
                    style={{
                      background: `linear-gradient(135deg, ${p.band}, ${p.tertiary})`,
                      color: p.bandFg,
                    }}
                  >
                    <span className="font-display text-3xl opacity-50 sm:text-4xl">
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
            {assets.aboutImage ? (
              <FadeIn>
                <div className="aspect-[4/5] overflow-hidden sm:aspect-[5/6]">
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
            <FadeIn delay={0.08} className="flex min-w-0 flex-col justify-center">
              <BrandEyebrow color={p.accent}>{content.about.headline}</BrandEyebrow>
              <DynamicSectionTitle
                text="Built around how real jobs get done"
                className="mt-4"
              >
                Built around how real jobs get done
              </DynamicSectionTitle>
              <DynamicBody text={content.about.body} className="mt-6 opacity-85">
                {content.about.body}
              </DynamicBody>
              {business.serviceAreas.length ? (
                <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.2em] opacity-55">
                  Serving {business.serviceAreas.join(" · ")}
                </p>
              ) : null}
            </FadeIn>
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
            <BrandEyebrow color={p.accent}>Portfolio</BrandEyebrow>
            <DynamicSectionTitle text={content.galleryHeadline} className="mt-4">
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
        <SectionShell id="testimonials" className="mx-auto max-w-6xl px-4 py-20 sm:px-8 sm:py-28">
          <DynamicSectionTitle text="What clients say">
            What clients say
          </DynamicSectionTitle>
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {content.testimonials.map((t, i) => (
              <blockquote
                key={`${t.name}-${i}`}
                className="border-l-2 pl-6"
                style={{ borderColor: p.accent }}
              >
                <p className="text-base leading-relaxed sm:text-lg" style={{ color: p.ink }}>
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
          <FadeIn>
            <DynamicSectionTitle text="Questions before you book">
              Questions before you book
            </DynamicSectionTitle>
          </FadeIn>
          <div className="mt-10 divide-y" style={{ borderColor: `${p.ink}14` }}>
            {content.faqs.map((f, i) => (
              <details
                key={`${f.question}-${i}`}
                className="group border-b py-5"
                style={{ borderColor: `${p.ink}14` }}
              >
                <summary className="cursor-pointer list-none font-display text-xl font-medium tracking-tight">
                  {f.question}
                </summary>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: p.muted }}>
                  {f.answer}
                </p>
              </details>
            ))}
          </div>
        </SectionShell>
      ) : null}

      <SectionShell id="contact" className="w-full">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-8 sm:py-24">
          <div
            className="grid w-full gap-8 px-4 py-10 sm:gap-12 sm:px-10 sm:py-14 lg:grid-cols-2"
            style={{ backgroundColor: p.band, color: p.bandFg }}
          >
            <FadeIn className="min-w-0">
              <BrandEyebrow color={p.accent}>Contact</BrandEyebrow>
              <DynamicSectionTitle text={content.contactHeadline} className="mt-4">
                {content.contactHeadline}
              </DynamicSectionTitle>
              <p className="mt-5 max-w-md text-base leading-relaxed opacity-80 break-words">
                {content.contactSubheadline}
              </p>
              <div className="mt-8 space-y-3 text-sm opacity-90 sm:mt-10">
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
                {business.address ? <p className="break-words">{business.address}</p> : null}
              </div>
            </FadeIn>
            <FadeIn delay={0.1} className="min-w-0 w-full">
              <PreviewContactForm
                primaryColor={p.bandFg}
                accentColor={p.accent}
                accentFg={p.accentFg}
                secondaryColor="transparent"
              />
            </FadeIn>
          </div>
        </div>
      </SectionShell>

      <PreviewFooter site={site} />
    </div>
  );
}
