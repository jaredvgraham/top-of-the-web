import Pricing from "@/components/Pricing";
import { PRICING_FAQS } from "@/components/pricing/faqs";
import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Pricing — Just $495 or $84/mo",
  description:
    "Custom website + hosting for just $495 — one customer pays for the life of your website. Or $0 build + $84/month. Live in about 24 hours.",
  keywords: [
    "website design pricing",
    "website builder cost",
    "monthly website plan",
    "one time website cost",
    "managed website hosting",
    "small business website cost",
  ],
  openGraph: {
    title: "Just $495 or $84/mo | Bsites Pricing",
    description:
      "Custom website + hosting for just $495 — one customer pays for the life of your website. Or $0 build + $84/mo care.",
    url: "https://www.bsites.io/pricing",
    siteName: "Bsites",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Just $495 or $84/mo | Bsites Pricing",
    description:
      "Just $495 — one customer pays for the life of your website. Or $84/mo care.",
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
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: "One-Time Website",
      description:
        "A custom website build with hosting included for a one-time payment of $495 — no monthly subscription.",
      brand: { "@type": "Brand", name: "Bsites" },
      offers: {
        "@type": "Offer",
        url: "https://www.bsites.io/pricing",
        price: "495.00",
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
