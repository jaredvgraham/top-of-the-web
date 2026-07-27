import OpenAI from "openai";
import type { ImportedBlobAsset } from "@/lib/facebookPageImport";
import { websiteSafeCopy } from "@/lib/preview/sanitizeCopy";
import { resolveOpenAiVisionModel } from "@/lib/preview/openaiModels";

export type PreviewImageAnalysis = {
  url: string;
  kindHint: "logo" | "about" | "photo" | "other";
  subject: string;
  /** Short label: exterior paint job, power wash, crew portrait, logo, etc. */
  classification: string;
  quality: "high" | "medium" | "low";
  roleSuggestion: "logo" | "hero" | "about" | "gallery" | "service" | "skip";
  isBefore: boolean;
  isAfter: boolean;
  /** Same non-empty id for matching before/after of one project/angle. */
  pairId: string;
  flattering: boolean;
  peopleVisible: boolean;
  notes: string;
};

export type VisionBusinessContext = {
  name: string;
  category?: string;
  description?: string;
  city?: string;
  state?: string;
  servicesHint?: string;
};

const ANALYSIS_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["images"],
  properties: {
    images: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "index",
          "subject",
          "classification",
          "quality",
          "roleSuggestion",
          "isBefore",
          "isAfter",
          "pairId",
          "flattering",
          "peopleVisible",
          "notes",
        ],
        properties: {
          index: { type: "number" },
          subject: { type: "string" },
          classification: { type: "string" },
          quality: { type: "string", enum: ["high", "medium", "low"] },
          roleSuggestion: {
            type: "string",
            enum: ["logo", "hero", "about", "gallery", "service", "skip"],
          },
          isBefore: { type: "boolean" },
          isAfter: { type: "boolean" },
          pairId: { type: "string" },
          flattering: { type: "boolean" },
          peopleVisible: { type: "boolean" },
          notes: { type: "string" },
        },
      },
    },
  },
} as const;

/**
 * Vision pass: send real image URLs so the model can SEE each photo.
 * Uses a vision-capable OpenAI model only. Retries once per batch.
 * Does NOT silently invent flattering heroes on failure.
 */
export async function analyzePreviewImages(
  assets: ImportedBlobAsset[],
  businessContext: VisionBusinessContext
): Promise<PreviewImageAnalysis[]> {
  const candidates = assets
    .filter((a) => a.url && /^https?:\/\//i.test(a.url))
    .slice(0, 12);

  if (!candidates.length) return [];

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    console.warn("[preview-vision] OPENAI_API_KEY missing — kind-hint only");
    return candidates.map((asset) => heuristicAnalysis(asset, true));
  }

  const model = resolveOpenAiVisionModel();
  const client = new OpenAI({ apiKey });

  const safeAbout = websiteSafeCopy(businessContext.description || "", "");
  const location = [businessContext.city, businessContext.state]
    .filter(Boolean)
    .join(", ");

  const results: PreviewImageAnalysis[] = new Array(candidates.length);
  let failedBatches = 0;

  const batchSize = 6;
  const batchStarts: number[] = [];
  for (let start = 0; start < candidates.length; start += batchSize) {
    batchStarts.push(start);
  }

  // Run up to 2 vision batches in parallel
  const runBatch = async (start: number) => {
    const batch = candidates.slice(start, batchSize + start);
    let ok = false;
    for (let attempt = 1; attempt <= 2 && !ok; attempt += 1) {
      try {
        const analyzed = await analyzeBatch(client, model, batch, start, {
          name: businessContext.name,
          category: businessContext.category || "",
          location,
          about: safeAbout.slice(0, 400),
          servicesHint: (businessContext.servicesHint || "").slice(0, 300),
        });
        analyzed.forEach((row, i) => {
          results[start + i] = row;
        });
        ok = true;
      } catch (error) {
        console.warn(
          `[preview-vision] batch ${start} attempt ${attempt} failed`,
          error instanceof Error ? error.message : error
        );
      }
    }
    if (!ok) {
      failedBatches += 1;
      batch.forEach((asset, i) => {
        results[start + i] = heuristicAnalysis(asset, false);
      });
    }
  };

  for (let i = 0; i < batchStarts.length; i += 2) {
    await Promise.all(
      batchStarts.slice(i, i + 2).map((start) => runBatch(start))
    );
  }

  if (failedBatches > 0) {
    console.warn(
      `[preview-vision] ${failedBatches} batch(es) failed — used conservative placeholders (not flattering heroes)`
    );
  }

  return results.map((r, i) => r || heuristicAnalysis(candidates[i], false));
}

