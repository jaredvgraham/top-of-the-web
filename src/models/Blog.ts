import mongoose, { Document, Model, Schema } from "mongoose";

interface IBlog extends Document {
  title: string;
  content: string;
  date: Date;
}

const BlogSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Blog: Model<IBlog> =
  mongoose.models.Blog || mongoose.model<IBlog>("Blog", BlogSchema);

export default Blog;
