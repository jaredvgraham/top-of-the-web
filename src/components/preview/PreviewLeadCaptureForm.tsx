"use client";

import Link from "next/link";
import React, { useState } from "react";
import {
  readMetaAttributionFromBrowser,
  trackMetaEvent,
} from "@/lib/preview/metaAttribution";

type Gate = "ask" | "yes" | "no";
type Phase = "idle" | "submitting" | "success" | "failure";

const FACEBOOK_NEEDS = [
  "A public Facebook business Page (not a personal profile)",
  "Your business name on the Page",
  "Photos of your real work (before/afters, jobs, crew, or storefront)",
  "An About / intro with what you do and where you serve",
] as const;

export default function PreviewLeadCaptureForm() {
  const [gate, setGate] = useState<Gate>("ask");
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (gate !== "yes") return;

    setError("");
    setPhase("submitting");

    if (!name.trim()) {
      setError("Enter your name.");
      setPhase("failure");
      return;
    }
    if (!businessName.trim()) {
      setError("Enter your business name.");
      setPhase("failure");
      return;
    }
    if (!city.trim()) {
      setError("Enter your city.");
      setPhase("failure");
      return;
    }
    if (!state.trim() || state.trim().replace(/[^a-zA-Z]/g, "").length !== 2) {
      setError("Enter your 2-letter state (e.g. TX).");
      setPhase("failure");
      return;
    }
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
    if (!authorized) {
      setError("Confirm we can contact you to continue.");
      setPhase("failure");
      return;
    }

    try {
      const attribution = readMetaAttributionFromBrowser();
      const response = await fetch("/api/preview/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          businessName: businessName.trim(),
          city: city.trim(),
          state: state.trim(),
          email: email.trim(),
          phone: phone.trim(),
          authorized: true,
          ...attribution,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(
          data?.error?.message ||
            "We couldn’t save your info. Please try again."
        );
        setPhase("failure");
        return;
      }

      // Reporting only — campaign optimizes for Purchase, not Lead
      trackMetaEvent("Lead", {
        content_name: "Website Preview Lead",
      });

      setPhase("success");
    } catch {
      setError("Something went wrong. Check your connection and try again.");
      setPhase("failure");
    }
  };

  const busy = phase === "submitting";

  if (phase === "success") {
    return (
      <div className="space-y-4 rounded-2xl border border-accent/20 bg-accent/10 px-5 py-6">
        <h3 className="font-display text-xl font-semibold text-ink">
          Check your email
        </h3>
        <p className="text-sm leading-relaxed text-ink/70">
          We sent a link to <strong>{email}</strong> with your next step. Paste
          your Facebook page and we’ll build your private demo.
        </p>
        <p className="text-sm text-ink/55">
          Don’t see it? Check spam/promotions, or wait a minute and refresh
          your inbox.
        </p>
      </div>
    );
  }

  if (gate === "ask") {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/45">
            Step 1
          </p>
          <h3 className="mt-2 font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl">
            Do you have a Facebook page for your business?
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-ink/60">
            This free demo is built from your Facebook business Page. Check the
            list below — if you don’t have this yet, we’ll point you to the
            right next step.
          </p>
        </div>

        <div className="rounded-2xl border border-ink/10 bg-ink/[0.03] px-4 py-4 sm:px-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/45">
            What we need on your Page
          </p>
          <ul className="mt-3 space-y-2.5 text-sm leading-snug text-ink/70">
            {FACEBOOK_NEEDS.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => setGate("yes")}
            className="w-full rounded-full bg-accent px-8 py-4 text-[13px] font-semibold uppercase tracking-[0.14em] text-paper transition hover:opacity-90 sm:w-auto"
          >
            Yes, I have that
          </button>
          <button
            type="button"
            onClick={() => setGate("no")}
            className="w-full rounded-full border border-ink/15 bg-transparent px-8 py-4 text-[13px] font-semibold uppercase tracking-[0.14em] text-ink transition hover:border-ink/30 hover:bg-ink/[0.03] sm:w-auto"
          >
            No, I don’t
          </button>
        </div>
      </div>
    );
  }

  if (gate === "no") {
    return (
      <div className="space-y-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/45">
            Not a Facebook demo fit
          </p>
          <h3 className="mt-2 font-display text-xl font-semibold tracking-tight text-ink">
            Talk to us instead
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-ink/65">
            This preview flow needs a Facebook business Page with your name,
            photos of your work, and an About section. Without that, we can’t
            auto-build a useful demo — but we can still help you get online.
          </p>
        </div>
        <Link
          href="/contact?from=preview-no-facebook"
          className="inline-flex w-full items-center justify-center rounded-full bg-accent px-8 py-4 text-center text-[13px] font-semibold uppercase tracking-[0.14em] text-paper transition hover:opacity-90 sm:w-auto"
        >
          Contact Bsites
        </Link>
        <button
          type="button"
          onClick={() => setGate("ask")}
          className="block text-sm text-ink/50 underline-offset-2 hover:text-ink/70 hover:underline"
        >
          Back — I do have a Facebook Page
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/45">
            Step 2
          </p>
          <p className="mt-1 text-sm text-ink/55">
            You’ve got a Facebook business Page — we’ll email your next step.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setGate("ask")}
          className="shrink-0 text-xs font-medium uppercase tracking-[0.12em] text-ink/40 hover:text-ink/65"
        >
          Change
        </button>
      </div>

      <div>
        <label
          htmlFor="lead-name"
          className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/45"
        >
          Your name
        </label>
        <input
          id="lead-name"
          type="text"
          required
          autoComplete="name"
          value={name}
          disabled={busy}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jordan Hale"
          className="w-full border-b border-ink/20 bg-transparent py-3 text-lg text-ink outline-none focus:border-accent disabled:opacity-60"
        />
      </div>

      <div>
        <label
          htmlFor="lead-business-name"
          className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/45"
        >
          Business name
        </label>
        <input
          id="lead-business-name"
          type="text"
          required
          autoComplete="organization"
          value={businessName}
          disabled={busy}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="Summit Exterior Co."
          className="w-full border-b border-ink/20 bg-transparent py-3 text-lg text-ink outline-none focus:border-accent disabled:opacity-60"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-[1fr_5.5rem]">
        <div>
          <label
            htmlFor="lead-city"
            className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/45"
          >
            City
          </label>
          <input
            id="lead-city"
            type="text"
            required
            autoComplete="address-level2"
            value={city}
            disabled={busy}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Dallas"
            className="w-full border-b border-ink/20 bg-transparent py-3 text-lg text-ink outline-none focus:border-accent disabled:opacity-60"
          />
        </div>
        <div>
          <label
            htmlFor="lead-state"
            className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/45"
          >
            State
          </label>
          <input
            id="lead-state"
            type="text"
            required
            autoComplete="address-level1"
            maxLength={2}
            value={state}
            disabled={busy}
            onChange={(e) =>
              setState(e.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 2))
            }
            placeholder="TX"
            className="w-full border-b border-ink/20 bg-transparent py-3 text-lg uppercase text-ink outline-none focus:border-accent disabled:opacity-60"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="lead-email"
          className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/45"
        >
          Business email
        </label>
        <input
          id="lead-email"
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
          htmlFor="lead-phone"
          className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/45"
        >
          Business phone
        </label>
        <input
          id="lead-phone"
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

      <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-ink/70">
        <input
          type="checkbox"
          checked={authorized}
          disabled={busy}
          onChange={(e) => setAuthorized(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 accent-[var(--accent)]"
        />
        <span>
          I own or represent this business and agree that Bsites may contact me
          at this business email or phone about my free website preview.
        </span>
      </label>

      {error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-full bg-accent px-8 py-4 text-[13px] font-semibold uppercase tracking-[0.14em] text-paper transition hover:opacity-90 disabled:opacity-60 sm:w-auto"
      >
        {busy ? "Sending…" : "Continue"}
      </button>
    </form>
  );
}
