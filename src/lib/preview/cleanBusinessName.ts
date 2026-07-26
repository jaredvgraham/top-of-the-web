/**
 * Strip trailing city/state from a business name when Facebook appends location.
 * Keeps location when it's clearly part of the brand (usually at the start),
 * e.g. "Plymouth Power Washing" stays; "Graham Powerwashing - Plymouth" → "Graham Powerwashing".
 */
export function cleanBusinessName(
  rawName: string,
  city?: string,
  state?: string
): string {
  let name = (rawName || "")
    .replace(/\s*\|\s*Facebook\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!name) return name;

  const cityName = (city || "").trim();
  const stateCode = (state || "").trim();
  const startsWithCity = cityName
    ? new RegExp(`^${escapeRegExp(cityName)}\\b`, "i").test(name)
    : false;

  if (cityName) {
    const cityEsc = escapeRegExp(cityName);
    const trailingPatterns: RegExp[] = [
      new RegExp(
        `\\s*\\(\\s*${cityEsc}(?:\\s*,\\s*[A-Z]{2})?\\s*\\)\\s*$`,
        "i"
      ),
      new RegExp(
        `\\s*[-–—,|/·•]\\s*${cityEsc}(?:\\s*,?\\s*[A-Z]{2})?\\s*$`,
        "i"
      ),
      new RegExp(`\\s+of\\s+${cityEsc}(?:\\s*,?\\s*[A-Z]{2})?\\s*$`, "i"),
      new RegExp(`\\s+in\\s+${cityEsc}(?:\\s*,?\\s*[A-Z]{2})?\\s*$`, "i"),
      new RegExp(`\\s+${cityEsc}\\s*,\\s*[A-Z]{2}\\s*$`, "i"),
    ];

    // Bare trailing city only when brand does not start with that city
    if (!startsWithCity) {
      trailingPatterns.push(new RegExp(`\\s+${cityEsc}\\s*$`, "i"));
    }

    for (const pattern of trailingPatterns) {
      const stripped = name.replace(pattern, "").trim();
      if (stripped.length >= 3 && stripped !== name) {
        name = stripped;
        break;
      }
    }
  }

  if (stateCode && stateCode.length === 2) {
    name = name
      .replace(new RegExp(`\\s*,\\s*${escapeRegExp(stateCode)}\\s*$`, "i"), "")
      .trim();
  }

  // Generic trailing " - Place" when city field missing
  if (!cityName) {
    name = name
      .replace(
        /\s*[-–—|]\s*[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?(?:\s*,\s*[A-Z]{2})?\s*$/,
        ""
      )
      .trim();
  }

  return name || rawName.trim();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
