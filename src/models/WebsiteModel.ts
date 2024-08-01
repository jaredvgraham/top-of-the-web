import mongoose, { Schema, model, Document } from "mongoose";

export interface IWebsite extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  url: string;
  description: string;
  createdAt: Date;
}

const websiteSchema = new Schema({
  name: { type: String },
  email: { type: String },
  url: { type: String },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const Website =
  mongoose.models.Website || model<IWebsite>("Website", websiteSchema);
export default Website;

export const addWebsite = async (website: IWebsite) => {
  await website.save();
};

export const findWebsiteByEmail = async (email: string) => {
  return await Website.findOne({ email });
};

export const findWebsiteById = async (id: string) => {
  return await Website.findOne({ id });
};