async function analyzeBatch(
  client: OpenAI,
  model: string,
  batch: ImportedBlobAsset[],
  indexOffset: number,
  ctx: {
    name: string;
    category: string;
    location: string;
    about: string;
    servicesHint: string;
  }
): Promise<PreviewImageAnalysis[]> {
  const content: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [
    {
      type: "text",
      text: `You are a senior art director classifying photos for a ~$4,000 custom local-business website.

BUSINESS CONTEXT (use this when deciding placement):
- Name: ${ctx.name}
- Category: ${ctx.category || "local service business"}
- Location: ${ctx.location || "unknown"}
- About: ${ctx.about || "n/a"}
- Services hint: ${ctx.servicesHint || "n/a"}

You will receive ${batch.length} photos. Each is labeled with a GLOBAL index.
LOOK at every image (vision). For each, classify exactly what it shows and pick ONE role.

Roles:
- hero: best flattering FINISHED result for THIS business (NEVER before/messy/dirty/UI)
- about: clear owner/team/people portrait
- logo: literal logo / wordmark only
- gallery: solid project proof (before/after OK — flag them)
- service: supporting work photo that matches a service offering
- skip: blurry, meme, FB UI chrome, duplicate, unflattering, irrelevant

CRITICAL — MATCH THE TRADE:
- Classify what the photo actually shows relative to THIS business (name/category/services).
- A house photo for a power washing / soft washing / pressure washing company is a CLEANING surface, not a siding/roofing/carpentry job.
- Dirty, stained, moldy, algae-covered, weathered, or "needs work" exteriors = isBefore:true, flattering:false, NEVER role=hero.
- Bright, clean, freshly washed, sparkling results = isAfter:true, good hero candidates.
- Do NOT label a dirty cedar / wood / siding surface as finished work.

BEFORE / AFTER PAIRING:
- If two photos in this batch (or clearly the same project/angle) are a before and after, set the SAME pairId on both (e.g. "house-front-1", "driveway-2").
- Unpaired photos get pairId "".
- Classification should name the service surface when possible (house wash, driveway, deck, gutters, fleet, etc.) so we can match images to the right service card.

Be specific in subject + classification (e.g. "freshly power-washed white colonial exterior, clean siding" / "dirty cedar house before wash — not hero").`,
    },
  ];

  batch.forEach((asset, i) => {
    const globalIndex = indexOffset + i;
    content.push({
      type: "text",
      text: `GLOBAL image index ${globalIndex} | import kind hint: ${asset.kind} | url: ${asset.url}`,
    });
    content.push({
      type: "image_url",
      image_url: {
        url: asset.url,
        detail: "low",
      },
    });
  });

  console.log(
    `[preview-vision] classifying ${batch.length} images (offset ${indexOffset}) with ${model} detail=low`
  );

  const completion = await client.chat.completions.create({
    model,
    temperature: 0.1,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "preview_image_analysis",
        strict: true,
        schema: ANALYSIS_SCHEMA,
      },
    },
    messages: [{ role: "user", content }],
  });

  const text = completion.choices[0]?.message?.content || "";
  if (!text) throw new Error("Empty vision response");
  const parsed = JSON.parse(text) as {
    images: Array<{
      index: number;
      subject: string;
      classification: string;
      quality: "high" | "medium" | "low";
      roleSuggestion: PreviewImageAnalysis["roleSuggestion"];
      isBefore: boolean;
      isAfter: boolean;
      pairId: string;
      flattering: boolean;
      peopleVisible: boolean;
      notes: string;
    }>;
  };

  return batch.map((asset, i) => {
    const globalIndex = indexOffset + i;
    const row =
      parsed.images.find((img) => img.index === globalIndex) ||
      parsed.images.find((img) => img.index === i);
    if (!row) return heuristicAnalysis(asset);
    return {
      url: asset.url,
      kindHint: asset.kind,
      subject: row.subject || "",
      classification: row.classification || row.subject || "",
      quality: row.quality || "medium",
      roleSuggestion: row.roleSuggestion || "gallery",
      isBefore: Boolean(row.isBefore),
      isAfter: Boolean(row.isAfter),
      pairId: typeof row.pairId === "string" ? row.pairId.trim() : "",
      flattering: Boolean(row.flattering),
      peopleVisible: Boolean(row.peopleVisible),
      notes: row.notes || "",
    };
  });
}

