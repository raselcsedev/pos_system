"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { expenseSchema, type ExpenseInput } from "@/validations/expense.schema";

export interface ExpenseRecord {
  _id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  description?: string;
  branchId?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: ExpenseRecord | null;
  onSuccess: () => void;
}

export function ExpenseFormDialog({ open, onOpenChange, expense, onSuccess }: Props) {
  const isEdit = Boolean(expense);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseInput>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      title: "",
      category: "",
      amount: 0,
      date: new Date().toISOString().slice(0, 10),
      description: "",
      branchId: "",
    },
  });

  useEffect(() => {
    if (expense) {
      reset({
        title: expense.title,
        category: expense.category,
        amount: expense.amount,
        date: expense.date ? expense.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
        description: expense.description ?? "",
        branchId: expense.branchId ?? "",
      });
    } else {
      reset({
        title: "",
        category: "",
        amount: 0,
        date: new Date().toISOString().slice(0, 10),
        description: "",
        branchId: "",
      });
    }
  }, [expense, reset, open]);

  const onSubmit = async (data: ExpenseInput) => {
    const url = isEdit ? `/api/expenses/${expense!._id}` : "/api/expenses";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();

    if (!json.success) {
      toast.error(json.error ?? "Failed to save expense");
      return;
    }

    toast.success(isEdit ? "Expense updated" : "Expense created");
    onOpenChange(false);
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Expense" : "Add Expense"}</DialogTitle>
          <DialogDescription>
            Track business expenses and keep the ledger up to date.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input {...register("title")} />
            {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Category *</Label>
            <Input {...register("category")} />
            {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Amount *</Label>
              <Input type="number" step="0.01" {...register("amount", { valueAsNumber: true })} />
              {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" {...register("date")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <textarea
              className="h-24 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
              {...register("description")}
            />
          </div>
          <div className="space-y-2">
            <Label>Branch ID</Label>
            <Input {...register("branchId")} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : isEdit ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
