import type { Metadata } from "next";
import OnboardingTokenClient from "@/components/onboarding/OnboardingTokenClient";

type Props = {
  params: { token: string };
};

const title = "Your Bsites site brief — finish onboarding";
const description =
  "This is your private Bsites onboarding link. Answer a few questions about your business so we can start building your website.";

export function generateMetadata({ params }: Props): Metadata {
  const url = `https://www.bsites.io/onboarding/${params.token}`;

  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "Bsites.io",
      url,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function OnboardingTokenPage({ params }: Props) {
  return <OnboardingTokenClient token={params.token} />;
}
