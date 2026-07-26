export type PreviewBrandPreferences = {
  /** Brand color 1 — typically ink / headlines */
  primaryColor: string;
  /** Brand color 2 — typically page / surface background */
  secondaryColor: string;
  /** Brand color 3 — supporting surfaces, borders, secondary blocks */
  tertiaryColor: string;
  /** Accent — CTAs and highlights only */
  accentColor: string;
};

const HEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

export function normalizeHexColor(input: unknown, fallback: string) {
  if (typeof input !== "string") return fallback;
  const value = input.trim();
  if (!HEX.test(value)) return fallback;
  if (value.length === 4) {
    const r = value[1];
    const g = value[2];
    const b = value[3];
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }
  return value.toUpperCase();
}

export function parseBrandPreferences(
  body: Record<string, unknown>
): PreviewBrandPreferences {
  return {
    primaryColor: normalizeHexColor(body.primaryColor, "#1A1433"),
    secondaryColor: normalizeHexColor(body.secondaryColor, "#F5F5FB"),
    tertiaryColor: normalizeHexColor(body.tertiaryColor, "#3D3654"),
    accentColor: normalizeHexColor(body.accentColor, "#5B2E9E"),
  };
}

export const BRAND_COLOR_PRESETS = [
  {
    id: "ink-accent",
    label: "Ink & violet",
    primaryColor: "#1A1433",
    secondaryColor: "#F5F5FB",
    tertiaryColor: "#3D3654",
    accentColor: "#5B2E9E",
  },
  {
    id: "coastal",
    label: "Coastal",
    primaryColor: "#0B3A4A",
    secondaryColor: "#F2F7F8",
    tertiaryColor: "#1A5A6B",
    accentColor: "#1FB6D6",
  },
  {
    id: "contractor",
    label: "Warm trade",
    primaryColor: "#1F1A17",
    secondaryColor: "#F7F3EE",
    tertiaryColor: "#5C4033",
    accentColor: "#C45C26",
  },
  {
    id: "fresh",
    label: "Fresh green",
    primaryColor: "#0B6E4F",
    secondaryColor: "#F3FAF8",
    tertiaryColor: "#145C4A",
    accentColor: "#1FB6D6",
  },
] as const;
