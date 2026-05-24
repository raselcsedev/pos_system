import { Branch, type IBranch } from "@/models/Branch";
import type { PaginationParams, PaginatedResult } from "@/types";

export class BranchRepository {
  async findById(id: string) {
    return Branch.findById(id).lean();
  }

  async paginate(params: PaginationParams): Promise<PaginatedResult<IBranch>> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const skip = (page - 1) * limit;
    const filter: Record<string, unknown> = {};

    if (params.search) {
      filter.$or = [
        { name: { $regex: params.search, $options: "i" } },
        { code: { $regex: params.search, $options: "i" } },
        { address: { $regex: params.search, $options: "i" } },
      ];
    }

    const [items, total] = await Promise.all([
      Branch.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Branch.countDocuments(filter),
    ]);

    return {
      items: items as IBranch[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async create(data: Partial<IBranch>) {
    return Branch.create(data);
  }

  async update(id: string, data: Partial<IBranch>) {
    return Branch.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string) {
    return Branch.findByIdAndUpdate(id, { isActive: false });
  }
}
