import OpenAI from "openai";
import type { PreviewGenerationInput } from "@/lib/preview/mapOnboardingFields";
import { mapOnboardingFieldsToSiteSpec } from "@/lib/preview/mapOnboardingFields";
import type { CompanyResearch } from "@/lib/preview/researchCompany";
import {
  cleanPostSnippet,
  looksLikeFacebookChrome,
  websiteSafeCopy,
} from "@/lib/preview/sanitizeCopy";
import {
  SITE_SPEC_JSON_SCHEMA,
  siteSpecSchema,
  type SiteSpec,
} from "@/lib/preview/siteSpecSchema";
import { cleanBusinessName } from "@/lib/preview/cleanBusinessName";
import {
  assignServiceImages,
  buildGalleryPairs,
  unpairedGalleryImages,
} from "@/lib/preview/galleryPairs";
import { resolveOpenAiTextModel } from "@/lib/preview/openaiModels";

const SYSTEM_PROMPT = `You are a senior agency strategist + copywriter building a SiteSpec for a ~$4,000 custom local-business website DEMO.

This demo must feel like a finished premium multi-page site a picky client would pay for.
If anyone looks at this and thinks “meh / Canva / not worth it,” you failed.

NEVER OUTPUT FACEBOOK COPY:
- Never include followers, likes, “talking about this”, “were here”, Like/Comment UI, Reels/Posts tabs, language switchers, cookie/login walls, or scraped Meta chrome.
- Ignore any source text that looks like Facebook UI. Rewrite into polished website copy.
- about.body and aboutPageBody must read like a real agency About page — never a social profile dump.

STAY IN THEIR ACTUAL TRADE (CRITICAL):
- Services MUST match this business's real trade from name, category, about, posts, and webResearch.servicesMentioned.
- Expand into 4–8 closely related offerings WITHIN that trade only.
- Example: a power washing / pressure washing / soft washing company → house wash, driveway, deck/fence, gutters, roof soft wash, fleet/commercial wash. NEVER invent vinyl siding, roofing install, painting, remodeling, carpentry, or other trades just because photos show a house.
- Photos show the SURFACE they work on, not a different profession. A dirty cedar house for a wash company is a cleaning job (often a BEFORE shot) — not a siding service.
- Prefer servicesMentioned from webResearch and servicesText when present; only invent close cousins of those.

ASSUMPTIONS (within the trade only):
- Fill gaps confidently with plausible content for THIS category of local business.
- Write longDescriptions + 3–5 benefits per service for a dedicated Services page.
- Invent a crisp process (3–4 steps), why-us points, and useful FAQs that remove buying friction.
- Expand about into aboutPageBody (multi-paragraph, human, specific-feeling).
- You MAY write 2–4 plausible testimonials (first name + optional city).
- Prefer real phone, email, city/state, address, and image URLs when present; lock brandPreferences colors exactly when provided.

Hard rules:
- Output ONLY valid JSON matching the schema. Never HTML/JSX/CSS/markdown.
- Choose layout.template: "contractor" | "cleaning" | "professional".
  For wash / clean / pressure / soft-wash businesses prefer "cleaning".
- sectionOrder must include hero + services + about + contact; include beforeAfter when you have galleryPairs; include gallery if unpaired images exist; include testimonials if you wrote any; include faq if you wrote FAQs.
- business.name: trade name only — do NOT append city/town/state unless that place name is clearly part of the brand (usually at the start, e.g. "Plymouth Power Washing").
- Image URLs: ONLY from the attached photos / imageIndexMap. Never invent URLs.
- You can SEE each photo. Place using what you see + the classification labels.
- heroImage: best flattering FINISHED / AFTER result for this trade — NEVER a before, dirty, stained, weathered, or "needs repair" shot. Prefer role=hero or isAfter=true + flattering=true.
- aboutImage: people/team when possible.
- logoUrl: only a real logo mark else "".
- Service imageUrl: MUST show that service's finished work (AFTER). Match the photo subject to the service (driveway wash photo → driveway service). Never put a dirty before shot, or a mismatched surface, on a service card.
- assets.galleryPairs: for every before/after set you can identify, include { beforeUrl, afterUrl, caption }. Do not put unpaired before shots alone in galleryImages — either pair them or omit the before.
- galleryImages: unpaired AFTER / finished proof photos only (not befores that belong in a pair).

COPY QUALITY ($4k bar):
- heroHeadline sells an outcome + locality — not just the business name.
- Every line should make the owner think: “this could get me booked.”
- No lazy filler (“we take pride in excellence”, “quality you can trust”).`;

