import type { SiteSpec } from "@/lib/preview/siteSpecSchema";
import ContractorTemplate from "@/components/preview/templates/ContractorTemplate";
import CleaningTemplate from "@/components/preview/templates/CleaningTemplate";
import ProfessionalTemplate from "@/components/preview/templates/ProfessionalTemplate";
import PreviewServicesPage from "@/components/preview/templates/PreviewServicesPage";
import PreviewAboutPage from "@/components/preview/templates/PreviewAboutPage";

type Props = {
  site: SiteSpec;
  basePath: string;
  page?: "home" | "services" | "about";
};

export default function SiteRenderer({
  site,
  basePath,
  page = "home",
}: Props) {
  if (page === "services") {
    return <PreviewServicesPage site={site} basePath={basePath} />;
  }
  if (page === "about") {
    return <PreviewAboutPage site={site} basePath={basePath} />;
  }

  const homeProps = { site, basePath };
  switch (site.layout.template) {
    case "contractor":
      return <ContractorTemplate {...homeProps} />;
    case "cleaning":
      return <CleaningTemplate {...homeProps} />;
    case "professional":
    default:
      return <ProfessionalTemplate {...homeProps} />;
  }
}
