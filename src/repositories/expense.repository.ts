import mongoose from "mongoose";
import { Expense, type IExpense } from "@/models/Expense";
import type { PaginationParams, PaginatedResult } from "@/types";

export class ExpenseRepository {
  async findById(id: string) {
    return Expense.findById(id)
      .populate("createdBy", "name")
      .lean();
  }

  async paginate(params: PaginationParams & { search?: string }): Promise<PaginatedResult<IExpense>> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const skip = (page - 1) * limit;
    const filter: Record<string, unknown> = {};

    if (params.search) {
      const regex = { $regex: params.search, $options: "i" };
      filter.$or = [
        { title: regex },
        { category: regex },
        { description: regex },
      ];
    }

    const [items, total] = await Promise.all([
      Expense.find(filter)
        .populate("createdBy", "name")
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Expense.countDocuments(filter),
    ]);

    return {
      items: items as IExpense[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async create(data: Partial<IExpense>) {
    return Expense.create(data);
  }

  async update(id: string, data: Partial<IExpense>) {
    return Expense.findByIdAndUpdate(id, data, { new: true }).lean();
  }

  async delete(id: string) {
    return Expense.findByIdAndDelete(id).lean();
  }
}
