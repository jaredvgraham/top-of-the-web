import type { PreviewImageAnalysis } from "@/lib/preview/analyzePreviewImages";

export type HtmlPageImageRoles = {
  /** Vision-chosen hero — HOME page full-bleed only. */
  homeHeroUrl: string;
  /** Owner/team — ABOUT primary photo. */
  aboutImageUrl: string;
  /** Distinct finished-work shot for SERVICES page hero. */
  servicesHeroUrl: string;
};

function isUsable(a: PreviewImageAnalysis) {
  return (
    Boolean(a.url) &&
    a.roleSuggestion !== "skip" &&
    a.roleSuggestion !== "logo" &&
    a.quality !== "low" &&
    !a.isBefore
  );
}

/**
 * Map vision roles into hard page assignments for HTML generation.
 * homeHero is reserved for the home page only.
 */
export function resolveHtmlPageImageRoles(
  analyses: PreviewImageAnalysis[],
  fallbackUrls: string[] = []
): HtmlPageImageRoles {
  const usable = analyses.filter(isUsable);

  const homeHeroUrl =
    usable.find(
      (a) => a.roleSuggestion === "hero" && a.flattering && !a.isBefore
    )?.url ||
    usable.find((a) => a.roleSuggestion === "hero")?.url ||
    usable.find((a) => a.roleSuggestion === "gallery" && a.flattering)?.url ||
    usable[0]?.url ||
    fallbackUrls.find((u) => /^https?:\/\//i.test(u)) ||
    "";

  const aboutImageUrl =
    usable.find((a) => a.roleSuggestion === "about" && a.url !== homeHeroUrl)
      ?.url ||
    usable.find((a) => a.peopleVisible && a.url !== homeHeroUrl)?.url ||
    usable.find(
      (a) =>
        a.url !== homeHeroUrl &&
        (a.roleSuggestion === "gallery" || a.roleSuggestion === "service")
    )?.url ||
    "";

  const servicesHeroUrl =
    usable.find(
      (a) =>
        a.url !== homeHeroUrl &&
        a.url !== aboutImageUrl &&
        (a.roleSuggestion === "service" || a.roleSuggestion === "gallery") &&
        a.flattering
    )?.url ||
    usable.find(
      (a) =>
        a.url !== homeHeroUrl &&
        a.url !== aboutImageUrl &&
        (a.roleSuggestion === "service" || a.roleSuggestion === "gallery")
    )?.url ||
    usable.find((a) => a.url !== homeHeroUrl)?.url ||
    homeHeroUrl;

  return {
    homeHeroUrl,
    aboutImageUrl,
    servicesHeroUrl: servicesHeroUrl || homeHeroUrl,
  };
}

/**
 * If a non-home page still used the home hero as its first primary image,
 * swap that occurrence to the page's assigned primary URL.
 */
export function enforcePagePrimaryImage(
  html: string,
  page: "home" | "services" | "about",
  roles: HtmlPageImageRoles
): string {
  const homeHero = roles.homeHeroUrl?.trim();
  if (!homeHero) return html;

  if (page === "home") {
    // Ensure home actually references its hero when we have one
    if (html.includes(homeHero)) return html;
    return html;
  }

  const replacement =
    page === "services"
      ? roles.servicesHeroUrl?.trim()
      : roles.aboutImageUrl?.trim() || roles.servicesHeroUrl?.trim();

  if (!replacement || replacement === homeHero) return html;
  if (!html.includes(homeHero)) return html;

  // Replace first hero-like use of the home hero URL only
  const escaped = homeHero.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(`(url\\(\\s*['"]?)${escaped}(['"]?\\s*\\))`, "i"),
    new RegExp(`(<img\\b[^>]*\\bsrc=["'])${escaped}(["'])`, "i"),
  ];

  for (const pattern of patterns) {
    if (pattern.test(html)) {
      console.log(
        `[preview-html] swapped home hero off ${page} primary → assigned image`
      );
      return html.replace(pattern, `$1${replacement}$2`);
    }
  }

  // Fallback: first raw URL occurrence
  const idx = html.indexOf(homeHero);
  if (idx >= 0) {
    console.log(
      `[preview-html] swapped home hero URL on ${page} (raw occurrence)`
    );
    return (
      html.slice(0, idx) + replacement + html.slice(idx + homeHero.length)
    );
  }

  return html;
}
