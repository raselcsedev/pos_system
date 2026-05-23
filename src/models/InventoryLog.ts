import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IInventoryLog extends Document {
  productId: mongoose.Types.ObjectId;
  type:
    | "purchase"
    | "sale"
    | "adjustment"
    | "damage"
    | "return"
    | "transfer";
  quantity: number;
  previousStock: number;
  newStock: number;
  reference?: string;
  notes?: string;
  branchId?: mongoose.Types.ObjectId;
  warehouseId?: string;
  createdBy: mongoose.Types.ObjectId;
}

const InventoryLogSchema = new Schema<IInventoryLog>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "purchase",
        "sale",
        "adjustment",
        "damage",
        "return",
        "transfer",
      ],
      required: true,
    },
    quantity: { type: Number, required: true },
    previousStock: Number,
    newStock: Number,
    reference: String,
    notes: String,
    branchId: { type: Schema.Types.ObjectId, ref: "Branch" },
    warehouseId: String,
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const InventoryLog: Model<IInventoryLog> =
  mongoose.models.InventoryLog ??
  mongoose.model<IInventoryLog>("InventoryLog", InventoryLogSchema);
