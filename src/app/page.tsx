import React from "react";
import type { Metadata } from "next";
import Hero from "../components/HomePage/Hero";
import HomeStart from "../components/HomePage/HomeStart";
import HowItWorks from "../components/HomePage/HowItWorks";
import WhoItsFor from "../components/HomePage/WhoItsFor";
import Offer from "../components/HomePage/Offer";
import LocalTrust from "../components/HomePage/LocalTrust";
import GettingStarted from "../components/HomePage/GettingStarted";
import Footer from "../components/HomePage/Footer";

export const metadata: Metadata = {
  title: {
    absolute:
      "AI Website Builder & Designer for US Businesses | Free Demo | Bsites.io",
  },
  description:
    "Bsites is an AI website builder for US local businesses. Free Facebook demo, then go live for just $495 — custom site + hosting. One customer pays for the life of your website.",
  keywords: [
    "AI website builder",
    "AI website generator",
    "website builder USA",
    "website designer",
    "US local business website",
    "Facebook website demo",
    "affordable website",
    "one time website cost",
    "web design for small business",
  ],
  openGraph: {
    title: "AI Website Builder for US Businesses | Free Facebook Demo | Bsites",
    description:
      "Free custom website demo from your Facebook page. Go live for just $495 — hosting included. One customer pays for the life of your website.",
    url: "https://www.bsites.io/",
    siteName: "Bsites",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Website Builder for US Businesses | Free Demo | Bsites",
    description:
      "Free Facebook demo. Just $495 for site + hosting. One customer pays for the life of your website.",
  },
  alternates: {
    canonical: "https://www.bsites.io/",
  },
};

export default function Home() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Bsites",
      url: "https://www.bsites.io/",
      description:
        "AI-assisted website builder and designer for US local businesses. Free demo from your Facebook page.",
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Bsites",
      url: "https://www.bsites.io/",
      email: "bsitesioteam@gmail.com",
      telephone: "+1-781-336-7274",
      sameAs: ["https://www.facebook.com/bsites.io"],
      logo: "https://www.bsites.io/icons/icon-512.png",
      areaServed: {
        "@type": "Country",
        name: "United States",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: "Bsites",
      image: "https://www.bsites.io/icons/icon-512.png",
      url: "https://www.bsites.io/",
      telephone: "+1-781-336-7274",
      email: "bsitesioteam@gmail.com",
      priceRange: "$$",
      address: {
        "@type": "PostalAddress",
        streetAddress: "75 Raymond Road",
        addressLocality: "Plymouth",
        addressRegion: "MA",
        postalCode: "02360",
        addressCountry: "US",
      },
      areaServed: [
        { "@type": "Country", name: "United States" },
        { "@type": "State", name: "Massachusetts" },
        { "@type": "AdministrativeArea", name: "South Shore Massachusetts" },
      ],
      description:
        "Website designer and AI website builder for US local businesses. Free custom demo from your Facebook page, then just $495 for site + hosting.",
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "One-Time Website",
      serviceType: "Website design, build, and hosting",
      description:
        "Custom website with hosting included for a one-time payment of $495. One customer pays for the life of your website.",
      provider: {
        "@type": "Organization",
        name: "Bsites",
        url: "https://www.bsites.io/",
      },
      areaServed: { "@type": "Country", name: "United States" },
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
    <main className="flex min-h-screen flex-col overflow-x-hidden bg-paper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <HomeStart />
      <HowItWorks />
      <WhoItsFor />
      <Offer />
      <LocalTrust />
      <GettingStarted />
      <Footer />
    </main>
  );
}
