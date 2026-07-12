import { randomUUID } from "crypto";
import type { IOnboarding, OnboardingAssetKind } from "@/models/Onboarding";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_UPLOAD_BYTES,
  ONBOARDING_STEP_COUNT,
} from "@/lib/onboardingConstants";

export type { OnboardingAssetKind };
export { ALLOWED_IMAGE_TYPES, MAX_UPLOAD_BYTES, ONBOARDING_STEP_COUNT };

export function createOnboardingToken() {
  return randomUUID().replace(/-/g, "") + randomUUID().replace(/-/g, "");
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function onboardingPublicUrl(token: string, origin?: string) {
  const base =
    origin || process.env.NEXT_PUBLIC_SITE_URL || "https://www.bsites.io";
  return `${base.replace(/\/$/, "")}/onboarding/${token}`;
}

export function normalizeOwnerNames(
  ownerNames?: string[] | null,
  fallbackName = ""
) {
  const fromList = (ownerNames || []).map((n) => n.trim()).filter(Boolean);
  if (fromList.length) return fromList;
  const single = fallbackName.trim();
  return single ? [single] : [""];
}

export function serializeOnboarding(doc: IOnboarding) {
  const ownerNames = normalizeOwnerNames(
    doc.contact?.ownerNames,
    doc.contact?.name || ""
  );

  return {
    token: doc.token,
    email: doc.email,
    status: doc.status,
    currentStep: doc.currentStep,
    contact: {
      name: ownerNames[0] || doc.contact?.name || "",
      ownerNames,
      email: doc.contact?.email || "",
      phone: doc.contact?.phone || "",
      businessName: doc.contact?.businessName || "",
    },
    business: doc.business,
    brand: doc.brand,
    content: doc.content,
    extras: doc.extras,
    assets: doc.assets.map((asset) => ({
      id: String((asset as { _id?: unknown })._id ?? ""),
      url: asset.url,
      pathname: asset.pathname,
      filename: asset.filename,
      kind: asset.kind,
      caption: asset.caption || "",
      uploadedAt: asset.uploadedAt,
    })),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export type OnboardingPatchBody = {
  currentStep?: number;
  contact?: Partial<IOnboarding["contact"]>;
  business?: Partial<IOnboarding["business"]>;
  brand?: Partial<IOnboarding["brand"]>;
  content?: Partial<IOnboarding["content"]>;
  extras?: Partial<IOnboarding["extras"]>;
};

/** Flip not_started → in_progress on first real edit/upload. */
export function markOnboardingStarted(doc: IOnboarding) {
  if (doc.status === "not_started") {
    doc.status = "in_progress";
  }
}
