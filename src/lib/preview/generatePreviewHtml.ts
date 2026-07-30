import OpenAI from "openai";
import type { CleanedOnboardingFields } from "@/lib/facebookOnboardingAi";
import type { FacebookPageImportData } from "@/lib/facebookPageImport";
import type { ImportedBlobAsset } from "@/lib/facebookPageImport";
import type { PreviewBrandPreferences } from "@/lib/preview/brandPreferences";
import type { PreviewImageAnalysis } from "@/lib/preview/analyzePreviewImages";
import {
  enforcePagePrimaryImage,
  resolveHtmlPageImageRoles,
  type HtmlPageImageRoles,
} from "@/lib/preview/assignHtmlPageImages";
import { resolveOpenAiHtmlModel } from "@/lib/preview/openaiModels";
import type { CompanyResearch } from "@/lib/preview/researchCompany";
import { websiteSafeCopy } from "@/lib/preview/sanitizeCopy";
import { sanitizePreviewViewportUnits } from "@/lib/preview/sanitizePreviewViewportUnits";

export type PreviewHtmlPages = {
  home: string;
  services: string;
  about: string;
};

type PageKind = "home" | "services" | "about";

const PAGE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["html"],
  properties: {
    html: { type: "string" },
  },
} as const;

const DESIGN_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "fontHeading",
    "fontBody",
    "ink",
    "paper",
    "accent",
    "band",
    "voiceNotes",
    "heroHeadline",
    "heroSubheadline",
    "primaryCta",
  ],
  properties: {
    fontHeading: { type: "string" },
    fontBody: { type: "string" },
    ink: { type: "string" },
    paper: { type: "string" },
    accent: { type: "string" },
    band: { type: "string" },
    voiceNotes: { type: "string" },
    heroHeadline: { type: "string" },
    heroSubheadline: { type: "string" },
    primaryCta: { type: "string" },
  },
} as const;

const QUALITY_RULES = `You are a senior agency copywriter + designer shipping a paid ~$4,000 CUSTOM website for a real local client (Bsites).

QUALITY BAR (non-negotiable):
- This must feel custom to THIS business — not a Tailwind template, not “AI filler.”
- Copy must be sharp, specific, and sales-ready: concrete outcomes, local proof, zero fluff.
  Bad: “We take pride in quality workmanship and customer satisfaction.”
  Good: “Algae-stained siding to bright again — usually in a day, with clear pricing before we spray.”
- Headlines sell a result + locality when natural. Body copy sounds like a trusted local pro, not a brochure bot.
- Study every attached photo. Hero = flattering FINISHED/AFTER only. Never a dirty before as hero.
- IMAGE ROLES: The brief’s homeHeroUrl is for the HOME page hero ONLY. Services and About must use their own assigned primary URLs — never reuse homeHeroUrl as their page hero / primary photo.
- Before/after pairs: labeled side-by-side in a dedicated section when those photos exist.
- Nav brand = exact businessName only. Never append city/town unless already inside businessName.
- City/state belong in trust lines / service area / footer — not the logo wordmark.
- Expressive Google Fonts. Dark hero scrim under light type. No purple-on-white AI cliché unless brand forces it.
- Stay in their actual trade for services.

NAVBAR (must work — this was broken before; do not ship a fake menu):
- Sticky top nav on every page with: logo/wordmark, links to index.html, services.html, about.html, and a primary CTA (tel: or #contact).
- Desktop: horizontal links visible.
- Mobile: a real hamburger <button type="button" aria-expanded="false" aria-controls="mobile-nav"> that toggles #mobile-nav. Include inline <script> that toggles a class (e.g. hidden / translate) AND aria-expanded. The menu must open and close on click.
- Active page can be visually indicated.
- All nav hrefs MUST be exactly: index.html | services.html | about.html (we rewrite routes later). Never use # for those three pages.

HTML RULES:
- One COMPLETE HTML5 document: <!DOCTYPE html>, <html>, <head>, <body>, closing tags.
- Tailwind CDN + optional Google Fonts + minimal <script> for mobile nav.
- Only real https image URLs from the brief/attachments.
- No lorem, TODO, Coming soon, or Facebook UI chrome.
- HERO HEIGHT: use a FIXED min-height only (min-h-[720px] or min-h-[800px]). NEVER 100vh, h-screen, min-h-screen, dvh, or calc(100vh…). Demos render in an iframe that grows to page height — vh then equals the full document and the hero balloons.
- HERO MEDIA: full-bleed via CSS background-size:cover (prefer inline background-size:cover with background-image) OR an absolutely positioned img with inset-0 h-full w-full object-cover inside overflow-hidden. Never a normal flow <img> for the hero (intrinsic size breaks the layout).`;

