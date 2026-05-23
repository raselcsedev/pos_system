import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface ISupplier extends Document {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  company?: string;
  dueBalance: number;
  totalPaid: number;
  isActive: boolean;
}

const SupplierSchema = new Schema<ISupplier>(
  {
    name: { type: String, required: true },
    email: String,
    phone: String,
    address: String,
    company: String,
    dueBalance: { type: Number, default: 0 },
    totalPaid: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Supplier: Model<ISupplier> =
  mongoose.models.Supplier ??
  mongoose.model<ISupplier>("Supplier", SupplierSchema);
