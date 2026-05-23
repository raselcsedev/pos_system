import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { requirePermission } from "@/lib/auth-helpers";
import { Customer } from "@/models/Customer";
import { Expense } from "@/models/Expense";
import { Product } from "@/models/Product";
import { Sale } from "@/models/Sale";
import { SaleRepository } from "@/repositories/sale.repository";

const saleRepo = new SaleRepository();

export async function GET(req: Request) {
  try {
    await requirePermission("reports.view");
    await connectDB();

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") ?? "sales";
    const days = Number(searchParams.get("days") ?? 30);
    const start = new Date();
    start.setDate(start.getDate() - days);

    if (type === "sales") {
      const sales = await Sale.find({
        status: "completed",
        createdAt: { $gte: start },
      })
        .populate("cashierId", "name")
        .sort({ createdAt: -1 })
        .limit(500)
        .lean();

      const rows = sales.map((s) => ({
        Invoice: s.invoiceNumber,
        Date: new Date(s.createdAt).toLocaleDateString(),
        Cashier: (s.cashierId as { name?: string })?.name ?? "—",
        Subtotal: s.subtotal,
        Discount: s.discount,
        Tax: s.tax,
        Total: s.total,
        Status: s.status,
      }));

      const stats = await saleRepo.getRevenueStats(start, new Date());
      return apiSuccess({ rows, stats, type: "sales" });
    }

    if (type === "inventory") {
      const products = await Product.find({ isActive: true })
        .populate("categoryId", "name")
        .sort({ name: 1 })
        .lean();

      const rows = products.map((p) => ({
        Product: p.name,
        SKU: p.sku,
        Category: (p.categoryId as { name?: string })?.name ?? "—",
        Stock: p.stock,
        "Low Threshold": p.lowStockThreshold,
        "Cost Price": p.costPrice,
        "Sell Price": p.sellingPrice,
        Status: p.stock <= p.lowStockThreshold ? "Low" : "OK",
      }));

      return apiSuccess({ rows, type: "inventory" });
    }

    if (type === "customers") {
      const customers = await Customer.find({ isActive: true })
        .sort({ name: 1 })
        .lean();

      const rows = customers.map((c) => ({
        Name: c.name,
        Email: c.email ?? "—",
        Phone: c.phone ?? "—",
        "Loyalty Points": c.loyaltyPoints,
        "Due Balance": c.dueBalance,
        "Total Purchases": c.totalPurchases,
      }));

      return apiSuccess({ rows, type: "customers" });
    }

    if (type === "profit") {
      const stats = await saleRepo.getRevenueStats(start, new Date());
      const [expenseAgg] = await Expense.aggregate([
        { $match: { date: { $gte: start } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);
      const expenses = expenseAgg?.total ?? 0;
      const revenue = stats.totalRevenue ?? 0;

      return apiSuccess({
        type: "profit",
        rows: [
          { Metric: "Revenue", Amount: revenue },
          { Metric: "Expenses", Amount: expenses },
          { Metric: "Profit", Amount: revenue - expenses },
          { Metric: "Sales Count", Amount: stats.totalSales ?? 0 },
        ],
      });
    }

    return apiError("Invalid report type");
  } catch (e) {
    return apiError(e instanceof Error ? e.message : "Failed", 401);
  }
}
