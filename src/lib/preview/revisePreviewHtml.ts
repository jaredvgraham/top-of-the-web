import OpenAI from "openai";
import {
  incompletePageReason,
  type PreviewHtmlPages,
} from "@/lib/preview/generatePreviewHtml";
import { resolveOpenAiHtmlModel } from "@/lib/preview/openaiModels";
import { sanitizePreviewViewportUnits } from "@/lib/preview/sanitizePreviewViewportUnits";
import type { SiteSpec } from "@/lib/preview/siteSpecSchema";

export type RevisePageKey = "home" | "services" | "about";

const PAGE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["html"],
  properties: {
    html: { type: "string" },
  },
} as const;

const REVISE_SYSTEM = `You are a senior agency designer making a SURGICAL revision to an existing custom website demo (Bsites).

You receive:
1) The client's revision request (chips + note) — change ONLY what this asks for
2) GROUND TRUTH from siteSpec (services, business facts) when present
3) The FULL current site HTML for home, services, and about as context
4) Which ONE page you must return as a complete updated HTML document

SURGICAL EDIT RULES (highest priority):
- Do exactly what the client asked. Do NOT redesign, restyle, or rewrite anything they did not ask to change.
- Preserve layout structure, section order, spacing patterns, fonts, colors, imagery, and copy that are outside the request.
- If the request only affects one area (e.g. services list, one headline, one wrong fact), change that area and leave the rest of the page essentially the same.
- If the request is sitewide (colors, tone, brand feel), apply it consistently — still avoid unrelated rewrites of good content.
- When in doubt, change less. Prefer minimal diffs over a fresh redesign.

OTHER RULES:
- Return ONE complete HTML5 document for the TARGET page only.
- If they list real services/names/corrections in their note, those override wrong/hallucinated copy on the site.
- Do NOT invent services, cities, credentials, prices, or offerings that are not in: the client note, siteSpec ground truth, or the existing site HTML.
- Keep existing image https URLs exactly as they appear. Never invent or swap photo URLs.
- Keep logo, business name (unless client corrects it), phone, email, and form notice: Not functional in demo preview
- Keep working sticky nav + mobile hamburger JS. Nav hrefs must stay as index.html | services.html | about.html (or existing /preview/ paths).
- HERO HEIGHT: fixed min-height only (min-h-[720px] / min-h-[800px]). NEVER vh/dvh/svh/h-screen.
- Do not add ecommerce/booking/new pages.
- Use the other pages as context so related facts stay consistent when the request requires it.
- Finish the entire document including </html>.`;

const CHIP_LABELS: Record<string, string> = {
  more_professional: "Make it more professional",
  more_bold: "Make it more bold / energetic",
  rewrite_headline: "Rewrite the headline",
  adjust_colors: "Adjust colors (warmer / darker / stronger brand feel)",
  emphasize_service: "Emphasize a key service",
  punchier_copy: "Punchier copy throughout",
  fix_something: "Fix something that looks wrong",
};

function assertCompletePage(value: string, label: string): string {
  const reason = incompletePageReason(value);
  if (reason) {
    throw new Error(`Invalid ${label} HTML: ${reason}`);
  }
  return sanitizePreviewViewportUnits((value || "").trim());
}

/** Compact factual brief from siteSpec so the model doesn't invent services. */
export function buildSiteSpecBrief(siteSpec?: SiteSpec | null): string {
  if (!siteSpec) return "";
  const biz = siteSpec.business;
  const services = siteSpec.content?.services || [];
  const lines: string[] = [];
  if (biz?.name) lines.push(`Business name: ${biz.name}`);
  if (biz?.phone) lines.push(`Phone: ${biz.phone}`);
  if (biz?.email) lines.push(`Email: ${biz.email}`);
  if (biz?.city || biz?.state) {
    lines.push(`Location: ${[biz.city, biz.state].filter(Boolean).join(", ")}`);
  }
  if (biz?.description) lines.push(`Description: ${biz.description}`);
  if (services.length) {
    lines.push("Services (authoritative list from siteSpec):");
    for (const s of services) {
      const bits = [s.name, s.description, s.longDescription]
        .filter(Boolean)
        .join(" — ");
      if (bits) lines.push(`- ${bits}`);
    }
  }
  return lines.join("\n");
}

function formatRevisionRequest(targets: string[], note: string): string {
  const chipLines = targets
    .map((t) => CHIP_LABELS[t] || t)
    .filter(Boolean);
  return [
    "CLIENT REVISION REQUEST — change ONLY this; leave everything else alone:",
    chipLines.length
      ? `- Selected changes: ${chipLines.join("; ")}`
      : "- Selected changes: (none — follow the note)",
    note.trim()
      ? `- Client note (authoritative):\n"""\n${note.trim()}\n"""`
      : "- Client note: (none)",
    "",
    "Do not invent extra improvements. If the note names specific services/facts, fix those and keep the rest of the page intact.",
  ].join("\n");
}

