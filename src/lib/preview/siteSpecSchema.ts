import { z } from "zod";

const hexColor = z
  .string()
  .regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, "Invalid hex color");

/** Empty string allowed for optional URL-ish fields from the model. */
const optionalString = z.string().max(500).default("");

const serviceItemSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).default(""),
  longDescription: z.string().max(1200).default(""),
  benefits: z.array(z.string().max(160)).max(6).default([]),
  imageUrl: optionalString,
});

const stepSchema = z.object({
  title: z.string().max(100),
  body: z.string().max(400),
});

const whySchema = z.object({
  title: z.string().max(100),
  body: z.string().max(400),
});

export const siteSpecSchema = z.object({
  business: z.object({
    name: z.string().min(1).max(120),
    tagline: z.string().max(160).default(""),
    description: z.string().max(2000).default(""),
    phone: z.string().max(40).default(""),
    email: z.string().max(120).default(""),
    website: optionalString,
    address: optionalString,
    city: z.string().max(80).default(""),
    state: z.string().max(40).default(""),
    serviceAreas: z.array(z.string().max(100)).max(12).default([]),
  }),
  branding: z.object({
    primaryColor: hexColor.default("#1A1433"),
    secondaryColor: hexColor.default("#F5F5FB"),
    tertiaryColor: hexColor.default("#3D3654"),
    accentColor: hexColor.default("#5B2E9E"),
    designStyle: z
      .enum(["clean", "bold", "premium", "friendly"])
      .default("clean"),
    logoUrl: optionalString,
  }),
  content: z.object({
    heroHeadline: z.string().min(1).max(160),
    heroSubheadline: z.string().max(300).default(""),
    primaryCta: z.string().max(80).default("Get a free estimate"),
    trustLine: z.string().max(160).default(""),
    servicesHeadline: z.string().max(120).default("Services"),
    servicesSubheadline: z.string().max(240).default(""),
    servicesPageHeadline: z.string().max(160).default("Our services"),
    servicesPageIntro: z.string().max(600).default(""),
    galleryHeadline: z.string().max(120).default("Our work"),
    gallerySubheadline: z.string().max(240).default(""),
    contactHeadline: z.string().max(120).default("Get in touch"),
    contactSubheadline: z.string().max(240).default(""),
    processHeadline: z.string().max(120).default("How it works"),
    processSubheadline: z.string().max(240).default(""),
    processSteps: z.array(stepSchema).max(6).default([]),
    whyUsHeadline: z.string().max(120).default("Why choose us"),
    whyUs: z.array(whySchema).max(6).default([]),
    about: z.object({
      headline: z.string().max(120).default("About us"),
      body: z.string().max(2500).default(""),
    }),
    aboutPageHeadline: z.string().max(160).default("About"),
    aboutPageBody: z.string().max(4000).default(""),
    services: z.array(serviceItemSchema).max(12).default([]),
    testimonials: z
      .array(
        z.object({
          name: z.string().max(80),
          text: z.string().max(600),
        })
      )
      .max(6)
      .default([]),
    faqs: z
      .array(
        z.object({
          question: z.string().max(200),
          answer: z.string().max(800),
        })
      )
      .max(8)
      .default([]),
  }),
  layout: z.object({
    template: z.enum(["contractor", "cleaning", "professional"]),
    heroVariant: z.enum(["split", "centered", "background"]),
    servicesVariant: z.enum(["cards", "alternating", "icons"]),
    sectionOrder: z
      .array(
        z.enum([
          "hero",
          "services",
          "about",
          "beforeAfter",
          "gallery",
          "testimonials",
          "faq",
          "contact",
        ])
      )
      .min(3)
      .max(9),
  }),
  assets: z.object({
    heroImage: optionalString,
    aboutImage: optionalString,
    galleryImages: z.array(z.string()).max(24).default([]),
    galleryPairs: z
      .array(
        z.object({
          beforeUrl: z.string(),
          afterUrl: z.string(),
          caption: z.string().max(160).default(""),
        })
      )
      .max(8)
      .default([]),
  }),
});

export type SiteSpec = z.infer<typeof siteSpecSchema>;

/**
 * OpenAI structured-output schema (strict mode):
 * every key in `properties` MUST appear in `required`.
 * Use "" for unknown optional strings.
 */
