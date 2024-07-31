//Scheduled Call
import mongoose from "mongoose";

export interface IScheduledCall extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  start: Date;
  end: Date;
  title: string;
}

const ScheduledCallSchema = new mongoose.Schema<IScheduledCall>(
  {
    start: {
      type: Date,
      required: true,
    },
    end: {
      type: Date,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const ScheduledCall: mongoose.Model<IScheduledCall> =
  mongoose.models.ScheduledCall ||
  mongoose.model<IScheduledCall>("ScheduledCall", ScheduledCallSchema);

export default ScheduledCall;
