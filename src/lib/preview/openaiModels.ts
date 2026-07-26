/**
 * Resolve OpenAI models for this app.
 * Prefer env overrides. Fall back to current OpenAI API defaults.
 */

const DEFAULT_TEXT_MODEL = "gpt-4.1";
const DEFAULT_VISION_MODEL = "gpt-4.1";
const DEFAULT_HTML_MODEL = "gpt-5.6-sol";

export function resolveOpenAiTextModel(): string {
  return process.env.OPENAI_MODEL?.trim() || DEFAULT_TEXT_MODEL;
}

export function resolveOpenAiVisionModel(): string {
  return (
    process.env.OPENAI_VISION_MODEL?.trim() ||
    process.env.OPENAI_MODEL?.trim() ||
    DEFAULT_VISION_MODEL
  );
}

/** Site HTML codegen — prefer frontier model for $4k-quality demos. */
export function resolveOpenAiHtmlModel(): string {
  return (
    process.env.OPENAI_HTML_MODEL?.trim() ||
    process.env.OPENAI_MODEL?.trim() ||
    DEFAULT_HTML_MODEL
  );
}
