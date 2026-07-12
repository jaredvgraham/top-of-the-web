import OpenAI from "openai";
import type { FacebookPageImportData } from "@/lib/facebookPageImport";
import {
  buildBusinessDescription,
  buildFacebookImportNotes,
} from "@/lib/facebookPageImport";

export type CleanedOnboardingFields = {
  contact: {
    name: string;
    ownerNames: string[];
    email: string;
    phone: string;
    businessName: string;
  };
  business: {
    description: string;
    city: string;
    state: string;
    idealCustomers: string;
    serviceArea: string;
    existingSiteUrl: string;
  };
  brand: {
    colors: string;
    fontsVibe: string;
    tagline: string;
  };
  content: {
    pagesNeeded: string;
    aboutCopy: string;
    servicesProducts: string;
    faqs: string;
    primaryCta: string;
  };
  extras: {
    preferredDomain: string;
    inspirationLinks: string;
    notes: string;
  };
};

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function asStringArray(value: unknown) {
  if (!Array.isArray(value)) return [] as string[];
  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function normalizeUsPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits.startsWith("1")) {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return phone.trim();
}

function normalizeWebsite(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function preferredDomainFromWebsite(website: string) {
  try {
    const host = new URL(normalizeWebsite(website)).hostname.replace(
      /^www\./i,
      "",
    );
    if (!host || /facebook\.com|fb\.com|instagram\.com/i.test(host)) return "";
    return host;
  } catch {
    return "";
  }
}

/** Deterministic fallback when OpenAI is unavailable. */
export function mapFacebookDataToOnboardingFields(
  page: FacebookPageImportData,
  fallbackEmail: string,
): CleanedOnboardingFields {
  const email = (page.email || fallbackEmail).toLowerCase();
  const website = normalizeWebsite(page.website);
  const description =
    buildBusinessDescription(page) ||
    `${page.name || "Business"} Facebook import — add more detail if needed.`;

  return {
    contact: {
      name: "",
      ownerNames: [""],
      email,
      phone: page.phone ? normalizeUsPhone(page.phone) : "",
      businessName: page.name || "",
    },
    business: {
      description,
      city: page.city || "",
      state: page.state || "",
      idealCustomers: "",
      serviceArea: page.addressLine || "",
      existingSiteUrl: website,
    },
    brand: {
      colors: "",
      fontsVibe: "",
      tagline: "",
    },
    content: {
      pagesNeeded: "",
      aboutCopy: "",
      servicesProducts: page.category || "",
      faqs: "",
      primaryCta: "",
    },
    extras: {
      preferredDomain: preferredDomainFromWebsite(website),
      inspirationLinks: page.pageUrl || "",
      notes: buildFacebookImportNotes(page),
    },
  };
}

function coerceCleanedFields(
  raw: unknown,
  fallback: CleanedOnboardingFields,
): CleanedOnboardingFields {
  const data =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const contact =
    data.contact && typeof data.contact === "object"
      ? (data.contact as Record<string, unknown>)
      : {};
  const business =
    data.business && typeof data.business === "object"
      ? (data.business as Record<string, unknown>)
      : {};
  const brand =
    data.brand && typeof data.brand === "object"
      ? (data.brand as Record<string, unknown>)
      : {};
  const content =
    data.content && typeof data.content === "object"
      ? (data.content as Record<string, unknown>)
      : {};
  const extras =
    data.extras && typeof data.extras === "object"
      ? (data.extras as Record<string, unknown>)
      : {};

  const ownerNames = asStringArray(contact.ownerNames);
  const email = asString(contact.email).toLowerCase() || fallback.contact.email;
  const website =
    normalizeWebsite(asString(business.existingSiteUrl)) ||
    fallback.business.existingSiteUrl;

  return {
    contact: {
      name: asString(contact.name) || fallback.contact.name,
      ownerNames: ownerNames.length ? ownerNames : fallback.contact.ownerNames,
      email,
      phone: asString(contact.phone)
        ? normalizeUsPhone(asString(contact.phone))
        : fallback.contact.phone,
      businessName:
        asString(contact.businessName) || fallback.contact.businessName,
    },
    business: {
      description:
        asString(business.description) || fallback.business.description,
      city: asString(business.city) || fallback.business.city,
      state: asString(business.state).toUpperCase() || fallback.business.state,
      idealCustomers:
        asString(business.idealCustomers) || fallback.business.idealCustomers,
      serviceArea:
        asString(business.serviceArea) || fallback.business.serviceArea,
      existingSiteUrl: website,
    },
    brand: {
      colors: asString(brand.colors) || fallback.brand.colors,
      fontsVibe: asString(brand.fontsVibe) || fallback.brand.fontsVibe,
      tagline: asString(brand.tagline) || fallback.brand.tagline,
    },
    content: {
      pagesNeeded:
        asString(content.pagesNeeded) || fallback.content.pagesNeeded,
      aboutCopy: asString(content.aboutCopy) || fallback.content.aboutCopy,
      servicesProducts:
        asString(content.servicesProducts) || fallback.content.servicesProducts,
      faqs: asString(content.faqs) || fallback.content.faqs,
      primaryCta: asString(content.primaryCta) || fallback.content.primaryCta,
    },
    extras: {
      preferredDomain:
        asString(extras.preferredDomain) ||
        preferredDomainFromWebsite(website) ||
        fallback.extras.preferredDomain,
      inspirationLinks:
        asString(extras.inspirationLinks) || fallback.extras.inspirationLinks,
      notes: asString(extras.notes) || fallback.extras.notes,
    },
  };
}

const CLEANUP_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["contact", "business", "brand", "content", "extras"],
  properties: {
    contact: {
      type: "object",
      additionalProperties: false,
      required: ["name", "ownerNames", "email", "phone", "businessName"],
      properties: {
        name: { type: "string" },
        ownerNames: { type: "array", items: { type: "string" } },
        email: { type: "string" },
        phone: { type: "string" },
        businessName: { type: "string" },
      },
    },
    business: {
      type: "object",
      additionalProperties: false,
      required: [
        "description",
        "city",
        "state",
        "idealCustomers",
        "serviceArea",
        "existingSiteUrl",
      ],
      properties: {
        description: { type: "string" },
        city: { type: "string" },
        state: { type: "string" },
        idealCustomers: { type: "string" },
        serviceArea: { type: "string" },
        existingSiteUrl: { type: "string" },
      },
    },
    brand: {
      type: "object",
      additionalProperties: false,
      required: ["colors", "fontsVibe", "tagline"],
      properties: {
        colors: { type: "string" },
        fontsVibe: { type: "string" },
        tagline: { type: "string" },
      },
    },
    content: {
      type: "object",
      additionalProperties: false,
      required: [
        "pagesNeeded",
        "aboutCopy",
        "servicesProducts",
        "faqs",
        "primaryCta",
      ],
      properties: {
        pagesNeeded: { type: "string" },
        aboutCopy: { type: "string" },
        servicesProducts: { type: "string" },
        faqs: { type: "string" },
        primaryCta: { type: "string" },
      },
    },
    extras: {
      type: "object",
      additionalProperties: false,
      required: ["preferredDomain", "inspirationLinks", "notes"],
      properties: {
        preferredDomain: { type: "string" },
        inspirationLinks: { type: "string" },
        notes: { type: "string" },
      },
    },
  },
} as const;

