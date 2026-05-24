import { Purchase, type IPurchase } from "@/models/Purchase";
import type { PaginationParams, PaginatedResult } from "@/types";

export class PurchaseRepository {
  async findById(id: string) {
    return Purchase.findById(id)
      .populate("supplierId", "name company")
      .lean();
  }

  async paginate(params: PaginationParams): Promise<PaginatedResult<IPurchase>> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const skip = (page - 1) * limit;
    const filter: Record<string, unknown> = {};

    if (params.search) {
      const regex = { $regex: params.search, $options: "i" };
      filter.$or = [
        { purchaseNumber: regex },
        { status: regex },
        { notes: regex },
      ];
    }

    const [items, total] = await Promise.all([
      Purchase.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("supplierId", "name company")
        .lean(),
      Purchase.countDocuments(filter),
    ]);

    return {
      items: items as IPurchase[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