export async function generatePreviewHtml(input: {
  fields: CleanedOnboardingFields;
  page: FacebookPageImportData;
  assets: ImportedBlobAsset[];
  imageAnalyses: PreviewImageAnalysis[];
  research?: CompanyResearch;
  brandPreferences?: PreviewBrandPreferences;
  businessName: string;
  fallbackEmail: string;
}): Promise<{ pages: PreviewHtmlPages; model: string; usedAi: boolean }> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required to generate preview HTML");
  }

  const model = resolveOpenAiHtmlModel();
  const client = new OpenAI({ apiKey });

  const images = (
    input.imageAnalyses.length
      ? input.imageAnalyses.filter((a) => a.roleSuggestion !== "skip")
      : input.assets.map((a) => ({
          url: a.url,
          classification: a.kind,
          roleSuggestion: a.kind === "logo" ? "logo" : "gallery",
          isBefore: false,
          isAfter: false,
          flattering: false,
          pairId: "",
          subject: a.caption || a.kind,
          notes: "",
          quality: "medium" as const,
        }))
  )
    .filter((img) => /^https?:\/\//i.test(img.url))
    .slice(0, 8);

  const imageRoles = resolveHtmlPageImageRoles(
    input.imageAnalyses,
    images.map((img) => img.url),
  );
  console.log("[preview-html] page image roles", {
    homeHero: imageRoles.homeHeroUrl.slice(0, 80),
    servicesHero: imageRoles.servicesHeroUrl.slice(0, 80),
    about: imageRoles.aboutImageUrl.slice(0, 80),
  });

  const brief = {
    businessName: input.businessName,
    phone: input.fields.contact.phone || input.page.phone || "",
    email:
      input.fields.contact.email ||
      input.page.email ||
      input.fallbackEmail ||
      "",
    city: input.fields.business.city || input.page.city || "",
    state: input.fields.business.state || input.page.state || "",
    category: input.page.category || "",
    description: websiteSafeCopy(input.fields.business.description || "", ""),
    servicesText: websiteSafeCopy(
      input.fields.content.servicesProducts || "",
      input.page.category || "",
    ),
    aboutHint: websiteSafeCopy(input.fields.content.aboutCopy || "", ""),
    brandPreferences: input.brandPreferences || null,
    webResearch: input.research
      ? {
          summary: websiteSafeCopy(input.research.summary || "", ""),
          servicesMentioned: input.research.servicesMentioned,
          differentiators: input.research.differentiators,
          serviceAreas: input.research.serviceAreas,
        }
      : null,
    imageAssignments: {
      homeHeroUrl: imageRoles.homeHeroUrl,
      servicesHeroUrl: imageRoles.servicesHeroUrl,
      aboutImageUrl: imageRoles.aboutImageUrl,
      rules: [
        "homeHeroUrl is for the HOME page full-bleed hero ONLY.",
        "servicesHeroUrl is for the SERVICES page hero/banner ONLY — never use homeHeroUrl there.",
        "aboutImageUrl is the ABOUT page primary story/portrait photo — never use homeHeroUrl as that primary.",
        "Other photos may appear in secondary sections (gallery, service cards).",
      ],
    },
    imageGuide: input.imageAnalyses.slice(0, 12).map((a) => ({
      url: a.url,
      classification: a.classification || a.subject,
      role: a.roleSuggestion,
      isBefore: a.isBefore,
      isAfter: a.isAfter,
      pairId: a.pairId || "",
      flattering: a.flattering,
      notes: a.notes,
    })),
  };

  console.log(`[preview-html] design system via ${model}`);
  const design = await generateDesignSystem(client, model, brief, images);

  const shared = {
    brief,
    design,
    imageRoles,
  };

  console.log(
    `[preview-html] pages (home/services/about) via ${model} in parallel`,
  );
  const [home, services, about] = await Promise.all([
    generateOnePage(client, model, "home", shared, images),
    generateOnePage(client, model, "services", shared, images),
    generateOnePage(client, model, "about", shared, images),
  ]);

  const pages = {
    home: assertCompletePage(home, "home"),
    services: assertCompletePage(services, "services"),
    about: assertCompletePage(about, "about"),
  };

  return { pages, model, usedAi: true };
}

