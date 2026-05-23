import { z } from "zod";

export const supplierSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  company: z.string().optional(),
  dueBalance: z.number(),
  isActive: z.boolean(),
});

export type SupplierInput = z.infer<typeof supplierSchema>;
