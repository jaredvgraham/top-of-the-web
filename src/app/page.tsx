import React from "react";
import type { Metadata } from "next";
import Hero from "../components/HomePage/Hero";

import WhyUs from "@/components/HomePage/WhyUs";
import Services from "@/components/HomePage/Services";
import Process from "@/components/HomePage/Process";
import GettingStarted from "@/components/HomePage/GettingStarted";
import Footer from "@/components/HomePage/Footer";

export const metadata: Metadata = {
  title: "Bsites.io - Free Website Build + $84/mo Hosting",
  description:
    "Get a custom business website built for free with managed hosting, maintenance, security, and basic updates for $84/month.",
  keywords:
    "free website, website hosting, web design, small business website, managed website, local business website",
  openGraph: {
    title: "Bsites.io - Free Website Build + $84/mo Hosting",
    description:
      "Custom website builds with managed hosting, care, and basic updates for one simple monthly price.",
    images: ["/og-image.jpg"],
    url: "https://www.bsites.io/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bsites.io - Free Website Build + $84/mo Hosting",
    description:
      "Get a custom website built for free and hosted for $84/month.",
    images: ["/twitter-og-image.jpg"],
  },
  alternates: {
    canonical: "https://www.bsites.io/",
  },
};

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Bsites.io",
    url: "https://www.bsites.io/",
    sameAs: [
      "https://www.facebook.com/bsites.io",
      "https://www.twitter.com/bsites.io",
      "https://www.linkedin.com/company/bsites.io",
    ],
    potentialAction: {
      "@type": "SearchAction",
      target: "https://www.bsites.io/?s={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden bg-paper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <Services />
      <WhyUs />
      <Process />
      <GettingStarted />
      <Footer />
    </main>
  );
}
