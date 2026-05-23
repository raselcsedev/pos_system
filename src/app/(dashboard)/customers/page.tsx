"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { ModulePage } from "@/components/shared/module-page";
import {
  CustomerFormDialog,
  type CustomerRecord,
} from "@/components/customers/customer-form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CustomerRecord | null>(null);

  const load = useCallback(() => {
    const q = search ? `?search=${encodeURIComponent(search)}` : "";
    fetch(`/api/customers${q}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setCustomers(json.data.items);
      });
  }, [search]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const handleDelete = async (id: string) => {
    if (!confirm("Deactivate this customer?")) return;
    const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) {
      toast.success("Customer deactivated");
      load();
    } else {
      toast.error(json.error);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (c: CustomerRecord) => {
    setEditing(c);
    setDialogOpen(true);
  };

  return (
    <ModulePage title="Customers" description="Customer profiles, loyalty points, and due balances">
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Customer List</CardTitle>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                placeholder="Search..."
                className="pl-9 w-48"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={openCreate}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-zinc-500">
                <th className="pb-3 pr-4">Name</th>
                <th className="pb-3 pr-4">Contact</th>
                <th className="pb-3 pr-4">Loyalty</th>
                <th className="pb-3 pr-4">Due</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c._id} className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="py-3 pr-4 font-medium">{c.name}</td>
                  <td className="py-3 pr-4 text-zinc-500">
                    {c.email ?? "—"}
                    {c.phone && <span className="block text-xs">{c.phone}</span>}
                  </td>
                  <td className="py-3 pr-4">{c.loyaltyPoints} pts</td>
                  <td className="py-3 pr-4">{formatCurrency(c.dueBalance)}</td>
                  <td className="py-3 pr-4">
                    <Badge variant={c.isActive ? "success" : "secondary"}>
                      {c.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="py-3">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(c)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(c._id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {customers.length === 0 && (
            <p className="py-8 text-center text-zinc-500">No customers yet. Add one to get started.</p>
          )}
        </CardContent>
      </Card>

      <CustomerFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        customer={editing}
        onSuccess={load}
      />
    </ModulePage>
  );
}
