import mongoose, { Schema, Model, Document } from "mongoose";
import type { SiteSpec } from "@/lib/preview/siteSpecSchema";

export type PreviewStatus =
  | "queued"
  | "scraping"
  | "generating"
  | "ready"
  | "failed"
  | "expired";

export type PreviewPages = {
  home: string;
  services: string;
  about: string;
};

export interface IPreview extends Document {
  _id: mongoose.Types.ObjectId;
  slug: string;
  email: string;
  phone?: string;
  /** Opaque lead funnel token (ad → email → continue). */
  leadToken?: string;
  /** Preview-only Blob path token — not an Onboarding session. */
  onboardingToken?: string;
  status: PreviewStatus;
  source: {
    type: "facebook";
    url: string;
  };
  siteSpec?: SiteSpec;
  /** Custom $4k-quality HTML pages (primary render path). */
  pages?: PreviewPages;
  generation?: {
    engine: string;
    model: string;
  };
  error?: {
    code: string;
    message: string;
  };
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PreviewSchema = new Schema<IPreview>(
  {
    slug: {
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
      default: "",
      trim: true,
    },
    leadToken: {
      type: String,
      default: "",
      index: true,
    },
    onboardingToken: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["queued", "scraping", "generating", "ready", "failed", "expired"],
      default: "queued",
      index: true,
    },
    source: {
      type: {
        type: String,
        enum: ["facebook"],
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    siteSpec: {
      type: Schema.Types.Mixed,
      default: undefined,
    },
    pages: {
      type: Schema.Types.Mixed,
      default: undefined,
    },
    generation: {
      type: Schema.Types.Mixed,
      default: undefined,
    },
    error: {
      code: { type: String, default: "" },
      message: { type: String, default: "" },
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

if (mongoose.models.Preview) {
  delete mongoose.models.Preview;
}
const connectionModels = mongoose.connection.models as Record<string, unknown>;
if (connectionModels.Preview) {
  delete connectionModels.Preview;
}

const Preview: Model<IPreview> = mongoose.model<IPreview>(
  "Preview",
  PreviewSchema
);

export default Preview;

export function previewExpiresAt(from = new Date()) {
  const d = new Date(from);
  d.setDate(d.getDate() + 7);
  return d;
}

export function isPreviewExpired(doc: Pick<IPreview, "expiresAt" | "status">) {
  if (doc.status === "expired") return true;
  return new Date(doc.expiresAt).getTime() < Date.now();
}
