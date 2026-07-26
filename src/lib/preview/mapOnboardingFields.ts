import type { CleanedOnboardingFields } from "@/lib/facebookOnboardingAi";
import type { ImportedBlobAsset } from "@/lib/facebookPageImport";
import type { FacebookPageImportData } from "@/lib/facebookPageImport";
import {
  curateAssetsFromAnalyses,
  type PreviewImageAnalysis,
} from "@/lib/preview/analyzePreviewImages";
import type { PreviewBrandPreferences } from "@/lib/preview/brandPreferences";
import type { CompanyResearch } from "@/lib/preview/researchCompany";
import { cleanBusinessName } from "@/lib/preview/cleanBusinessName";
import {
  assignServiceImages,
  buildGalleryPairs,
  unpairedGalleryImages,
} from "@/lib/preview/galleryPairs";
import {
  websiteSafeCopy,
} from "@/lib/preview/sanitizeCopy";
import type { SiteSpec } from "@/lib/preview/siteSpecSchema";

export type PreviewGenerationInput = {
  fields: CleanedOnboardingFields;
  page: FacebookPageImportData;
  assets: ImportedBlobAsset[];
  fallbackEmail: string;
  brandPreferences?: PreviewBrandPreferences;
  imageAnalyses?: PreviewImageAnalysis[];
  research?: CompanyResearch;
};

function pickTemplate(
  category: string,
  description: string,
  services: string
): SiteSpec["layout"]["template"] {
  const hay = `${category} ${description} ${services}`.toLowerCase();
  if (
    /clean|wash|window|janitor|maid|pressure|power\s*wash|soft\s*wash/i.test(
      hay
    )
  ) {
    return "cleaning";
  }
  if (
    /paint|roof|landscap|construct|contractor|plumb|electric|hvac|remodel|deck|fence|siding|mason|concrete|handyman|excav/i.test(
      hay
    )
  ) {
    return "contractor";
  }
  return "professional";
}

function parseServiceLines(raw: string) {
  return raw
    .split(/\n|•|,|;|\|/)
    .map((s) => s.replace(/^[-–—*]\s*/, "").trim())
    .filter((s) => s.length > 1 && s.length < 80)
    .slice(0, 8);
}

/**
 * Deterministic SiteSpec from cleaned onboarding-shaped fields + imported assets.
 * Used as OpenAI fallback and to seed the AI prompt.
 */
