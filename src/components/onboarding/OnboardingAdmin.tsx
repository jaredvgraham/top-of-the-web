"use client";

import React, { useCallback, useEffect, useState } from "react";
import type { OnboardingSession } from "@/components/onboarding/types";
import {
  buildCursorBuildPrompt,
  cursorPromptFilename,
} from "@/components/onboarding/buildCursorPrompt";

type AdminSession = OnboardingSession & { url?: string };

function formatDate(value?: string | Date) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

export default function OnboardingAdmin() {
  const [sessions, setSessions] = useState<AdminSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<AdminSession | null>(null);
  const [creating, setCreating] = useState(false);
  const [createEmail, setCreateEmail] = useState("");
  const [copiedToken, setCopiedToken] = useState("");
  const [promptCopied, setPromptCopied] = useState(false);
  const [filter, setFilter] = useState<"all" | "in_progress" | "completed">(
    "all",
  );

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

  const createLink = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = createEmail.trim();
    if (!email) {
      setError("Enter the client’s email to create a link.");
      return;
    }
    setCreating(true);
    setError("");
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
      if (data.url) {
        await navigator.clipboard.writeText(data.url);
        setCopiedToken(data.token);
        window.setTimeout(() => setCopiedToken(""), 2500);
      }
      setSelected({ ...data.session, url: data.url });
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
    await navigator.clipboard.writeText(url);
    setCopiedToken(session.token);
    window.setTimeout(() => setCopiedToken(""), 2000);
  };

  const copyCursorPrompt = async (session: AdminSession) => {
    const prompt = buildCursorBuildPrompt(session);
    await navigator.clipboard.writeText(prompt);
    setPromptCopied(true);
    setSelected(session);
    window.setTimeout(() => setPromptCopied(false), 2500);
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

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-ink/45">
            Client intake
          </p>
          <h1 className="font-display mt-2 text-3xl font-medium tracking-tight text-ink sm:text-4xl">
            Onboarding
          </h1>
        </div>
        <div className="flex gap-2">
          {(["all", "in_progress", "completed"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] ${
                filter === value
                  ? "bg-ink text-paper"
                  : "bg-ink/5 text-ink/50"
              }`}
            >
              {value === "all"
                ? "All"
                : value === "in_progress"
                  ? "In progress"
                  : "Completed"}
            </button>
          ))}
        </div>
      </div>

      <form
        onSubmit={createLink}
        className="mb-8 flex flex-col gap-4 rounded-3xl border border-ink/15 bg-paper p-6 sm:flex-row sm:items-end"
      >
        <div className="min-w-0 flex-1">
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/45">
            Client email
          </label>
          <input
            type="email"
            required
            value={createEmail}
            onChange={(e) => setCreateEmail(e.target.value)}
            placeholder="client@email.com"
            className="w-full border-b border-ink/20 bg-transparent py-3 outline-none focus:border-accent"
          />
          <p className="mt-2 text-sm text-ink/45">
            They’ll fill in business name and the rest in the brief.
          </p>
        </div>
        <button
          type="submit"
          disabled={creating}
          className="shrink-0 rounded-full bg-ink px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-paper disabled:opacity-60"
        >
          {creating ? "Creating…" : "Create & copy link"}
        </button>
      </form>

      {copiedToken ? (
        <p className="mb-4 text-sm text-accent">Link copied to clipboard</p>
      ) : null}
      {promptCopied ? (
        <p className="mb-4 text-sm text-accent">
          Cursor build prompt copied — paste it into a new chat
        </p>
      ) : null}
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

      {loading ? (
        <p className="text-ink/50">Loading sessions…</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="overflow-hidden rounded-3xl border border-ink/15">
            <table className="w-full text-left text-sm">
              <thead className="bg-ink/[0.03] text-[11px] uppercase tracking-[0.16em] text-ink/45">
                <tr>
                  <th className="px-4 py-3 font-semibold">Client</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Updated</th>
                  <th className="px-4 py-3 font-semibold" />
                </tr>
              </thead>
              <tbody>
                {sessions.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-8 text-center text-ink/45"
                    >
                      No onboarding sessions yet.
                    </td>
                  </tr>
                )}
                {sessions.map((session) => (
                  <tr
                    key={session.token}
                    className={`border-t border-ink/10 ${
                      selected?.token === session.token ? "bg-accent/5" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setSelected(session)}
                        className="text-left"
                      >
                        <div className="font-medium text-ink">
                          {session.contact.email ||
                            session.email ||
                            "No email"}
                        </div>
                        <div className="text-ink/45">
                          {session.contact.businessName ||
                            (session.contact.ownerNames || [])
                              .filter(Boolean)
                              .join(", ") ||
                            session.contact.name ||
                            "Waiting on brief"}
                        </div>
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                          session.status === "completed"
                            ? "bg-accent/15 text-accent"
                            : "bg-ink/5 text-ink/50"
                        }`}
                      >
                        {session.status === "completed"
                          ? "Completed"
                          : "In progress"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink/55">
                      {formatDate(session.updatedAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <button
                          type="button"
                          onClick={() => void copyCursorPrompt(session)}
                          className="text-xs font-semibold uppercase tracking-[0.14em] text-accent hover:text-ink"
                        >
                          Copy prompt
                        </button>
                        <button
                          type="button"
                          onClick={() => void copyUrl(session)}
                          className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/50 hover:text-accent"
                        >
                          Copy link
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-3xl border border-ink/15 bg-paper p-6">
            {!selected ? (
              <p className="text-ink/45">
                Select a session to view the full brief.
              </p>
            ) : (
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/45">
                      Brief detail
                    </p>
                    <h2 className="font-display mt-1 text-2xl text-ink">
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
                    className="text-xs font-semibold uppercase tracking-[0.14em] text-accent"
                  >
                    Open
                  </a>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void copyCursorPrompt(selected)}
                    className="rounded-full bg-ink px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-paper"
                  >
                    {promptCopied ? "Copied" : "Copy Cursor prompt"}
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadCursorPrompt(selected)}
                    className="rounded-full border border-ink/20 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/70 hover:border-accent hover:text-accent"
                  >
                    Download .md
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
                            className="text-sm text-accent hover:underline"
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
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.12em] text-ink/35">
        {label}
      </p>
      <p className="whitespace-pre-wrap text-sm text-ink/80">{value || "—"}</p>
    </div>
  );
}
