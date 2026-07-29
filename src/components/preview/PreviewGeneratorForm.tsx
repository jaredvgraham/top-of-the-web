"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import PreviewLoadingState from "@/components/preview/PreviewLoadingState";
import { resolveBrandPalette } from "@/lib/preview/brandColors";
import { BRAND_COLOR_PRESETS } from "@/lib/preview/brandPreferences";
import { trackMetaEvent } from "@/lib/preview/metaAttribution";
import type { PreviewStreamEvent } from "@/lib/preview/generateProgress";

type FormPhase =
  | "idle"
  | "validating"
  | "submitting"
  | "success"
  | "failure";

const DEFAULT_PRESET = BRAND_COLOR_PRESETS[0];

export type PreviewGeneratorFormProps = {
  leadToken?: string;
  initialEmail?: string;
  initialPhone?: string;
};

async function readGenerateStream(
  response: Response,
  onProgress: (percent: number, stageIndex: number) => void
): Promise<PreviewStreamEvent> {
  const contentType = response.headers.get("content-type") || "";

  // Validation / early errors still return JSON
  if (!contentType.includes("ndjson")) {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        type: "error",
        error: {
          code: data?.error?.code || "request_failed",
          message:
            data?.error?.message ||
            (response.status === 429
              ? "Rate limit reached. Try again tomorrow."
              : "We couldn’t generate your preview. Please try again."),
        },
      };
    }
    if (data?.status === "ready" && data?.slug) {
      return {
        type: "done",
        slug: data.slug,
        previewUrl: data.previewUrl || "",
        status: "ready",
        pagesComplete: true,
        usedAi: data.usedAi,
        percent: 100,
      };
    }
    return {
      type: "error",
      error: {
        code: "unexpected_response",
        message: "Unexpected response from the generator.",
      },
    };
  }

  if (!response.body) {
    return {
      type: "error",
      error: {
        code: "empty_stream",
        message: "No progress stream received. Please try again.",
      },
    };
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let lastEvent: PreviewStreamEvent | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const event = JSON.parse(trimmed) as PreviewStreamEvent;
        lastEvent = event;
        if (event.type === "progress") {
          onProgress(event.percent, event.stageIndex);
        } else if (event.type === "done") {
          onProgress(100, 5);
        }
      } catch {
        // skip malformed chunk
      }
    }
  }

  if (buffer.trim()) {
    try {
      const event = JSON.parse(buffer.trim()) as PreviewStreamEvent;
      lastEvent = event;
      if (event.type === "progress") {
        onProgress(event.percent, event.stageIndex);
      } else if (event.type === "done") {
        onProgress(100, 5);
      }
    } catch {
      // ignore
    }
  }

  if (!lastEvent) {
    return {
      type: "error",
      error: {
        code: "empty_stream",
        message: "Generation ended without a result. Please try again.",
      },
    };
  }
  return lastEvent;
}