async function generateDesignSystem(
  client: OpenAI,
  model: string,
  brief: unknown,
  images: Array<{ url: string }>,
) {
  const content: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [
    {
      type: "text",
      text: `Define a distinctive design + voice system for this $4k client site. Return JSON only.

CLIENT BRIEF:
${JSON.stringify(brief, null, 2)}

Pick expressive font pair names (Google Fonts), a tight palette, and sharp hero copy (no fluff). Voice notes should describe tone in 2–3 sentences.`,
    },
  ];
  images.slice(0, 4).forEach((img, i) => {
    content.push({ type: "text", text: `PHOTO ${i}: ${img.url}` });
    content.push({
      type: "image_url",
      image_url: { url: img.url, detail: "low" },
    });
  });

  const completion = await client.chat.completions.create({
    model,
    max_completion_tokens: 4096,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "preview_design_system",
        strict: true,
        schema: DESIGN_SCHEMA,
      },
    },
    messages: [
      { role: "system", content: QUALITY_RULES },
      { role: "user", content },
    ],
  });

  const text = completion.choices[0]?.message?.content || "";
  if (!text) throw new Error("Empty design system response");
  return JSON.parse(text) as Record<string, string>;
}

function pageImageInstructions(page: PageKind, roles: HtmlPageImageRoles) {
  if (page === "home") {
    return `HOME IMAGE RULES:
- Full-bleed hero MUST use this exact URL: ${roles.homeHeroUrl || "(best finished-work photo from attachments)"}
- Do not use aboutImageUrl as the home hero.`;
  }
  if (page === "services") {
    return `SERVICES IMAGE RULES:
- Page hero / banner MUST use this exact URL: ${roles.servicesHeroUrl || "(a gallery/service photo)"}
- NEVER use homeHeroUrl (${roles.homeHeroUrl || "n/a"}) as the services page hero.
- Match service card images to finished work for that service when possible.`;
  }
  return `ABOUT IMAGE RULES:
- Primary story / portrait photo MUST use this exact URL: ${roles.aboutImageUrl || roles.servicesHeroUrl || "(owner/team or non-hero photo)"}
- NEVER use homeHeroUrl (${roles.homeHeroUrl || "n/a"}) as the about page primary photo.`;
}

async function generateOnePage(
  client: OpenAI,
  model: string,
  page: PageKind,
  shared: {
    brief: unknown;
    design: Record<string, string>;
    imageRoles: HtmlPageImageRoles;
  },
  images: Array<{ url: string; [key: string]: unknown }>,
): Promise<string> {
  const pageBrief =
    page === "home"
      ? "HOME: full-bleed hero, services teaser (3–6), before/after if pairs exist, about teaser, gallery of finished work, contact/CTA. Sticky working navbar."
      : page === "services"
        ? "SERVICES: page hero, full services list with matched finished-work images + specific copy/benefits each, process, CTA. Same sticky working navbar + visual system as home."
        : "ABOUT: story page with owner/team photo when available, trust, service area, CTA. Same sticky working navbar + visual system as home.";

  const content: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [
    {
      type: "text",
      text: `Build the ${page.toUpperCase()} page as one complete HTML document (JSON { html }).

${pageBrief}

${pageImageInstructions(page, shared.imageRoles)}

Use this design system exactly (fonts, colors, voice, hero lines):
${JSON.stringify(shared.design, null, 2)}

CLIENT BRIEF:
${JSON.stringify(shared.brief, null, 2)}

CRITICAL:
- Finish the entire document including </html>.
- Working mobile nav JS required.
- Copy must be specific and premium — rewrite anything generic.
- Follow IMAGE RULES above for the primary/hero photo on this page.
- businessName in nav: "${(shared.brief as { businessName?: string }).businessName || ""}" with NO extra town.`,
    },
  ];

  images.forEach((img, index) => {
    content.push({
      type: "text",
      text: `PHOTO ${index}\nURL: ${img.url}\n${JSON.stringify({
        classification: img.classification,
        role: img.roleSuggestion,
        isBefore: img.isBefore,
        isAfter: img.isAfter,
        flattering: img.flattering,
      })}`,
    });
    content.push({
      type: "image_url",
      image_url: { url: img.url, detail: "low" },
    });
  });

  let lastError: unknown;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const completion = await client.chat.completions.create({
        model,
        max_completion_tokens: 32000,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: `preview_${page}_html`,
            strict: true,
            schema: PAGE_SCHEMA,
          },
        },
        messages: [
          { role: "system", content: QUALITY_RULES },
          { role: "user", content },
        ],
      });

      const text = completion.choices[0]?.message?.content || "";
      if (!text) throw new Error(`Empty ${page} HTML response`);
      const parsed = JSON.parse(text) as { html: string };
      const enforced = enforcePagePrimaryImage(
        parsed.html,
        page,
        shared.imageRoles,
      );
      return assertCompletePage(enforced, page);
    } catch (error) {
      lastError = error;
      console.warn(
        `[preview-html] ${page} attempt ${attempt} failed`,
        error instanceof Error ? error.message : error,
      );
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(`Failed to generate ${page} HTML`);
}

