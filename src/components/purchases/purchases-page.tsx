"use client";

import { useCallback, useEffect, useState } from "react";
import { Eye, RefreshCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";

interface PurchaseItem {
  name: string;
  quantity: number;
  cost: number;
  subtotal: number;
}

interface PurchaseRecord {
  _id: string;
  purchaseNumber: string;
  status: "pending" | "received" | "returned" | "cancelled";
  subtotal: number;
  tax: number;
  total: number;
  paid: number;
  receivedAt?: string | null;
  createdAt?: string;
  supplierId?: {
    name: string;
    company?: string;
  } | null;
  items: PurchaseItem[];
  notes?: string;
}

export function PurchasesPage() {
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseRecord | null>(null);

  const loadPurchases = useCallback(async () => {
    setIsLoading(true);
    try {
      const query = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await fetch(`/api/purchases${query}`);
      const json = await res.json();
      if (json.success) {
        setPurchases(json.data.items ?? []);
      }
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timeout = setTimeout(loadPurchases, 250);
    return () => clearTimeout(timeout);
  }, [loadPurchases]);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Purchase History</CardTitle>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              className="h-10 rounded-md border border-zinc-200 bg-white pl-10 pr-3 text-sm shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
              placeholder="Search purchases..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <Button
            size="sm"
            variant="secondary"
            className="flex items-center gap-2"
            onClick={loadPurchases}
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-zinc-500 dark:text-zinc-400">
              <th className="pb-3 pr-4">Purchase #</th>
              <th className="pb-3 pr-4">Supplier</th>
              <th className="pb-3 pr-4">Status</th>
              <th className="pb-3 pr-4">Total</th>
              <th className="pb-3 pr-4">Paid</th>
              <th className="pb-3 pr-4">Received</th>
              <th className="pb-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((purchase) => (
              <tr key={purchase._id} className="border-b border-zinc-100 dark:border-zinc-800">
                <td className="py-3 pr-4 font-medium">{purchase.purchaseNumber}</td>
                <td className="py-3 pr-4">
                  {purchase.supplierId?.name ?? "Unknown"}
                  {purchase.supplierId?.company ? (
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      {purchase.supplierId.company}
                    </div>
                  ) : null}
                </td>
                <td className="py-3 pr-4">
                  <Badge
                    variant={
                      purchase.status === "received"
                        ? "success"
                        : purchase.status === "pending"
                        ? "secondary"
                        : purchase.status === "returned"
                        ? "outline"
                        : "destructive"
                    }
                  >
                    {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                  </Badge>
                </td>
                <td className="py-3 pr-4">{formatCurrency(purchase.total)}</td>
                <td className="py-3 pr-4">{formatCurrency(purchase.paid)}</td>
                <td className="py-3 pr-4">
                  {purchase.receivedAt ? new Date(purchase.receivedAt).toLocaleDateString() : "—"}
                </td>
                <td className="py-3">
                  <Button variant="ghost" size="icon" onClick={() => setSelectedPurchase(purchase)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {isLoading ? (
          <p className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">Loading purchases...</p>
        ) : purchases.length === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
            No purchases found. Add a purchase record in the backend or seed data.
          </p>
        ) : null}
      </CardContent>

      <Dialog open={Boolean(selectedPurchase)} onOpenChange={(open) => !open && setSelectedPurchase(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Purchase details</DialogTitle>
            <DialogDescription>Review the selected purchase order and item summary.</DialogDescription>
          </DialogHeader>

          {selectedPurchase ? (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Purchase #</p>
                  <p className="font-medium">{selectedPurchase.purchaseNumber}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Supplier</p>
                  <p className="font-medium">{selectedPurchase.supplierId?.name ?? "Unknown"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Total</p>
                  <p className="font-medium">{formatCurrency(selectedPurchase.total)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Paid</p>
                  <p className="font-medium">{formatCurrency(selectedPurchase.paid)}</p>
                </div>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm dark:border-zinc-700 dark:bg-zinc-900">
                <p className="font-medium">Notes</p>
                <p className="mt-2 text-zinc-600 dark:text-zinc-300">
                  {selectedPurchase.notes ?? "No additional notes."}
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-zinc-500 dark:text-zinc-400">
                      <th className="pb-3 pr-4">Item</th>
                      <th className="pb-3 pr-4">Qty</th>
                      <th className="pb-3 pr-4">Cost</th>
                      <th className="pb-3">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPurchase.items.map((item, index) => (
                      <tr key={index} className="border-b border-zinc-100 dark:border-zinc-800">
                        <td className="py-3 pr-4 font-medium">{item.name}</td>
                        <td className="py-3 pr-4">{item.quantity}</td>
                        <td className="py-3 pr-4">{formatCurrency(item.cost)}</td>
                        <td className="py-3">{formatCurrency(item.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No purchase selected.</p>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
