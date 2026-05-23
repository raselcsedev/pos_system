import { Customer, type ICustomer } from "@/models/Customer";
import type { PaginationParams, PaginatedResult } from "@/types";

export class CustomerRepository {
  async findById(id: string) {
    return Customer.findById(id).lean();
  }

  async paginate(params: PaginationParams): Promise<PaginatedResult<ICustomer>> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const skip = (page - 1) * limit;
    const filter: Record<string, unknown> = {};

    if (params.search) {
      filter.$or = [
        { name: { $regex: params.search, $options: "i" } },
        { email: { $regex: params.search, $options: "i" } },
        { phone: { $regex: params.search, $options: "i" } },
      ];
    }

    const [items, total] = await Promise.all([
      Customer.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Customer.countDocuments(filter),
    ]);

    return {
      items: items as ICustomer[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async create(data: Partial<ICustomer>) {
    return Customer.create(data);
  }

  async update(id: string, data: Partial<ICustomer>) {
    return Customer.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string) {
    return Customer.findByIdAndUpdate(id, { isActive: false });
  }
}
