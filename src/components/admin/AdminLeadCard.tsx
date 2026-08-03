"use client";

import { useState } from "react";
import type { AdminLeadRow } from "@/lib/adminLeads";

function formatWhen(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function statusLabel(status: string) {
  return status.replace(/_/g, " ");
}

function phoneDigits(phone: string) {
  return phone.replace(/[^\d+]/g, "");
}

function telHref(phone: string) {
  const digits = phoneDigits(phone);
  return digits ? `tel:${digits}` : "";
}

function smsHref(phone: string) {
  const digits = phoneDigits(phone);
  return digits ? `sms:${digits}` : "";
}

function Flag({
  yes,
  yesLabel,
  noLabel,
}: {
  yes: boolean;
  yesLabel: string;
  noLabel: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${
        yes ? "bg-emerald-500/15 text-emerald-800" : "bg-ink/5 text-ink/45"
      }`}
    >
      {yes ? yesLabel : noLabel}
    </span>
  );
}

function SourceFlag({
  source,
  fromMeta,
}: {
  source: AdminLeadRow["source"];
  fromMeta: boolean;
}) {
  if (source === "contact") {
    return (
      <span className="inline-flex items-center rounded-full bg-sky-500/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-sky-900">
        Contact
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${
        fromMeta
          ? "bg-accent/15 text-accent"
          : "bg-amber-500/15 text-amber-900"
      }`}
    >
      {fromMeta ? "Meta ad" : "Organic"}
    </span>
  );
}

function ActionBtn({
  href,
  label,
  disabled,
  primary,
}: {
  href?: string;
  label: string;
  disabled?: boolean;
  primary?: boolean;
}) {
  const className = `flex min-h-11 flex-1 items-center justify-center rounded-xl px-3 text-sm font-semibold transition ${
    disabled
      ? "pointer-events-none bg-ink/[0.04] text-ink/25"
      : primary
        ? "bg-ink text-paper active:scale-[0.98]"
        : "bg-ink/5 text-ink active:bg-ink/10"
  }`;

  if (href && !disabled) {
    return (
      <a href={href} className={className}>
        {label}
      </a>
    );
  }

  return (
    <button type="button" disabled className={className}>
      {label}
    </button>
  );
}

type Props = {
  lead: AdminLeadRow;
  /** Show Meta ad vs Organic source badge (for the all-leads admin page). */
  showSource?: boolean;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
  onDelete?: (id: string) => void;
  deleting?: boolean;
};