async function reviseOnePage(input: {
  client: OpenAI;
  model: string;
  page: RevisePageKey;
  sitePages: PreviewHtmlPages;
  targets: string[];
  note: string;
  businessHint: string;
  siteSpecBrief: string;
  consistencyNote?: string;
}): Promise<string> {
  const otherPages = (["home", "services", "about"] as RevisePageKey[])
    .filter((p) => p !== input.page)
    .map(
      (p) =>
        `===== ${p.toUpperCase()} PAGE (context only — do not return this page) =====\n${input.sitePages[p]}`
    )
    .join("\n\n");

  const userText = `Surgically revise the TARGET page: ${input.page.toUpperCase()}.
Return the complete HTML for that page. Change ONLY what the client requested; keep everything else the same.

BUSINESS: ${input.businessHint || "Local business demo"}

${input.siteSpecBrief
  ? `GROUND TRUTH (use only if needed for the requested fix):\n${input.siteSpecBrief}\n`
  : ""}
${formatRevisionRequest(input.targets, input.note)}

${input.consistencyNote ? `CONSISTENCY: ${input.consistencyNote}\n` : ""}
FULL SITE CONTEXT — apply the request on this page; use other pages only so related facts stay aligned when the request requires it:

===== ${input.page.toUpperCase()} PAGE (TARGET — return this page, surgically edited) =====
${input.sitePages[input.page]}

${otherPages}`;

  let lastError: unknown;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const completion = await input.client.chat.completions.create({
        model: input.model,
        max_completion_tokens: 32000,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: `revise_${input.page}_html`,
            strict: true,
            schema: PAGE_SCHEMA,
          },
        },
        messages: [
          { role: "system", content: REVISE_SYSTEM },
          { role: "user", content: userText },
        ],
      });
      const text = completion.choices[0]?.message?.content || "";
      if (!text) throw new Error(`Empty ${input.page} revise response`);
      const parsed = JSON.parse(text) as { html: string };
      return assertCompletePage(parsed.html, input.page);
    } catch (error) {
      lastError = error;
      console.warn(
        `[preview-revise] ${input.page} attempt ${attempt} failed`,
        error instanceof Error ? error.message : error
      );
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error(`Failed to revise ${input.page}`);
}

export type ReviseProgressPayload = {
  stageKey: "reading" | "redesigning" | "updating";
  message: string;
  percent: number;
  pageIndex?: number;
  pageTotal?: number;
  pageLabel?: string;
};

const PAGE_LABEL: Record<RevisePageKey, string> = {
  home: "Home",
  services: "Services",
  about: "About",
};

export async function revisePreviewPages(input: {
  pages: PreviewHtmlPages;
  pagesToUpdate: RevisePageKey[];
  targets: string[];
  note: string;
  businessHint?: string;
  siteSpec?: SiteSpec | null;
  onProgress?: (payload: ReviseProgressPayload) => void;
}): Promise<{ pages: PreviewHtmlPages; model: string; updated: RevisePageKey[] }> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required to revise preview HTML");
  }
  // Same premium HTML model as generate (OPENAI_HTML_MODEL, default gpt-5.6-sol)
  const model = resolveOpenAiHtmlModel();
  console.info(`[preview-revise] using HTML model ${model}`);
  const client = new OpenAI({ apiKey });
  const next: PreviewHtmlPages = { ...input.pages };
  const updated: RevisePageKey[] = [];
  const total = input.pagesToUpdate.length;
  const siteSpecBrief = buildSiteSpecBrief(input.siteSpec);

  input.onProgress?.({
    stageKey: "reading",
    message: "Reading your feedback",
    percent: 6,
  });

  for (let i = 0; i < total; i += 1) {
    const page = input.pagesToUpdate[i];
    const label = PAGE_LABEL[page];
    const startPct = 10 + (i / Math.max(total, 1)) * 78;
    input.onProgress?.({
      stageKey: "redesigning",
      message: "Updating and redesigning your website",
      percent: startPct,
      pageIndex: i,
      pageTotal: total,
      pageLabel: label,
    });
    // Pass latest site state so later pages see earlier revisions in this pass
    const html = await reviseOnePage({
      client,
      model,
      page,
      sitePages: next,
      targets: input.targets,
      note: input.note,
      businessHint: input.businessHint || "",
      siteSpecBrief,
      consistencyNote:
        "Only change what the client asked for. If the request affects shared facts (services, colors, brand wording), keep those consistent with other pages — but do not rewrite unrelated sections.",
    });
    next[page] = html;
    updated.push(page);
    const donePct = 10 + ((i + 1) / Math.max(total, 1)) * 78;
    input.onProgress?.({
      stageKey: "redesigning",
      message: "Updating and redesigning your website",
      percent: Math.min(88, donePct),
      pageIndex: i,
      pageTotal: total,
      pageLabel: label,
    });
  }

  input.onProgress?.({
    stageKey: "updating",
    message: "Updating and redesigning your website",
    percent: 94,
  });
  return { pages: next, model, updated };
}

export function pagesForScope(
  _scope: "focused" | "sitewide",
  _focusPage: RevisePageKey
): RevisePageKey[] {
  return ["home", "services", "about"];
}
