import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IProductVariant {
  name: string;
  sku: string;
  barcode?: string;
  price: number;
  cost: number;
  stock: number;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  sku: string;
  barcode?: string;
  description?: string;
  categoryId: mongoose.Types.ObjectId;
  brandId?: mongoose.Types.ObjectId;
  images: string[];
  costPrice: number;
  sellingPrice: number;
  taxRate: number;
  stock: number;
  lowStockThreshold: number;
  unit: string;
  variants: IProductVariant[];
  isActive: boolean;
  branchId?: mongoose.Types.ObjectId;
}

const ProductVariantSchema = new Schema<IProductVariant>({
  name: { type: String, required: true },
  sku: { type: String, required: true },
  barcode: String,
  price: { type: Number, required: true },
  cost: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },
});

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },
    sku: { type: String, required: true, unique: true },
    barcode: { type: String, index: true },
    description: String,
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    brandId: { type: Schema.Types.ObjectId, ref: "Brand" },
    images: [String],
    costPrice: { type: Number, default: 0 },
    sellingPrice: { type: Number, required: true },
    taxRate: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    unit: { type: String, default: "pcs" },
    variants: [ProductVariantSchema],
    isActive: { type: Boolean, default: true },
    branchId: { type: Schema.Types.ObjectId, ref: "Branch" },
  },
  { timestamps: true }
);

ProductSchema.index({ name: "text", sku: "text", barcode: "text" });

export const Product: Model<IProduct> =
  mongoose.models.Product ?? mongoose.model<IProduct>("Product", ProductSchema);
