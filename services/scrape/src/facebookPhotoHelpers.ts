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

/**
 * FB CDN URLs are signed (oh/oe). Rewriting the path / `_n`→`_o` breaks auth.
 * Safe upgrade: when `cstp=mxWxH` advertises a larger max than `ctp=`, bump `ctp`
 * to that max via string replace (preserve query order / signature params).
 */
export function upgradeFacebookImageUrl(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;

  const mx = trimmed.match(/[?&]cstp=mx(\d+)x(\d+)/i);
  if (!mx) return trimmed;
  const maxW = Number(mx[1]);
  const maxH = Number(mx[2]);
  if (!maxW || !maxH) return trimmed;

  const targetCtp = `ctp=s${maxW}x${maxH}`;
  const ctpMatch = trimmed.match(/[?&]ctp=((?:s|p)(\d+)x(\d+))/i);
  if (ctpMatch) {
    const curW = Number(ctpMatch[2]);
    const curH = Number(ctpMatch[3]);
    if (Math.min(curW, curH) >= Math.min(maxW, maxH)) return trimmed;
    return trimmed.replace(/ctp=(?:s|p)\d+x\d+/i, targetCtp);
  }

  return trimmed.replace(/(cstp=mx\d+x\d+)/i, `$1&${targetCtp}`);
}

/** Min edge implied by ctp/stp size tokens; 0 if unknown. */
export function facebookPhotoMinEdge(url: string) {
  const lower = url.toLowerCase();
  const ctp = lower.match(/ctp=(?:s|p)(\d+)x(\d+)/);
  if (ctp) return Math.min(Number(ctp[1]), Number(ctp[2]));
  const stpSize = lower.match(/_(?:fb\d+_)?s(\d+)x(\d+)/);
  if (stpSize) return Math.min(Number(stpSize[1]), Number(stpSize[2]));
  const cstp = lower.match(/cstp=mx(\d+)x(\d+)/);
  if (cstp) return Math.min(Number(cstp[1]), Number(cstp[2]));
  return 0;
}

/** Prefer larger already-signed variants; never rewrite the signed path. */
export function scoreFacebookPhotoUrl(url: string) {
  const lower = url.toLowerCase();
  if (/\.kf(\?|$)/i.test(lower)) return -10000;
  if (/hads-ak|\/ads\//i.test(lower)) return -10000;
  if (!/\.(jpe?g|png|webp)(\?|$)/i.test(lower)) return -5000;

  let score = 0;
  const edge = facebookPhotoMinEdge(url);
  if (edge) score += edge;
  const ctp = lower.match(/ctp=(?:s|p)(\d+)x(\d+)/);
  if (ctp) score += Math.min(Number(ctp[1]), Number(ctp[2])) * 0.25;
  const stpSize = lower.match(/_(?:fb\d+_)?s(\d+)x(\d+)/);
  if (stpSize) score += Math.min(Number(stpSize[1]), Number(stpSize[2])) * 0.5;
  if (/ctp=s2048|ctp=p960|ctp=s960|ctp=s1536/i.test(lower)) score += 200;
  if (/ctp=s(?:64|80|100|120|200)x/i.test(lower)) score -= 800;
  if (/t39\.30808-6\//i.test(lower)) score += 80;
  if (/t39\.30808-1\//i.test(lower)) score += 40;
  const mx = lower.match(/cstp=mx(\d+)x(\d+)/);
  const ctpExact = lower.match(/ctp=s(\d+)x(\d+)/);
  if (
    mx &&
    ctpExact &&
    mx[1] === ctpExact[1] &&
    mx[2] === ctpExact[2]
  ) {
    score += 400;
  }
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
    (() => {
      const pathSize = url.match(/\/s(\d+)x(\d+)\//i);
      if (!pathSize) return false;
      return Math.min(Number(pathSize[1]), Number(pathSize[2])) < 600;
    })()
  );
}

export function pickBestFacebookPhotoUrls(urls: string[], limit = 40) {
  const bestById = new Map<string, string>();
  for (const url of urls) {
    const trimmed = url.trim();
    if (!trimmed || isFacebookChromeImageUrl(trimmed)) continue;
    if (scoreFacebookPhotoUrl(trimmed) < 0) continue;
    const upgraded = upgradeFacebookImageUrl(trimmed);
    const candidate =
      scoreFacebookPhotoUrl(upgraded) > scoreFacebookPhotoUrl(trimmed)
        ? upgraded
        : trimmed;
    const id = facebookImageAssetId(candidate);
    const prev = bestById.get(id);
    if (!prev || scoreFacebookPhotoUrl(candidate) > scoreFacebookPhotoUrl(prev)) {
      bestById.set(id, candidate);
    }
  }
  return Array.from(bestById.values())
    .sort((a, b) => scoreFacebookPhotoUrl(b) - scoreFacebookPhotoUrl(a))
    .slice(0, limit);
}

/** Count photos that look like real gallery resolution (≥ minEdge). */
export function countHighQualityFacebookPhotos(
  urls: string[],
  minEdge = 1200,
  limit = 24
) {
  return pickBestFacebookPhotoUrls(urls, limit).filter(
    (url) => facebookPhotoMinEdge(url) >= minEdge
  ).length;
}
