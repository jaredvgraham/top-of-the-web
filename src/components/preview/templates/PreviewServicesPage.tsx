"use client";

import React from "react";
import Link from "next/link";
import {
  BrandEyebrow,
  DynamicBody,
  DynamicHero,
  DynamicSectionTitle,
  FadeIn,
  PreviewContactForm,
  PreviewFooter,
  PreviewNav,
  SectionShell,
  usePreviewPalette,
} from "./shared";
import type { SiteSpec } from "@/lib/preview/siteSpecSchema";

type Props = {
  site: SiteSpec;
  basePath: string;
};

export default function PreviewServicesPage({ site, basePath }: Props) {
  const { content, business, assets } = site;
  const p = usePreviewPalette(site);
  const root = basePath.replace(/\/$/, "");

  return (
    <div
      className="w-full max-w-[100vw] overflow-x-hidden"
      style={{ backgroundColor: p.paper, color: p.ink }}
    >
      <div
        className="relative overflow-hidden"
        style={{
          background: assets.heroImage
            ? `linear-gradient(115deg, rgba(0,0,0,.7) 0%, rgba(0,0,0,.5) 50%, rgba(0,0,0,.4) 100%), linear-gradient(115deg, ${p.band}99 0%, ${p.band}55 55%, transparent 100%), url(${assets.heroImage}) center/cover`
            : `linear-gradient(145deg, ${p.band} 0%, ${p.tertiary} 100%)`,
        }}
      >
        <PreviewNav site={site} tone="light" basePath={root} />
        <div className="mx-auto w-full max-w-6xl px-4 pb-14 pt-8 sm:px-8 sm:pb-20 sm:pt-10">
          <FadeIn className="max-w-3xl text-white">
            <BrandEyebrow color="rgba(255,255,255,0.7)">Services</BrandEyebrow>
            <DynamicHero
              text={content.servicesPageHeadline || content.servicesHeadline}
              className="mt-4"
            >
              {content.servicesPageHeadline || content.servicesHeadline}
            </DynamicHero>
            {(content.servicesPageIntro || content.servicesSubheadline) && (
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
                {content.servicesPageIntro || content.servicesSubheadline}
              </p>
            )}
          </FadeIn>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl space-y-14 px-4 py-14 sm:space-y-20 sm:px-8 sm:py-28">
        {content.services.map((service, index) => (
          <FadeIn
            key={`${service.name}-${index}`}
            delay={index * 0.04}
            className={`grid w-full items-center gap-8 lg:grid-cols-2 lg:gap-10 ${
              index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
            }`}
          >
            <div className="min-w-0">
              <p
                className="font-display text-4xl font-light opacity-20 sm:text-5xl"
                style={{ color: p.tertiary }}
              >
                {String(index + 1).padStart(2, "0")}
              </p>
              <DynamicSectionTitle text={service.name} className="mt-2">
                {service.name}
              </DynamicSectionTitle>
              <DynamicBody
                text={service.longDescription || service.description}
                className="mt-4 sm:mt-5"
                style={{ color: p.muted }}
              >
                {service.longDescription || service.description}
              </DynamicBody>
              {service.benefits?.length ? (
                <ul className="mt-6 space-y-3 sm:mt-8">
                  {service.benefits.map((b) => (
                    <li key={b} className="flex gap-3 text-sm leading-relaxed">
                      <span
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: p.accent }}
                      />
                      <span
                        className="min-w-0 break-words"
                        style={{ color: p.muted }}
                      >
                        {b}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
              <Link
                href={`${root}#contact`}
                className="mt-8 inline-flex px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.16em]"
                style={{ backgroundColor: p.accent, color: p.accentFg }}
              >
                {content.primaryCta}
              </Link>
            </div>
            {service.imageUrl ? (
              <div className="aspect-[16/11] w-full overflow-hidden">
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
                className="flex aspect-[16/11] w-full items-end p-6 sm:p-8"
                style={{
                  background: `linear-gradient(135deg, ${p.band}, ${p.tertiary})`,
                  color: p.bandFg,
                }}
              >
                <span className="font-display text-2xl opacity-50 sm:text-3xl">
                  {service.name}
                </span>
              </div>
            )}
          </FadeIn>
        ))}
      </div>

      {content.processSteps?.length ? (
        <SectionShell
          id="process"
          style={{ backgroundColor: p.surface, color: p.ink }}
        >
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-8 sm:py-24">
            <FadeIn className="max-w-2xl">
              <BrandEyebrow color={p.accent}>{content.processHeadline}</BrandEyebrow>
              <DynamicSectionTitle
                text="A clear process from day one"
                className="mt-4"
              >
                A clear process from day one
              </DynamicSectionTitle>
              {content.processSubheadline ? (
                <p className="mt-4" style={{ color: p.muted }}>
                  {content.processSubheadline}
                </p>
              ) : null}
            </FadeIn>
            <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {content.processSteps.map((step, i) => (
                <FadeIn key={step.title} delay={i * 0.05}>
                  <p
                    className="font-display text-3xl opacity-25"
                    style={{ color: p.tertiary }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-2 font-display text-xl font-medium">
                    {step.title}
                  </h3>
                  <p
                    className="mt-3 text-sm leading-relaxed"
                    style={{ color: p.muted }}
                  >
                    {step.body}
                  </p>
                </FadeIn>
              ))}
            </div>
          </div>
        </SectionShell>
      ) : null}

      <SectionShell id="contact" className="w-full px-4 py-14 sm:px-8 sm:py-20">
        <div
          className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:gap-12 sm:px-10 sm:py-14 lg:grid-cols-2"
          style={{ backgroundColor: p.band, color: p.bandFg }}
        >
          <FadeIn className="min-w-0">
            <BrandEyebrow color={p.accent}>Next step</BrandEyebrow>
            <DynamicSectionTitle text={content.contactHeadline} className="mt-4">
              {content.contactHeadline}
            </DynamicSectionTitle>
            <p className="mt-4 max-w-md opacity-80 break-words">
              {content.contactSubheadline}
            </p>
            {business.serviceAreas.length ? (
              <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.18em] opacity-55 break-words">
                Serving {business.serviceAreas.join(" · ")}
              </p>
            ) : null}
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
