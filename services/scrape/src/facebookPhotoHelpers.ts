/** Stable id for deduping the same photo at many sizes. */
export function facebookImageAssetId(url: string) {
  try {
    const path = new URL(url).pathname;
    const match =
      path.match(/\/(\d+_\d+_\d+)_[a-z]\./i) ||
      path.match(/\/(\d+_\d+_\d+)\./i);
    return match?.[1] || path;
  } catch {
    return url;
  }
}

/** Prefer larger already-signed variants; never rewrite the signed path. */
export function scoreFacebookPhotoUrl(url: string) {
  const lower = url.toLowerCase();
  if (/\.kf(\?|$)/i.test(lower)) return -10000;
  if (/hads-ak|\/ads\//i.test(lower)) return -10000;
  if (!/\.(jpe?g|png|webp)(\?|$)/i.test(lower)) return -5000;

  let score = 0;
  const ctp = lower.match(/ctp=(?:s|p)(\d+)x(\d+)/);
  if (ctp) score += Math.min(Number(ctp[1]), Number(ctp[2]));
  const stpSize = lower.match(/_(?:fb\d+_)?s(\d+)x(\d+)/);
  if (stpSize) score += Math.min(Number(stpSize[1]), Number(stpSize[2])) * 0.5;
  if (/ctp=s2048|ctp=p960|ctp=s960/i.test(lower)) score += 200;
  if (/ctp=s(?:64|80|100|120|200)x/i.test(lower)) score -= 800;
  if (/t39\.30808-6\//i.test(lower)) score += 80;
  if (/t39\.30808-1\//i.test(lower)) score += 40;
  return score;
}

/** Facebook UI chrome / icons / emoji / ads / video fragments — not client photos. */
export function isFacebookChromeImageUrl(url: string) {
  const lower = url.toLowerCase();
  return (
    lower.includes("static.xx.fbcdn.net") ||
    lower.includes("static.facebook.com") ||
    lower.includes("/rsrc.php") ||
    lower.includes("emoji.php") ||
    lower.includes("/images/emoji") ||
    lower.includes("/images/icons") ||
    lower.includes("/images/fb_icon") ||
    lower.includes("fb_favicon") ||
    lower.includes("/images/messaging/") ||
    lower.includes("facebook.com/images/") ||
    lower.includes("hads-ak") ||
    /\.kf(\?|$)/i.test(lower) ||
    /\.css(\?|$)/i.test(lower) ||
    /\.js(\?|$)/i.test(lower) ||
    /\/s(?:[1-9]|[1-4]\d)x(?:[1-9]|[1-4]\d)\//i.test(url)
  );
}

export function pickBestFacebookPhotoUrls(urls: string[], limit = 40) {
  const bestById = new Map<string, string>();
  for (const url of urls) {
    const trimmed = url.trim();
    if (!trimmed || isFacebookChromeImageUrl(trimmed)) continue;
    if (scoreFacebookPhotoUrl(trimmed) < 0) continue;
    const id = facebookImageAssetId(trimmed);
    const prev = bestById.get(id);
    if (!prev || scoreFacebookPhotoUrl(trimmed) > scoreFacebookPhotoUrl(prev)) {
      bestById.set(id, trimmed);
    }
  }
  return Array.from(bestById.values())
    .sort((a, b) => scoreFacebookPhotoUrl(b) - scoreFacebookPhotoUrl(a))
    .slice(0, limit);
}
