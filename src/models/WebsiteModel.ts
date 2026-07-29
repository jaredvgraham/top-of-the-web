import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWebsite extends Document {
  _id: mongoose.Types.ObjectId;
  name?: string;
  email: string;
  url?: string;
  description?: string;
  pack?: string;
  plan?: string;
  createdAt: Date;
  updatedAt?: Date;
}

const websiteSchema = new Schema<IWebsite>(
  {
    name: { type: String, default: "" },
    email: { type: String, required: true, index: true, lowercase: true, trim: true },
    url: { type: String, default: "" },
    description: { type: String, default: "" },
    pack: { type: String, default: "" },
    plan: { type: String, default: "" },
  },
  { timestamps: true }
);

if (mongoose.models.Website) {
  delete mongoose.models.Website;
}
const connectionModels = mongoose.connection.models as Record<string, unknown>;
if (connectionModels.Website) {
  delete connectionModels.Website;
}

const Website: Model<IWebsite> = mongoose.model<IWebsite>(
  "Website",
  websiteSchema
);
export default Website;

export const addWebsite = async (website: IWebsite) => {
  await website.save();
};

export const findWebsiteByEmail = async (email: string) => {
  return await Website.findOne({ email });
};

export const findWebsiteById = async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }
  return await Website.findById(id);
};
