"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { rewritePreviewHtmlLinks } from "@/lib/preview/generatePreviewHtml";

type PageKey = "home" | "services" | "about";

function measureDocHeight(doc: Document) {
  const body = doc.body;
  const html = doc.documentElement;
  return Math.max(
    body?.scrollHeight || 0,
    body?.offsetHeight || 0,
    html?.scrollHeight || 0,
    html?.offsetHeight || 0,
    900
  );
}

export function externalDemoPageUrl(
  baseUrl: string,
  page: PageKey
): string {
  const trimmed = baseUrl.trim().replace(/\/+$/, "");
  if (!trimmed) return "";
  if (page === "home") return `${trimmed}/`;
  return `${trimmed}/${page}`;
}

export default function CustomPreviewFrame({
  html,
  slug,
  page,
  externalUrl,
}: {
  html?: string;
  slug: string;
  page: PageKey;
  /** When set, load this live URL instead of stored HTML (srcDoc). */
  externalUrl?: string;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const liveUrl = (externalUrl || "").trim();
  const srcDoc = useMemo(() => {
    if (liveUrl || !html) return "";
    const basePath = `/preview/${slug}`;
    return rewritePreviewHtmlLinks(html, basePath);
  }, [html, slug, liveUrl]);

  useEffect(() => {
    if (liveUrl) return;
    const iframe = iframeRef.current;
    if (!iframe) return;

    let ro: ResizeObserver | null = null;
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    const cleanups: Array<() => void> = [];

    const applyHeight = () => {
      try {
        const doc = iframe.contentDocument;
        if (!doc) return;
        const height = measureDocHeight(doc);
        iframe.style.height = `${height + 24}px`;
        iframe.style.minHeight = "0";
      } catch {
        iframe.style.height = "2400px";
      }
    };

    const scheduleHeight = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(applyHeight, 80);
    };

    const bind = () => {
      try {
        const doc = iframe.contentDocument;
        if (!doc?.body) return;

        // Parent page is the only scrollport
        const style = doc.createElement("style");
        style.setAttribute("data-bsites-scroll-fix", "1");
        style.textContent =
          "html,body{margin:0!important;overflow:hidden!important;height:auto!important;max-height:none!important;}";
        if (!doc.head.querySelector("[data-bsites-scroll-fix]")) {
          doc.head.appendChild(style);
        }

        applyHeight();

        if (typeof ResizeObserver !== "undefined") {
          ro = new ResizeObserver(scheduleHeight);
          ro.observe(doc.documentElement);
          if (doc.body) ro.observe(doc.body);
        }

        const imgs = Array.from(doc.images || []);
        for (const img of imgs) {
          if (!img.complete) {
            img.addEventListener("load", scheduleHeight);
            img.addEventListener("error", scheduleHeight);
            cleanups.push(() => {
              img.removeEventListener("load", scheduleHeight);
              img.removeEventListener("error", scheduleHeight);
            });
          }
        }

        void doc.fonts?.ready?.then(scheduleHeight);

        // Late Tailwind / layout shifts
        const retries = [200, 600, 1500, 3000];
        for (const ms of retries) {
          const id = window.setTimeout(scheduleHeight, ms);
          cleanups.push(() => window.clearTimeout(id));
        }
      } catch {
        iframe.style.height = "2400px";
      }
    };

    const onLoad = () => bind();
    iframe.addEventListener("load", onLoad);
    // srcDoc may already be loaded
    if (iframe.contentDocument?.readyState === "complete") {
      bind();
    }

    window.addEventListener("resize", scheduleHeight);
    cleanups.push(() => window.removeEventListener("resize", scheduleHeight));

    return () => {
      iframe.removeEventListener("load", onLoad);
      ro?.disconnect();
      if (debounceTimer) clearTimeout(debounceTimer);
      for (const fn of cleanups) fn();
    };
  }, [srcDoc, liveUrl]);

  if (liveUrl) {
    return (
      <iframe
        title={`Website demo — ${page}`}
        src={liveUrl}
        className="block w-full border-0 bg-white"
        style={{
          width: "100%",
          height: "calc(100vh - 9rem)",
          minHeight: "720px",
        }}
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-top-navigation-by-user-activation"
      />
    );
  }

  return (
    <iframe
      ref={iframeRef}
      title={`Website demo — ${page}`}
      srcDoc={srcDoc}
      className="block w-full overflow-hidden border-0 bg-white"
      style={{ width: "100%", minHeight: "100vh", overflow: "hidden" }}
      sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-top-navigation-by-user-activation"
    />
  );
}
