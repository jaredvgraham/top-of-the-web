import type { Metadata } from "next";
import Link from "next/link";
import dbConnect from "@/lib/db";
import Lead, { isLeadExpired } from "@/models/Lead";
import PreviewGeneratorForm from "@/components/preview/PreviewGeneratorForm";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Continue Your Website Preview",
  description:
    "Paste your Facebook page to finish your free private website demo.",
  robots: { index: false, follow: false },
};

type Props = {
  params: { token: string };
};

export default async function PreviewContinuePage({ params }: Props) {
  const token = (params.token || "").trim();

  await dbConnect();
  const lead = await Lead.findOne({ token });

  if (!lead || isLeadExpired(lead)) {
    return (
      <main className="mx-auto max-w-lg px-5 py-28 text-center">
        <h1 className="font-display text-3xl font-semibold text-ink">
          This link isn’t valid
        </h1>
        <p className="mt-4 text-ink/60">
          It may have expired. Start again and we’ll email you a fresh link.
        </p>
        <Link
          href="/preview"
          className="mt-8 inline-flex rounded-full bg-accent px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-paper"
        >
          Start again
        </Link>
      </main>
    );
  }

  if (lead.previewSlug && lead.status === "preview_ready") {
    redirect(`/preview/${lead.previewSlug}`);
  }

  if (lead.status === "captured") {
    lead.status = "continued";
    await lead.save();
  }

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
            Continue setup
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-5xl">
            Paste your Facebook page to build the demo.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/65">
            Your business email and phone are filled in — you can still change them.
            Add your Facebook business page URL and brand colors, then generate
            your private demo.
          </p>
        </div>

        <div className="rounded-[2rem] border border-ink/10 bg-paper/90 p-6 shadow-[0_20px_60px_rgba(26,20,51,0.08)] backdrop-blur sm:p-8">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-ink">
            Finish my demo
          </h2>
          <p className="mt-2 text-sm text-ink/55">
            Usually ready in a few minutes.
          </p>
          <div className="mt-8">
            <PreviewGeneratorForm
              leadToken={lead.token}
              initialEmail={lead.email}
              initialPhone={lead.phone}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
