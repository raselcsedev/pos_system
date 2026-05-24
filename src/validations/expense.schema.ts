import { z } from "zod";

export const expenseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  category: z.string().min(1, "Category is required"),
  amount: z.number().min(0.01, "Amount must be greater than zero"),
  date: z.string().optional(),
  description: z.string().optional(),
  branchId: z.string().optional(),
});

export type ExpenseInput = z.infer<typeof expenseSchema>;
