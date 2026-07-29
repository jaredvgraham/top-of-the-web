import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { loadPreviewSite } from "@/lib/preview/loadPreview";
import SiteRenderer from "@/components/preview/SiteRenderer";
import CustomPreviewFrame from "@/components/preview/CustomPreviewFrame";
import PreviewClaimBanner from "@/components/preview/PreviewClaimBanner";
import PreviewDemoRibbon from "@/components/preview/PreviewDemoRibbon";
import type { SiteSpec } from "@/lib/preview/siteSpecSchema";
import type { PreviewPages } from "@/models/Preview";

type Props = { params: { slug: string } };
type PageKey = "home" | "services" | "about";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const loaded = await loadPreviewSite(params.slug);
  const name = loaded.ok ? loaded.site.business.name : null;

  return {
    title: {
      absolute: name
        ? `${name} — Website Demo | Bsites`
        : "Website Demo | Bsites",
    },
    description:
      "Private BSITES auto-generated website demo. Not indexed by search engines.",
    robots: { index: false, follow: false },
  };
}

function StatusCard({
  title,
  body,
  actionHref,
  actionLabel,
}: {
  title: string;
  body: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-5">
      <div className="w-full max-w-lg rounded-3xl border border-ink/10 bg-white p-8 text-center shadow-sm">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
          {title}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-ink/60">{body}</p>
        {actionHref && actionLabel ? (
          <Link
            href={actionHref}
            className="mt-8 inline-flex rounded-full bg-accent px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-paper"
          >
            {actionLabel}
          </Link>
        ) : null}
      </div>
    </main>
  );
}

function PreviewShell({
  slug,
  page,
  site,
  pages,
}: {
  slug: string;
  page: PageKey;
  site: SiteSpec;
  pages?: PreviewPages;
}) {
  const html =
    pages &&
    (page === "home"
      ? pages.home
      : page === "services"
        ? pages.services
        : pages.about);

  return (
    <>
      <PreviewDemoRibbon slug={slug} />
      <div className="pb-44 sm:pb-36">
        {html ? (
          <CustomPreviewFrame html={html} slug={slug} page={page} />
        ) : (
          <SiteRenderer site={site} basePath={`/preview/${slug}`} page={page} />
        )}
      </div>
      <PreviewClaimBanner slug={slug} />
    </>
  );
}

export default async function PreviewSlugPage({ params }: Props) {
  const loaded = await loadPreviewSite(params.slug);
  if (!loaded.ok) {
    if (loaded.kind === "not_found") notFound();
    const titles: Record<string, string> = {
      expired: "This demo has expired",
      failed: "Demo unavailable",
      building: "Still building your demo",
      invalid: "Demo data issue",
    };
    return (
      <StatusCard
        title={titles[loaded.kind] || "Preview unavailable"}
        body={loaded.message}
        actionHref="/preview"
        actionLabel={loaded.kind === "building" ? "Back to generator" : "Try again"}
      />
    );
  }

  return (
    <PreviewShell
      slug={loaded.slug}
      page="home"
      site={loaded.site}
      pages={loaded.pages}
    />
  );
}
