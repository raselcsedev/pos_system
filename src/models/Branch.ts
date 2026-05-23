import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IBranch extends Document {
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  isMain: boolean;
  isActive: boolean;
}

const BranchSchema = new Schema<IBranch>(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    address: String,
    phone: String,
    email: String,
    isMain: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Branch: Model<IBranch> =
  mongoose.models.Branch ?? mongoose.model<IBranch>("Branch", BranchSchema);
