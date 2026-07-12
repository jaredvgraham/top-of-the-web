export type OnboardingAsset = {
  id: string;
  url: string;
  pathname: string;
  filename: string;
  kind: "logo" | "about" | "photo" | "other";
  caption: string;
  uploadedAt: string | Date;
};

export type OnboardingSession = {
  token: string;
  email: string;
  status: "not_started" | "in_progress" | "completed";
  currentStep: number;
  contact: {
    name: string;
    ownerNames: string[];
    email: string;
    phone: string;
    businessName: string;
  };
  business: {
    description: string;
    city: string;
    state: string;
    idealCustomers: string;
    serviceArea: string;
    existingSiteUrl: string;
  };
  brand: {
    colors: string;
    fontsVibe: string;
    tagline: string;
  };
  content: {
    pagesNeeded: string;
    aboutCopy: string;
    servicesProducts: string;
    faqs: string;
    primaryCta: string;
  };
  extras: {
    preferredDomain: string;
    inspirationLinks: string;
    notes: string;
  };
  assets: OnboardingAsset[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

export const ONBOARDING_STEPS = [
  {
    id: "basics",
    label: "You",
    title: "Quick intro",
    subtitle:
      "Owner name(s), plus your business email and phone — not personal ones.",
  },
  {
    id: "business",
    label: "Business",
    title: "What do you do?",
    subtitle:
      "Stuck? Paste your rough notes into ChatGPT and ask it to describe your business — then drop that here. As long as you want is fine.",
  },
  {
    id: "extras",
    label: "Extras",
    title: "Anything else?",
    subtitle: "All optional. Skip anything you don’t have.",
  },
] as const;

export const inputClasses =
  "w-full border-0 border-b border-ink/20 bg-transparent px-0 py-4 text-lg text-ink placeholder:text-ink/30 outline-none transition-colors focus:border-accent focus:ring-0";

export const labelClasses =
  "mb-1 block text-[13px] font-medium uppercase tracking-[0.16em] text-ink/50";

export const ease = [0.65, 0, 0.35, 1] as const;

export function emptySession(token = ""): OnboardingSession {
  return {
    token,
    email: "",
    status: "not_started",
    currentStep: 0,
    contact: {
      name: "",
      ownerNames: [""],
      email: "",
      phone: "",
      businessName: "",
    },
    business: {
      description: "",
      city: "",
      state: "",
      idealCustomers: "",
      serviceArea: "",
      existingSiteUrl: "",
    },
    brand: { colors: "", fontsVibe: "", tagline: "" },
    content: {
      pagesNeeded: "",
      aboutCopy: "",
      servicesProducts: "",
      faqs: "",
      primaryCta: "",
    },
    extras: { preferredDomain: "", inspirationLinks: "", notes: "" },
    assets: [],
  };
}
