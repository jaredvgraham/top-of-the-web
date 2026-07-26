import Link from "next/link";
import React from "react";

export default function PreviewClaimBanner({ slug }: { slug: string }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] w-full p-3 sm:p-5">
      <div className="pointer-events-auto mx-auto flex w-full max-w-3xl min-w-0 flex-col gap-3 rounded-2xl border border-ink/10 bg-paper/95 p-4 shadow-[0_12px_40px_rgba(26,20,51,0.18)] backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:gap-5 sm:p-5">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">
            Live in 24 hours from checkout
          </p>
          <p className="mt-1 font-display text-lg font-semibold tracking-tight text-ink sm:text-xl">
            Want the real custom site? Lock it in now.
          </p>
        </div>
        <Link
          href={`/preview/${slug}/claim`}
          className="inline-flex w-full shrink-0 items-center justify-center rounded-full bg-accent px-5 py-3.5 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-paper transition hover:opacity-90 sm:w-auto sm:px-6"
        >
          Get my site live
        </Link>
      </div>
    </div>
  );
}
