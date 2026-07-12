"use client";

import React, { useRef, useState } from "react";
import type { OnboardingAsset, OnboardingSession } from "./types";
import { labelClasses } from "./types";

type Props = {
  token: string;
  kind: "logo" | "about" | "photo";
  assets: OnboardingAsset[];
  onSession: (session: OnboardingSession) => void;
  multiple?: boolean;
  label: string;
  hint?: string;
};

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
  const [error, setError] = useState("");

  const visible = assets.filter((asset) => asset.kind === kind);

  const uploadFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setError("");
    setUploading(true);

    try {
      let latest: OnboardingSession | null = null;
      const list = Array.from(files);

      for (const file of list) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("kind", kind);

        const response = await fetch(`/api/onboarding/${token}/upload`, {
          method: "POST",
          body: formData,
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Upload failed");
        }

        latest = data.session;
      }

      if (latest) onSession(latest);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
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
          {uploading ? "Uploading…" : multiple ? "Add photos" : "Upload"}
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
