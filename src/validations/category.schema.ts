import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  parentId: z.string().optional(),
  isActive: z.boolean().optional(),
  branchId: z.string().optional(),
});

export type CategoryInput = z.infer<typeof categorySchema>;
