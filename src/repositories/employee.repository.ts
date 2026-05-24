import { User, type IUser } from "@/models/User";
import type { PaginationParams, PaginatedResult } from "@/types";

export class EmployeeRepository {
  async findById(id: string) {
    return User.findById(id).lean();
  }

  async paginate(params: PaginationParams): Promise<PaginatedResult<IUser>> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const skip = (page - 1) * limit;
    const filter: Record<string, unknown> = {};

    if (params.search) {
      filter.$or = [
        { name: { $regex: params.search, $options: "i" } },
        { email: { $regex: params.search, $options: "i" } },
        { phone: { $regex: params.search, $options: "i" } },
        { role: { $regex: params.search, $options: "i" } },
      ];
    }

    const [items, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(filter),
    ]);

    return {
      items: items as IUser[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async create(data: Partial<IUser>) {
    return User.create(data);
  }

  async update(id: string, data: Partial<IUser>) {
    return User.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string) {
    return User.findByIdAndUpdate(id, { isActive: false });
  }
}
