"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { US_STATES, type PlaceSuggestion } from "@/lib/usLocations";
import { inputClasses, labelClasses } from "./types";

type Props = {
  city: string;
  state: string;
  onChange: (next: { city: string; state: string }) => void;
};

export default function CityStateFields({ city, state, onChange }: Props) {
  const listId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [cityQuery, setCityQuery] = useState(city);
  const [stateQuery, setStateQuery] = useState(state);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setCityQuery(city);
  }, [city]);

  useEffect(() => {
    setStateQuery(state);
  }, [state]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const fetchSuggestions = (cityValue: string, stateValue: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (cityValue.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ q: cityValue.trim() });
        const normalizedState = US_STATES.find(
          (s) =>
            s.abbr.toLowerCase() === stateValue.trim().toLowerCase() ||
            s.name.toLowerCase() === stateValue.trim().toLowerCase()
        );
        if (normalizedState) params.set("state", normalizedState.abbr);

        const response = await fetch(`/api/geo/suggest?${params.toString()}`);
        const data = await response.json();
        const next = (data.suggestions || []) as PlaceSuggestion[];
        setSuggestions(next);
        setActiveIndex(0);
        setOpen(next.length > 0);
      } catch {
        setSuggestions([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }, 200);
  };

  const pick = (suggestion: PlaceSuggestion) => {
    const nextCity = suggestion.city || cityQuery;
    const nextState = suggestion.stateAbbr || suggestion.state;
    setCityQuery(nextCity);
    setStateQuery(nextState);
    onChange({ city: nextCity, state: nextState });
    setSuggestions([]);
    setOpen(false);
  };

  const stateMatches = US_STATES.filter((s) => {
    const q = stateQuery.trim().toLowerCase();
    if (!q) return false;
    return (
      s.name.toLowerCase().startsWith(q) ||
      s.abbr.toLowerCase().startsWith(q) ||
      s.abbr.toLowerCase() === q
    );
  }).slice(0, 8);

  return (
    <div ref={wrapRef} className="space-y-8">
      <div className="relative">
        <label className={labelClasses} htmlFor={`${listId}-city`}>
          City / town
        </label>
        <input
          id={`${listId}-city`}
          name="city"
          autoComplete="address-level2"
          value={cityQuery}
          required
          placeholder="Type your town"
          className={inputClasses}
          onChange={(e) => {
            const value = e.target.value;
            setCityQuery(value);
            onChange({ city: value, state: stateQuery });
            fetchSuggestions(value, stateQuery);
          }}
          onFocus={() => {
            if (cityQuery.trim().length >= 2) {
              fetchSuggestions(cityQuery, stateQuery);
            }
          }}
          onKeyDown={(e) => {
            if (!open || !suggestions.length) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActiveIndex((i) => (i + 1) % suggestions.length);
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveIndex(
                (i) => (i - 1 + suggestions.length) % suggestions.length
              );
            } else if (e.key === "Enter" && suggestions[activeIndex]) {
              e.preventDefault();
              pick(suggestions[activeIndex]);
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
        />
        <p className="mt-2 text-sm text-ink/45">
          {loading
            ? "Searching towns…"
            : "Suggestions from every US ZIP town — or just type yours."}
        </p>

        {open && suggestions.length > 0 && (
          <ul
            role="listbox"
            className="absolute z-20 mt-2 max-h-56 w-full overflow-auto rounded-2xl border border-ink/15 bg-paper py-2 shadow-lg"
          >
            {suggestions.map((suggestion, index) => (
              <li key={`${suggestion.label}-${index}`}>
                <button
                  type="button"
                  role="option"
                  aria-selected={index === activeIndex}
                  className={`w-full px-4 py-2.5 text-left text-[15px] ${
                    index === activeIndex
                      ? "bg-accent/10 text-ink"
                      : "text-ink/80 hover:bg-ink/[0.04]"
                  }`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(suggestion)}
                >
                  {suggestion.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="relative">
        <label className={labelClasses} htmlFor={`${listId}-state`}>
          State
        </label>
        <input
          id={`${listId}-state`}
          name="state"
          list={`${listId}-state-list`}
          autoComplete="address-level1"
          value={stateQuery}
          required
          placeholder="TX or Texas"
          className={inputClasses}
          onChange={(e) => {
            const value = e.target.value;
            setStateQuery(value);
            onChange({ city: cityQuery, state: value });
            if (cityQuery.trim().length >= 2) {
              fetchSuggestions(cityQuery, value);
            }
          }}
          onBlur={() => {
            const match = US_STATES.find(
              (s) =>
                s.abbr.toLowerCase() === stateQuery.trim().toLowerCase() ||
                s.name.toLowerCase() === stateQuery.trim().toLowerCase()
            );
            if (match) {
              setStateQuery(match.abbr);
              onChange({ city: cityQuery, state: match.abbr });
            }
          }}
        />
        <datalist id={`${listId}-state-list`}>
          {US_STATES.map((s) => (
            <option key={s.abbr} value={s.abbr}>
              {s.name}
            </option>
          ))}
        </datalist>
        {stateQuery &&
          stateMatches.length > 0 &&
          !US_STATES.some(
            (s) =>
              s.abbr.toLowerCase() === stateQuery.trim().toLowerCase() ||
              s.name.toLowerCase() === stateQuery.trim().toLowerCase()
          ) && (
            <ul className="absolute z-20 mt-2 max-h-48 w-full overflow-auto rounded-2xl border border-ink/15 bg-paper py-2 shadow-lg">
              {stateMatches.map((s) => (
                <li key={s.abbr}>
                  <button
                    type="button"
                    className="w-full px-4 py-2.5 text-left text-[15px] text-ink/80 hover:bg-ink/[0.04]"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setStateQuery(s.abbr);
                      onChange({ city: cityQuery, state: s.abbr });
                      if (cityQuery.trim().length >= 2) {
                        fetchSuggestions(cityQuery, s.abbr);
                      }
                    }}
                  >
                    {s.name} ({s.abbr})
                  </button>
                </li>
              ))}
            </ul>
          )}
      </div>
    </div>
  );
}
