import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { zodFirstError } from "@/lib/zod-error";
import { NotificationRepository } from "@/repositories/notification.repository";
import { notificationCreateSchema } from "@/validations/notification.schema";

const repo = new NotificationRepository();

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const result = await repo.paginate({
      page: Number(searchParams.get("page") ?? 1),
      limit: Number(searchParams.get("limit") ?? 50),
      search: searchParams.get("search") ?? undefined,
    });
    return apiSuccess(result);
  } catch (e) {
    return apiError(e instanceof Error ? e.message : "Failed", 401);
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const parsed = notificationCreateSchema.safeParse(body);
    if (!parsed.success) return apiError(zodFirstError(parsed.error));

    const notification = await repo.create({
      title: parsed.data.title,
      message: parsed.data.message,
      type: parsed.data.type,
      userId: parsed.data.userId ? new mongoose.Types.ObjectId(parsed.data.userId) : undefined,
      branchId: parsed.data.branchId ? new mongoose.Types.ObjectId(parsed.data.branchId) : undefined,
      link: parsed.data.link || undefined,
      isRead: parsed.data.isRead ?? false,
    });

    return apiSuccess(notification, "Notification created", 201);
  } catch (e) {
    return apiError(e instanceof Error ? e.message : "Failed", 400);
  }
}
