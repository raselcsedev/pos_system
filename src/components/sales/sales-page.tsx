"use client";

import { useCallback, useEffect, useState } from "react";
import { Eye, RefreshCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

interface SaleRecord {
  _id: string;
  invoiceNumber: string;
  status: "completed" | "held" | "returned" | "refunded";
  total: number;
  subtotal: number;
  discount: number;
  tax: number;
  createdAt?: string;
  updatedAt?: string;
  customerId?: { name?: string } | null;
  cashierId?: { name?: string } | null;
}

export function SalesPage() {
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("completed");
  const [isLoading, setIsLoading] = useState(true);

  const loadSales = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (status) params.set("status", status);
      const query = params.toString() ? `?${params.toString()}` : "";
      const res = await fetch(`/api/sales${query}`);
      const json = await res.json();
      if (json.success) {
        setSales(json.data.items ?? []);
      }
    } finally {
      setIsLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    const timeout = setTimeout(loadSales, 250);
    return () => clearTimeout(timeout);
  }, [loadSales]);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Sales Records</CardTitle>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              className="h-10 rounded-md border border-zinc-200 bg-white pl-10 pr-3 text-sm shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
              placeholder="Search by invoice or customer"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-10 rounded-md border border-zinc-200 bg-white px-3 text-sm shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
          >
            <option value="completed">Completed</option>
            <option value="held">Held</option>
            <option value="returned">Returned</option>
            <option value="refunded">Refunded</option>
            <option value="">All statuses</option>
          </select>
          <Button size="sm" variant="secondary" className="flex items-center gap-2" onClick={loadSales}>
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-zinc-500 dark:text-zinc-400">
              <th className="pb-3 pr-4">Invoice</th>
              <th className="pb-3 pr-4">Customer</th>
              <th className="pb-3 pr-4">Cashier</th>
              <th className="pb-3 pr-4">Status</th>
              <th className="pb-3 pr-4">Total</th>
              <th className="pb-3 pr-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr key={sale._id} className="border-b border-zinc-100 dark:border-zinc-800">
                <td className="py-3 pr-4 font-medium">{sale.invoiceNumber}</td>
                <td className="py-3 pr-4">{sale.customerId?.name ?? "Walk-in"}</td>
                <td className="py-3 pr-4">{sale.cashierId?.name ?? "—"}</td>
                <td className="py-3 pr-4">
                  <Badge
                    variant={
                      sale.status === "completed"
                        ? "success"
                        : sale.status === "held"
                        ? "secondary"
                        : sale.status === "returned"
                        ? "outline"
                        : "destructive"
                    }
                  >
                    {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                  </Badge>
                </td>
                <td className="py-3 pr-4">{formatCurrency(sale.total)}</td>
                <td className="py-3 pr-4">{sale.createdAt ? new Date(sale.createdAt).toLocaleDateString() : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {isLoading ? (
          <p className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">Loading sales...</p>
        ) : sales.length === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">No sales found for the selected filter.</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
