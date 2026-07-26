import type { SiteSpec } from "@/lib/preview/siteSpecSchema";

export type TemplateProps = {
  site: SiteSpec;
  basePath?: string;
};

export function hasSection(
  site: SiteSpec,
  id: SiteSpec["layout"]["sectionOrder"][number]
) {
  if (!site?.layout?.sectionOrder?.includes(id)) return false;
  switch (id) {
    case "services":
      return (site.content?.services?.length || 0) > 0;
    case "about":
      return Boolean(site.content?.about?.body?.trim());
    case "beforeAfter":
      return (site.assets?.galleryPairs?.length || 0) > 0;
    case "gallery":
      return (site.assets?.galleryImages?.length || 0) > 0;
    case "testimonials":
      return (site.content?.testimonials?.length || 0) > 0;
    case "faq":
      return (site.content?.faqs?.length || 0) > 0;
    case "hero":
    case "contact":
      return true;
    default:
      return true;
  }
}
