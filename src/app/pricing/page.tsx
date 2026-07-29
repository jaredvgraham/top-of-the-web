import Pricing from "@/components/Pricing";
import { PRICING_FAQS } from "@/components/pricing/faqs";
import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Pricing — Free Website Build + $84/mo Hosting",
  description:
    "One simple offer: a custom website designed and built for $0, then $84/month for managed hosting, SSL, security updates, and basic content changes. Cancel anytime.",
  keywords: [
    "website design pricing",
    "website builder cost",
    "monthly website plan",
    "managed website hosting",
    "small business website cost",
  ],
  openGraph: {
    title: "Free Website Build + $84/mo Hosting | Bsites Pricing",
    description:
      "$0 to design and build your custom website, then $84/month for hosting, security, and care. No contract — cancel anytime.",
    url: "https://www.bsites.io/pricing",
    siteName: "Bsites",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Website Build + $84/mo Hosting | Bsites Pricing",
    description:
      "$0 build, $84/mo hosting and care. Cancel anytime. Live in about 24 hours.",
  },
  alternates: { canonical: "https://www.bsites.io/pricing" },
};

const page = () => {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: PRICING_FAQS.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: { "@type": "Answer", text: faq.a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: "Managed Website Plan",
      description:
        "A custom website designed and built for $0, then hosted and maintained for $84/month — including hosting, SSL, security updates, uptime monitoring, and basic content updates.",
      brand: { "@type": "Brand", name: "Bsites" },
      offers: {
        "@type": "Offer",
        url: "https://www.bsites.io/pricing",
        price: "84.00",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
      },
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Pricing />
    </>
  );
};

export default page;