export const SITE_SPEC_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["business", "branding", "content", "layout", "assets"],
  properties: {
    business: {
      type: "object",
      additionalProperties: false,
      required: [
        "name",
        "tagline",
        "description",
        "phone",
        "email",
        "website",
        "address",
        "city",
        "state",
        "serviceAreas",
      ],
      properties: {
        name: { type: "string" },
        tagline: { type: "string" },
        description: { type: "string" },
        phone: { type: "string" },
        email: { type: "string" },
        website: { type: "string" },
        address: { type: "string" },
        city: { type: "string" },
        state: { type: "string" },
        serviceAreas: { type: "array", items: { type: "string" } },
      },
    },
    branding: {
      type: "object",
      additionalProperties: false,
      required: [
        "primaryColor",
        "secondaryColor",
        "tertiaryColor",
        "accentColor",
        "designStyle",
        "logoUrl",
      ],
      properties: {
        primaryColor: { type: "string" },
        secondaryColor: { type: "string" },
        tertiaryColor: { type: "string" },
        accentColor: { type: "string" },
        designStyle: {
          type: "string",
          enum: ["clean", "bold", "premium", "friendly"],
        },
        logoUrl: { type: "string" },
      },
    },
    content: {
      type: "object",
      additionalProperties: false,
      required: [
        "heroHeadline",
        "heroSubheadline",
        "primaryCta",
        "trustLine",
        "servicesHeadline",
        "servicesSubheadline",
        "servicesPageHeadline",
        "servicesPageIntro",
        "galleryHeadline",
        "gallerySubheadline",
        "contactHeadline",
        "contactSubheadline",
        "processHeadline",
        "processSubheadline",
        "processSteps",
        "whyUsHeadline",
        "whyUs",
        "about",
        "aboutPageHeadline",
        "aboutPageBody",
        "services",
        "testimonials",
        "faqs",
      ],
      properties: {
        heroHeadline: { type: "string" },
        heroSubheadline: { type: "string" },
        primaryCta: { type: "string" },
        trustLine: { type: "string" },
        servicesHeadline: { type: "string" },
        servicesSubheadline: { type: "string" },
        servicesPageHeadline: { type: "string" },
        servicesPageIntro: { type: "string" },
        galleryHeadline: { type: "string" },
        gallerySubheadline: { type: "string" },
        contactHeadline: { type: "string" },
        contactSubheadline: { type: "string" },
        processHeadline: { type: "string" },
        processSubheadline: { type: "string" },
        processSteps: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["title", "body"],
            properties: {
              title: { type: "string" },
              body: { type: "string" },
            },
          },
        },
        whyUsHeadline: { type: "string" },
        whyUs: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["title", "body"],
            properties: {
              title: { type: "string" },
              body: { type: "string" },
            },
          },
        },
        about: {
          type: "object",
          additionalProperties: false,
          required: ["headline", "body"],
          properties: {
            headline: { type: "string" },
            body: { type: "string" },
          },
        },
        aboutPageHeadline: { type: "string" },
        aboutPageBody: { type: "string" },
        services: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: [
              "name",
              "description",
              "longDescription",
              "benefits",
              "imageUrl",
            ],
            properties: {
              name: { type: "string" },
              description: { type: "string" },
              longDescription: { type: "string" },
              benefits: { type: "array", items: { type: "string" } },
              imageUrl: { type: "string" },
            },
          },
        },
        testimonials: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["name", "text"],
            properties: {
              name: { type: "string" },
              text: { type: "string" },
            },
          },
        },
        faqs: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["question", "answer"],
            properties: {
              question: { type: "string" },
              answer: { type: "string" },
            },
          },
        },
      },
    },
    layout: {
      type: "object",
      additionalProperties: false,
      required: ["template", "heroVariant", "servicesVariant", "sectionOrder"],
      properties: {
        template: {
          type: "string",
          enum: ["contractor", "cleaning", "professional"],
        },
        heroVariant: {
          type: "string",
          enum: ["split", "centered", "background"],
        },
        servicesVariant: {
          type: "string",
          enum: ["cards", "alternating", "icons"],
        },
        sectionOrder: {
          type: "array",
          items: {
            type: "string",
            enum: [
              "hero",
              "services",
              "about",
              "beforeAfter",
              "gallery",
              "testimonials",
              "faq",
              "contact",
            ],
          },
        },
      },
    },
    assets: {
      type: "object",
      additionalProperties: false,
      required: ["heroImage", "aboutImage", "galleryImages", "galleryPairs"],
      properties: {
        heroImage: { type: "string" },
        aboutImage: { type: "string" },
        galleryImages: { type: "array", items: { type: "string" } },
        galleryPairs: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["beforeUrl", "afterUrl", "caption"],
            properties: {
              beforeUrl: { type: "string" },
              afterUrl: { type: "string" },
              caption: { type: "string" },
            },
          },
        },
      },
    },
  },
} as const;
