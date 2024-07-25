import React from "react";
import Head from "next/head";
import Hero from "../components/Hero";
import AboutMe from "@/components/AboutMe";
import WhyUs from "@/components/WhyUs";
import OurWork from "@/components/OurWork";
import Services from "@/components/Services";
import Process from "@/components/Process";
import GettingStarted from "@/components/GettingStarted";

export default function Home() {
  return (
    <>
      <Head>
        <title>Bsites.io - Professional Web Development Services</title>
        <meta
          name="description"
          content="Bsites.io offers professional web development services tailored to your unique business needs. Get started with our high-quality, responsive websites."
        />
        <meta
          name="keywords"
          content="web development, web design, SEO, digital marketing, cyber security, business solutions"
        />
        <meta
          property="og:title"
          content="Bsites.io - Professional Web Development Services"
        />
        <meta
          property="og:description"
          content="Bsites.io offers professional web development services tailored to your unique business needs. Get started with our high-quality, responsive websites."
        />
        <meta property="og:image" content="/og-image.jpg" />
        <meta property="og:url" content="https://www.bsites.io/" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Bsites.io - Professional Web Development Services"
        />
        <meta
          name="twitter:description"
          content="Bsites.io offers professional web development services tailored to your unique business needs. Get started with our high-quality, responsive websites."
        />
        <meta name="twitter:image" content="/twitter-og-image.jpg" />
        <link rel="canonical" href="https://www.bsites.io/" />
        <script type="application/ld+json">
          {JSON.stringify({
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
          })}
        </script>
      </Head>
      <Hero />
      <Services />
      <OurWork />
      <WhyUs />
      <Process />
      <GettingStarted />
    </>
  );
}
