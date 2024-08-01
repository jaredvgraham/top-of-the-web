import mongoose from "mongoose";

export interface IOrder extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  phone: string;
  progress: number;
  pack: string;
  plan: string;
}

const OrderSchema = new mongoose.Schema<IOrder>(
  {
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    progress: {
      type: Number,
      required: true,
    },
    pack: {
      type: String,
      required: true,
    },
    plan: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Order: mongoose.Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
export default Order;

export const addOrder = async (order: IOrder) => {
  await order.save();
};

export const findOrderById = async (id: string) => {
  return await Order.findOne({ id });
};

export const findOrderByEmail = async (email: string) => {
  return await Order.findOne({ email });
};
