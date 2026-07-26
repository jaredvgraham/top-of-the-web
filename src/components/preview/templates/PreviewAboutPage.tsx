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

export default function PreviewAboutPage({ site, basePath }: Props) {
  const { content, business, assets } = site;
  const p = usePreviewPalette(site);
  const root = basePath.replace(/\/$/, "");

  return (
    <div
      className="w-full max-w-[100vw] overflow-x-hidden"
      style={{ backgroundColor: p.paper, color: p.ink }}
    >
      <div style={{ backgroundColor: p.band }}>
        <PreviewNav site={site} tone="light" basePath={root} />
        <div className="mx-auto w-full max-w-6xl px-4 pb-14 pt-8 text-white sm:px-8 sm:pb-20 sm:pt-10">
          <FadeIn className="max-w-3xl">
            <BrandEyebrow color={p.accent}>About</BrandEyebrow>
            <DynamicHero
              text={content.aboutPageHeadline || content.about.headline}
              className="mt-4"
            >
              {content.aboutPageHeadline || content.about.headline}
            </DynamicHero>
          </FadeIn>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:gap-12 sm:px-8 sm:py-28 lg:grid-cols-2 lg:items-start">
        <FadeIn className="min-w-0">
          <DynamicBody
            text={content.aboutPageBody || content.about.body}
            style={{ color: p.muted }}
          >
            {content.aboutPageBody || content.about.body}
          </DynamicBody>
          {business.serviceAreas.length ? (
            <p
              className="mt-8 text-[11px] font-semibold uppercase tracking-[0.2em] sm:mt-10"
              style={{ color: p.muted }}
            >
              Serving {business.serviceAreas.join(" · ")}
            </p>
          ) : null}
          <div className="mt-8 flex flex-wrap gap-3 sm:mt-10">
            <Link
              href={`${root}/services`}
              className="px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.16em]"
              style={{ backgroundColor: p.accent, color: p.accentFg }}
            >
              View services
            </Link>
            <Link
              href={`${root}#contact`}
              className="border px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.16em]"
              style={{ borderColor: `${p.ink}33`, color: p.ink }}
            >
              {content.primaryCta}
            </Link>
          </div>
        </FadeIn>
        {assets.aboutImage || assets.heroImage ? (
          <FadeIn delay={0.08} className="min-w-0 w-full">
            <div className="aspect-[4/5] w-full overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={assets.aboutImage || assets.heroImage}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
          </FadeIn>
        ) : null}
      </div>

      {content.whyUs?.length ? (
        <SectionShell id="why" style={{ backgroundColor: p.surface }}>
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-8">
            <FadeIn className="max-w-2xl">
              <BrandEyebrow color={p.accent}>{content.whyUsHeadline}</BrandEyebrow>
              <DynamicSectionTitle text="What we stand for" className="mt-4">
                What we stand for
              </DynamicSectionTitle>
            </FadeIn>
            <div className="mt-14 grid gap-10 sm:grid-cols-3">
              {content.whyUs.map((item, i) => (
                <FadeIn key={item.title} delay={i * 0.05}>
                  <div
                    className="mb-5 h-1 w-10"
                    style={{
                      backgroundColor: i % 2 === 0 ? p.accent : p.tertiary,
                    }}
                  />
                  <h3 className="font-display text-2xl font-medium tracking-tight">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed" style={{ color: p.muted }}>
                    {item.body}
                  </p>
                </FadeIn>
              ))}
            </div>
          </div>
        </SectionShell>
      ) : null}

      {content.faqs?.length ? (
        <SectionShell id="faq" className="mx-auto max-w-3xl px-4 py-20 sm:px-8">
          <DynamicSectionTitle text="Common questions">
            Common questions
          </DynamicSectionTitle>
          <div className="mt-10 divide-y" style={{ borderColor: `${p.ink}14` }}>
            {content.faqs.map((f, i) => (
              <details
                key={`${f.question}-${i}`}
                className="border-b py-5"
                style={{ borderColor: `${p.ink}14` }}
              >
                <summary className="cursor-pointer font-display text-xl font-medium">
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

      <SectionShell id="contact" className="w-full px-4 py-14 sm:px-8 sm:py-20">
        <div
          className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:gap-12 sm:px-10 sm:py-14 lg:grid-cols-2"
          style={{ backgroundColor: p.band, color: p.bandFg }}
        >
          <FadeIn className="min-w-0">
            <BrandEyebrow color={p.accent}>Contact</BrandEyebrow>
            <DynamicSectionTitle text={content.contactHeadline} className="mt-4">
              {content.contactHeadline}
            </DynamicSectionTitle>
            <p className="mt-4 max-w-md opacity-80 break-words">
              {content.contactSubheadline}
            </p>
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
