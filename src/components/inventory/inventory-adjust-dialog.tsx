"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
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

const adjustSchema = z.object({
  productId: z.string(),
  quantity: z.number(),
  type: z.enum(["adjustment", "damage", "return", "transfer"]),
  notes: z.string().optional(),
});

type InventoryAdjustInput = z.infer<typeof adjustSchema>;

export interface InventoryAdjustDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
  onSuccess: () => void;
}

export function InventoryAdjustDialog({
  open,
  onOpenChange,
  productId,
  productName,
  onSuccess,
}: InventoryAdjustDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InventoryAdjustInput>({
    resolver: zodResolver(adjustSchema),
    defaultValues: {
      productId,
      quantity: 0,
      type: "adjustment",
      notes: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        productId,
        quantity: 0,
        type: "adjustment",
        notes: "",
      });
    }
  }, [open, productId, reset]);

  const onSubmit = async (values: InventoryAdjustInput) => {
    try {
      const res = await fetch("/api/inventory/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error ?? "Failed to adjust stock");
        return;
      }
      toast.success("Inventory updated");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast.error("Failed to adjust stock");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust inventory for {productName}</DialogTitle>
          <DialogDescription>
            Enter the stock change and reason for this adjustment.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input type="hidden" {...register("productId")} />
          <div className="space-y-2">
            <Label>Quantity</Label>
            <Input type="number" step="1" {...register("quantity", { valueAsNumber: true })} />
            {errors.quantity && (
              <p className="text-sm text-red-500">{errors.quantity.message}</p>
            )}
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Use a negative value to remove stock or positive value to add stock.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <select className="flex h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50" {...register("type")}> 
              <option value="adjustment">Adjustment</option>
              <option value="damage">Damage</option>
              <option value="return">Return</option>
              <option value="transfer">Transfer</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <textarea
              className="flex min-h-24 w-full resize-none rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
              {...register("notes")}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save adjustment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
