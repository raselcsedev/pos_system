import mongoose, { Schema, type Document, type Model } from "mongoose";
import type { Permission } from "@/types";

export interface IRole extends Document {
  name: string;
  slug: string;
  permissions: Permission[];
  description?: string;
  isSystem: boolean;
}

const RoleSchema = new Schema<IRole>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    permissions: [{ type: String }],
    description: String,
    isSystem: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Role: Model<IRole> =
  mongoose.models.Role ?? mongoose.model<IRole>("Role", RoleSchema);