export default function AdminLeadCard({
  lead,
  showSource = false,
  selected = false,
  onToggleSelect,
  onDelete,
  deleting = false,
}: Props) {
  const [copied, setCopied] = useState<
    "email" | "phone" | "demo" | "brief" | null
  >(null);
  const bought = lead.status === "purchased";
  const hasFb = Boolean(lead.facebookUrl?.trim());
  const phoneLink = telHref(lead.phone);
  const textLink = smsHref(lead.phone);
  const location = [lead.city, lead.state].filter(Boolean).join(", ");
  const demoLink = lead.demoUrl || lead.continueUrl;
  const demoLabel = lead.demoUrl ? "Demo" : lead.continueUrl ? "Make demo" : "";
  const briefLink = lead.onboardingUrl;
  const notes = lead.notes?.trim() || "";

  async function copy(
    kind: "email" | "phone" | "demo" | "brief",
    value: string
  ) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 1200);
    } catch {
      // ignore
    }
  }

  return (
    <article className="border-b border-ink/10 py-5 last:border-b-0">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          {onToggleSelect ? (
            <input
              type="checkbox"
              checked={selected}
              onChange={() => onToggleSelect(lead.id)}
              className="mt-1.5 h-4 w-4 shrink-0 accent-ink"
              aria-label={`Select ${lead.name || lead.email || "lead"}`}
            />
          ) : null}
          <div className="min-w-0">
            <p className="font-display text-xl font-medium leading-tight text-ink">
              {lead.name || "Unnamed"}
            </p>
            <p className="mt-0.5 truncate text-sm text-ink/60">
              {lead.businessName || "No business name"}
              {location ? ` · ${location}` : ""}
            </p>
            <p className="mt-1 text-xs text-ink/40">{formatWhen(lead.createdAt)}</p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          {showSource ? (
            <SourceFlag source={lead.source} fromMeta={lead.fromMeta} />
          ) : null}
          <Flag yes={bought} yesLabel="Bought" noLabel="No buy" />
          <Flag yes={hasFb} yesLabel="FB in" noLabel="No FB" />
          {lead.source !== "contact" ? (
            <Flag
              yes={lead.demoViewCount > 0}
              yesLabel={
                lead.demoViewCount === 1
                  ? "Viewed 1×"
                  : `Viewed ${lead.demoViewCount}×`
              }
              noLabel="Not viewed"
            />
          ) : null}
          {lead.previewSlug ? (
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${
                (lead.revisionsBeforePayUsed ?? 0) > 0 ||
                (lead.revisionsAfterPayUsed ?? 0) > 0
                  ? "bg-accent/15 text-accent"
                  : "bg-ink/5 text-ink/45"
              }`}
              title="AI revisions used (pre-pay / post-pay)"
            >
              AI {lead.revisionsBeforePayUsed ?? 0}/2 ·{" "}
              {lead.revisionsAfterPayUsed ?? 0}/2
            </span>
          ) : null}
        </div>
      </div>

      <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/40">
        {statusLabel(lead.status)}
        {lead.demoViewCount > 0 && lead.demoLastViewedAt ? (
          <span className="normal-case tracking-normal font-normal text-ink/35">
            {" "}
            · last demo view {formatWhen(lead.demoLastViewedAt)}
          </span>
        ) : null}
        {lead.previewSlug ? (
          <span className="normal-case tracking-normal font-normal text-ink/35">
            {" "}
            · AI revisions {lead.revisionsBeforePayUsed ?? 0}/2 pre ·{" "}
            {lead.revisionsAfterPayUsed ?? 0}/2 post
          </span>
        ) : null}
      </p>

      {lead.lastRevisionNote ? (
        <p className="mt-3 whitespace-pre-wrap rounded-xl border border-accent/15 bg-accent/[0.05] px-3 py-2.5 text-sm leading-6 text-ink/75">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">
            Last AI revision note
          </span>
          <br />
          {lead.lastRevisionNote}
        </p>
      ) : null}

      {notes ? (
        <p className="mt-3 whitespace-pre-wrap rounded-xl bg-ink/[0.03] px-3 py-2.5 text-sm leading-6 text-ink/70">
          {notes}
        </p>
      ) : null}

      {briefLink ? (
        <div className="mt-3 rounded-xl bg-ink/[0.03] px-3 py-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/40">
            Onboarding brief
          </p>
          <div className="mt-1 flex items-center justify-between gap-2">
            <a
              href={briefLink}
              target="_blank"
              rel="noreferrer"
              className="min-w-0 truncate text-sm text-accent hover:underline"
            >
              {briefLink}
            </a>
            <button
              type="button"
              onClick={() => void copy("brief", briefLink)}
              className="shrink-0 rounded-lg bg-ink/5 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink/55"
            >
              {copied === "brief" ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      ) : null}

      {demoLink ? (
        <div className="mt-3 rounded-xl bg-ink/[0.03] px-3 py-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/40">
            {demoLabel}
          </p>
          <div className="mt-1 flex items-center justify-between gap-2">
            <a
              href={demoLink}
              target="_blank"
              rel="noreferrer"
              className="min-w-0 truncate text-sm text-accent hover:underline"
            >
              {demoLink}
            </a>
            <button
              type="button"
              onClick={() => void copy("demo", demoLink)}
              className="shrink-0 rounded-lg bg-ink/5 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink/55"
            >
              {copied === "demo" ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      ) : !briefLink ? (
        <p className="mt-3 text-xs text-ink/40">No demo or continue link</p>
      ) : null}

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <ActionBtn
          href={phoneLink || undefined}
          label="Call"
          primary
          disabled={!phoneLink}
        />
        <ActionBtn href={textLink || undefined} label="Text" disabled={!textLink} />
        <ActionBtn
          href={lead.email ? `mailto:${lead.email}` : undefined}
          label="Email"
          disabled={!lead.email}
        />
        <ActionBtn
          href={hasFb ? lead.facebookUrl : undefined}
          label="FB page"
          disabled={!hasFb}
        />
      </div>

      <div className="mt-3 space-y-2 text-sm">
        {lead.phone ? (
          <div className="flex items-center justify-between gap-2">
            <a
              href={phoneLink || undefined}
              className="min-w-0 truncate font-medium text-ink"
            >
              {lead.phone}
            </a>
            <button
              type="button"
              onClick={() => void copy("phone", lead.phone)}
              className="shrink-0 rounded-lg bg-ink/5 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink/55"
            >
              {copied === "phone" ? "Copied" : "Copy"}
            </button>
          </div>
        ) : null}
        {lead.email ? (
          <div className="flex items-center justify-between gap-2">
            <a
              href={`mailto:${lead.email}`}
              className="min-w-0 truncate text-ink/70"
            >
              {lead.email}
            </a>
            <button
              type="button"
              onClick={() => void copy("email", lead.email)}
              className="shrink-0 rounded-lg bg-ink/5 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink/55"
            >
              {copied === "email" ? "Copied" : "Copy"}
            </button>
          </div>
        ) : null}
      </div>

      {onDelete ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={deleting}
            onClick={() => onDelete(lead.id)}
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      ) : null}
    </article>
  );
}
