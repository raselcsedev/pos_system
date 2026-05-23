import { connectDB } from "@/lib/db";
import { InventoryLog } from "@/models/InventoryLog";
import { Product } from "@/models/Product";
import { ProductRepository } from "@/repositories/product.repository";

const productRepo = new ProductRepository();

export class InventoryService {
  async adjustStock(params: {
    productId: string;
    quantity: number;
    type: "adjustment" | "damage" | "return" | "transfer";
    notes?: string;
    createdBy: string;
    branchId?: string;
    warehouseId?: string;
  }) {
    await connectDB();
    const product = await Product.findById(params.productId);
    if (!product) throw new Error("Product not found");

    const previousStock = product.stock;
    product.stock += params.quantity;
    if (product.stock < 0) throw new Error("Stock cannot be negative");
    await product.save();

    await InventoryLog.create({
      productId: params.productId,
      type: params.type,
      quantity: params.quantity,
      previousStock,
      newStock: product.stock,
      notes: params.notes,
      branchId: params.branchId,
      warehouseId: params.warehouseId,
      createdBy: params.createdBy,
    });

    return product;
  }

  async transferStock(params: {
    productId: string;
    quantity: number;
    fromWarehouse: string;
    toWarehouse: string;
    createdBy: string;
    branchId?: string;
  }) {
    return this.adjustStock({
      productId: params.productId,
      quantity: 0,
      type: "transfer",
      notes: `Transfer ${params.quantity} from ${params.fromWarehouse} to ${params.toWarehouse}`,
      createdBy: params.createdBy,
      branchId: params.branchId,
      warehouseId: params.toWarehouse,
    });
  }

  async getLowStockAlerts() {
    await connectDB();
    return productRepo.lowStock();
  }

  async getHistory(productId: string, limit = 50) {
    await connectDB();
    return InventoryLog.find({ productId })
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }
}
