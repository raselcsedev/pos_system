import { z } from "zod";

export const settingsSchema = z.object({
  storeName: z.string().min(1, "Store name is required"),
  storeAddress: z.string().optional(),
  storePhone: z.string().optional(),
  storeEmail: z.string().email("Enter a valid email").optional(),
  logo: z.string().optional(),
  currency: z.string().min(1, "Currency is required"),
  currencySymbol: z.string().min(1, "Currency symbol is required"),
  taxRate: z.number().min(0, "Tax rate cannot be negative"),
  taxName: z.string().min(1, "Tax name is required"),
  language: z.string().min(1, "Language is required"),
  invoicePrefix: z.string().min(1, "Invoice prefix is required"),
  invoiceFooter: z.string().optional(),
  lowStockAlert: z.boolean(),
  theme: z.enum(["light", "dark", "system"]),
});

export type SettingsInput = z.infer<typeof settingsSchema>;
