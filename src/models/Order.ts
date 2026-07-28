import mongoose from "mongoose";

export interface IOrder extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  phone: string;
  progress?: number;
  pack: string;
  plan: string;
  success: boolean;
  /** Prevents duplicate purchase confirmation emails on Stripe webhook retries. */
  confirmationEmailSent: boolean;
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
      default: 0,
    },
    pack: {
      type: String,
      required: true,
    },
    plan: {
      type: String,
      required: true,
    },
    success: {
      type: Boolean,
      default: false,
    },
    confirmationEmailSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

if (mongoose.models.Order) {
  delete mongoose.models.Order;
}
const connectionModels = mongoose.connection.models as Record<string, unknown>;
if (connectionModels.Order) {
  delete connectionModels.Order;
}

const Order = mongoose.model<IOrder>("Order", OrderSchema);
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
