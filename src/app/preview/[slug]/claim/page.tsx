import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PreviewClaimCheckout from "@/components/preview/PreviewClaimCheckout";
import { loadPreviewSite } from "@/lib/preview/loadPreview";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const loaded = await loadPreviewSite(params.slug);
  const name = loaded.ok ? loaded.site.business.name : "Your demo";
  return {
    title: `Lock in ${name} — Custom build | Bsites`,
    description:
      "Claim your custom Bsites website build from this Facebook demo preview.",
    robots: { index: false, follow: false },
  };
}

export default async function PreviewClaimPage({ params }: Props) {
  const loaded = await loadPreviewSite(params.slug);
  if (!loaded.ok) {
    if (loaded.kind === "not_found") notFound();
    return (
      <main className="flex min-h-screen items-center justify-center bg-paper px-5">
        <div className="w-full max-w-lg rounded-3xl border border-ink/10 bg-white p-8 text-center">
          <h1 className="font-display text-3xl font-semibold text-ink">
            Demo unavailable
          </h1>
          <p className="mt-4 text-sm text-ink/60">{loaded.message}</p>
          <Link
            href="/preview"
            className="mt-8 inline-flex rounded-full bg-accent px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-paper"
          >
            Generate a demo
          </Link>
        </div>
      </main>
    );
  }

  return (
    <PreviewClaimCheckout
      slug={loaded.slug}
      businessName={loaded.site.business.name}
      defaultEmail={loaded.checkoutEmail}
      defaultPhone={loaded.phone}
      previewPath={`/preview/${loaded.slug}`}
    />
  );
}