function assertCompletePage(value: string, label: string): string {
  const reason = incompletePageReason(value);
  if (reason) {
    throw new Error(`Invalid ${label} HTML: ${reason}`);
  }
  return sanitizePreviewViewportUnits((value || "").trim());
}

export function incompletePageReason(value: string): string | null {
  const html = (value || "").trim();
  const checks: Array<[boolean, string]> = [
    [html.length >= 2500, "too short / unfinished"],
    [/<!DOCTYPE html>/i.test(html), "missing doctype"],
    [/<html[\s>]/i.test(html), "missing <html>"],
    [/<\/html>/i.test(html), "missing </html> — unfinished output"],
    [
      /<nav[\s>]/i.test(html) || /role=["']navigation["']/i.test(html),
      "missing nav",
    ],
    [/index\.html|\/preview\//i.test(html), "missing home nav link"],
    [/services\.html|\/services/i.test(html), "missing services nav link"],
    [/about\.html|\/about/i.test(html), "missing about nav link"],
    [
      /aria-expanded|classList\.toggle|getElementById|querySelector/i.test(
        html,
      ),
      "missing mobile nav JS",
    ],
  ];

  for (const [ok, reason] of checks) {
    if (!ok) return reason;
  }
  return null;
}

export function previewPagesComplete(
  pages: PreviewHtmlPages | null | undefined,
): boolean {
  if (!pages) return false;
  return (
    !incompletePageReason(pages.home) &&
    !incompletePageReason(pages.services) &&
    !incompletePageReason(pages.about)
  );
}

/** Rewrite demo-relative links to preview app routes (navigate top window). */
export function rewritePreviewHtmlLinks(
  html: string,
  basePath: string,
): string {
  const root = basePath.replace(/\/$/, "");
  let out = sanitizePreviewViewportUnits(html)
    .replace(/(href=["'])index\.html(["'])/gi, `$1${root}$2`)
    .replace(/(href=["'])\.\/index\.html(["'])/gi, `$1${root}$2`)
    .replace(/(href=["'])services\.html(["'])/gi, `$1${root}/services$2`)
    .replace(/(href=["'])\.\/services\.html(["'])/gi, `$1${root}/services$2`)
    .replace(/(href=["'])about\.html(["'])/gi, `$1${root}/about$2`)
    .replace(/(href=["'])\.\/about\.html(["'])/gi, `$1${root}/about$2`);

  // Force top-window navigation so iframe sandbox doesn't trap demo links
  out = out.replace(
    new RegExp(`(href=["']${root}(?:/services|/about)?["'])`, "gi"),
    '$1 target="_top"',
  );

  const navScript = `<script>(function(){document.addEventListener("click",function(e){var t=e.target;if(!t||!t.closest)return;var a=t.closest("a");if(!a)return;var href=a.getAttribute("href")||"";if(href.indexOf("${root}")!==0)return;if(window.top&&window.top!==window){e.preventDefault();window.top.location.href=href;}});})();</script>`;

  if (/<\/body>/i.test(out)) {
    out = out.replace(/<\/body>/i, `${navScript}</body>`);
  } else {
    out = `${out}${navScript}`;
  }
  return out;
}
