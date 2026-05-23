import mongoose, { Schema, type Document, type Model } from "mongoose";
import type { Permission, UserRole } from "@/types";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  roleId?: mongoose.Types.ObjectId;
  permissions: Permission[];
  branchId?: mongoose.Types.ObjectId;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  lastLogin?: Date;
  resetToken?: string;
  resetTokenExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["admin", "manager", "cashier", "staff"],
      default: "cashier",
    },
    roleId: { type: Schema.Types.ObjectId, ref: "Role" },
    permissions: [{ type: String }],
    branchId: { type: Schema.Types.ObjectId, ref: "Branch" },
    phone: String,
    avatar: String,
    isActive: { type: Boolean, default: true },
    lastLogin: Date,
    resetToken: String,
    resetTokenExpiry: Date,
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>("User", UserSchema);
