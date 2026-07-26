/**
 * Detect / strip Facebook UI chrome so it never lands on a website demo.
 */

const FB_CHROME_PATTERNS: RegExp[] = [
  /\bfollowers?\b/i,
  /\bfollowing\b/i,
  /\blikes?\b/i,
  /\btalking about this\b/i,
  /\bwere here\b/i,
  /\bLikeComment/i,
  /\bNo comments yet\b/i,
  /\bBe the first to comment\b/i,
  /\bPostsAboutReelsPhotos/i,
  /\bSee more on Facebook\b/i,
  /\bLog\s*in\b/i,
  /\bSign\s*up\b/i,
  /\bcookie\b/i,
  /\bMeta\b/,
  /English\s*\(US\)\s*Español/i,
  /Français\s*\(France\)/i,
  /中文/,
  /\bCreate new account\b/i,
  /\bForgot password\b/i,
  /\bMessenger\b/i,
  /\bWatch\b.*\bReels\b/i,
];

const FB_LINE_KILL: RegExp[] = [
  /^\d[\d,]*\s+(followers|likes|following)\b/i,
  /followers\s*[•·|]/i,
  /likes\s*[•·|]/i,
  /talking about this/i,
  /were here/i,
  /Like\s*Comment/i,
  /No comments yet/i,
  /Be the first to comment/i,
  /Posts\s*About\s*Reels\s*Photos/i,
  /Category:\s*/i,
  /Recent Facebook posts/i,
  /^Español$/i,
  /^Français/i,
  /^Português/i,
  /^Deutsch$/i,
  /^Italiano$/i,
  /^中文/,
  /^日本語/,
  /^한국어/,
];

export function looksLikeFacebookChrome(text: string): boolean {
  const value = (text || "").trim();
  if (!value) return false;
  if (value.length > 120 && FB_CHROME_PATTERNS.filter((p) => p.test(value)).length >= 2) {
    return true;
  }
  const hits = FB_CHROME_PATTERNS.filter((p) => p.test(value)).length;
  if (hits >= 1 && /followers|likes|LikeComment|PostsAbout/i.test(value)) {
    return true;
  }
  // Repeated business-name + followers dump
  if ((value.match(/\bfollowers\b/gi) || []).length >= 2) return true;
  if ((value.match(/\blikes\b/gi) || []).length >= 2 && /talking about/i.test(value)) {
    return true;
  }
  return false;
}

/** Keep only lines that look like real human copy. */
export function stripFacebookChrome(text: string): string {
  const value = (text || "").replace(/\r/g, "").trim();
  if (!value) return "";
  if (looksLikeFacebookChrome(value)) {
    // Try to salvage clean sentences before giving up
    const sentences = value
      .split(/(?<=[.!?])\s+|\n+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .filter((s) => !FB_LINE_KILL.some((p) => p.test(s)))
      .filter((s) => !looksLikeFacebookChrome(s))
      .filter((s) => s.length > 40 && /[a-z]/i.test(s));
    if (sentences.length) {
      return sentences.join(" ").replace(/\s+/g, " ").trim();
    }
    return "";
  }

  return value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !FB_LINE_KILL.some((p) => p.test(line)))
    .join("\n")
    .replace(/\s+/g, " ")
    .trim();
}

/** Safe website copy: empty if Facebook chrome dominates. */
export function websiteSafeCopy(text: string, fallback = ""): string {
  const cleaned = stripFacebookChrome(text);
  if (!cleaned) return fallback;
  if (looksLikeFacebookChrome(cleaned)) return fallback;
  return cleaned;
}

export function cleanPostSnippet(snippet: string): string {
  const cleaned = stripFacebookChrome(snippet);
  if (!cleaned) return "";
  // Drop UI-heavy short crumbs
  if (cleaned.length < 24) return "";
  if (/^(Like|Comment|Share|Follow)/i.test(cleaned)) return "";
  return cleaned.slice(0, 280);
}
