import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  brandId: z.string().optional(),
  costPrice: z.number().min(0),
  sellingPrice: z.number().min(0),
  taxRate: z.number().min(0).max(100),
  stock: z.number().min(0),
  lowStockThreshold: z.number().min(0),
  unit: z.string(),
  images: z.array(z.string()).optional(),
  branchId: z.string().optional(),
});

export const saleCheckoutSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      name: z.string(),
      sku: z.string(),
      price: z.number(),
      quantity: z.number().min(1),
      discount: z.number().default(0),
      tax: z.number().default(0),
    })
  ).min(1),
  discount: z.number().default(0),
  taxRate: z.number().default(0),
  payments: z.array(
    z.object({
      method: z.enum(["cash", "card", "mobile", "bank", "credit"]),
      amount: z.number().min(0),
      reference: z.string().optional(),
    })
  ).min(1),
  customerId: z.string().optional(),
  notes: z.string().optional(),
});

export type ProductInput = z.infer<typeof productSchema>;
export type SaleCheckoutInput = z.infer<typeof saleCheckoutSchema>;
