/**
 * True only with evidence of a Meta ad click.
 * `_fbp` alone does not count — the pixel sets that on any organic visit.
 * Kept dependency-free so client components can import it safely.
 */
export function hasMetaAdClickAttribution(attr?: {
  fbclid?: string;
  fbc?: string;
}) {
  const fbclid = attr?.fbclid?.trim() || "";
  const fbc = attr?.fbc?.trim() || "";
  // fbc looks like: fb.1.<timestamp>.<fbclid>
  return Boolean(fbclid || /^fb\.\d+\.\d+\./.test(fbc));
}
