import type { Metadata } from "next";
import Footer from "@/components/HomePage/Footer";
import OnboardingStart from "@/components/onboarding/OnboardingStart";

export const metadata: Metadata = {
  title: "Your Bsites site brief — start onboarding",
  description:
    "This is a Bsites onboarding link. Share a short brief about your business so we can start building your website.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Your Bsites site brief — start onboarding",
    description:
      "Private Bsites onboarding. Answer a few questions about your business so we can build your site.",
    type: "website",
    siteName: "Bsites.io",
    url: "https://www.bsites.io/onboarding",
  },
  twitter: {
    card: "summary_large_image",
    title: "Your Bsites site brief — start onboarding",
    description:
      "Private Bsites onboarding. Answer a few questions about your business so we can build your site.",
  },
};

export default function OnboardingPage() {
  return (
    <>
      <main className="relative min-h-screen overflow-hidden px-5 pb-20 pt-28 sm:px-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 10% -10%, rgba(91,46,158,0.12), transparent 55%), radial-gradient(ellipse 60% 40% at 90% 20%, rgba(31,182,214,0.1), transparent 50%), linear-gradient(180deg, #f5f5fb 0%, #ebe8f7 100%)",
          }}
        />
        <OnboardingStart />
      </main>
      <Footer />
    </>
  );
}
