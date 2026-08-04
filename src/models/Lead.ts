import mongoose, { Schema, Model, Document } from "mongoose";

export type LeadStatus =
  | "captured"
  | "continued"
  | "generating"
  | "preview_ready"
  | "purchased"
  | "expired";

/** How the lead entered the pipeline. */
export type LeadSource = "preview" | "contact";

export interface ILeadAttribution {
  fbclid?: string;
  fbp?: string;
  fbc?: string;
  landingUrl?: string;
  userAgent?: string;
  ip?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  /** Meta Ads dynamic URL param (e.g. campaign_id={{campaign.id}}). */
  campaignId?: string;
  adsetId?: string;
  adId?: string;
}

export interface ILead extends Document {
  _id: mongoose.Types.ObjectId;
  token: string;
  email: string;
  phone: string;
  name: string;
  businessName: string;
  city: string;
  state: string;
  status: LeadStatus;
  /** preview = homepage/preview capture; contact = /contact inquiry form. */
  source: LeadSource;
  /** Contact-form message (and similar free-text notes). */
  notes?: string;
  /** Linked onboarding brief token when source is contact. */
  onboardingToken?: string;
  attribution: ILeadAttribution;
  previewSlug?: string;
  /** Optional override for admin Demo link (e.g. live Vercel URL). */
  demoUrl?: string;
  facebookUrl?: string;
  authorized?: boolean;
  /** Client demo page views (admin sessions excluded). */
  demoViewCount: number;
  demoFirstViewedAt?: Date;
  demoLastViewedAt?: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILead>(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      default: "",
    },
    businessName: {
      type: String,
      required: true,
      trim: true,
      default: "",
    },
    city: {
      type: String,
      required: true,
      trim: true,
      default: "",
    },
    state: {
      type: String,
      required: true,
      trim: true,
      default: "",
      uppercase: true,
    },
    status: {
      type: String,
      enum: [
        "captured",
        "continued",
        "generating",
        "preview_ready",
        "purchased",
        "expired",
      ],
      default: "captured",
      index: true,
    },
    source: {
      type: String,
      enum: ["preview", "contact"],
      default: "preview",
      index: true,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    onboardingToken: {
      type: String,
      default: "",
      index: true,
    },
    attribution: {
      fbclid: { type: String, default: "" },
      fbp: { type: String, default: "" },
      fbc: { type: String, default: "" },
      landingUrl: { type: String, default: "" },
      userAgent: { type: String, default: "" },
      ip: { type: String, default: "" },
      utmSource: { type: String, default: "" },
      utmMedium: { type: String, default: "" },
      utmCampaign: { type: String, default: "" },
      utmContent: { type: String, default: "" },
      utmTerm: { type: String, default: "" },
      campaignId: { type: String, default: "" },
      adsetId: { type: String, default: "" },
      adId: { type: String, default: "" },
    },
    previewSlug: {
      type: String,
      default: "",
      index: true,
    },
    demoUrl: {
      type: String,
      default: "",
      trim: true,
    },
    facebookUrl: {
      type: String,
      default: "",
    },
    authorized: {
      type: Boolean,
      default: false,
    },
    demoViewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    demoFirstViewedAt: {
      type: Date,
    },
    demoLastViewedAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

if (mongoose.models.Lead) {
  delete mongoose.models.Lead;
}
const connectionModels = mongoose.connection.models as Record<string, unknown>;
if (connectionModels.Lead) {
  delete connectionModels.Lead;
}

const Lead: Model<ILead> = mongoose.model<ILead>("Lead", LeadSchema);

export default Lead;

export function leadExpiresAt(from = new Date()) {
  const d = new Date(from);
  d.setDate(d.getDate() + 30);
  return d;
}

export function isLeadExpired(doc: Pick<ILead, "expiresAt" | "status">) {
  if (doc.status === "expired") return true;
  return new Date(doc.expiresAt).getTime() < Date.now();
}
