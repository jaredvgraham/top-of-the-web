//CustomerModel.ts
import mongoose, { Schema, Model, Document } from "mongoose";

export interface ICustomer extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  phone: string;
  customerId: string;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
    },
    customerId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Customer: Model<ICustomer> =
  mongoose.models.Customer ||
  mongoose.model<ICustomer>("Customer", CustomerSchema);
export default Customer;

export const addCustomer = async (customer: ICustomer) => {
  await customer.save();
};

export const findCustomerByEmail = async (email: string) => {
  return await Customer.findOne({ email });
};
export const findCustomerById = async (id: string) => {
  return await Customer.findOne({ id });
};
