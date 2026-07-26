/**
 * Resolve user brand colors into a usable website palette.
 * Raw picks often fail (dark page bg + dark text, low-contrast accents).
 */

export type BrandInput = {
  primaryColor: string;
  secondaryColor: string;
  tertiaryColor?: string;
  accentColor: string;
};

export type ResolvedBrandPalette = {
  /** Main text / ink */
  ink: string;
  /** Page background (always light enough to read on) */
  paper: string;
  /** Elevated surface (cards, forms) */
  surface: string;
  /** Soft muted text */
  muted: string;
  /** CTA / highlight */
  accent: string;
  /** Text on accent buttons */
  accentFg: string;
  /** Dark band / footer / contact block */
  band: string;
  /** Text on band */
  bandFg: string;
  /** Supporting brand tone */
  tertiary: string;
  /** Soft tint of accent for chips / soft fills */
  accentSoft: string;
  /** Soft tint of tertiary for section strips */
  tertiarySoft: string;
  primary: string;
  secondary: string;
};

function clamp(n: number, min = 0, max = 255) {
  return Math.min(max, Math.max(min, n));
}

export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex(r: number, g: number, b: number) {
  return (
    "#" +
    [r, g, b]
      .map((v) => clamp(Math.round(v)).toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

export function relativeLuminance(hex: string) {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function isLightColor(hex: string) {
  return relativeLuminance(hex) > 0.55;
}

export function mixHex(a: string, b: string, t: number) {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  return rgbToHex(
    ar + (br - ar) * t,
    ag + (bg - ag) * t,
    ab + (bb - ab) * t
  );
}

export function contrastForeground(bg: string, dark = "#111111", light = "#FFFFFF") {
  return relativeLuminance(bg) > 0.45 ? dark : light;
}

/** Lighten a color toward white until it's a readable page background. */
function ensurePaper(hex: string) {
  if (isLightColor(hex) && relativeLuminance(hex) > 0.82) return hex.toUpperCase();
  if (isLightColor(hex)) return mixHex(hex, "#FFFFFF", 0.35);
  // Dark pick used as "secondary" — derive a soft paper tint from it
  return mixHex(hex, "#FFFFFF", 0.9);
}

function ensureInk(primary: string, tertiary: string, paper: string) {
  // Prefer primary for ink if it contrasts with paper
  const candidates = [primary, tertiary, "#121212"];
  for (const c of candidates) {
    const ratio =
      (Math.max(relativeLuminance(c), relativeLuminance(paper)) + 0.05) /
      (Math.min(relativeLuminance(c), relativeLuminance(paper)) + 0.05);
    if (ratio >= 4.2) return c.toUpperCase();
  }
  return mixHex(primary, "#000000", 0.55).toUpperCase();
}

function ensureAccent(accent: string, paper: string, ink: string) {
  // Accent must pop on paper and support white or dark label text
  let a = accent.toUpperCase();
  const paperRatio =
    (Math.max(relativeLuminance(a), relativeLuminance(paper)) + 0.05) /
    (Math.min(relativeLuminance(a), relativeLuminance(paper)) + 0.05);
  if (paperRatio < 2.4) {
    // Too washed — deepen toward ink
    a = mixHex(a, ink, 0.45);
  }
  return a;
}

/**
 * Turn raw brand prefs into colors that actually look good on a website.
 */
export function resolveBrandPalette(input: BrandInput): ResolvedBrandPalette {
  const primary = (input.primaryColor || "#1A1433").toUpperCase();
  const tertiary = (input.tertiaryColor || primary).toUpperCase();
  const secondaryRaw = (input.secondaryColor || "#F5F5FB").toUpperCase();
  const accentRaw = (input.accentColor || "#5B2E9E").toUpperCase();

  const paper = ensurePaper(secondaryRaw);
  const ink = ensureInk(primary, tertiary, paper);
  const accent = ensureAccent(accentRaw, paper, ink);
  const accentFg = contrastForeground(accent, ink, "#FFFFFF");

  const band = !isLightColor(primary)
    ? primary
    : !isLightColor(tertiary)
      ? tertiary
      : mixHex(ink, "#000000", 0.15);
  const bandFg = contrastForeground(band, ink, "#FFFFFF");

  return {
    ink,
    paper,
    surface: "#FFFFFF",
    muted: mixHex(ink, paper, 0.55),
    accent,
    accentFg,
    band,
    bandFg,
    tertiary,
    accentSoft: mixHex(accent, paper, 0.88),
    tertiarySoft: mixHex(tertiary, paper, 0.9),
    primary,
    secondary: paper,
  };
}