export function mapOnboardingFieldsToSiteSpec(
  input: PreviewGenerationInput
): SiteSpec {
  const { fields, page, assets, fallbackEmail } = input;
  const city = fields.business.city || page.city || "";
  const state = fields.business.state || page.state || "";
  const name = cleanBusinessName(
    fields.contact.businessName || page.name || "Local Business",
    city,
    state
  );
  const email =
    fields.contact.email || page.email || fallbackEmail || "";
  const phone = fields.contact.phone || page.phone || "";
  const description = websiteSafeCopy(
    fields.business.description || "",
    websiteSafeCopy(
      page.about || "",
      websiteSafeCopy(
        page.description || "",
        `${name} serves local customers with careful workmanship and clear communication.`
      )
    )
  );
  const location = [city, state].filter(Boolean).join(", ");
  const aboutCopySafe = websiteSafeCopy(fields.content.aboutCopy || "", "");

  const curated =
    input.imageAnalyses?.length
      ? curateAssetsFromAnalyses(input.imageAnalyses, assets)
      : null;

  const logo = curated?.logoUrl || undefined;
  const aboutImg =
    curated?.aboutImage ||
    assets.find((a) => a.kind === "about")?.url ||
    undefined;
  const gallery =
    curated?.galleryImages?.length
      ? curated.galleryImages
      : assets
          .filter((a) => a.kind === "photo" || a.kind === "other")
          .map((a) => a.url);
  const heroImage =
    curated?.heroImage || gallery[0] || aboutImg || logo;
  const serviceImagePool =
    curated?.serviceImages?.length
      ? curated.serviceImages
      : gallery.slice(1);

  const research = input.research;
  const researchServices = research?.servicesMentioned || [];
  const researchAreas = research?.serviceAreas || [];

  const serviceLines = [
    ...parseServiceLines(fields.content.servicesProducts || page.category || ""),
    ...researchServices,
  ];
  const uniqueServiceLines = Array.from(new Set(serviceLines)).slice(0, 8);

  const services =
    uniqueServiceLines.length > 0
      ? uniqueServiceLines.map((line, i) => ({
          name: line,
          description: `Clear scope, careful workmanship, and communication you can count on for ${line.toLowerCase()}.`,
          longDescription: `Our ${line.toLowerCase()} service is scoped clearly up front, scheduled around your life, and finished to a standard you can inspect in person. We keep you informed, protect your property, and don’t leave you guessing about what’s included.`,
          benefits: [
            "Written scope before we start",
            "Clean jobsite habits",
            "Straightforward communication",
            "Results you can walk through",
          ],
          imageUrl: serviceImagePool[i] || "",
        }))
      : page.category
        ? [
            {
              name: page.category,
              description: description.slice(0, 220),
              longDescription: description.slice(0, 800),
              benefits: [
                "Local, responsive team",
                "Clear estimates",
                "Quality-focused finish",
              ],
              imageUrl: serviceImagePool[0] || "",
            },
          ]
        : [
            {
              name: "Core services",
              description: description.slice(0, 220),
              longDescription: description.slice(0, 800),
              benefits: [
                "Clear next steps",
                "Respectful of your home",
                "Reliable scheduling",
              ],
              imageUrl: serviceImagePool[0] || "",
            },
          ];

  const processSteps = [
    {
      title: "Tell us what you need",
      body: "Share a few details about the project — photos help. We’ll confirm fit and next steps.",
    },
    {
      title: "Get a clear estimate",
      body: "You’ll receive a straightforward scope and price so there are no surprises.",
    },
    {
      title: "We get to work",
      body: "We show up prepared, communicate along the way, and finish to a walkthrough-ready standard.",
    },
    {
      title: "Final walkthrough",
      body: "We review the results with you and make sure you’re confident before we call it done.",
    },
  ];

  const whyUs = [
    {
      title: "Clarity before commitment",
      body: "You know what’s included, what’s not, and what it costs before work begins.",
    },
    {
      title: "Local & responsive",
      body: location
        ? `We’re built around ${location} homeowners who want straight answers and solid work.`
        : "We’re built for homeowners who want straight answers and solid work.",
    },
    {
      title: "Finished like it matters",
      body: "Details, cleanup, and communication are part of the job — not extras.",
    },
  ];

  const template = pickTemplate(
    page.category || "",
    description,
    fields.content.servicesProducts || ""
  );

  const serviceAreas = [
    ...(fields.business.serviceArea
      ? [fields.business.serviceArea]
      : []),
    ...(location ? [location] : []),
    ...researchAreas,
  ].filter(Boolean);
  const uniqueAreas = Array.from(new Set(serviceAreas)).slice(0, 6);

  const faqs = fields.content.faqs
    ? fields.content.faqs
        .split(/\n{2,}|\n(?=Q[:.)])/i)
        .map((block) => block.trim())
        .filter(Boolean)
        .slice(0, 4)
        .map((block) => {
          const parts = block.split(/\n/).map((l) => l.trim()).filter(Boolean);
          return {
            question: parts[0]?.replace(/^Q[:.)]\s*/i, "") || "Question",
            answer: parts.slice(1).join(" ").replace(/^A[:.)]\s*/i, "") || "",
          };
        })
        .filter((f) => f.answer)
    : [];

  const defaultFaqs =
    faqs.length > 0
      ? faqs
      : [
          {
            question: "How do estimates work?",
            answer:
              "We review the job details, ask a few clarifying questions, and send a clear written estimate so you know what’s included before anything starts.",
          },
          {
            question: "What areas do you serve?",
            answer: location
              ? `We primarily serve ${location}${
                  uniqueAreas.length > 1
                    ? ` and nearby communities including ${uniqueAreas
                        .slice(0, 3)
                        .join(", ")}`
                    : ""
                }.`
              : "Reach out with your location — we’ll confirm whether we can take the job.",
          },
          {
            question: "How soon can you start?",
            answer:
              "Timing depends on the season and current schedule. Share your ideal window and we’ll give you a realistic start date.",
          },
        ];

  // Demo may include AI-assumed testimonials later; fallback keeps empty
  const testimonials: SiteSpec["content"]["testimonials"] = [];

  const tagline =
    fields.brand.tagline ||
    (location
      ? `Local experts serving ${location}`
      : "Done right. Communicated clearly.");

  const heroHeadline = location
    ? `${page.category || "Trusted service"} in ${location}`
    : `${name} — work you can stand behind`;

  const heroSubheadline =
    websiteSafeCopy(research?.summary || "", "").slice(0, 220) ||
    aboutCopySafe.slice(0, 220) ||
    description.slice(0, 220);

  const aboutBody = websiteSafeCopy(
    [
      aboutCopySafe || description.slice(0, 900),
      research?.summary ? `\n\n${websiteSafeCopy(research.summary)}` : "",
      research?.differentiators?.length
        ? `\n\nWhat sets us apart: ${research.differentiators.join("; ")}.`
        : "",
    ]
      .join("")
      .slice(0, 2500),
    `${name} is a local${page.category ? ` ${page.category.toLowerCase()}` : ""} business${
      location ? ` serving ${location}` : ""
    }. We focus on clear communication, careful work, and results you can inspect in person.`
  );

  const prefs = input.brandPreferences;
  const primary =
    prefs?.primaryColor ||
    (fields.brand.colors && /^#/.test(fields.brand.colors.trim())
      ? fields.brand.colors.trim().split(/[\s,]+/)[0]
      : template === "cleaning"
        ? "#0B6E4F"
        : template === "contractor"
          ? "#1F1A17"
          : "#1A1433");

  const secondary = prefs?.secondaryColor || "#F7F5F1";

  const tertiary =
    prefs?.tertiaryColor ||
    (template === "cleaning"
      ? "#145C4A"
      : template === "contractor"
        ? "#5C4033"
        : "#3D3654");

  const accent =
    prefs?.accentColor ||
    (template === "cleaning"
      ? "#1FB6D6"
      : template === "contractor"
        ? "#C45C26"
        : "#5B2E9E");

  return {
    business: {
      name,
      tagline,
      description: description.slice(0, 2000),
      phone,
      email,
      website: fields.business.existingSiteUrl || page.website || "",
      address: page.addressLine || fields.business.serviceArea || "",
      city: city || "",
      state: state || "",
      serviceAreas: uniqueAreas,
    },
    branding: {
      primaryColor: primary.startsWith("#") ? primary : "#1A1433",
      secondaryColor: secondary.startsWith("#") ? secondary : "#F7F5F1",
      tertiaryColor: tertiary.startsWith("#") ? tertiary : "#3D3654",
      accentColor: accent.startsWith("#") ? accent : "#5B2E9E",
      designStyle:
        template === "contractor"
          ? "bold"
          : template === "cleaning"
            ? "friendly"
            : "premium",
      logoUrl: logo || "",
    },
    content: {
      heroHeadline: heroHeadline.slice(0, 160),
      heroSubheadline,
      primaryCta: fields.content.primaryCta || "Get a free estimate",
      trustLine: location
        ? `Proudly serving ${location}${
            uniqueAreas.length > 1 ? ` & nearby communities` : ""
          }`
        : page.category
          ? `${page.category} for homeowners who want it done right`
          : "",
      servicesHeadline:
        template === "cleaning"
          ? "Services that leave a lasting impression"
          : template === "contractor"
            ? "Work built for real homes & real timelines"
            : "How we help",
      servicesSubheadline:
        "Straightforward options, clear estimates, and results you can inspect.",
      servicesPageHeadline:
        template === "cleaning"
          ? "Cleaning services designed around real homes"
          : template === "contractor"
            ? "Full-service work for homeowners who want it done right"
            : "Services built to move you forward",
      servicesPageIntro:
        "Explore what’s included, what to expect, and how we keep the process clear from first message to final walkthrough.",
      galleryHeadline: "Proof in the work",
      gallerySubheadline: "Recent projects from the field — not stock photos.",
      contactHeadline: "Ready when you are",
      contactSubheadline:
        "Tell us what you need. We’ll follow up with clear next steps — usually the same business day.",
      processHeadline: "How it works",
      processSubheadline: "A simple path from first conversation to finished work.",
      processSteps,
      whyUsHeadline: "Why homeowners choose us",
      whyUs,
      about: {
        headline: `About ${name}`,
        body: aboutBody,
      },
      aboutPageHeadline: `The story behind ${name}`,
      aboutPageBody: websiteSafeCopy(
        aboutBody +
          (research?.differentiators?.length
            ? ""
            : "\n\nWe’re focused on clear communication, careful work, and a finished result you feel good about recommending."),
        aboutBody
      ),
      services: assignServiceImages(
        services.map((s) => ({
          ...s,
          imageUrl: s.imageUrl || "",
          longDescription: s.longDescription || s.description || "",
          benefits: s.benefits || [],
        })),
        input.imageAnalyses || []
      ),
      testimonials,
      faqs: defaultFaqs,
    },
    layout: {
      template,
      heroVariant:
        template === "professional"
          ? "centered"
          : heroImage
            ? "background"
            : "split",
      servicesVariant:
        template === "cleaning"
          ? "cards"
          : template === "contractor"
            ? "alternating"
            : "icons",
      sectionOrder: (() => {
        const analyses = input.imageAnalyses || [];
        const hasPairs = buildGalleryPairs(analyses).length > 0;
        return [
          "hero",
          "services",
          "about",
          ...(hasPairs ? (["beforeAfter"] as const) : []),
          "gallery",
          "testimonials",
          "faq",
          "contact",
        ];
      })(),
    },
    assets: (() => {
      const analyses = input.imageAnalyses || [];
      const galleryPairs = buildGalleryPairs(analyses);
      const paired = new Set(
        galleryPairs.flatMap((p) => [p.beforeUrl, p.afterUrl])
      );
      const galleryImages = (
        analyses.length
          ? unpairedGalleryImages(analyses, galleryPairs)
          : gallery
      )
        .filter((u) => !paired.has(u))
        .slice(0, 16);

      return {
        heroImage: heroImage || "",
        aboutImage: aboutImg || galleryImages[0] || gallery[1] || "",
        galleryImages,
        galleryPairs,
      };
    })(),
  };
}
