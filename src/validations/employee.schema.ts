import { z } from "zod";

export const employeeCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "manager", "cashier", "staff"]),
  phone: z.string().optional(),
  isActive: z.boolean(),
});

const employeePasswordUpdateSchema = z
  .union([z.string().min(6, "Password must be at least 6 characters"), z.literal("")])
  .optional()
  .transform((value) => (value === "" ? undefined : value));

export const employeeUpdateSchema = employeeCreateSchema.partial().extend({
  password: employeePasswordUpdateSchema,
});

export type EmployeeCreateInput = z.infer<typeof employeeCreateSchema>;
export type EmployeeUpdateInput = z.infer<typeof employeeUpdateSchema>;
