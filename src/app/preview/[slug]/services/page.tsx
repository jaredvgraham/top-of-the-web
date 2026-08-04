import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { loadPreviewSite } from "@/lib/preview/loadPreview";
import SiteRenderer from "@/components/preview/SiteRenderer";
import CustomPreviewFrame, {
  externalDemoPageUrl,
} from "@/components/preview/CustomPreviewFrame";
import PreviewClaimBanner from "@/components/preview/PreviewClaimBanner";
import PreviewDemoRibbon from "@/components/preview/PreviewDemoRibbon";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const loaded = await loadPreviewSite(params.slug);
  const name = loaded.ok ? loaded.site.business.name : "Services";
  return {
    title: { absolute: `${name} — Services Demo | Bsites` },
    robots: { index: false, follow: false },
  };
}

export default async function PreviewServicesRoute({ params }: Props) {
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

  const liveUrl = loaded.externalDemoUrl
    ? externalDemoPageUrl(loaded.externalDemoUrl, "services")
    : "";

  return (
    <>
      <PreviewDemoRibbon slug={loaded.slug} page="services" />
      <div className="pb-44 sm:pb-36">
        {liveUrl || loaded.pages?.services ? (
          <CustomPreviewFrame
            html={loaded.pages?.services}
            slug={loaded.slug}
            page="services"
            externalUrl={liveUrl || undefined}
          />
        ) : (
          <SiteRenderer
            site={loaded.site}
            basePath={`/preview/${loaded.slug}`}
            page="services"
          />
        )}
      </div>
      <PreviewClaimBanner slug={loaded.slug} />
    </>
  );
}