async function callOpenAiOnce(
  client: OpenAI,
  model: string,
  textPayload: unknown,
  images: Array<{ url: string; label: string }>
): Promise<unknown> {
  const content: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [
    {
      type: "text",
      text: `Build a premium $4k-quality SiteSpec (full multi-page demo) from this source JSON.
You will SEE the business photos below — each is labeled with index, URL, and a vision classification.
Use those classifications to place images intentionally. Never paste Facebook UI text into any field.

${JSON.stringify(textPayload, null, 2)}`,
    },
  ];

  images.slice(0, 8).forEach((img, index) => {
    content.push({
      type: "text",
      text: `PHOTO ${index}\nURL (use exactly when placing): ${img.url}\nVision classification: ${img.label}`,
    });
    content.push({
      type: "image_url",
      image_url: {
        url: img.url,
        detail: "low",
      },
    });
  });

  const completion = await client.chat.completions.create({
    model,
    temperature: 0.55,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "site_spec",
        strict: true,
        schema: SITE_SPEC_JSON_SCHEMA,
      },
    },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content },
    ],
  });

  const text = completion.choices[0]?.message?.content || "";
  if (!text) throw new Error("Empty model response");
  return JSON.parse(text) as unknown;
}

function scrubCopy(value: string, fallback = ""): string {
  return websiteSafeCopy(value || "", fallback);
}

function scrubSiteSpecCopy(spec: SiteSpec, fallback: SiteSpec): SiteSpec {
  const scrub = (v: string, fb = "") => {
    const cleaned = scrubCopy(v, fb);
    return looksLikeFacebookChrome(cleaned) ? fb : cleaned;
  };

  return {
    ...spec,
    business: {
      ...spec.business,
      description: scrub(
        spec.business.description,
        fallback.business.description
      ),
      tagline: scrub(spec.business.tagline, fallback.business.tagline),
    },
    content: {
      ...spec.content,
      heroHeadline: scrub(
        spec.content.heroHeadline,
        fallback.content.heroHeadline
      ),
      heroSubheadline: scrub(
        spec.content.heroSubheadline,
        fallback.content.heroSubheadline
      ),
      trustLine: scrub(spec.content.trustLine, fallback.content.trustLine),
      servicesHeadline: scrub(
        spec.content.servicesHeadline,
        fallback.content.servicesHeadline
      ),
      servicesSubheadline: scrub(
        spec.content.servicesSubheadline,
        fallback.content.servicesSubheadline
      ),
      servicesPageHeadline: scrub(
        spec.content.servicesPageHeadline,
        fallback.content.servicesPageHeadline
      ),
      servicesPageIntro: scrub(
        spec.content.servicesPageIntro,
        fallback.content.servicesPageIntro
      ),
      galleryHeadline: scrub(
        spec.content.galleryHeadline,
        fallback.content.galleryHeadline
      ),
      gallerySubheadline: scrub(
        spec.content.gallerySubheadline,
        fallback.content.gallerySubheadline
      ),
      contactHeadline: scrub(
        spec.content.contactHeadline,
        fallback.content.contactHeadline
      ),
      contactSubheadline: scrub(
        spec.content.contactSubheadline,
        fallback.content.contactSubheadline
      ),
      processHeadline: scrub(
        spec.content.processHeadline,
        fallback.content.processHeadline
      ),
      processSubheadline: scrub(
        spec.content.processSubheadline,
        fallback.content.processSubheadline
      ),
      whyUsHeadline: scrub(
        spec.content.whyUsHeadline,
        fallback.content.whyUsHeadline
      ),
      about: {
        headline: scrub(
          spec.content.about.headline,
          fallback.content.about.headline
        ),
        body: scrub(spec.content.about.body, fallback.content.about.body),
      },
      aboutPageHeadline: scrub(
        spec.content.aboutPageHeadline,
        fallback.content.aboutPageHeadline
      ),
      aboutPageBody: scrub(
        spec.content.aboutPageBody,
        fallback.content.aboutPageBody
      ),
      services: spec.content.services.map((s, i) => ({
        ...s,
        name: scrub(s.name, fallback.content.services[i]?.name || s.name),
        description: scrub(
          s.description,
          fallback.content.services[i]?.description || ""
        ),
        longDescription: scrub(
          s.longDescription,
          fallback.content.services[i]?.longDescription || s.description || ""
        ),
        benefits: (s.benefits || [])
          .map((b) => scrub(b, ""))
          .filter(Boolean),
      })),
      testimonials: (spec.content.testimonials || [])
        .map((t) => ({
          name: scrub(t.name, ""),
          text: scrub(t.text, ""),
        }))
        .filter((t) => t.name && t.text && !looksLikeFacebookChrome(t.text)),
      faqs: (spec.content.faqs || [])
        .map((f) => ({
          question: scrub(f.question, ""),
          answer: scrub(f.answer, ""),
        }))
        .filter((f) => f.question && f.answer),
      processSteps: (spec.content.processSteps || []).map((s, i) => ({
        title: scrub(s.title, fallback.content.processSteps[i]?.title || ""),
        body: scrub(s.body, fallback.content.processSteps[i]?.body || ""),
      })),
      whyUs: (spec.content.whyUs || []).map((s, i) => ({
        title: scrub(s.title, fallback.content.whyUs[i]?.title || ""),
        body: scrub(s.body, fallback.content.whyUs[i]?.body || ""),
      })),
    },
  };
}

