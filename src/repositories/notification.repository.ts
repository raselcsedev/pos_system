import { Notification, type INotification } from "@/models/Notification";
import type { PaginationParams, PaginatedResult } from "@/types";

export class NotificationRepository {
  async findById(id: string) {
    return Notification.findById(id).lean();
  }

  async paginate(params: PaginationParams): Promise<PaginatedResult<INotification>> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const skip = (page - 1) * limit;
    const filter: Record<string, unknown> = {};

    if (params.search) {
      filter.$or = [
        { title: { $regex: params.search, $options: "i" } },
        { message: { $regex: params.search, $options: "i" } },
        { type: { $regex: params.search, $options: "i" } },
      ];
    }

    const [items, total] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Notification.countDocuments(filter),
    ]);

    return {
      items: items as INotification[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async create(data: Partial<INotification>) {
    return Notification.create(data);
  }

  async update(id: string, data: Partial<INotification>) {
    return Notification.findByIdAndUpdate(id, data, { new: true }).lean();
  }

  async delete(id: string) {
    return Notification.findByIdAndDelete(id);
  }
}
