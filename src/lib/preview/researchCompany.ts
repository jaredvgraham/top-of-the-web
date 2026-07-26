import OpenAI from "openai";
import { resolveOpenAiTextModel } from "@/lib/preview/openaiModels";

export type CompanyResearch = {
  summary: string;
  servicesMentioned: string[];
  differentiators: string[];
  serviceAreas: string[];
  toneNotes: string;
  sources: string[];
  usedWeb: boolean;
};

type ResearchInput = {
  businessName: string;
  category?: string;
  city?: string;
  state?: string;
  website?: string;
  facebookUrl?: string;
  about?: string;
  phone?: string;
};

/**
 * Research the company on the public web via OpenAI Responses + web_search.
 * Falls back to synthesizing from provided scrape facts if web search fails.
 */
export async function researchCompany(
  input: ResearchInput
): Promise<CompanyResearch> {
  const empty: CompanyResearch = {
    summary: "",
    servicesMentioned: [],
    differentiators: [],
    serviceAreas: [],
    toneNotes: "",
    sources: [],
    usedWeb: false,
  };

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return empty;

  const model =
    process.env.OPENAI_RESEARCH_MODEL?.trim() &&
    !/gpt-5\.6-sol|composer-|claude-4/i.test(
      process.env.OPENAI_RESEARCH_MODEL || ""
    )
      ? process.env.OPENAI_RESEARCH_MODEL.trim()
      : resolveOpenAiTextModel();
  const client = new OpenAI({ apiKey });

  const location = [input.city, input.state].filter(Boolean).join(", ");
  const queryParts = [
    input.businessName,
    input.category,
    location,
    input.website,
    input.phone,
  ]
    .filter(Boolean)
    .join(" | ");

  const prompt = `Research this local business on the public web and return ONLY compact JSON (no markdown):

{
  "summary": "2-4 sentences of what they actually do, grounded in sources",
  "servicesMentioned": ["service names found"],
  "differentiators": ["specific proven strengths — no invented claims"],
  "serviceAreas": ["cities/regions mentioned"],
  "toneNotes": "how their brand voice feels",
  "sources": ["https://..."]
}

Rules:
- Prefer their official website, Google Business / Maps listings, Yelp, Angi, BBB, news, and their Facebook page.
- Do NOT invent licenses, years in business, awards, insurance, ratings, or “family owned” unless a source states it.
- If little is found, say so briefly in summary and leave arrays short.
- Focus on facts useful for writing a high-converting local service website.

Business to research:
${queryParts}
Facebook: ${input.facebookUrl || "n/a"}
Known about text: ${(input.about || "").slice(0, 800)}`;

  try {
    console.log(`[preview-research] web research with ${model}`);
    // SDK typings may lag behind hosted web_search tool support.
    const response = await (client as OpenAI).responses.create({
      model,
      tools: [{ type: "web_search" } as never],
      tool_choice: "auto",
      input: prompt,
    });

    const text =
      (response as { output_text?: string }).output_text?.trim() ||
      extractOutputText(response);

    if (!text) return empty;

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        ...empty,
        summary: text.slice(0, 1200),
        usedWeb: true,
      };
    }

    const parsed = JSON.parse(jsonMatch[0]) as Partial<CompanyResearch>;
    return {
      summary: String(parsed.summary || "").slice(0, 2000),
      servicesMentioned: asStringArray(parsed.servicesMentioned).slice(0, 12),
      differentiators: asStringArray(parsed.differentiators).slice(0, 8),
      serviceAreas: asStringArray(parsed.serviceAreas).slice(0, 12),
      toneNotes: String(parsed.toneNotes || "").slice(0, 400),
      sources: asStringArray(parsed.sources).slice(0, 8),
      usedWeb: true,
    };
  } catch (error) {
    console.warn(
      "[preview-research] web research failed",
      error instanceof Error ? error.message : error
    );

    // Soft fallback: ask model to structure known scrape data only (no web)
    try {
      const completion = await client.chat.completions.create({
        model,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "Structure known business facts into research JSON. Never invent awards, licenses, years, ratings.",
          },
          {
            role: "user",
            content: JSON.stringify({
              businessName: input.businessName,
              category: input.category,
              city: input.city,
              state: input.state,
              website: input.website,
              about: input.about,
              desiredShape: {
                summary: "",
                servicesMentioned: [],
                differentiators: [],
                serviceAreas: [],
                toneNotes: "",
                sources: [],
              },
            }),
          },
        ],
      });
      const raw = completion.choices[0]?.message?.content || "{}";
      const parsed = JSON.parse(raw) as Partial<CompanyResearch>;
      return {
        summary: String(parsed.summary || "").slice(0, 2000),
        servicesMentioned: asStringArray(parsed.servicesMentioned).slice(0, 12),
        differentiators: asStringArray(parsed.differentiators).slice(0, 8),
        serviceAreas: asStringArray(parsed.serviceAreas).slice(0, 12),
        toneNotes: String(parsed.toneNotes || "").slice(0, 400),
        sources: asStringArray(parsed.sources).slice(0, 8),
        usedWeb: false,
      };
    } catch {
      return empty;
    }
  }
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is string => typeof v === "string")
    .map((v) => v.trim())
    .filter(Boolean);
}

function extractOutputText(response: unknown): string {
  const r = response as {
    output?: Array<{
      type?: string;
      content?: Array<{ type?: string; text?: string }>;
    }>;
  };
  const parts: string[] = [];
  for (const item of r.output || []) {
    for (const c of item.content || []) {
      if (c.type === "output_text" && c.text) parts.push(c.text);
      if (c.text) parts.push(c.text);
    }
  }
  return parts.join("\n").trim();
}
