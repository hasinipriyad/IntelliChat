import mongoose, { Document, Types } from "mongoose";

export interface IMessage extends Document {
  chatId: Types.ObjectId;
  role: "user" | "model";
  content: string;
  createdAt: Date;
}

const messageSchema = new mongoose.Schema<IMessage>(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "model"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const messageModel = mongoose.model<IMessage>("Message", messageSchema);

export default messageModel;
