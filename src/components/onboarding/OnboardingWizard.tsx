"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import CheckoutButton from "@/components/checkout/CheckoutButton";
import CityStateFields from "./CityStateFields";
import ImageUploadField from "./ImageUploadField";
import { TextArea, TextField } from "./FormFields";
import {
  ONBOARDING_STEPS,
  ease,
  inputClasses,
  labelClasses,
  type OnboardingSession,
} from "./types";

type SaveState = "idle" | "saving" | "saved" | "error";

type Props = {
  initialSession: OnboardingSession;
};

const LAST_STEP = ONBOARDING_STEPS.length - 1;

export default function OnboardingWizard({ initialSession }: Props) {
  const clampedStart = Math.min(initialSession.currentStep || 0, LAST_STEP);
  const [session, setSession] = useState<OnboardingSession>(initialSession);
  const [step, setStep] = useState(clampedStart);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [copied, setCopied] = useState(false);

  const sessionRef = useRef(session);
  const stepRef = useRef(step);
  const dirtyRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  const persist = useCallback(async (showStatus = true) => {
    const current = sessionRef.current;
    if (showStatus) setSaveState("saving");
    setSaveError("");

    try {
      const response = await fetch(`/api/onboarding/${current.token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentStep: stepRef.current,
          contact: current.contact,
          business: current.business,
          extras: current.extras,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Save failed");
      }

      dirtyRef.current = false;
      if (data.session) {
        setSession((prev) => ({
          ...prev,
          ...data.session,
          assets: data.session.assets?.length
            ? data.session.assets
            : prev.assets,
        }));
      }
      if (showStatus) {
        setSaveState("saved");
        window.setTimeout(() => setSaveState("idle"), 2000);
      }
    } catch (err) {
      setSaveState("error");
      setSaveError(err instanceof Error ? err.message : "Save failed");
    }
  }, []);

  // Lock in contact-form (or admin) prefill as soon as the brief opens.
  useEffect(() => {
    if (initialSession.status === "completed") return;
    const hasPrefill =
      Boolean(initialSession.contact.email?.trim()) ||
      Boolean(initialSession.contact.phone?.trim()) ||
      Boolean(initialSession.contact.name?.trim()) ||
      Boolean(
        (initialSession.contact.ownerNames || []).some((n) => n.trim())
      ) ||
      Boolean(initialSession.business.description?.trim()) ||
      Boolean(initialSession.extras.notes?.trim());
    if (!hasPrefill) return;
    dirtyRef.current = true;
    void persist(true);
    // Only on first mount for this session token
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSession.token, persist]);

  const scheduleSave = useCallback(() => {
    dirtyRef.current = true;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      void persist(true);
    }, 2500);
  }, [persist]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (dirtyRef.current) {
        void persist(true);
      }
    }, 30000);

    return () => {
      clearInterval(interval);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [persist]);

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirtyRef.current) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const updateSection = <K extends keyof OnboardingSession>(
    section: K,
    key: string,
    value: string,
  ) => {
    setSession((prev) => {
      const currentSection = prev[section];
      if (
        typeof currentSection !== "object" ||
        currentSection === null ||
        Array.isArray(currentSection)
      ) {
        return prev;
      }
      return {
        ...prev,
        [section]: {
          ...(currentSection as Record<string, unknown>),
          [key]: value,
        },
      };
    });
    scheduleSave();
  };

  const goToStep = async (next: number) => {
    if (step === 0 && next > 0) {
      const owners = (session.contact.ownerNames || [])
        .map((n) => n.trim())
        .filter(Boolean);
      if (!owners.length && !session.contact.name.trim()) {
        setSubmitError("Add at least one owner name.");
        return;
      }
      if (!session.contact.email.trim()) {
        setSubmitError("Add your business email.");
        return;
      }
      if (!session.contact.phone.trim()) {
        setSubmitError("Add your business phone number.");
        return;
      }
      if (!session.contact.businessName.trim()) {
        setSubmitError("Add your business name.");
        return;
      }
    }
    if (step === 1 && next > 1) {
      if (!session.business.description.trim()) {
        setSubmitError("Tell us what the business does first.");
        return;
      }
      if (!session.business.city.trim() || !session.business.state.trim()) {
        setSubmitError("Add city and state before continuing.");
        return;
      }
    }
    setSubmitError("");
    const clamped = Math.max(0, Math.min(LAST_STEP, next));
    setStep(clamped);
    stepRef.current = clamped;
    dirtyRef.current = true;
    await persist(true);
  };

  const handleSubmit = async () => {
    if (!session.contact.businessName.trim()) {
      setSubmitError("Add your business name.");
      setStep(0);
      return;
    }
    if (!session.business.description.trim()) {
      setSubmitError(
        "Tell us what the business does — that’s the main thing we need."
      );
      setStep(1);
      return;
    }
    if (!session.business.city.trim() || !session.business.state.trim()) {
      setSubmitError("Add the city and state you operate in.");
      setStep(1);
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    try {
      await persist(false);
      const response = await fetch(`/api/onboarding/${session.token}/submit`, {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Submit failed");
      }
      setSession(data.session);
      setStep(LAST_STEP);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Submit failed");
    } finally {
      setSubmitting(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const progress = ((step + 1) / ONBOARDING_STEPS.length) * 100;
  const current = ONBOARDING_STEPS[step];
  const checkoutEmail = session.contact.email || session.email;
  const isCompleted = session.status === "completed";

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-ink/45">
            Short brief
          </p>
          <h1 className="font-display mt-2 text-3xl font-medium tracking-tight text-ink sm:text-4xl">
            {current.title}
          </h1>
          <p className="mt-2 max-w-md text-[15px] leading-6 text-ink/55">
            {current.subtitle}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 text-sm text-ink/50">
          <span>
            {saveState === "saving" && "Saving…"}
            {saveState === "saved" && "Saved"}
            {saveState === "error" && (saveError || "Save failed")}
            {saveState === "idle" && "Auto-saves"}
          </span>
          <button
            type="button"
            onClick={copyLink}
            className="rounded-full border border-ink/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-ink/70 transition-colors hover:border-accent hover:text-accent"
          >
            {copied ? "Copied" : "Copy link"}
          </button>
        </div>
      </div>

      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.16em] text-ink/40">
          <span>
            {step + 1} / {ONBOARDING_STEPS.length}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-ink/10">
          <motion.div
            className="h-full rounded-full bg-accent"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease }}
          />
        </div>
        <div className="mt-4 flex gap-1">
          {ONBOARDING_STEPS.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => void goToStep(index)}
              className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors ${
                index === step
                  ? "bg-ink text-paper"
                  : index < step
                    ? "bg-accent/15 text-accent"
                    : "bg-ink/5 text-ink/40"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-ink/15 bg-paper p-6 sm:p-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease }}
            className="space-y-8"
          >
            {step === 0 && (
              <>
                <div className="space-y-4">
                  <p className={labelClasses}>Owner name(s)</p>
                  {(session.contact.ownerNames?.length
                    ? session.contact.ownerNames
                    : [session.contact.name || ""]
                  ).map((ownerName, index) => (
                    <div key={index} className="flex items-end gap-3">
                      <div className="min-w-0 flex-1">
                        <input
                          type="text"
                          name={`owner-${index}`}
                          value={ownerName}
                          required={index === 0}
                          placeholder={
                            index === 0 ? "Jane Doe" : "Another owner"
                          }
                          className={inputClasses}
                          onChange={(e) => {
                            const next = [
                              ...(session.contact.ownerNames?.length
                                ? session.contact.ownerNames
                                : [session.contact.name || ""]),
                            ];
                            next[index] = e.target.value;
                            setSession((prev) => ({
                              ...prev,
                              contact: {
                                ...prev.contact,
                                ownerNames: next,
                                name: next[0] || "",
                              },
                            }));
                            scheduleSave();
                          }}
                        />
                      </div>
                      {index > 0 ? (
                        <button
                          type="button"
                          onClick={() => {
                            const current =
                              session.contact.ownerNames?.length
                                ? session.contact.ownerNames
                                : [session.contact.name || ""];
                            const next = current.filter((_, i) => i !== index);
                            setSession((prev) => ({
                              ...prev,
                              contact: {
                                ...prev.contact,
                                ownerNames: next.length ? next : [""],
                                name: (next[0] || "").trim(),
                              },
                            }));
                            scheduleSave();
                          }}
                          className="shrink-0 pb-4 text-sm text-ink/40 transition-colors hover:text-ink"
                        >
                          Remove
                        </button>
                      ) : null}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const current = session.contact.ownerNames?.length
                        ? session.contact.ownerNames
                        : [session.contact.name || ""];
                      setSession((prev) => ({
                        ...prev,
                        contact: {
                          ...prev.contact,
                          ownerNames: [...current, ""],
                        },
                      }));
                      scheduleSave();
                    }}
                    className="text-sm font-medium text-accent transition-colors hover:text-ink"
                  >
                    + Add another owner
                  </button>
                </div>
                <TextField
                  label="Business name"
                  name="businessName"
                  value={session.contact.businessName}
                  onChange={(v) => updateSection("contact", "businessName", v)}
                  placeholder="Acme Landscaping"
                  required
                />
                <TextField
                  label="Business email"
                  name="email"
                  type="email"
                  value={session.contact.email}
                  onChange={(v) => updateSection("contact", "email", v)}
                  placeholder="hello@yourbusiness.com"
                  required
                  hint="Use the email customers should reach — not a personal Gmail if you can avoid it."
                />
                <TextField
                  label="Business phone"
                  name="phone"
                  type="tel"
                  value={session.contact.phone}
                  onChange={(v) => updateSection("contact", "phone", v)}
                  placeholder="(555) 123-4567"
                  required
                  hint="The number you’d want on the website and for client calls."
                />
              </>
            )}

            {step === 1 && (
              <>
                <TextArea
                  label="What does the business do?"
                  name="description"
                  value={session.business.description}
                  onChange={(v) => updateSection("business", "description", v)}
                  placeholder="Paste an AI-written description, or write a few sentences yourself…"
                  required
                  rows={6}
                  hint="Tip: open ChatGPT (or similar), dump your messy notes, and ask it to describe the business clearly. Paste whatever you get here — longer is fine."
                />
                <CityStateFields
                  city={session.business.city}
                  state={session.business.state}
                  onChange={({ city, state }) => {
                    setSession((prev) => ({
                      ...prev,
                      business: { ...prev.business, city, state },
                    }));
                    scheduleSave();
                  }}
                />
                <TextField
                  label="Current website"
                  name="existingSiteUrl"
                  value={session.business.existingSiteUrl}
                  onChange={(v) =>
                    updateSection("business", "existingSiteUrl", v)
                  }
                  placeholder="https://… if you have one"
                />
              </>
            )}

            {step === 2 && (
              <div className="space-y-8">
                {!isCompleted && (
                  <>
                    <ImageUploadField
                      token={session.token}
                      kind="logo"
                      assets={session.assets}
                      onSession={setSession}
                      label="Logo"
                      hint="Nice if you have it — skip if not."
                    />
                    <ImageUploadField
                      token={session.token}
                      kind="about"
                      assets={session.assets}
                      onSession={setSession}
                      label="Photo of you"
                      hint="Optional — for the About section. A clear headshot or casual photo works."
                    />
                    <ImageUploadField
                      token={session.token}
                      kind="photo"
                      assets={session.assets}
                      onSession={setSession}
                      multiple
                      label="A few more photos"
                      hint="Work shots, products, team — whatever you already have."
                    />
                    <TextField
                      label="Domain you want"
                      name="preferredDomain"
                      value={session.extras.preferredDomain}
                      onChange={(v) =>
                        updateSection("extras", "preferredDomain", v)
                      }
                      placeholder="yourbrand.com — optional"
                    />
                    <TextArea
                      label="Anything else?"
                      name="notes"
                      value={session.extras.notes}
                      onChange={(v) => updateSection("extras", "notes", v)}
                      placeholder="Must-haves, colors you like, sites you admire — only if you want."
                      rows={3}
                    />

                    <div className="space-y-4 border-t border-ink/10 pt-8">
                      <p className="text-[15px] leading-7 text-ink/65">
                        That’s everything we need. Hit submit when you’re ready.
                      </p>
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => void handleSubmit()}
                        className="group relative w-full overflow-hidden rounded-full bg-ink px-8 py-5 text-sm font-semibold uppercase tracking-[0.14em] text-paper disabled:opacity-60"
                      >
                        <span className="absolute inset-0 translate-y-full bg-accent transition-transform duration-300 ease-out group-hover:translate-y-0" />
                        <span className="relative">
                          {submitting ? "Submitting…" : "Submit brief"}
                        </span>
                      </button>
                      {submitError ? (
                        <p className="text-sm text-red-600">{submitError}</p>
                      ) : null}
                    </div>
                  </>
                )}

                {isCompleted && (
                  <div className="space-y-5">
                    <div className="rounded-2xl border border-accent/25 bg-accent/5 p-6">
                      <p className="font-display text-2xl text-ink">
                        Brief received — thank you
                      </p>
                      <p className="mt-2 text-[15px] leading-7 text-ink/65">
                        Want a heads-up the moment your site goes live? Lock in
                        hosting for $84/mo and we’ll email you when it’s ready.
                        Totally optional — you can do this later.
                      </p>
                    </div>
                    <CheckoutButton
                      defaultEmail={checkoutEmail}
                      skipEmailPrompt
                      className="group relative w-full overflow-hidden rounded-full border border-ink/20 bg-transparent px-8 py-5 text-sm font-semibold uppercase tracking-[0.14em] text-ink hover:border-accent hover:text-accent disabled:opacity-60"
                    >
                      Get notified when your site is live
                    </CheckoutButton>
                    <p className="text-center text-sm text-ink/45">
                      Prefer to wait? You’re all set — we’ll be in touch.
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {step < LAST_STEP && (
          <div className="mt-10 space-y-3 border-t border-ink/10 pt-6">
            {submitError && step < LAST_STEP ? (
              <p className="text-sm text-red-600">{submitError}</p>
            ) : null}
            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                disabled={step === 0}
                onClick={() => void goToStep(step - 1)}
                className="text-sm font-medium text-ink/50 transition-colors hover:text-ink disabled:opacity-30"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => void goToStep(step + 1)}
                className="group relative overflow-hidden rounded-full bg-ink px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.14em] text-paper"
              >
                <span className="absolute inset-0 translate-y-full bg-accent transition-transform duration-300 ease-out group-hover:translate-y-0" />
                <span className="relative">
                  {step === 0 ? "Continue" : "Almost done"}
                </span>
              </button>
            </div>
          </div>
        )}

        {step === LAST_STEP && !isCompleted && (
          <div className="mt-6">
            <button
              type="button"
              onClick={() => void goToStep(step - 1)}
              className="text-sm font-medium text-ink/50 transition-colors hover:text-ink"
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
