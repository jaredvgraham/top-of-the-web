"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { OnboardingSession } from "@/components/onboarding/types";
import {
  buildCursorBuildPrompt,
  cursorPromptFilename,
} from "@/components/onboarding/buildCursorPrompt";

type AdminSession = OnboardingSession & { url?: string };

function formatDate(value?: string | Date) {
  if (!value) return "—";
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Mobile Safari often blocks clipboard after await — fall through.
  }

  try {
    const input = document.createElement("textarea");
    input.value = text;
    input.setAttribute("readonly", "");
    input.style.position = "fixed";
    input.style.top = "0";
    input.style.left = "0";
    input.style.opacity = "0";
    document.body.appendChild(input);
    input.focus();
    input.select();
    input.setSelectionRange(0, text.length);
    const ok = document.execCommand("copy");
    document.body.removeChild(input);
    return ok;
  } catch {
    return false;
  }
}

function sessionTitle(session: AdminSession) {
  return (
    session.contact.businessName ||
    (session.contact.ownerNames || []).filter(Boolean).join(", ") ||
    session.contact.name ||
    "Waiting on brief"
  );
}

function sessionEmail(session: AdminSession) {
  return session.contact.email || session.email || "No email";
}

function statusLabel(status: AdminSession["status"]) {
  if (status === "completed") return "Done";
  if (status === "in_progress") return "In progress";
  return "Not started";
}

function statusBadgeClass(status: AdminSession["status"]) {
  if (status === "completed") return "bg-accent/15 text-accent";
  if (status === "in_progress") return "bg-ink/10 text-ink/70";
  return "bg-ink/5 text-ink/40";
}

