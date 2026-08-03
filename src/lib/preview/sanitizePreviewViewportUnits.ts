/**
 * Preview demos render inside an iframe that grows to document height.
 * Any vh-based min-height then resolves to the FULL page height,
 * so heroes balloon and nested scroll returns.
 *
 * Rewrite all viewport-based heights to a fixed ~viewport hero min-height.
 */
const FIXED_MIN = "min-h-[720px]";
const FIXED_H = "h-[720px]";
const FIXED_MAX = "max-h-[720px]";
const FIXED_PX = "720px";

export function sanitizePreviewViewportUnits(html: string): string {
  if (!html) return html;
  let out = html;

  // Tailwind arbitrary: min-h-[90vh], h-[70svh], min-h-[calc(100svh-4rem)], etc.
  out = out.replace(
    /\bmin-h-\[calc\([^\]]*?(?:vh|dvh|svh|lvh)[^\]]*\]/gi,
    FIXED_MIN
  );
  out = out.replace(
    /\bh-\[calc\([^\]]*?(?:vh|dvh|svh|lvh)[^\]]*\]/gi,
    FIXED_H
  );
  out = out.replace(
    /\bmax-h-\[calc\([^\]]*?(?:vh|dvh|svh|lvh)[^\]]*\]/gi,
    FIXED_MAX
  );
  out = out.replace(
    /\bmin-h-\[[^\]]*?(?:vh|dvh|svh|lvh)[^\]]*\]/gi,
    FIXED_MIN
  );
  out = out.replace(/\bh-\[[^\]]*?(?:vh|dvh|svh|lvh)[^\]]*\]/gi, FIXED_H);
  out = out.replace(
    /\bmax-h-\[[^\]]*?(?:vh|dvh|svh|lvh)[^\]]*\]/gi,
    FIXED_MAX
  );

  // Named Tailwind viewport utilities
  out = out.replace(/\bmin-h-screen\b/g, FIXED_MIN);
  out = out.replace(/\bh-screen\b/g, FIXED_MIN);
  out = out.replace(/\bmax-h-screen\b/g, FIXED_MAX);
  out = out.replace(/\bmin-h-dvh\b/g, FIXED_MIN);
  out = out.replace(/\bh-dvh\b/g, FIXED_MIN);
  out = out.replace(/\bmax-h-dvh\b/g, FIXED_MAX);
  out = out.replace(/\bmin-h-svh\b/g, FIXED_MIN);
  out = out.replace(/\bh-svh\b/g, FIXED_MIN);
  out = out.replace(/\bmin-h-lvh\b/g, FIXED_MIN);
  out = out.replace(/\bh-lvh\b/g, FIXED_MIN);

  // Inline / <style> calc(Nvh …) — rewrite any vh unit inside calc
  out = out.replace(
    /calc\(([^)]*?)(\d+(?:\.\d+)?)(?:vh|dvh|svh|lvh)([^)]*)\)/gi,
    (_m, before: string, _n: string, after: string) => {
      const head = String(before || "").trim();
      const tail = String(after || "").trim();
      if (!head && !tail) return FIXED_PX;
      if (!head) return `calc(${FIXED_PX} ${tail})`.replace(/\s+/g, " ").trim();
      if (!tail) return `calc(${head} ${FIXED_PX})`.replace(/\s+/g, " ").trim();
      return `calc(${head} ${FIXED_PX} ${tail})`.replace(/\s+/g, " ").trim();
    }
  );

  // Bare Nvh / Ndvh / etc. (including 90vh, 100vh, 70svh)
  out = out.replace(/\b\d+(?:\.\d+)?(?:vh|dvh|svh|lvh)\b/gi, FIXED_PX);

  return out;
}
