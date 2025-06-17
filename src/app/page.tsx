import React from "react";
import type { Metadata } from "next";
import Hero from "../components/HomePage/Hero";

import WhyUs from "@/components/HomePage/WhyUs";
import OurWork from "@/components/HomePage/OurWork";
import Services from "@/components/HomePage/Services";
import Process from "@/components/HomePage/Process";
import GettingStarted from "@/components/HomePage/GettingStarted";
import Footer from "@/components/HomePage/Footer";

export const metadata: Metadata = {
  title: "Bsites.io - Professional Web Development Services",
  description:
    "Bsites.io offers professional web development services tailored to your unique business needs. Get started with our high-quality, responsive websites.",
  keywords:
    "web development, web design, SEO, digital marketing, cyber security, business solutions",
  openGraph: {
    title: "Bsites.io - Professional Web Development Services",
    description:
      "Bsites.io offers professional web development services tailored to your unique business needs. Get started with our high-quality, responsive websites.",
    images: ["/og-image.jpg"],
    url: "https://www.bsites.io/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bsites.io - Professional Web Development Services",
    description:
      "Bsites.io offers professional web development services tailored to your unique business needs. Get started with our high-quality, responsive websites.",
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
    <main className="flex min-h-screen flex-col items-center justify-between overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <Services />
      {/* <OurWork /> */}
      <WhyUs />
      <Process />
      <GettingStarted />
      <Footer />
    </main>
  );
}