function looksLikeBeforeShot(text: string) {
  return /\b(before|dirty|stained|mold|mildew|algae|weathered|needs?\s*(work|repair|fix)|run.?down|filthy|grimy)\b/i.test(
    text
  );
}

/** Prefer vision-approved finished work; never keep a before/dirty hero. */
function resolveHeroImage(
  chosen: string,
  analyses: PreviewGenerationInput["imageAnalyses"],
  fallbackHero: string
): string {
  const list = analyses || [];
  if (!list.length) return chosen || fallbackHero;

  const byUrl = new Map(list.map((a) => [a.url, a]));
  const chosenMeta = chosen ? byUrl.get(chosen) : undefined;
  const chosenIsBad =
    !chosen ||
    !chosenMeta ||
    chosenMeta.isBefore ||
    chosenMeta.roleSuggestion === "skip" ||
    (!chosenMeta.flattering && !chosenMeta.isAfter) ||
    looksLikeBeforeShot(
      `${chosenMeta.subject} ${chosenMeta.classification} ${chosenMeta.notes}`
    );

  if (!chosenIsBad) return chosen;

  const ranked = [...list]
    .filter(
      (a) =>
        a.roleSuggestion !== "skip" &&
        a.roleSuggestion !== "logo" &&
        !a.isBefore &&
        a.quality !== "low" &&
        (a.flattering || a.isAfter || a.roleSuggestion === "hero")
    )
    .sort((a, b) => {
      const score = (x: (typeof list)[number]) =>
        (x.roleSuggestion === "hero" ? 8 : 0) +
        (x.isAfter ? 4 : 0) +
        (x.flattering ? 3 : 0) +
        (x.quality === "high" ? 2 : x.quality === "medium" ? 1 : 0) -
        (looksLikeBeforeShot(
          `${x.subject} ${x.classification} ${x.notes}`
        )
          ? 10
          : 0);
      return score(b) - score(a);
    });

  return ranked[0]?.url || chosen || fallbackHero;
}

