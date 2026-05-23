"use client";

import { useEffect, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { ModulePage } from "@/components/shared/module-page";
import { ProductFormDialog } from "@/components/products/product-form-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

interface ProductRow {
  _id: string;
  name: string;
  sku: string;
  sellingPrice: number;
  stock: number;
  isActive: boolean;
  categoryId?: { name?: string };
}

const columnHelper = createColumnHelper<ProductRow>();

const columns = [
  columnHelper.accessor("name", { header: "Product" }),
  columnHelper.accessor("sku", { header: "SKU" }),
  columnHelper.accessor("sellingPrice", {
    header: "Price",
    cell: (info) => formatCurrency(info.getValue()),
  }),
  columnHelper.accessor("stock", { header: "Stock" }),
  columnHelper.accessor("isActive", {
    header: "Status",
    cell: (info) => (
      <Badge variant={info.getValue() ? "success" : "secondary"}>
        {info.getValue() ? "Active" : "Inactive"}
      </Badge>
    ),
  }),
];

export default function ProductsPage() {
  const [data, setData] = useState<ProductRow[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const load = () => {
    fetch("/api/products?limit=50")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setData(json.data.items);
      });
  };

  useEffect(() => {
    load();
  }, []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <ModulePage
      title="Products"
      description="Manage product catalog, SKUs, barcodes, and pricing"
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Product List</CardTitle>
          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="border-b text-left text-zinc-500 dark:text-zinc-400">
                  {hg.headers.map((h) => (
                    <th key={h.id} className="pb-3 pr-4 font-medium">
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b border-zinc-100 dark:border-zinc-800">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="py-3 pr-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {data.length === 0 && (
            <p className="py-8 text-center text-zinc-500 dark:text-zinc-400">No products found. Run seed script.</p>
          )}
        </CardContent>
      </Card>

      <ProductFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={load}
      />
    </ModulePage>
  );
}
