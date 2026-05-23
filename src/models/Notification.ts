import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface INotification extends Document {
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error" | "low_stock" | "sale";
  userId?: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId;
  isRead: boolean;
  link?: string;
}

const NotificationSchema = new Schema<INotification>(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["info", "warning", "success", "error", "low_stock", "sale"],
      default: "info",
    },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    branchId: { type: Schema.Types.ObjectId, ref: "Branch" },
    isRead: { type: Boolean, default: false },
    link: String,
  },
  { timestamps: true }
);

export const Notification: Model<INotification> =
  mongoose.models.Notification ??
  mongoose.model<INotification>("Notification", NotificationSchema);