function sanitizeSpecAgainstSource(
  spec: SiteSpec,
  input: PreviewGenerationInput,
  fallback: SiteSpec
): SiteSpec {
  const allowedUrls = new Set(
    [
      ...input.assets.map((a) => a.url),
      input.page.profilePictureUrl,
      input.page.coverPhotoUrl,
      ...input.page.photoUrls,
    ].filter(Boolean)
  );

  const keepUrl = (url?: string) =>
    url && allowedUrls.has(url) ? url : "";

  const branding = {
    ...spec.branding,
    logoUrl: keepUrl(spec.branding.logoUrl),
  };

  if (input.brandPreferences) {
    branding.primaryColor = input.brandPreferences.primaryColor;
    branding.secondaryColor = input.brandPreferences.secondaryColor;
    branding.tertiaryColor = input.brandPreferences.tertiaryColor;
    branding.accentColor = input.brandPreferences.accentColor;
  }

  const analyses = input.imageAnalyses || [];

  let services = (spec.content.services.length
    ? spec.content.services
    : fallback.content.services
  ).map((s) => ({
    ...s,
    imageUrl: keepUrl(s.imageUrl),
    longDescription:
      websiteSafeCopy(s.longDescription || s.description || "") ||
      `Professional ${s.name.toLowerCase()} with clear communication and careful workmanship.`,
    benefits:
      (s.benefits || []).map((b) => websiteSafeCopy(b, "")).filter(Boolean)
        .length > 0
        ? (s.benefits || []).map((b) => websiteSafeCopy(b, "")).filter(Boolean)
        : [
            "Clear scope before work begins",
            "Respectful of your home and schedule",
            "Results you can inspect",
          ],
    description:
      websiteSafeCopy(s.description || "") ||
      `Reliable ${s.name.toLowerCase()} for local homeowners.`,
  }));

  // Re-match service images to the right finished-work photo for that service
  services = assignServiceImages(services, analyses);

  const heroImage = resolveHeroImage(
    keepUrl(spec.assets.heroImage),
    analyses,
    fallback.assets.heroImage
  );

  const modelPairs = (spec.assets.galleryPairs || [])
    .map((p) => ({
      beforeUrl: keepUrl(p.beforeUrl),
      afterUrl: keepUrl(p.afterUrl),
      caption: websiteSafeCopy(p.caption || "", "Before & after"),
    }))
    .filter((p) => p.beforeUrl && p.afterUrl && p.beforeUrl !== p.afterUrl);

  const visionPairs = buildGalleryPairs(analyses)
    .map((p) => ({
      beforeUrl: keepUrl(p.beforeUrl),
      afterUrl: keepUrl(p.afterUrl),
      caption: websiteSafeCopy(p.caption || "", "Before & after"),
    }))
    .filter((p) => p.beforeUrl && p.afterUrl);

  // Prefer model pairs when valid; merge in any vision pairs not already covered
  const galleryPairs = [...modelPairs];
  const covered = new Set(
    galleryPairs.flatMap((p) => [p.beforeUrl, p.afterUrl])
  );
  for (const p of visionPairs) {
    if (covered.has(p.beforeUrl) || covered.has(p.afterUrl)) continue;
    galleryPairs.push(p);
    covered.add(p.beforeUrl);
    covered.add(p.afterUrl);
  }

  const pairedUrls = new Set(
    galleryPairs.flatMap((p) => [p.beforeUrl, p.afterUrl])
  );

  let galleryImages = (spec.assets.galleryImages || [])
    .map((u) => keepUrl(u))
    .filter((u): u is string => Boolean(u) && !pairedUrls.has(u));

  // Drop lone before shots from the flat gallery
  const beforeUrls = new Set(
    analyses.filter((a) => a.isBefore).map((a) => a.url)
  );
  galleryImages = galleryImages.filter((u) => !beforeUrls.has(u));

  if (!galleryImages.length && analyses.length) {
    galleryImages = unpairedGalleryImages(analyses, galleryPairs).filter(
      (u) => allowedUrls.has(u)
    );
  }

  const cleanedName = cleanBusinessName(
    spec.business.name || fallback.business.name,
    input.fields.business.city || input.page.city,
    input.fields.business.state || input.page.state
  );

  let sectionOrder = [...(spec.layout.sectionOrder || [])];
  const hasPairs = galleryPairs.length > 0;
  if (hasPairs && !sectionOrder.includes("beforeAfter")) {
    const aboutIdx = sectionOrder.indexOf("about");
    const galleryIdx = sectionOrder.indexOf("gallery");
    const insertAt =
      galleryIdx >= 0 ? galleryIdx : aboutIdx >= 0 ? aboutIdx + 1 : 2;
    sectionOrder.splice(insertAt, 0, "beforeAfter");
  }
  if (!hasPairs) {
    sectionOrder = sectionOrder.filter((s) => s !== "beforeAfter");
  }
  if (!galleryImages.length) {
    sectionOrder = sectionOrder.filter((s) => s !== "gallery");
  }

  // Drop non-logo URLs that slipped into logoUrl (e.g. FB profile)
  let logoUrl = keepUrl(branding.logoUrl);
  if (logoUrl) {
    const logoMeta = analyses.find((a) => a.url === logoUrl);
    if (
      !logoMeta ||
      logoMeta.roleSuggestion !== "logo" ||
      /profile|portrait|selfie|headshot|person/i.test(
        `${logoMeta.subject} ${logoMeta.classification} ${logoMeta.notes}`
      )
    ) {
      logoUrl = "";
    }
  }

  const scrubbed = scrubSiteSpecCopy(
    {
      ...spec,
      business: {
        ...spec.business,
        name: cleanedName,
      },
      branding: {
        ...branding,
        logoUrl,
      },
      layout: {
        ...spec.layout,
        sectionOrder,
      },
      content: {
        ...spec.content,
        services,
        aboutPageBody:
          websiteSafeCopy(spec.content.aboutPageBody) ||
          websiteSafeCopy(spec.content.about.body) ||
          fallback.content.aboutPageBody,
        aboutPageHeadline:
          websiteSafeCopy(spec.content.aboutPageHeadline) ||
          websiteSafeCopy(spec.content.about.headline) ||
          "About",
        servicesPageHeadline:
          websiteSafeCopy(spec.content.servicesPageHeadline) ||
          websiteSafeCopy(spec.content.servicesHeadline) ||
          "Services",
        servicesPageIntro:
          websiteSafeCopy(spec.content.servicesPageIntro) ||
          websiteSafeCopy(spec.content.servicesSubheadline) ||
          "",
      },
      assets: {
        heroImage,
        aboutImage: keepUrl(spec.assets.aboutImage),
        galleryImages: galleryImages.slice(0, 16),
        galleryPairs: galleryPairs.slice(0, 8),
      },
    },
    fallback
  );

  return scrubbed;
}

