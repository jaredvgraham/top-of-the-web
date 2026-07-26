import Link from "next/link";
import React from "react";

/** Persistent top ribbon on rendered demos. */
export default function PreviewDemoRibbon({ slug }: { slug: string }) {
  return (
    <div
      className="sticky top-0 z-[55] w-full border-b border-ink/10 px-3 py-2.5 backdrop-blur-md sm:px-4"
      style={{ backgroundColor: "rgba(245,245,251,0.94)" }}
    >
      <p className="mx-auto max-w-5xl text-left text-[11px] leading-snug text-ink/70 break-words sm:text-center sm:text-[13px]">
        <span className="font-semibold text-ink">Demo only.</span> Your real
        custom site can be live in 24 hours.{" "}
        <Link
          href={`/preview/${slug}/claim`}
          className="font-semibold text-accent underline-offset-2 hover:underline"
        >
          Claim it now
        </Link>
      </p>
    </div>
  );
}
