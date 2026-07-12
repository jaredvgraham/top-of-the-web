import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/HomePage/Footer";

export const metadata: Metadata = {
  title: "Thank You — Bsites.io",
  robots: { index: false, follow: false },
};

export default function ThankYou() {
  return (
    <>
      <main className="relative flex min-h-screen flex-col items-center overflow-hidden px-5 pb-20 pt-28 text-center sm:px-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(91,46,158,0.14), transparent 55%), linear-gradient(180deg, #f5f5fb 0%, #ebe8f7 100%)",
          }}
        />
        <div className="max-w-2xl">
          <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-ink/45">
            You&apos;re in
          </p>
          <h1 className="font-display mt-3 text-4xl font-medium tracking-tight text-ink sm:text-6xl">
            Thank you for your purchase
          </h1>
          <p className="mt-6 text-[16px] leading-7 text-ink/60">
            We&apos;ve received your order and will get started on your website.
            You&apos;ll get an email confirmation shortly.
          </p>
          <p className="mt-4 text-[16px] leading-7 text-ink/60">
            If you haven&apos;t finished your site brief yet, complete it so we
            have logos, copy, and photos before we build.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/onboarding"
              className="group relative inline-flex overflow-hidden rounded-full bg-ink px-8 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-paper"
            >
              <span className="absolute inset-0 translate-y-full bg-accent transition-transform duration-300 ease-out group-hover:translate-y-0" />
              <span className="relative">Finish your site brief</span>
            </Link>
            <Link
              href="/"
              className="text-sm font-medium text-ink/50 transition-colors hover:text-ink"
            >
              Back to homepage
            </Link>
          </div>

          <p className="mt-10 text-sm text-ink/45">
            Questions?{" "}
            <a
              href="mailto:bsitesioteam@gmail.com"
              className="text-accent hover:underline"
            >
              bsitesioteam@gmail.com
            </a>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
