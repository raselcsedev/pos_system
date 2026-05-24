"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Search, RefreshCcw, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ExpenseFormDialog, type ExpenseRecord } from "@/components/expenses/expense-form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

interface ApiExpenseRecord extends ExpenseRecord {
  createdBy?: { name?: string } | null;
}

export function ExpensesPage() {
  const [expenses, setExpenses] = useState<ApiExpenseRecord[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ApiExpenseRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchExpenses = useCallback(async (searchTerm = search) => {
    setIsLoading(true);
    try {
      const query = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : "";
      const res = await fetch(`/api/expenses${query}`);
      const json = await res.json();
      if (json.success) {
        setExpenses(json.data.items ?? []);
      }
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  const loadExpenses = useCallback(() => fetchExpenses(search), [fetchExpenses, search]);

  useEffect(() => {
    const timeout = setTimeout(() => fetchExpenses(search), 250);
    return () => clearTimeout(timeout);
  }, [fetchExpenses, search]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this expense?")) return;

    const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!json.success) {
      toast.error(json.error ?? "Failed to delete expense");
      return;
    }

    toast.success("Expense deleted");
    fetchExpenses(search);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Expenses</CardTitle>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                placeholder="Search expenses..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="secondary" size="sm" className="flex items-center gap-2" onClick={loadExpenses}>
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </Button>
            <Button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700" size="sm" onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}>
              <Plus className="h-4 w-4" />
              Add Expense
            </Button>
          </div>
        </CardHeader>

        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-zinc-500 dark:text-zinc-400">
                <th className="pb-3 pr-4">Title</th>
                <th className="pb-3 pr-4">Category</th>
                <th className="pb-3 pr-4">Amount</th>
                <th className="pb-3 pr-4">Date</th>
                <th className="pb-3 pr-4">Created By</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense._id} className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="py-3 pr-4 font-medium">{expense.title}</td>
                  <td className="py-3 pr-4">{expense.category}</td>
                  <td className="py-3 pr-4">{formatCurrency(expense.amount)}</td>
                  <td className="py-3 pr-4">{new Date(expense.date).toLocaleDateString()}</td>
                  <td className="py-3 pr-4">{expense.createdBy?.name ?? "—"}</td>
                  <td className="py-3">
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditing(expense);
                          setDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(expense._id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {isLoading ? (
            <p className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
              Loading expenses...
            </p>
          ) : expenses.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
              No expenses recorded yet.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <ExpenseFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        expense={editing}
        onSuccess={loadExpenses}
      />
    </>
  );
}
