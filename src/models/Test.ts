// src/models/Test.ts
import mongoose, { Document, Model, Schema } from "mongoose";

interface ITest extends Document {
  name: string;
}

const TestSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
});

const Test: Model<ITest> =
  mongoose.models.Test || mongoose.model<ITest>("Test", TestSchema);

export default Test;
