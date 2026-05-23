import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { generateInvoiceNumber } from "@/lib/utils";
import { InventoryLog } from "@/models/InventoryLog";
import { Notification } from "@/models/Notification";
import { Product } from "@/models/Product";
import { SaleRepository } from "@/repositories/sale.repository";
import type { CartItem, PaymentSplit } from "@/types";

const saleRepo = new SaleRepository();

export class SaleService {
  async completeSale(params: {
    items: CartItem[];
    discount: number;
    taxRate: number;
    payments: PaymentSplit[];
    customerId?: string;
    cashierId: string;
    branchId?: string;
    notes?: string;
  }) {
    await connectDB();

    const subtotal = params.items.reduce(
      (sum, item) =>
        sum + item.price * item.quantity * (1 - item.discount / 100),
      0
    );
    const afterDiscount = subtotal - params.discount;
    const tax = afterDiscount * (params.taxRate / 100);
    const total = afterDiscount + tax;

    const paymentTotal = params.payments.reduce((s, p) => s + p.amount, 0);
    if (Math.abs(paymentTotal - total) > 0.01) {
      throw new Error("Payment total does not match sale total");
    }

    for (const item of params.items) {
      const product = await Product.findById(item.productId);
      if (!product) throw new Error(`Product not found: ${item.name}`);
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${item.name}`);
      }
    }

    const invoiceNumber = generateInvoiceNumber();
    const saleItems = params.items.map((item) => {
      const lineSubtotal =
        item.price * item.quantity * (1 - item.discount / 100);
      return {
        productId: new mongoose.Types.ObjectId(item.productId),
        name: item.name,
        sku: item.sku,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount,
        tax: item.tax,
        subtotal: lineSubtotal,
        variantId: item.variantId,
      };
    });

    const sale = await saleRepo.create({
      invoiceNumber,
      items: saleItems,
      subtotal,
      discount: params.discount,
      tax,
      total,
      payments: params.payments,
      customerId: params.customerId
        ? new mongoose.Types.ObjectId(params.customerId)
        : undefined,
      cashierId: new mongoose.Types.ObjectId(params.cashierId),
      branchId: params.branchId
        ? new mongoose.Types.ObjectId(params.branchId)
        : undefined,
      status: "completed",
      notes: params.notes,
    });

    for (const item of params.items) {
      const product = await Product.findById(item.productId);
      if (!product) continue;
      const prev = product.stock;
      product.stock -= item.quantity;
      await product.save();

      await InventoryLog.create({
        productId: new mongoose.Types.ObjectId(item.productId),
        type: "sale",
        quantity: -item.quantity,
        previousStock: prev,
        newStock: product.stock,
        reference: invoiceNumber,
        branchId: params.branchId
          ? new mongoose.Types.ObjectId(params.branchId)
          : undefined,
        createdBy: new mongoose.Types.ObjectId(params.cashierId),
      });

      if (product.stock <= product.lowStockThreshold) {
        await Notification.create({
          title: "Low Stock Alert",
          message: `${product.name} is low on stock (${product.stock} left)`,
          type: "low_stock",
          branchId: params.branchId
            ? new mongoose.Types.ObjectId(params.branchId)
            : undefined,
          link: `/products`,
        });
      }
    }

    return sale;
  }

  async holdCart(params: {
    items: CartItem[];
    discount: number;
    taxRate: number;
    cashierId: string;
    branchId?: string;
    customerId?: string;
  }) {
    await connectDB();
    const subtotal = params.items.reduce(
      (sum, item) =>
        sum + item.price * item.quantity * (1 - item.discount / 100),
      0
    );
    const tax = (subtotal - params.discount) * (params.taxRate / 100);
    const total = subtotal - params.discount + tax;

    return saleRepo.create({
      invoiceNumber: generateInvoiceNumber("HOLD"),
      items: params.items.map((item) => ({
        productId: new mongoose.Types.ObjectId(item.productId),
        name: item.name,
        sku: item.sku,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount,
        tax: item.tax,
        subtotal: item.price * item.quantity,
      })),
      subtotal,
      discount: params.discount,
      tax,
      total,
      payments: [],
      cashierId: new mongoose.Types.ObjectId(params.cashierId),
      branchId: params.branchId
        ? new mongoose.Types.ObjectId(params.branchId)
        : undefined,
      customerId: params.customerId
        ? new mongoose.Types.ObjectId(params.customerId)
        : undefined,
      status: "held",
      heldAt: new Date(),
    });
  }
}