function heuristicAnalysis(
  asset: ImportedBlobAsset,
  allowOptimistic = false
): PreviewImageAnalysis {
  if (asset.kind === "logo") {
    return {
      url: asset.url,
      kindHint: "logo",
      subject: "Imported logo candidate",
      classification: "logo candidate",
      quality: "medium",
      roleSuggestion: allowOptimistic ? "logo" : "skip",
      isBefore: false,
      isAfter: false,
      pairId: "",
      flattering: allowOptimistic,
      peopleVisible: false,
      notes: "Kind hint from import — vision unavailable",
    };
  }
  if (asset.kind === "about") {
    return {
      url: asset.url,
      kindHint: "about",
      subject: "Cover / about candidate",
      classification: "cover or contextual photo",
      quality: "medium",
      roleSuggestion: allowOptimistic ? "about" : "gallery",
      isBefore: false,
      isAfter: false,
      pairId: "",
      flattering: allowOptimistic,
      peopleVisible: false,
      notes: "Kind hint from import — vision unavailable",
    };
  }
  return {
    url: asset.url,
    kindHint: asset.kind,
    subject: "Work photo",
    classification: "unverified project photo",
    quality: "low",
    roleSuggestion: "gallery",
    isBefore: false,
    isAfter: false,
    pairId: "",
    flattering: false,
    peopleVisible: false,
    notes: "Vision unavailable — conservative placement only",
  };
}

/** Deterministic placement from analyses when SiteSpec AI is unavailable. */
export function curateAssetsFromAnalyses(
  analyses: PreviewImageAnalysis[],
  fallbackAssets: ImportedBlobAsset[]
) {
  const byRole = (role: PreviewImageAnalysis["roleSuggestion"]) =>
    analyses.filter(
      (a) =>
        a.roleSuggestion === role &&
        a.quality !== "low" &&
        (role === "hero" ? a.flattering && !a.isBefore : true)
    );

  // Only vision-confirmed logos — never FB profile photos by import kind
  const logo =
    byRole("logo").find(
      (a) =>
        !/profile|portrait|selfie|headshot|person/i.test(
          `${a.subject} ${a.classification} ${a.notes}`
        )
    )?.url || "";

  const hero =
    byRole("hero").sort((a, b) => Number(b.flattering) - Number(a.flattering))[0]
      ?.url ||
    byRole("gallery").find((a) => a.flattering && !a.isBefore)?.url ||
    fallbackAssets.find((a) => a.kind === "photo")?.url ||
    "";

  const about =
    byRole("about")[0]?.url ||
    fallbackAssets.find((a) => a.kind === "about")?.url ||
    "";

  const gallery = analyses
    .filter(
      (a) =>
        a.roleSuggestion !== "skip" &&
        a.roleSuggestion !== "logo" &&
        !a.isBefore &&
        (a.roleSuggestion === "gallery" ||
          a.roleSuggestion === "service" ||
          a.roleSuggestion === "hero") &&
        a.url !== hero &&
        a.url !== about &&
        a.url !== logo
    )
    .map((a) => a.url);

  const serviceImages = byRole("service")
    .filter((a) => !a.isBefore)
    .map((a) => a.url);

  return {
    logoUrl: logo,
    heroImage: hero,
    aboutImage: about,
    galleryImages: Array.from(new Set(gallery)).slice(0, 16),
    serviceImages,
  };
}
