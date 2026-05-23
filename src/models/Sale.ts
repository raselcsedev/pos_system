import "@/models/User";
import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface ISaleItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  discount: number;
  tax: number;
  subtotal: number;
  variantId?: string;
}

export interface ISale extends Document {
  invoiceNumber: string;
  items: ISaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  payments: { method: string; amount: number; reference?: string }[];
  customerId?: mongoose.Types.ObjectId;
  cashierId: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId;
  status: "completed" | "held" | "returned" | "refunded";
  notes?: string;
  heldAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SaleItemSchema = new Schema<ISaleItem>({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  name: String,
  sku: String,
  quantity: { type: Number, required: true },
  price: Number,
  discount: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  subtotal: Number,
  variantId: String,
});

const SaleSchema = new Schema<ISale>(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    items: [SaleItemSchema],
    subtotal: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    payments: [
      {
        method: String,
        amount: Number,
        reference: String,
      },
    ],
    customerId: { type: Schema.Types.ObjectId, ref: "Customer" },
    cashierId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    branchId: { type: Schema.Types.ObjectId, ref: "Branch" },
    status: {
      type: String,
      enum: ["completed", "held", "returned", "refunded"],
      default: "completed",
    },
    notes: String,
    heldAt: Date,
  },
  { timestamps: true }
);

export const Sale: Model<ISale> =
  mongoose.models.Sale ?? mongoose.model<ISale>("Sale", SaleSchema);
