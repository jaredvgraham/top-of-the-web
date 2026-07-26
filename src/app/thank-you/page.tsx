import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import Footer from "@/components/HomePage/Footer";
import ThankYouPurchasePixel from "@/components/analytics/ThankYouPurchasePixel";

export const metadata: Metadata = {
  title: "Thank You — Bsites.io",
  description: "Thanks for your purchase. Your custom website is on the way.",
  robots: { index: false, follow: false },
};

export default function ThankYou() {
  return (
    <>
      <Suspense fallback={null}>
        <ThankYouPurchasePixel />
      </Suspense>

      <main className="relative flex min-h-screen flex-col items-center overflow-hidden px-5 pb-20 pt-28 text-center sm:px-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(91,46,158,0.14), transparent 55%), linear-gradient(180deg, #f5f5fb 0%, #ebe8f7 100%)",
          }}
        />
        <div className="max-w-xl">
          <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-accent">
            Purchase confirmed
          </p>
          <h1 className="font-display mt-3 text-4xl font-medium tracking-tight text-ink sm:text-6xl">
            Thank you — we&apos;re on it.
          </h1>
          <p className="mt-6 text-[16px] leading-7 text-ink/60">
            You&apos;ll get an email confirmation shortly. We&apos;ll call for
            your quick brief, then get your custom site live within 24 hours.
          </p>

          <ul className="mx-auto mt-8 max-w-md space-y-3 text-left text-sm text-ink/70">
            <li className="flex gap-3">
              <span className="font-semibold text-accent">1.</span>
              <span>Watch for your purchase confirmation email.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-accent">2.</span>
              <span>Answer our call / text for your custom brief.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-accent">3.</span>
              <span>Your site goes live — cancel anytime after that.</span>
            </li>
          </ul>

          <p className="mt-10 text-sm text-ink/45">
            Questions?{" "}
            <a
              href="mailto:bsitesioteam@gmail.com"
              className="text-accent hover:underline"
            >
              bsitesioteam@gmail.com
            </a>
          </p>

          <Link
            href="/"
            className="mt-8 inline-block text-sm font-medium text-ink/50 transition-colors hover:text-ink"
          >
            Back to homepage
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
