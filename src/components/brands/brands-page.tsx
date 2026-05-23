"use client";

import { useEffect, useState } from "react";
import { Plus, Edit3, Trash2 } from "lucide-react";
import { BrandFormDialog, type BrandRecord } from "@/components/brands/brand-form-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function BrandsPage() {
  const [brands, setBrands] = useState<BrandRecord[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<BrandRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/brands");
      const json = await res.json();
      if (json.success) {
        setBrands(json.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const openCreate = () => {
    setSelectedBrand(null);
    setDialogOpen(true);
  };

  const openEdit = (brand: BrandRecord) => {
    setSelectedBrand(brand);
    setDialogOpen(true);
  };

  const handleDelete = async (brand: BrandRecord) => {
    const confirmed = window.confirm(`Delete brand "${brand.name}"? This cannot be undone.`);
    if (!confirmed) return;
    const res = await fetch(`/api/brands/${brand._id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) {
      setBrands((current) => current.filter((item) => item._id !== brand._id));
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Brand Directory</CardTitle>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Manage the brands available for your products.
            </p>
          </div>
          <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Brand
          </Button>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-zinc-500 dark:text-zinc-400">
                <th className="pb-3 pr-4 font-medium">Brand</th>
                <th className="pb-3 pr-4 font-medium">Slug</th>
                <th className="pb-3 pr-4 font-medium">Status</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {brands.map((brand) => (
                <tr key={brand._id} className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="py-3 pr-4">{brand.name}</td>
                  <td className="py-3 pr-4 text-zinc-500 dark:text-zinc-400">{brand.slug}</td>
                  <td className="py-3 pr-4">
                    <Badge variant={brand.isActive ? "success" : "secondary"}>
                      {brand.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="py-3 flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => openEdit(brand)}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="destructive" size="sm" onClick={() => handleDelete(brand)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!isLoading && brands.length === 0 && (
            <p className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
              No brands found. Add a brand to get started.
            </p>
          )}
          {isLoading && (
            <p className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">Loading brands...</p>
          )}
        </CardContent>
      </Card>

      <BrandFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        brand={selectedBrand}
        onSuccess={loadBrands}
      />
    </div>
  );
}
