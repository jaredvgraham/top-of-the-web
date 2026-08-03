import dbConnect from "@/lib/db";
import Lead from "@/models/Lead";
import Preview, {
  isPreviewExpired,
  type PreviewPages,
} from "@/models/Preview";
import { previewPagesComplete } from "@/lib/preview/generatePreviewHtml";
import { siteSpecSchema, type SiteSpec } from "@/lib/preview/siteSpecSchema";

export type PreviewLeadMetaAttribution = {
  fbclid: string;
  fbp: string;
  fbc: string;
};

export type LoadedPreview =
  | {
      ok: true;
      slug: string;
      site: SiteSpec;
      pages?: PreviewPages;
      /** Email entered with the Facebook URL (owner). */
      email: string;
      /** Best contact email for checkout autofill. */
      checkoutEmail: string;
      /** Phone from FB / site spec when available. */
      phone: string;
      facebookUrl: string;
      /** Lead click ids for Meta pixel attribution on claim / purchase. */
      leadMetaAttribution: PreviewLeadMetaAttribution;
    }
  | {
      ok: false;
      kind: "not_found" | "expired" | "failed" | "building" | "invalid";
      message: string;
    };

function resolveCheckoutEmail(
  ownerEmail: string,
  businessEmail?: string
): string {
  const owner = (ownerEmail || "").trim().toLowerCase();
  const business = (businessEmail || "").trim().toLowerCase();
  // Prefer the email they typed with the Facebook page; fall back to FB contact email
  return owner || business;
}

function minimalSiteFromPages(
  pages: PreviewPages,
  emailFallback = ""
): SiteSpec | null {
  const nameMatch = pages.home.match(
    /<title[^>]*>([^|<]+)/i
  );
  const name = (nameMatch?.[1] || "Business Demo").trim();
  try {
    return siteSpecSchema.parse({
      business: {
        name,
        tagline: "",
        description: "",
        phone: "",
        email: emailFallback,
        website: "",
        address: "",
        city: "",
        state: "",
        serviceAreas: [],
      },
      branding: {
        primaryColor: "#1A1433",
        secondaryColor: "#F5F5FB",
        tertiaryColor: "#3D3654",
        accentColor: "#5B2E9E",
        designStyle: "clean",
        logoUrl: "",
      },
      content: {
        heroHeadline: name,
        heroSubheadline: "",
        primaryCta: "Get a free estimate",
        trustLine: "",
        servicesHeadline: "Services",
        servicesSubheadline: "",
        servicesPageHeadline: "Services",
        servicesPageIntro: "",
        galleryHeadline: "Our work",
        gallerySubheadline: "",
        contactHeadline: "Get in touch",
        contactSubheadline: "",
        processHeadline: "How it works",
        processSubheadline: "",
        processSteps: [],
        whyUsHeadline: "Why choose us",
        whyUs: [],
        about: { headline: "About", body: "" },
        aboutPageHeadline: "About",
        aboutPageBody: "",
        services: [],
        testimonials: [],
        faqs: [],
      },
      layout: {
        template: "cleaning",
        heroVariant: "background",
        servicesVariant: "cards",
        sectionOrder: ["hero", "services", "about", "contact"],
      },
      assets: {
        heroImage: "",
        aboutImage: "",
        galleryImages: [],
        galleryPairs: [],
      },
    });
  } catch {
    return null;
  }
}