/**
 * Generate a validated SiteSpec via OpenAI (retry once), else deterministic fallback.
 */
export async function generateSiteSpec(
  input: PreviewGenerationInput & { research?: CompanyResearch }
): Promise<{ siteSpec: SiteSpec; usedAi: boolean }> {
  const fallback = mapOnboardingFieldsToSiteSpec(input);
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    console.warn("[preview-ai] OPENAI_API_KEY missing — using fallback SiteSpec");
    return { siteSpec: fallback, usedAi: false };
  }

  const model = resolveOpenAiTextModel();
  const client = new OpenAI({ apiKey });

  const analyses = input.imageAnalyses || [];
  const imagesForModel = (
    analyses.length
      ? analyses
          .filter((a) => a.roleSuggestion !== "skip")
          .map((a) => ({
            url: a.url,
            label: [
              a.classification || a.subject,
              `role=${a.roleSuggestion}`,
              a.quality,
              a.isBefore ? "before" : "",
              a.isAfter ? "after" : "",
              a.pairId ? `pairId=${a.pairId}` : "",
              a.peopleVisible ? "people" : "",
              a.flattering ? "flattering" : "",
              a.notes,
            ]
              .filter(Boolean)
              .join(" | "),
          }))
      : input.assets.map((a) => ({
          url: a.url,
          label: `import kind=${a.kind}`,
        }))
  )
    .filter((img) => /^https?:\/\//i.test(img.url))
    .slice(0, 8);

  const imageIndexMap = Object.fromEntries(
    imagesForModel.map((img, index) => [String(index), img.url])
  );

  const research = input.research;
  const safeDescription = websiteSafeCopy(
    input.fields.business.description || "",
    ""
  );
  const safeAboutCopy = websiteSafeCopy(input.fields.content.aboutCopy || "", "");
  const safePosts = (input.page.postSnippets || [])
    .map(cleanPostSnippet)
    .filter(Boolean)
    .slice(0, 6);

  const userPayload = {
    businessName: input.fields.contact.businessName || input.page.name,
    phone: input.fields.contact.phone || input.page.phone,
    email: input.fields.contact.email || input.page.email || input.fallbackEmail,
    website: input.fields.business.existingSiteUrl || input.page.website,
    city: input.fields.business.city || input.page.city,
    state: input.fields.business.state || input.page.state,
    address: input.page.addressLine,
    category: input.page.category,
    // Never send raw Facebook about/description dumps
    description: safeDescription,
    aboutCopyHint: safeAboutCopy,
    servicesText: websiteSafeCopy(
      input.fields.content.servicesProducts || "",
      input.page.category || ""
    ),
    taglineHint: websiteSafeCopy(input.fields.brand.tagline || "", ""),
    primaryCtaHint: websiteSafeCopy(
      input.fields.content.primaryCta || "",
      "Get a free estimate"
    ),
    postSnippets: safePosts,
    brandPreferences: input.brandPreferences || null,
    webResearch: research
      ? {
          summary: websiteSafeCopy(research.summary || "", ""),
          servicesMentioned: research.servicesMentioned,
          differentiators: research.differentiators,
          serviceAreas: research.serviceAreas,
          toneNotes: websiteSafeCopy(research.toneNotes || "", ""),
          sources: research.sources,
          usedWeb: research.usedWeb,
        }
      : null,
    imageAnalyses: analyses.map((a) => ({
      url: a.url,
      subject: a.subject,
      classification: a.classification,
      quality: a.quality,
      roleSuggestion: a.roleSuggestion,
      isBefore: a.isBefore,
      isAfter: a.isAfter,
      pairId: a.pairId,
      flattering: a.flattering,
      peopleVisible: a.peopleVisible,
      notes: a.notes,
      kindHint: a.kindHint,
    })),
    imageIndexMap,
    note: "Photos are attached as real images for vision. Match service images to the correct finished work. Put before/after into galleryPairs with labels — never show a before alone without its after. Never output Facebook UI copy.",
  };

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      console.log(
        `[preview-ai] SiteSpec attempt ${attempt} with ${model} (${imagesForModel.length} images attached detail=low)`
      );
      const raw = await callOpenAiOnce(
        client,
        model,
        userPayload,
        imagesForModel
      );
      const parsed = siteSpecSchema.parse(raw);
      const siteSpec = sanitizeSpecAgainstSource(parsed, input, fallback);

      if (!siteSpec.business.name.trim()) {
        siteSpec.business.name = fallback.business.name;
      }
      if (!siteSpec.content.heroHeadline.trim()) {
        siteSpec.content.heroHeadline = fallback.content.heroHeadline;
      }
      if (!siteSpec.content.services.length && fallback.content.services.length) {
        siteSpec.content.services = fallback.content.services;
      }
      if (!siteSpec.content.processSteps.length) {
        siteSpec.content.processSteps = fallback.content.processSteps;
      }
      if (!siteSpec.content.whyUs.length) {
        siteSpec.content.whyUs = fallback.content.whyUs;
      }
      if (!siteSpec.content.faqs.length) {
        siteSpec.content.faqs = fallback.content.faqs;
      }
      if (
        !siteSpec.content.about.body.trim() ||
        looksLikeFacebookChrome(siteSpec.content.about.body)
      ) {
        siteSpec.content.about.body = fallback.content.about.body;
      }
      if (
        !siteSpec.content.aboutPageBody.trim() ||
        looksLikeFacebookChrome(siteSpec.content.aboutPageBody)
      ) {
        siteSpec.content.aboutPageBody = fallback.content.aboutPageBody;
      }
      if (!siteSpec.assets.galleryImages.length && fallback.assets.galleryImages.length) {
        siteSpec.assets.galleryImages = fallback.assets.galleryImages;
      }
      if (
        !siteSpec.assets.galleryPairs?.length &&
        fallback.assets.galleryPairs?.length
      ) {
        siteSpec.assets.galleryPairs = fallback.assets.galleryPairs;
      }
      if (!siteSpec.assets.galleryPairs) {
        siteSpec.assets.galleryPairs = [];
      }
      if (!siteSpec.assets.heroImage && fallback.assets.heroImage) {
        siteSpec.assets.heroImage = fallback.assets.heroImage;
      }
      if (!siteSpec.assets.aboutImage && fallback.assets.aboutImage) {
        siteSpec.assets.aboutImage = fallback.assets.aboutImage;
      }
      if (input.brandPreferences) {
        siteSpec.branding.primaryColor = input.brandPreferences.primaryColor;
        siteSpec.branding.secondaryColor = input.brandPreferences.secondaryColor;
        siteSpec.branding.tertiaryColor = input.brandPreferences.tertiaryColor;
        siteSpec.branding.accentColor = input.brandPreferences.accentColor;
      }
      return { siteSpec, usedAi: true };
    } catch (error) {
      console.warn(
        `[preview-ai] attempt ${attempt} failed`,
        error instanceof Error ? error.message : error
      );
    }
  }

  console.warn("[preview-ai] falling back to deterministic SiteSpec");
  return { siteSpec: fallback, usedAi: false };
}
