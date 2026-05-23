import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface ISettings extends Document {
  storeName: string;
  storeAddress?: string;
  storePhone?: string;
  storeEmail?: string;
  logo?: string;
  currency: string;
  currencySymbol: string;
  taxRate: number;
  taxName: string;
  language: string;
  invoicePrefix: string;
  invoiceFooter?: string;
  lowStockAlert: boolean;
  theme: "light" | "dark" | "system";
  branchId?: mongoose.Types.ObjectId;
}

const SettingsSchema = new Schema<ISettings>(
  {
    storeName: { type: String, default: "RetailPOS Store" },
    storeAddress: String,
    storePhone: String,
    storeEmail: String,
    logo: String,
    currency: { type: String, default: "USD" },
    currencySymbol: { type: String, default: "$" },
    taxRate: { type: Number, default: 0 },
    taxName: { type: String, default: "VAT" },
    language: { type: String, default: "en" },
    invoicePrefix: { type: String, default: "INV" },
    invoiceFooter: String,
    lowStockAlert: { type: Boolean, default: true },
    theme: {
      type: String,
      enum: ["light", "dark", "system"],
      default: "system",
    },
    branchId: { type: Schema.Types.ObjectId, ref: "Branch" },
  },
  { timestamps: true }
);

export const Settings: Model<ISettings> =
  mongoose.models.Settings ??
  mongoose.model<ISettings>("Settings", SettingsSchema);
