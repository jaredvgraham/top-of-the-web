function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function randomSuffix(length = 6) {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

/**
 * Build a unique-ish preview slug from a business name (or fallback).
 * Caller must ensure uniqueness in Mongo (retry with new suffix if needed).
 */
export function createPreviewSlug(businessName?: string) {
  const base = slugify(businessName || "") || "preview";
  return `${base}-${randomSuffix(6)}`;
}

export function createPreviewBlobToken() {
  // Same shape as onboarding tokens — used only for Blob path namespacing.
  const a = randomSuffix(16);
  const b = randomSuffix(16);
  return `${a}${b}`;
}
