import mongoose from "mongoose";

export interface IPurchase extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  phoneNumber?: string;
  pack: string;
  price: number;
}

const PurchaseSchema = new mongoose.Schema<IPurchase>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phoneNumber: {
      type: String,
    },
    pack: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const Purchase: mongoose.Model<IPurchase> =
  mongoose.models.Purchase ||
  mongoose.model<IPurchase>("Purchase", PurchaseSchema);

export default Purchase;

export const addPurchase = async (purchase: IPurchase) => {
  await purchase.save();
};

export const findPurchaseByEmail = async (email: string) => {
  return await Purchase.findOne({ email });
};

export const findPurchaseById = async (id: string) => {
  return await Purchase.findOne({ id });
};
