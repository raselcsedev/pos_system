import { z } from "zod";

export const notificationCreateSchema = z.object({
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
  type: z.enum(["info", "warning", "success", "error", "low_stock", "sale"]),
  userId: z.string().optional(),
  branchId: z.string().optional(),
  link: z.string().url().optional().or(z.literal("")),
  isRead: z.boolean().optional(),
});

export const notificationUpdateSchema = z.object({
  isRead: z.boolean(),
});

export type NotificationCreateInput = z.infer<typeof notificationCreateSchema>;
export type NotificationUpdateInput = z.infer<typeof notificationUpdateSchema>;
