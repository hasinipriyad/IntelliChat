import mongoose, { Document, Types } from "mongoose";

export interface IChat extends Document {
  user: Types.ObjectId;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

const chatSchema = new mongoose.Schema<IChat>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    title: {
      type: String,
      default: "New Chat",
    },
  },
  {
    timestamps: true,
  },
);

const chatModel = mongoose.model<IChat>("Chat", chatSchema);

export default chatModel;
