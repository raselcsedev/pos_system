"use client";

import { useEffect, useState } from "react";
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { ModulePage } from "@/components/shared/module-page";
import { CategoryFormDialog } from "@/components/categories/category-form-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CategoryRow {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

const columnHelper = createColumnHelper<CategoryRow>();

const columns = [
  columnHelper.accessor("name", { header: "Name" }),
  columnHelper.accessor("slug", { header: "Slug" }),
  columnHelper.accessor("isActive", {
    header: "Status",
    cell: (info) => (
      <Badge variant={info.getValue() ? "success" : "secondary"}>
        {info.getValue() ? "Active" : "Inactive"}
      </Badge>
    ),
  }),
];

export function CategoriesPage() {
  const [data, setData] = useState<CategoryRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const load = () => {
    setIsLoading(true);
    fetch("/api/categories")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setData(json.data ?? []);
        }
      })
      .finally(() => setIsLoading(false));
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
    <ModulePage title="Categories" description="Manage product categories from the dashboard">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Category List</CardTitle>
          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Category
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
          {isLoading ? (
            <p className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">Loading categories...</p>
          ) : data.length === 0 ? (
            <p className="py-8 text-center text-zinc-500 dark:text-zinc-400">No categories found. Add one to get started.</p>
          ) : null}
        </CardContent>
      </Card>

      <CategoryFormDialog open={dialogOpen} onOpenChange={setDialogOpen} onSuccess={load} />
    </ModulePage>
  );
}
