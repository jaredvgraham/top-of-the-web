"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Dedupe Strict Mode double-mount / rapid remounts (survives remount). */
const recentPings = new Map<string, number>();

/**
 * Fires a demo view ping once per page visit.
 * Admin exclusion is enforced server-side via admin_session cookie.
 */
export default function PreviewViewTracker({ slug }: { slug: string }) {
  const pathname = usePathname();

  useEffect(() => {
    if (!slug) return;

    const key = `${slug}:${pathname || ""}`;
    const now = Date.now();
    const prev = recentPings.get(key) || 0;
    if (now - prev < 1500) return;
    recentPings.set(key, now);

    void fetch(`/api/preview/${encodeURIComponent(slug)}/view`, {
      method: "POST",
      credentials: "same-origin",
      keepalive: true,
    }).catch(() => {
      // non-blocking
    });
  }, [slug, pathname]);

  return null;
}
