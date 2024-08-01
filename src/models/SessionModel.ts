import mongoose, { Document, Model, Schema } from "mongoose";

export interface ISession extends Document {
  userId: string;
  refreshToken: string;
  createdAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    userId: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Session: Model<ISession> =
  mongoose.models.Session || mongoose.model<ISession>("Session", SessionSchema);
export default Session;

export const addSession = async (session: ISession) => {
  await session.save();
};

export const findSessionByToken = async (refreshToken: string) => {
  return await Session.findOne({ refreshToken });
};

export const deleteSessionByToken = async (refreshToken: string) => {
  await Session.deleteOne({ refreshToken });
};

export const updateSessionToken = async (
  oldToken: string,
  newToken: string
) => {
  return await Session.findOneAndUpdate(
    { refreshToken: oldToken },
    { refreshToken: newToken },
    { new: true }
  );
};