export default function OnboardingAdmin() {
  const [sessions, setSessions] = useState<AdminSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<AdminSession | null>(null);
  const [creating, setCreating] = useState(false);
  const [createEmail, setCreateEmail] = useState("");
  const [copiedToken, setCopiedToken] = useState("");
  const [copiedLabel, setCopiedLabel] = useState("");
  const [promptCopied, setPromptCopied] = useState(false);
  const [copyHint, setCopyHint] = useState("");
  const [deletingToken, setDeletingToken] = useState("");
  const [filter, setFilter] = useState<
    "all" | "not_started" | "in_progress" | "completed"
  >("all");
  const detailRef = useRef<HTMLDivElement>(null);
  const copiedClearRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const markLinkCopied = (session: AdminSession) => {
    setCopiedToken(session.token);
    setCopiedLabel(sessionEmail(session));
    setCopyHint("");
    if (copiedClearRef.current) clearTimeout(copiedClearRef.current);
    copiedClearRef.current = setTimeout(() => {
      setCopiedToken("");
      setCopiedLabel("");
    }, 4500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const query = filter === "all" ? "" : `?status=${filter}`;
      const response = await fetch(`/api/admin/onboarding${query}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to load");
      }
      setSessions(data.sessions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    return () => {
      if (copiedClearRef.current) clearTimeout(copiedClearRef.current);
    };
  }, []);

  const selectSession = (session: AdminSession) => {
    setSelected(session);
    window.setTimeout(() => {
      detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const createLink = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = createEmail.trim();
    if (!email) {
      setError("Enter the client’s email to create a link.");
      return;
    }
    setCreating(true);
    setError("");
    setCopyHint("");
    try {
      const response = await fetch("/api/admin/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Could not create link");
      }
      setCreateEmail("");
      await load();
      selectSession({ ...data.session, url: data.url });

      if (data.url) {
        const copied = await copyText(data.url);
        if (copied) {
          markLinkCopied({ ...data.session, url: data.url });
        } else {
          setCopyHint("Created — tap Link to copy on this device");
          window.setTimeout(() => setCopyHint(""), 4000);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create link");
    } finally {
      setCreating(false);
    }
  };

  const copyUrl = async (session: AdminSession) => {
    const url =
      session.url ||
      `${window.location.origin}/onboarding/${session.token}`;
    const copied = await copyText(url);
    if (copied) {
      markLinkCopied(session);
      setSelected(session);
    } else {
      setCopyHint("Couldn’t copy automatically — long-press the Open link");
      window.setTimeout(() => setCopyHint(""), 4000);
    }
  };

  const copyCursorPrompt = async (session: AdminSession) => {
    const prompt = buildCursorBuildPrompt(session);
    const copied = await copyText(prompt);
    setSelected(session);
    if (copied) {
      setPromptCopied(true);
      setCopyHint("");
      window.setTimeout(() => setPromptCopied(false), 2500);
    } else {
      setCopyHint("Couldn’t copy — use Download .md instead");
      window.setTimeout(() => setCopyHint(""), 4000);
    }
  };

  const downloadCursorPrompt = (session: AdminSession) => {
    const prompt = buildCursorBuildPrompt(session);
    const blob = new Blob([prompt], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = cursorPromptFilename(session);
    anchor.click();
    URL.revokeObjectURL(url);
    setSelected(session);
  };

  const deleteSession = async (session: AdminSession) => {
    const label =
      session.contact.businessName ||
      session.contact.email ||
      session.email ||
      "this onboarding";
    const confirmed = window.confirm(
      `Delete ${label}? This removes the brief and uploaded images.`
    );
    if (!confirmed) return;

    setDeletingToken(session.token);
    setError("");
    try {
      const response = await fetch(`/api/admin/onboarding/${session.token}`, {
        method: "DELETE",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || "Could not delete");
      }
      setSessions((prev) => prev.filter((item) => item.token !== session.token));
      if (selected?.token === session.token) {
        setSelected(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete");
    } finally {
      setDeletingToken("");
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-6 sm:px-8 sm:pb-12 sm:pt-10">
      <div className="mb-6 space-y-4 sm:mb-8 sm:flex sm:flex-wrap sm:items-end sm:justify-between sm:gap-4 sm:space-y-0">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-ink/45 sm:text-[12px]">
            Client intake
          </p>
          <h1 className="font-display mt-2 text-3xl font-medium tracking-tight text-ink sm:text-4xl">
            Onboarding
          </h1>
        </div>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
          {(
            ["all", "not_started", "in_progress", "completed"] as const
          ).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`shrink-0 rounded-full px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] ${
                filter === value
                  ? "bg-ink text-paper"
                  : "bg-ink/5 text-ink/50"
              }`}
            >
              {value === "all"
                ? "All"
                : value === "not_started"
                  ? "Not started"
                  : value === "in_progress"
                    ? "In progress"
                    : "Completed"}
            </button>
          ))}
        </div>
      </div>

      <form
        onSubmit={createLink}
        className="mb-6 space-y-4 rounded-3xl border border-ink/15 bg-paper p-5 sm:mb-8 sm:flex sm:flex-row sm:items-end sm:gap-4 sm:space-y-0 sm:p-6"
      >
        <div className="min-w-0 flex-1">
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/45">
            Client email
          </label>
          <input
            type="email"
            required
            inputMode="email"
            autoCapitalize="none"
            autoCorrect="off"
            value={createEmail}
            onChange={(e) => setCreateEmail(e.target.value)}
            placeholder="client@email.com"
            className="w-full border-b border-ink/20 bg-transparent py-3 text-base outline-none focus:border-accent"
          />
          <p className="mt-2 text-sm text-ink/45">
            They’ll fill in business name and the rest in the brief.
          </p>
        </div>
        <button
          type="submit"
          disabled={creating}
          className="w-full shrink-0 rounded-full bg-ink px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-paper disabled:opacity-60 sm:w-auto"
        >
          {creating ? "Creating…" : "Create & copy link"}
        </button>
      </form>

      {copiedToken ? (
        <p className="mb-3 rounded-2xl border border-accent/25 bg-accent/10 px-4 py-3 text-sm text-accent">
          Copied link for <span className="font-semibold">{copiedLabel}</span>
        </p>
      ) : null}
      {promptCopied ? (
        <p className="mb-3 text-sm text-accent">
          Cursor build prompt copied — paste it into a new chat
        </p>
      ) : null}
      {copyHint ? <p className="mb-3 text-sm text-ink/55">{copyHint}</p> : null}
      {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}

      {loading ? (
        <p className="text-ink/50">Loading sessions…</p>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6">
          <div className="space-y-3">
            {sessions.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-ink/15 px-5 py-10 text-center text-ink/45">
                No onboarding sessions yet.
              </div>
            ) : (
              sessions.map((session) => {
                const active = selected?.token === session.token;
                const justCopied = copiedToken === session.token;
                return (
                  <div
                    key={session.token}
                    className={`rounded-3xl border p-4 transition-all duration-300 sm:p-5 ${
                      justCopied
                        ? "border-accent bg-accent/10 ring-2 ring-accent/40 shadow-[0_0_0_4px_rgba(91,46,158,0.12)]"
                        : active
                          ? "border-accent/40 bg-accent/5"
                          : "border-ink/15 bg-paper"
                    }`}
                  >
                    {justCopied ? (
                      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
                        Link copied · {sessionEmail(session)}
                      </p>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => selectSession(session)}
                      className="w-full text-left"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-ink">
                            {sessionEmail(session)}
                          </p>
                          <p className="mt-1 truncate text-sm text-ink/50">
                            {sessionTitle(session)}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${statusBadgeClass(
                            session.status
                          )}`}
                        >
                          {statusLabel(session.status)}
                        </span>
                      </div>
                      <p className="mt-3 text-xs text-ink/40">
                        Updated {formatDate(session.updatedAt)}
                      </p>
                    </button>

                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => void copyCursorPrompt(session)}
                        className="rounded-full bg-ink px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-paper"
                      >
                        Prompt
                      </button>
                      <button
                        type="button"
                        onClick={() => void copyUrl(session)}
                        className={`rounded-full px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] ${
                          justCopied
                            ? "bg-accent text-paper"
                            : "border border-ink/15 text-ink/70"
                        }`}
                      >
                        {justCopied ? "Copied" : "Link"}
                      </button>
                      <button
                        type="button"
                        disabled={deletingToken === session.token}
                        onClick={() => void deleteSession(session)}
                        className="rounded-full border border-red-200 px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-red-600 disabled:opacity-60"
                      >
                        {deletingToken === session.token ? "…" : "Delete"}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div
            ref={detailRef}
            className={`rounded-3xl border border-ink/15 bg-paper p-5 sm:p-6 ${
              selected ? "block" : "hidden lg:block"
            }`}
          >
            {!selected ? (
              <p className="py-8 text-center text-ink/45 lg:py-0 lg:text-left">
                Select a session to view the full brief.
              </p>
            ) : (
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <button
                      type="button"
                      onClick={() => setSelected(null)}
                      className="mb-3 text-sm text-ink/45 lg:hidden"
                    >
                      ← Back to list
                    </button>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/45">
                      Brief detail
                    </p>
                    <h2 className="font-display mt-1 break-words text-2xl text-ink">
                      {selected.contact.businessName ||
                        selected.contact.email ||
                        selected.email ||
                        "Untitled brief"}
                    </h2>
                  </div>
                  <a
                    href={`/onboarding/${selected.token}`}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 pt-1 text-xs font-semibold uppercase tracking-[0.14em] text-accent"
                  >
                    Open
                  </a>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => void copyCursorPrompt(selected)}
                    className="rounded-full bg-ink px-4 py-3.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-paper"
                  >
                    {promptCopied ? "Copied" : "Copy Cursor prompt"}
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadCursorPrompt(selected)}
                    className="rounded-full border border-ink/20 px-4 py-3.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/70"
                  >
                    Download .md
                  </button>
                  <button
                    type="button"
                    disabled={deletingToken === selected.token}
                    onClick={() => void deleteSession(selected)}
                    className="rounded-full border border-red-200 px-4 py-3.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-red-600 disabled:opacity-60"
                  >
                    {deletingToken === selected.token
                      ? "Deleting…"
                      : "Delete brief"}
                  </button>
                </div>
                <p className="text-sm text-ink/45">
                  Copies a ready-to-paste build prompt with contact info,
                  description, location, notes, and image URLs.
                </p>

                <Section title="What they do">
                  <Row
                    label="Business"
                    value={selected.business.description}
                  />
                  <Row
                    label="Location"
                    value={
                      [selected.business.city, selected.business.state]
                        .filter(Boolean)
                        .join(", ") || undefined
                    }
                  />
                  <Row
                    label="Existing site"
                    value={selected.business.existingSiteUrl}
                  />
                </Section>

                <Section title="Contact">
                  <Row
                    label="Owners"
                    value={
                      (
                        selected.contact.ownerNames?.filter((n) => n.trim()) ||
                        (selected.contact.name ? [selected.contact.name] : [])
                      ).join(", ") || undefined
                    }
                  />
                  <Row
                    label="Business name"
                    value={selected.contact.businessName}
                  />
                  <Row
                    label="Business email"
                    value={selected.contact.email || selected.email}
                  />
                  <Row label="Business phone" value={selected.contact.phone} />
                </Section>

                <Section title="Extras">
                  <Row
                    label="Domain"
                    value={selected.extras.preferredDomain}
                  />
                  <Row label="Notes" value={selected.extras.notes} />
                </Section>

                <Section title="Uploads">
                  {selected.assets.length === 0 ? (
                    <p className="text-sm text-ink/40">None yet.</p>
                  ) : (
                    <ul className="space-y-2">
                      {selected.assets.map((asset) => (
                        <li key={asset.id || asset.url}>
                          <a
                            href={asset.url}
                            target="_blank"
                            rel="noreferrer"
                            className="break-all text-sm text-accent hover:underline"
                          >
                            [{asset.kind}] {asset.filename}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </Section>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/40">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.12em] text-ink/35">
        {label}
      </p>
      <p className="whitespace-pre-wrap break-words text-sm leading-6 text-ink/80">
        {value || "—"}
      </p>
    </div>
  );
}
