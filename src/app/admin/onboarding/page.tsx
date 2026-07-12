import type { Metadata } from "next";
import OnboardingAdmin from "@/components/onboarding/OnboardingAdmin";

export const metadata: Metadata = {
  title: "Onboarding — Admin",
  robots: { index: false, follow: false },
};

export default function AdminOnboardingPage() {
  return <OnboardingAdmin />;
}