export default function PreviewGeneratorForm({
  leadToken = "",
  initialEmail = "",
  initialPhone = "",
}: PreviewGeneratorFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState(initialPhone);
  const [facebookUrl, setFacebookUrl] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [primaryColor, setPrimaryColor] = useState<string>(
    DEFAULT_PRESET.primaryColor
  );
  const [secondaryColor, setSecondaryColor] = useState<string>(
    DEFAULT_PRESET.secondaryColor
  );
  const [tertiaryColor, setTertiaryColor] = useState<string>(
    DEFAULT_PRESET.tertiaryColor
  );
  const [accentColor, setAccentColor] = useState<string>(DEFAULT_PRESET.accentColor);
  const [phase, setPhase] = useState<FormPhase>("idle");
  const [error, setError] = useState("");
  const [progressPercent, setProgressPercent] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    setEmail(initialEmail);
  }, [initialEmail]);

  useEffect(() => {
    setPhone(initialPhone);
  }, [initialPhone]);

  useEffect(() => {
    if (leadToken) {
      trackMetaEvent("ViewContent", {
        content_name: "Preview Continue",
        content_category: "website_preview",
      });
    }
  }, [leadToken]);

  const applyPreset = (preset: (typeof BRAND_COLOR_PRESETS)[number]) => {
    setPrimaryColor(preset.primaryColor);
    setSecondaryColor(preset.secondaryColor);
    setTertiaryColor(preset.tertiaryColor);
    setAccentColor(preset.accentColor);
  };

  const palette = useMemo(
    () =>
      resolveBrandPalette({
        primaryColor,
        secondaryColor,
        tertiaryColor,
        accentColor,
      }),
    [primaryColor, secondaryColor, tertiaryColor, accentColor]
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setPhase("validating");

    if (!email.trim()) {
      setError("Enter your business email.");
      setPhase("failure");
      return;
    }
    if (!phone.trim()) {
      setError("Enter your business phone number.");
      setPhase("failure");
      return;
    }
    if (!facebookUrl.trim()) {
      setError("Paste your Facebook business page URL.");
      setPhase("failure");
      return;
    }
    if (!authorized) {
      setError(
        "Confirm that you own or represent this business to continue."
      );
      setPhase("failure");
      return;
    }

    setPhase("submitting");
    setProgressPercent(4);
    setStageIndex(0);

    try {
      trackMetaEvent("InitiateCheckout", {
        content_name: "Website Preview Generate",
      });

      const response = await fetch("/api/preview/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/x-ndjson, application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          phone: phone.trim(),
          facebookUrl: facebookUrl.trim(),
          authorized: true,
          leadToken: leadToken || undefined,
          primaryColor,
          secondaryColor,
          tertiaryColor,
          accentColor,
        }),
      });

      const result = await readGenerateStream(response, (percent, stage) => {
        setProgressPercent((p) => Math.max(p, percent));
        setStageIndex((s) => Math.max(s, stage));
      });

      if (result.type === "error") {
        setError(result.error.message);
        setPhase("failure");
        return;
      }

      if (result.type !== "done" || !result.slug) {
        setError(
          "Preview isn’t finished yet. Please try again — don’t leave until generation completes."
        );
        setPhase("failure");
        return;
      }

      setProgressPercent(100);
      setStageIndex(5);
      setPhase("success");
      router.push(`/preview/${result.slug}`);
    } catch {
      setError("Something went wrong. Check your connection and try again.");
      setPhase("failure");
    }
  };

  const busy = phase === "submitting" || phase === "validating";

  return (
    <>
      <PreviewLoadingState
        active={phase === "submitting" || phase === "success"}
        progressPercent={progressPercent}
        stageIndex={stageIndex}
      />

      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="preview-email"
            className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/45"
          >
            Business email
          </label>
          <input
            id="preview-email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            value={email}
            disabled={busy}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@yourbusiness.com"
            className="w-full border-b border-ink/20 bg-transparent py-3 text-lg text-ink outline-none focus:border-accent disabled:opacity-60"
          />
        </div>

        <div>
          <label
            htmlFor="preview-phone"
            className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/45"
          >
            Business phone
          </label>
          <input
            id="preview-phone"
            type="tel"
            required
            autoComplete="tel"
            inputMode="tel"
            value={phone}
            disabled={busy}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(555) 555-5555"
            className="w-full border-b border-ink/20 bg-transparent py-3 text-lg text-ink outline-none focus:border-accent disabled:opacity-60"
          />
        </div>

        <div>
          <label
            htmlFor="preview-facebook"
            className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/45"
          >
            Facebook business page URL
          </label>
          <input
            id="preview-facebook"
            type="url"
            required
            value={facebookUrl}
            disabled={busy}
            onChange={(e) => setFacebookUrl(e.target.value)}
            placeholder="https://www.facebook.com/YourPage"
            className="w-full border-b border-ink/20 bg-transparent py-3 text-lg text-ink outline-none focus:border-accent disabled:opacity-60"
          />
          <p className="mt-2 text-xs text-ink/45">
            Open Facebook → your Page → copy the link from the address bar.
          </p>
        </div>

        <fieldset disabled={busy} className="space-y-4">
          <legend className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/45">
            Brand colors
          </legend>
          <p className="text-sm text-ink/55">
            Color 1 = text/ink · Color 2 = light page background · Color 3 =
            supporting · Accent = buttons. We’ll tune contrast so the site
            still looks premium.
          </p>

          <div className="flex flex-wrap gap-2">
            {BRAND_COLOR_PRESETS.map((preset) => {
              const selected =
                primaryColor === preset.primaryColor &&
                secondaryColor === preset.secondaryColor &&
                tertiaryColor === preset.tertiaryColor &&
                accentColor === preset.accentColor;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    selected
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-ink/15 text-ink/70 hover:border-ink/30"
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ColorField
              id="primary-color"
              label="Ink / text"
              value={primaryColor}
              onChange={setPrimaryColor}
            />
            <ColorField
              id="secondary-color"
              label="Page bg (light)"
              value={secondaryColor}
              onChange={setSecondaryColor}
            />
            <ColorField
              id="tertiary-color"
              label="Supporting"
              value={tertiaryColor}
              onChange={setTertiaryColor}
            />
            <ColorField
              id="accent-color"
              label="Accent / CTA"
              value={accentColor}
              onChange={setAccentColor}
            />
          </div>

          <div
            className="overflow-hidden rounded-2xl border border-ink/10"
            style={{ background: palette.paper }}
          >
            <div
              className="px-4 py-3 text-sm font-semibold"
              style={{ background: palette.band, color: palette.bandFg }}
            >
              How it will render
            </div>
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <span className="text-sm font-medium" style={{ color: palette.ink }}>
                Sample headline
              </span>
              <span
                className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wide"
                style={{
                  background: palette.accent,
                  color: palette.accentFg,
                }}
              >
                CTA
              </span>
            </div>
          </div>
        </fieldset>

        <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-ink/70">
          <input
            type="checkbox"
            checked={authorized}
            disabled={busy}
            onChange={(e) => setAuthorized(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 accent-[var(--accent)]"
          />
          <span>
            I own or represent this business and authorize BSITES to use its
            public information and images to generate this private demo
            website.
          </span>
        </label>

        {error ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {phase === "success" ? (
          <p className="rounded-2xl border border-accent/20 bg-accent/10 px-4 py-3 text-sm text-accent">
            Demo ready — opening…
          </p>
        ) : null}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full bg-accent px-8 py-4 text-[13px] font-semibold uppercase tracking-[0.14em] text-paper transition hover:opacity-90 disabled:opacity-60 sm:w-auto"
        >
          {busy ? "Generating…" : "Generate My Demo"}
        </button>
      </form>
    </>
  );
}

function ColorField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/45"
      >
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          className="h-10 w-12 cursor-pointer rounded-lg border border-ink/15 bg-transparent p-1"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          pattern="^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$"
          maxLength={7}
          className="w-full border-b border-ink/20 bg-transparent py-2 font-mono text-sm text-ink outline-none focus:border-accent"
          aria-label={`${label} hex`}
        />
      </div>
    </div>
  );
}
