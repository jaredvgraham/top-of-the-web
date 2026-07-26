#!/usr/bin/env node
/**
 * Seed a demo Preview document for local rendering tests without Facebook scrape.
 *
 *   MONGODB_URI=... node scripts/seed-preview-demo.mjs
 *
 * Then open /preview/demo-preview-local
 */
import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Set MONGODB_URI");
  process.exit(1);
}

const siteSpec = {
  business: {
    name: "Harbor Line Painting",
    tagline: "Clean lines. Honest work.",
    description:
      "Harbor Line Painting provides interior and exterior painting for homes across the South Shore.",
    phone: "(555) 010-2200",
    email: "hello@harborline.example",
    website: "https://example.com",
    address: "12 Pier St, Plymouth, MA",
    city: "Plymouth",
    state: "MA",
    serviceAreas: ["Plymouth", "Duxbury", "Kingston"],
  },
    branding: {
      primaryColor: "#1A1433",
      secondaryColor: "#F5F5FB",
      tertiaryColor: "#3D3654",
      accentColor: "#C45C26",
      designStyle: "bold",
      logoUrl: "",
    },
  content: {
    heroHeadline: "Painting that holds up on the coast",
    heroSubheadline:
      "Careful prep, durable finishes, and clear communication from estimate to final walkthrough.",
    primaryCta: "Request an estimate",
    trustLine: "Proudly serving Plymouth & the South Shore",
    servicesHeadline: "Work built for real homes & real timelines",
    servicesSubheadline:
      "Straightforward options, clear estimates, and results you can inspect.",
    servicesPageHeadline: "Full-service work for homeowners who want it done right",
    servicesPageIntro:
      "Explore what’s included, what to expect, and how we keep the process clear from first message to final walkthrough.",
    galleryHeadline: "Proof in the work",
    gallerySubheadline: "Recent projects from the field — not stock photos.",
    contactHeadline: "Ready when you are",
    contactSubheadline:
      "Tell us what you need. We’ll follow up with clear next steps — usually the same business day.",
    processHeadline: "How it works",
    processSubheadline: "A simple path from first conversation to finished work.",
    processSteps: [
      {
        title: "Tell us what you need",
        body: "Share a few details about the project — photos help.",
      },
      {
        title: "Get a clear estimate",
        body: "You’ll receive a straightforward scope and price.",
      },
      {
        title: "We get to work",
        body: "We show up prepared and finish walkthrough-ready.",
      },
    ],
    whyUsHeadline: "Why homeowners choose us",
    whyUs: [
      {
        title: "Clarity before commitment",
        body: "You know what’s included before work begins.",
      },
      {
        title: "Local & responsive",
        body: "Built around South Shore homeowners who want straight answers.",
      },
      {
        title: "Finished like it matters",
        body: "Details and cleanup are part of the job.",
      },
    ],
    about: {
      headline: "About Harbor Line",
      body: "We focus on residential painting with meticulous surface prep and finishes chosen for New England weather.",
    },
    aboutPageHeadline: "The story behind Harbor Line",
    aboutPageBody:
      "We focus on residential painting with meticulous surface prep and finishes chosen for New England weather.\n\nWe’re focused on clear communication, careful work, and a finished result you feel good about recommending.",
    services: [
      {
        name: "Interior painting",
        description: "Walls, trim, and ceilings with clean edges and low-VOC options.",
        longDescription:
          "Our interior painting is scoped clearly up front, scheduled around your life, and finished to a standard you can inspect in person.",
        benefits: [
          "Written scope before we start",
          "Clean jobsite habits",
          "Low-VOC options available",
        ],
        imageUrl: "",
      },
      {
        name: "Exterior painting",
        description: "Weather-ready coatings for siding, doors, and trim.",
        longDescription:
          "Exterior coatings chosen for coastal weather, with careful prep so the finish holds up season after season.",
        benefits: [
          "Weather-ready products",
          "Detailed surface prep",
          "Clean edges and lines",
        ],
        imageUrl: "",
      },
      {
        name: "Cabinet refinishing",
        description: "Kitchen and bath cabinet refresh without a full remodel.",
        longDescription:
          "A cabinet refresh that feels like a remodel — without the demolition timeline.",
        benefits: [
          "Durable finishes",
          "Hardware-friendly process",
          "Minimal disruption",
        ],
        imageUrl: "",
      },
    ],
    testimonials: [],
    faqs: [
      {
        question: "Do you provide estimates?",
        answer: "Yes — after a quick walkthrough we send a clear written estimate.",
      },
    ],
  },
  layout: {
    template: "contractor",
    heroVariant: "centered",
    servicesVariant: "alternating",
    sectionOrder: [
      "hero",
      "services",
      "about",
      "faq",
      "contact",
    ],
  },
  assets: {
    heroImage: "",
    aboutImage: "",
    galleryImages: [],
  },
};

await mongoose.connect(uri);
const col = mongoose.connection.collection("previews");
const expiresAt = new Date();
expiresAt.setDate(expiresAt.getDate() + 7);

await col.updateOne(
  { slug: "demo-preview-local" },
  {
    $set: {
      slug: "demo-preview-local",
      email: "demo@example.com",
      onboardingToken: "preview-demo-token",
      status: "ready",
      source: {
        type: "facebook",
        url: "https://www.facebook.com/example",
      },
      siteSpec,
      error: { code: "", message: "" },
      expiresAt,
      updatedAt: new Date(),
    },
    $setOnInsert: { createdAt: new Date() },
  },
  { upsert: true }
);

console.log("Seeded preview: /preview/demo-preview-local");
await mongoose.disconnect();
