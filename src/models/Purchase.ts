import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IPurchaseItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  quantity: number;
  cost: number;
  subtotal: number;
}

export interface IPurchase extends Document {
  purchaseNumber: string;
  supplierId: mongoose.Types.ObjectId;
  items: IPurchaseItem[];
  subtotal: number;
  tax: number;
  total: number;
  paid: number;
  status: "pending" | "received" | "returned" | "cancelled";
  branchId?: mongoose.Types.ObjectId;
  notes?: string;
  receivedAt?: Date;
}

const PurchaseItemSchema = new Schema<IPurchaseItem>({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  name: String,
  quantity: Number,
  cost: Number,
  subtotal: Number,
});

const PurchaseSchema = new Schema<IPurchase>(
  {
    purchaseNumber: { type: String, required: true, unique: true },
    supplierId: {
      type: Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
    items: [PurchaseItemSchema],
    subtotal: Number,
    tax: { type: Number, default: 0 },
    total: Number,
    paid: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "received", "returned", "cancelled"],
      default: "pending",
    },
    branchId: { type: Schema.Types.ObjectId, ref: "Branch" },
    notes: String,
    receivedAt: Date,
  },
  { timestamps: true }
);

export const Purchase: Model<IPurchase> =
  mongoose.models.Purchase ??
  mongoose.model<IPurchase>("Purchase", PurchaseSchema);
