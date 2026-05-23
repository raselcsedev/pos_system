import { Product, type IProduct } from "@/models/Product";
import type { PaginationParams, PaginatedResult } from "@/types";

export class ProductRepository {
  async findById(id: string) {
    return Product.findById(id)
      .populate("categoryId", "name")
      .populate("brandId", "name")
      .lean();
  }

  async findByBarcode(barcode: string) {
    return Product.findOne({
      $or: [{ barcode }, { "variants.barcode": barcode }],
      isActive: true,
    }).lean();
  }

  async search(query: string, limit = 20) {
    return Product.find({
      isActive: true,
      $or: [
        { name: { $regex: query, $options: "i" } },
        { sku: { $regex: query, $options: "i" } },
        { barcode: query },
      ],
    })
      .limit(limit)
      .lean();
  }

  async paginate(
    params: PaginationParams & { categoryId?: string; branchId?: string }
  ): Promise<PaginatedResult<IProduct>> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const skip = (page - 1) * limit;
    const filter: Record<string, unknown> = {};

    if (params.search) {
      filter.$or = [
        { name: { $regex: params.search, $options: "i" } },
        { sku: { $regex: params.search, $options: "i" } },
      ];
    }
    if (params.categoryId) filter.categoryId = params.categoryId;
    if (params.branchId) filter.branchId = params.branchId;

    const [items, total] = await Promise.all([
      Product.find(filter)
        .populate("categoryId", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    return {
      items: items as IProduct[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async create(data: Partial<IProduct>) {
    return Product.create(data);
  }

  async update(id: string, data: Partial<IProduct>) {
    return Product.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string) {
    return Product.findByIdAndUpdate(id, { isActive: false });
  }

  async updateStock(id: string, quantity: number) {
    return Product.findByIdAndUpdate(
      id,
      { $inc: { stock: quantity } },
      { new: true }
    );
  }

  async lowStock(threshold?: number) {
    return Product.find({
      isActive: true,
      $expr: { $lte: ["$stock", "$lowStockThreshold"] },
    })
      .limit(50)
      .lean();
  }
}