async function resolveLeadMetaAttribution(input: {
  leadToken?: string;
  email?: string;
  previewSlug?: string;
}): Promise<PreviewLeadMetaAttribution> {
  const empty = { fbclid: "", fbp: "", fbc: "" };
  try {
    let lead: {
      attribution?: { fbclid?: string; fbp?: string; fbc?: string };
    } | null = null;

    const leadToken = (input.leadToken || "").trim();
    if (leadToken) {
      lead = await Lead.findOne({ token: leadToken })
        .select("attribution")
        .lean();
    }

    const previewSlug = (input.previewSlug || "").trim();
    if (!lead && previewSlug) {
      lead = await Lead.findOne({ previewSlug })
        .sort({ createdAt: -1 })
        .select("attribution")
        .lean();
    }

    const email = (input.email || "").trim().toLowerCase();
    if (!lead && email) {
      lead = await Lead.findOne({ email })
        .sort({ createdAt: -1 })
        .select("attribution")
        .lean();
    }

    const attr = lead?.attribution || {};
    return {
      fbclid: attr.fbclid || "",
      fbp: attr.fbp || "",
      fbc: attr.fbc || "",
    };
  } catch {
    return empty;
  }
}

export async function loadPreviewSite(slugRaw: string): Promise<LoadedPreview> {
  const slug = (slugRaw || "").trim();
  if (!slug) return { ok: false, kind: "not_found", message: "Not found" };

  await dbConnect();
  const doc = await Preview.findOne({ slug });
  if (!doc) return { ok: false, kind: "not_found", message: "Not found" };

  if (isPreviewExpired(doc)) {
    if (doc.status !== "expired") {
      doc.status = "expired";
      await doc.save();
    }
    return {
      ok: false,
      kind: "expired",
      message:
        "Unclaimed demos expire after 30 days. Generate a new one anytime from your Facebook page.",
    };
  }

  if (doc.status === "failed") {
    return {
      ok: false,
      kind: "failed",
      message:
        doc.error?.message ||
        "We couldn’t finish generating this demo. Please try again.",
    };
  }

  const pages = doc.pages as PreviewPages | undefined;
  const hasCompletePages = previewPagesComplete(pages);

  // Custom HTML demos must be fully finished — never show a half-built site
  if (doc.status !== "ready" || !hasCompletePages) {
    if (doc.status === "ready" && !hasCompletePages) {
      return {
        ok: false,
        kind: "invalid",
        message:
          "This demo didn’t finish generating completely. Please generate a new one.",
      };
    }
    return {
      ok: false,
      kind: "building",
      message:
        "Your demo is still being generated. Keep this tab open until it finishes — or start again if this takes longer than several minutes.",
    };
  }

  if (hasCompletePages && pages) {
    const parsed = doc.siteSpec
      ? siteSpecSchema.safeParse(doc.siteSpec)
      : { success: false as const };
    const site = parsed.success
      ? parsed.data
      : minimalSiteFromPages(pages, doc.email);
    if (!site) {
      return {
        ok: false,
        kind: "invalid",
        message: "This demo couldn’t be rendered. Please generate a new one.",
      };
    }
    const leadMetaAttribution = await resolveLeadMetaAttribution({
      leadToken: doc.leadToken,
      email: doc.email,
      previewSlug: doc.slug,
    });

    return {
      ok: true,
      slug: doc.slug,
      site,
      pages,
      email: doc.email || "",
      checkoutEmail: resolveCheckoutEmail(
        doc.email || "",
        site.business.email
      ),
      phone: (doc.phone || site.business.phone || "").trim(),
      facebookUrl: doc.source?.url || "",
      leadMetaAttribution,
    };
  }

  const parsed = siteSpecSchema.safeParse(doc.siteSpec);
  if (!parsed.success) {
    console.error("[preview] invalid stored SiteSpec", parsed.error.message);
    return {
      ok: false,
      kind: "invalid",
      message: "This demo couldn’t be rendered. Please generate a new one.",
    };
  }

  const leadMetaAttribution = await resolveLeadMetaAttribution({
    leadToken: doc.leadToken,
    email: doc.email,
    previewSlug: doc.slug,
  });

  return {
    ok: true,
    slug: doc.slug,
    site: parsed.data,
    email: doc.email || "",
    checkoutEmail: resolveCheckoutEmail(
      doc.email || "",
      parsed.data.business.email
    ),
    phone: (doc.phone || parsed.data.business.phone || "").trim(),
    facebookUrl: doc.source?.url || "",
    leadMetaAttribution,
  };
}
