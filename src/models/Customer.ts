import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface ICustomer extends Document {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  loyaltyPoints: number;
  dueBalance: number;
  totalPurchases: number;
  branchId?: mongoose.Types.ObjectId;
  isActive: boolean;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    name: { type: String, required: true },
    email: String,
    phone: String,
    address: String,
    loyaltyPoints: { type: Number, default: 0 },
    dueBalance: { type: Number, default: 0 },
    totalPurchases: { type: Number, default: 0 },
    branchId: { type: Schema.Types.ObjectId, ref: "Branch" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Customer: Model<ICustomer> =
  mongoose.models.Customer ??
  mongoose.model<ICustomer>("Customer", CustomerSchema);
