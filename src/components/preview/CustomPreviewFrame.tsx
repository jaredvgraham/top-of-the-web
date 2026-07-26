"use client";

import React, { useMemo, useRef } from "react";
import { rewritePreviewHtmlLinks } from "@/lib/preview/generatePreviewHtml";

type PageKey = "home" | "services" | "about";

export default function CustomPreviewFrame({
  html,
  slug,
  page,
}: {
  html: string;
  slug: string;
  page: PageKey;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const srcDoc = useMemo(() => {
    const basePath = `/preview/${slug}`;
    return rewritePreviewHtmlLinks(html, basePath);
  }, [html, slug]);

  return (
    <iframe
      ref={iframeRef}
      title={`Website demo — ${page}`}
      srcDoc={srcDoc}
      className="block w-full border-0 bg-white"
      style={{ minHeight: "100vh", width: "100%" }}
      sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-top-navigation-by-user-activation"
      onLoad={() => {
        try {
          const doc = iframeRef.current?.contentDocument;
          const height = Math.max(
            doc?.body?.scrollHeight || 0,
            doc?.documentElement?.scrollHeight || 0,
            900
          );
          if (iframeRef.current) {
            iframeRef.current.style.height = `${height + 40}px`;
          }
        } catch {
          if (iframeRef.current) {
            iframeRef.current.style.height = "2400px";
          }
        }
      }}
    />
  );
}
