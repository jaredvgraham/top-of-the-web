import { codes as zipCodes } from "zipcodes";
import { US_STATES, type PlaceSuggestion } from "@/lib/usLocations";

type PlaceRecord = {
  city: string;
  state: string;
  cityLower: string;
};

let placeIndex: PlaceRecord[] | null = null;

function getPlaceIndex(): PlaceRecord[] {
  if (placeIndex) return placeIndex;

  const seen = new Set<string>();
  const places: PlaceRecord[] = [];

  for (const zip of Object.keys(zipCodes)) {
    const entry = zipCodes[zip];
    if (!entry?.city || !entry?.state) continue;

    const state = entry.state.toUpperCase();
    if (!US_STATES.some((s) => s.abbr === state)) continue;

    const key = `${entry.city.toLowerCase()}|${state}`;
    if (seen.has(key)) continue;
    seen.add(key);

    places.push({
      city: entry.city,
      state,
      cityLower: entry.city.toLowerCase(),
    });
  }

  places.sort((a, b) => a.cityLower.localeCompare(b.cityLower));
  placeIndex = places;
  return places;
}

function parseQuery(raw: string): { cityPart: string; statePart: string } {
  const trimmed = raw.trim();
  const comma = trimmed.match(/^(.+?),\s*([A-Za-z]{2}|[A-Za-z .]+)$/);
  if (comma) {
    const maybeState = comma[2].trim();
    const byAbbr = US_STATES.find(
      (s) => s.abbr.toLowerCase() === maybeState.toLowerCase()
    );
    const byName = US_STATES.find(
      (s) => s.name.toLowerCase() === maybeState.toLowerCase()
    );
    if (byAbbr || byName) {
      return {
        cityPart: comma[1].trim().toLowerCase(),
        statePart: (byAbbr || byName)!.abbr,
      };
    }
  }

  const trailingState = trimmed.match(/^(.+)\s+([A-Za-z]{2})$/);
  if (trailingState) {
    const abbr = trailingState[2].toUpperCase();
    if (US_STATES.some((s) => s.abbr === abbr)) {
      return {
        cityPart: trailingState[1].trim().toLowerCase(),
        statePart: abbr,
      };
    }
  }

  return { cityPart: trimmed.toLowerCase(), statePart: "" };
}

export function searchPlaces(
  query: string,
  preferredState = "",
  limit = 12
): PlaceSuggestion[] {
  const q = query.trim();
  if (q.length < 2) return [];

  const { cityPart, statePart } = parseQuery(q);
  const stateFilter = (preferredState || statePart).toUpperCase();
  const places = getPlaceIndex();

  const starts: PlaceRecord[] = [];
  const includes: PlaceRecord[] = [];

  for (const place of places) {
    if (stateFilter && place.state !== stateFilter) continue;

    if (place.cityLower.startsWith(cityPart)) {
      starts.push(place);
    } else if (cityPart.length >= 3 && place.cityLower.includes(cityPart)) {
      includes.push(place);
    }

    if (starts.length >= limit) break;
  }

  const matched = [...starts, ...includes].slice(0, limit);

  return matched.map((place) => {
    const stateMeta = US_STATES.find((s) => s.abbr === place.state);
    return {
      city: place.city,
      state: stateMeta?.name || place.state,
      stateAbbr: place.state,
      label: `${place.city}, ${place.state}`,
    };
  });
}
