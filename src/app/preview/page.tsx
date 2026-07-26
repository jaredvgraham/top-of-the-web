import type { Metadata } from "next";
import PreviewGeneratorForm from "@/components/preview/PreviewGeneratorForm";

export const metadata: Metadata = {
  title: "Free Website Demo from Facebook | Bsites",
  description:
    "See an auto-generated demo of your business website from Facebook. A real person at Bsites custom-builds the final site — this is just a taste.",
  robots: { index: false, follow: false },
};

export default function PreviewEntryPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(900px 420px at 85% -10%, rgba(91,46,158,0.18), transparent), radial-gradient(700px 380px at 0% 20%, rgba(31,182,214,0.12), transparent), linear-gradient(180deg, #F5F5FB 0%, #ECEAF6 100%)",
        }}
      />

      <div className="mx-auto grid max-w-6xl gap-12 px-5 pb-24 pt-28 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pt-32">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
            Instant website demo
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl">
            Peek at what’s possible for your business.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/65">
            Paste your Facebook page and we’ll auto-generate a private demo
            site from your public info and photos. It’s not the finished
            product — a real person at Bsites will custom-make your actual
            website. If you even slightly like the demo, you’ll be amazed by
            the real thing.
          </p>

          <ul className="mt-8 space-y-3 text-sm text-ink/70">
            <li className="flex gap-3">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              Auto-generated demo only — not your final custom site
            </li>
            <li className="flex gap-3">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              Free to view · private · not published to Google
            </li>
            <li className="flex gap-3">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              Launch and a real designer builds the polished version
            </li>
          </ul>
        </div>

        <div className="rounded-[2rem] border border-ink/10 bg-paper/90 p-6 shadow-[0_20px_60px_rgba(26,20,51,0.08)] backdrop-blur sm:p-8">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-ink">
            Generate my demo
          </h2>
          <p className="mt-2 text-sm text-ink/55">
            A quick taste of direction — your real site is handcrafted.
          </p>
          <div className="mt-8">
            <PreviewGeneratorForm />
          </div>
        </div>
      </div>
    </main>
  );
}
