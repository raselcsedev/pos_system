import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { requirePermission } from "@/lib/auth-helpers";
import { ExpenseRepository } from "@/repositories/expense.repository";
import { zodFirstError } from "@/lib/zod-error";
import { expenseSchema } from "@/validations/expense.schema";

const repo = new ExpenseRepository();

export async function GET(req: Request) {
  try {
    await requirePermission("expenses.manage");
    await connectDB();
    const { searchParams } = new URL(req.url);
    const result = await repo.paginate({
      page: Number(searchParams.get("page") ?? 1),
      limit: Number(searchParams.get("limit") ?? 20),
      search: searchParams.get("search") ?? undefined,
    });
    return apiSuccess(result);
  } catch (e) {
    return apiError(e instanceof Error ? e.message : "Failed", 401);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requirePermission("expenses.manage");
    await connectDB();
    const body = await req.json();
    const parsed = expenseSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(zodFirstError(parsed.error));
    }

    const data = parsed.data;
    const expense = await repo.create({
      title: data.title,
      category: data.category,
      amount: data.amount,
      date: data.date ? new Date(data.date) : new Date(),
      description: data.description,
      branchId: data.branchId ? new mongoose.Types.ObjectId(data.branchId) : undefined,
      createdBy: new mongoose.Types.ObjectId(session.user.id),
    });
    return apiSuccess(expense, "Expense created", 201);
  } catch (e) {
    return apiError(e instanceof Error ? e.message : "Failed to create expense", 400);
  }
}
