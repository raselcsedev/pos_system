import { Supplier, type ISupplier } from "@/models/Supplier";
import type { PaginationParams, PaginatedResult } from "@/types";

export class SupplierRepository {
  async findById(id: string) {
    return Supplier.findById(id).lean();
  }

  async paginate(params: PaginationParams): Promise<PaginatedResult<ISupplier>> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const skip = (page - 1) * limit;
    const filter: Record<string, unknown> = {};

    if (params.search) {
      filter.$or = [
        { name: { $regex: params.search, $options: "i" } },
        { company: { $regex: params.search, $options: "i" } },
        { email: { $regex: params.search, $options: "i" } },
      ];
    }

    const [items, total] = await Promise.all([
      Supplier.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Supplier.countDocuments(filter),
    ]);

    return {
      items: items as ISupplier[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async create(data: Partial<ISupplier>) {
    return Supplier.create(data);
  }

  async update(id: string, data: Partial<ISupplier>) {
    return Supplier.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string) {
    return Supplier.findByIdAndUpdate(id, { isActive: false });
  }
}