export function openaiConfigured() {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

/**
 * Use OpenAI to turn noisy Facebook scrape data into clean onboarding fields.
 * Falls back to deterministic mapping if the key is missing or the call fails.
 */
export async function cleanFacebookDataForOnboarding(
  page: FacebookPageImportData,
  fallbackEmail: string,
): Promise<{ fields: CleanedOnboardingFields; usedAi: boolean }> {
  const fallback = mapFacebookDataToOnboardingFields(page, fallbackEmail);
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    console.warn(
      "[fb-ai] OPENAI_API_KEY missing — using raw scrape field mapping",
    );
    return { fields: fallback, usedAi: false };
  }

  const model = process.env.OPENAI_MODEL?.trim() || "gpt-5.4-mini";
  const client = new OpenAI({ apiKey });

  const scrapePayload = {
    pageUrl: page.pageUrl,
    name: page.name,
    about: page.about,
    description: page.description,
    phone: page.phone,
    email: page.email,
    website: page.website,
    city: page.city,
    state: page.state,
    category: page.category,
    addressLine: page.addressLine,
    postSnippets: page.postSnippets.slice(0, 8),
    photoCount: page.photoUrls.length,
    fallbackEmail,
  };

  try {
    console.log(`[fb-ai] cleaning scrape with ${model}`);
    const completion = await client.chat.completions.create({
      model,
      temperature: 0.2,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "onboarding_fields",
          strict: true,
          schema: CLEANUP_SCHEMA,
        },
      },
      messages: [
        {
          role: "system",
          content: `You clean Facebook page scrapes into a website onboarding brief for a local service business.

Rules:
- Use only facts supported by the scrape. Do not invent phone numbers, emails, addresses, or owners.
- If owner names are unknown, set ownerNames to [""] and name to "".
- businessName should be the public trade name (title case, no "| Facebook").
- description: 2–5 clear sentences about what the business does, who they serve, and where — website-ready, no login-wall / cookie / Meta chrome text.
- city/state: US city + 2-letter state when possible.
- serviceArea: short phrase (city/region or "Buzzards Bay, MA and surrounding areas").
- idealCustomers: one short sentence when inferable from category/posts; else "".
- existingSiteUrl: official site only (not Facebook/HomeAdvisor/Yelp). Empty if unknown.
- preferredDomain: hostname of existingSiteUrl without www, else "".
- brand.tagline: short punchy line only if strongly implied; else "".
- brand.colors / fontsVibe: only if clearly stated; else "".
- content.servicesProducts: bullet-like plain text list of services inferred from category/about/posts.
- content.aboutCopy: polished 1–2 paragraph about section when enough signal; else "".
- content.pagesNeeded: comma-separated likely pages (e.g. "Home, Services, Gallery, About, Contact").
- content.primaryCta: e.g. "Get a free estimate" when appropriate.
- content.faqs: 2–4 Q/A pairs only if grounded; else "".
- extras.inspirationLinks: the Facebook page URL.
- extras.notes: brief import notes for the web designer (source page, category, anything uncertain).
- phone: US formatted like (774) 487-7616 when possible.
- email: lowercase; prefer scrape email, else fallbackEmail.
- Strip Facebook UI noise ("Log in", "Create new account", cookie banners, etc.).`,
        },
        {
          role: "user",
          content: `Clean this Facebook scrape into onboarding fields:\n\n${JSON.stringify(
            scrapePayload,
            null,
            2,
          )}`,
        },
      ],
    });

    const text = completion.choices[0]?.message?.content || "";
    if (!text) {
      console.warn("[fb-ai] empty model response — using fallback");
      return { fields: fallback, usedAi: false };
    }

    const parsed = JSON.parse(text) as unknown;
    const fields = coerceCleanedFields(parsed, fallback);
    console.log("[fb-ai] cleanup ok", {
      businessName: fields.contact.businessName,
      city: fields.business.city,
      state: fields.business.state,
      phone: fields.contact.phone,
      website: fields.business.existingSiteUrl,
      descriptionChars: fields.business.description.length,
    });
    return { fields, usedAi: true };
  } catch (error) {
    console.warn(
      "[fb-ai] cleanup failed — using fallback",
      error instanceof Error ? error.message : error,
    );
    return { fields: fallback, usedAi: false };
  }
}
