import mongoose, { Schema, Model, Document } from "mongoose";

export type OnboardingStatus = "not_started" | "in_progress" | "completed";

export type OnboardingAssetKind = "logo" | "about" | "photo" | "other";

export interface IOnboardingAsset {
  url: string;
  pathname: string;
  filename: string;
  kind: OnboardingAssetKind;
  caption?: string;
  uploadedAt: Date;
}

export interface IOnboardingContact {
  name: string;
  ownerNames: string[];
  email: string;
  phone: string;
  businessName: string;
}

export interface IOnboardingBusiness {
  description: string;
  city: string;
  state: string;
  idealCustomers: string;
  serviceArea: string;
  existingSiteUrl: string;
}

export interface IOnboardingBrand {
  colors: string;
  fontsVibe: string;
  tagline: string;
}

export interface IOnboardingContent {
  pagesNeeded: string;
  aboutCopy: string;
  servicesProducts: string;
  faqs: string;
  primaryCta: string;
}

export interface IOnboardingExtras {
  preferredDomain: string;
  inspirationLinks: string;
  notes: string;
}

export interface IOnboarding extends Document {
  _id: mongoose.Types.ObjectId;
  token: string;
  email: string;
  status: OnboardingStatus;
  currentStep: number;
  contact: IOnboardingContact;
  business: IOnboardingBusiness;
  brand: IOnboardingBrand;
  content: IOnboardingContent;
  extras: IOnboardingExtras;
  assets: IOnboardingAsset[];
  createdAt: Date;
  updatedAt: Date;
}

const AssetSchema = new Schema<IOnboardingAsset>(
  {
    url: { type: String, required: true },
    pathname: { type: String, required: true },
    filename: { type: String, required: true },
    kind: {
      type: String,
      enum: ["logo", "about", "photo", "other"],
      default: "photo",
    },
    caption: { type: String, default: "" },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const OnboardingSchema = new Schema<IOnboarding>(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      default: "",
      index: true,
    },
    status: {
      type: String,
      enum: ["not_started", "in_progress", "completed"],
      default: "not_started",
    },
    currentStep: {
      type: Number,
      default: 0,
    },
    contact: {
      name: { type: String, default: "" },
      ownerNames: { type: [String], default: [] },
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
      businessName: { type: String, default: "" },
    },
    business: {
      description: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      idealCustomers: { type: String, default: "" },
      serviceArea: { type: String, default: "" },
      existingSiteUrl: { type: String, default: "" },
    },
    brand: {
      colors: { type: String, default: "" },
      fontsVibe: { type: String, default: "" },
      tagline: { type: String, default: "" },
    },
    content: {
      pagesNeeded: { type: String, default: "" },
      aboutCopy: { type: String, default: "" },
      servicesProducts: { type: String, default: "" },
      faqs: { type: String, default: "" },
      primaryCta: { type: String, default: "" },
    },
    extras: {
      preferredDomain: { type: String, default: "" },
      inspirationLinks: { type: String, default: "" },
      notes: { type: String, default: "" },
    },
    assets: { type: [AssetSchema], default: [] },
  },
  { timestamps: true }
);

// Next.js hot reload can keep a stale compiled model (missing newer enum values).
if (mongoose.models.Onboarding) {
  delete mongoose.models.Onboarding;
}
const connectionModels = mongoose.connection.models as Record<string, unknown>;
if (connectionModels.Onboarding) {
  delete connectionModels.Onboarding;
}

const Onboarding: Model<IOnboarding> = mongoose.model<IOnboarding>(
  "Onboarding",
  OnboardingSchema
);

export default Onboarding;

export function emptyOnboardingFields() {
  return {
    contact: {
      name: "",
      ownerNames: [] as string[],
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
    brand: {
      colors: "",
      fontsVibe: "",
      tagline: "",
    },
    content: {
      pagesNeeded: "",
      aboutCopy: "",
      servicesProducts: "",
      faqs: "",
      primaryCta: "",
    },
    extras: {
      preferredDomain: "",
      inspirationLinks: "",
      notes: "",
    },
    assets: [] as IOnboardingAsset[],
  };
}
