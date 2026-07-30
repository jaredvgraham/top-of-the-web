/**
 * Preview demos render inside an iframe that grows to document height.
 * Any 100vh / h-screen min-height then resolves to the FULL page height,
 * so the home hero balloons (image looks "full size" and breaks the layout).
 *
 * Rewrite viewport-based heights to a fixed ~viewport hero min-height.
 */
const FIXED_MIN = "min-h-[720px]";
const FIXED_H = "h-[720px]";
const FIXED_MAX = "max-h-[720px]";
const FIXED_PX = "720px";

export function sanitizePreviewViewportUnits(html: string): string {
  if (!html) return html;
  let out = html;

  // Tailwind arbitrary values: min-h-[calc(100vh-76px)], h-[100dvh], etc.
  out = out.replace(
    /\bmin-h-\[calc\(100(?:vh|dvh|svh|lvh)[^\]]*\]/gi,
    FIXED_MIN
  );
  out = out.replace(
    /\bh-\[calc\(100(?:vh|dvh|svh|lvh)[^\]]*\]/gi,
    FIXED_H
  );
  out = out.replace(
    /\bmax-h-\[calc\(100(?:vh|dvh|svh|lvh)[^\]]*\]/gi,
    FIXED_MAX
  );
  out = out.replace(/\bmin-h-\[100(?:vh|dvh|svh|lvh)\]/gi, FIXED_MIN);
  out = out.replace(/\bh-\[100(?:vh|dvh|svh|lvh)\]/gi, FIXED_H);
  out = out.replace(/\bmax-h-\[100(?:vh|dvh|svh|lvh)\]/gi, FIXED_MAX);

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

  // Inline / <style> calc(100vh - …) and bare 100vh
  out = out.replace(
    /calc\(\s*100(?:vh|dvh|svh|lvh)\s*([^)]*)\)/gi,
    (_m, rest: string) => {
      const tail = String(rest || "").trim();
      return tail ? `calc(${FIXED_PX} ${tail})` : FIXED_PX;
    }
  );
  out = out.replace(/\b100(?:vh|dvh|svh|lvh)\b/gi, FIXED_PX);

  return out;
}
