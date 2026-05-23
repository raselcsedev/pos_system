import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  loyaltyPoints: z.number().min(0),
  dueBalance: z.number(),
  isActive: z.boolean(),
});

export type CustomerInput = z.infer<typeof customerSchema>;
