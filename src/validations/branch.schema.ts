import { z } from "zod";

export const branchSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  isMain: z.boolean(),
  isActive: z.boolean(),
});

export type BranchInput = z.infer<typeof branchSchema>;
