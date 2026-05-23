import { z } from "zod";

export const brandSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  logo: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type BrandInput = z.infer<typeof brandSchema>;
