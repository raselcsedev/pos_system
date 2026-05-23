import { Sale, type ISale } from "@/models/Sale";
import type { PaginationParams, PaginatedResult } from "@/types";

export class SaleRepository {
  async findById(id: string) {
    return Sale.findById(id)
      .populate("customerId", "name phone")
      .populate("cashierId", "name")
      .lean();
  }

  async findByInvoice(invoiceNumber: string) {
    return Sale.findOne({ invoiceNumber }).lean();
  }

  async paginate(
    params: PaginationParams & {
      status?: string;
      from?: Date;
      to?: Date;
      branchId?: string;
    }
  ): Promise<PaginatedResult<ISale>> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const skip = (page - 1) * limit;
    const filter: Record<string, unknown> = {};

    if (params.status) filter.status = params.status;
    if (params.branchId) filter.branchId = params.branchId;
    if (params.from || params.to) {
      filter.createdAt = {};
      if (params.from)
        (filter.createdAt as Record<string, Date>).$gte = params.from;
      if (params.to)
        (filter.createdAt as Record<string, Date>).$lte = params.to;
    }

    const [items, total] = await Promise.all([
      Sale.find(filter)
        .populate("customerId", "name")
        .populate("cashierId", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Sale.countDocuments(filter),
    ]);

    return {
      items: items as ISale[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async create(data: Partial<ISale>) {
    return Sale.create(data);
  }

  async getRevenueStats(from: Date, to: Date, branchId?: string) {
    const match: Record<string, unknown> = {
      status: "completed",
      createdAt: { $gte: from, $lte: to },
    };
    if (branchId) match.branchId = branchId;

    const [stats] = await Sale.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total" },
          totalSales: { $sum: 1 },
          avgOrder: { $avg: "$total" },
        },
      },
    ]);

    return stats ?? { totalRevenue: 0, totalSales: 0, avgOrder: 0 };
  }

  async topProducts(limit = 10, from?: Date, to?: Date) {
    const match: Record<string, unknown> = { status: "completed" };
    if (from && to) match.createdAt = { $gte: from, $lte: to };

    return Sale.aggregate([
      { $match: match },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          name: { $first: "$items.name" },
          quantity: { $sum: "$items.quantity" },
          revenue: { $sum: "$items.subtotal" },
        },
      },
      { $sort: { quantity: -1 } },
      { $limit: limit },
    ]);
  }

  async recent(limit = 10) {
    return Sale.find({ status: "completed" })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("cashierId", "name")
      .lean();
  }
}
