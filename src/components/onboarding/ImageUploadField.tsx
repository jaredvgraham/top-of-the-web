"use client";

import React, { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import type { OnboardingAsset, OnboardingSession } from "./types";
import { labelClasses } from "./types";
import {
  isAllowedImageType,
  MAX_UPLOAD_BYTES,
} from "@/lib/onboardingConstants";

type Props = {
  token: string;
  kind: "logo" | "about" | "photo";
  assets: OnboardingAsset[];
  onSession: (session: OnboardingSession) => void;
  multiple?: boolean;
  label: string;
  hint?: string;
};

function formatMb(bytes: number) {
  return `${Math.round(bytes / (1024 * 1024))} MB`;
}

export default function ImageUploadField({
  token,
  kind,
  assets,
  onSession,
  multiple = false,
  label,
  hint,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");

  const visible = assets.filter((asset) => asset.kind === kind);

  const uploadFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setError("");
    setUploading(true);
    setProgress("");

    try {
      let latest: OnboardingSession | null = null;
      const list = Array.from(files);

      for (let index = 0; index < list.length; index += 1) {
        const file = list[index];
        setProgress(
          list.length > 1
            ? `Uploading ${index + 1} of ${list.length}…`
            : "Uploading…"
        );

        if (!isAllowedImageType(file.type)) {
          throw new Error(
            `${file.name}: use JPEG, PNG, WebP, GIF, or SVG`
          );
        }

        if (file.size > MAX_UPLOAD_BYTES) {
          throw new Error(
            `${file.name} is over ${formatMb(MAX_UPLOAD_BYTES)}`
          );
        }

        const safeName =
          file.name.replace(/[^a-zA-Z0-9._-]/g, "_") || "upload";
        const pathname = `onboarding/${token}/${kind}-${Date.now()}-${safeName}`;

        // Upload goes browser → Blob (not through our serverless function).
        const blob = await upload(pathname, file, {
          access: "public",
          handleUploadUrl: `/api/onboarding/${token}/blob`,
          multipart: true,
          clientPayload: JSON.stringify({ kind }),
          contentType: file.type,
        });

        const response = await fetch(`/api/onboarding/${token}/assets`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: blob.url,
            pathname: blob.pathname,
            filename: file.name,
            kind,
          }),
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not save uploaded image");
        }

        latest = data.session;
        if (data.session) onSession(data.session);
      }

      if (latest) onSession(latest);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      setProgress("");
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeAsset = async (asset: OnboardingAsset) => {
    setError("");
    try {
      const response = await fetch(`/api/onboarding/${token}/assets`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId: asset.id, url: asset.url }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Could not remove image");
      }
      onSession(data.session);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove image");
    }
  };

  return (
    <div>
      <p className={labelClasses}>{label}</p>
      {hint ? <p className="mb-4 text-sm text-ink/45">{hint}</p> : null}

      <div className="flex flex-wrap gap-4">
        {visible.map((asset) => (
          <div
            key={asset.id || asset.url}
            className="group relative flex max-h-48 max-w-[14rem] items-center justify-center rounded-2xl border border-ink/10 bg-ink/[0.03] p-2"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={asset.url}
              alt={asset.filename}
              className="max-h-44 max-w-full object-contain"
            />
            <button
              type="button"
              onClick={() => removeAsset(asset)}
              className="absolute right-2 top-2 rounded-full bg-ink/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-paper opacity-0 transition-opacity group-hover:opacity-100"
            >
              Remove
            </button>
          </div>
        ))}

        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="flex h-32 min-w-[8rem] flex-col items-center justify-center rounded-2xl border border-dashed border-ink/25 px-4 text-sm text-ink/55 transition-colors hover:border-accent hover:text-accent disabled:opacity-60"
        >
          {uploading
            ? progress || "Uploading…"
            : multiple
              ? "Add photos"
              : "Upload"}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        multiple={multiple}
        className="hidden"
        onChange={(e) => uploadFiles(e.target.files)}
      />

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
