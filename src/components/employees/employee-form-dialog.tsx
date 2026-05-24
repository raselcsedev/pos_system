"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { employeeCreateSchema, employeeUpdateSchema, type EmployeeCreateInput, type EmployeeUpdateInput } from "@/validations/employee.schema";

export interface EmployeeRecord {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "cashier" | "staff";
  phone?: string;
  isActive: boolean;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: EmployeeRecord | null;
  onSuccess: () => void;
}

export function EmployeeFormDialog({ open, onOpenChange, employee, onSuccess }: Props) {
  const isEdit = Boolean(employee);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeCreateInput | EmployeeUpdateInput>({
    resolver: zodResolver(isEdit ? employeeUpdateSchema : employeeCreateSchema) as any,
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "cashier",
      phone: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (employee) {
      reset({
        name: employee.name,
        email: employee.email,
        password: "",
        role: employee.role,
        phone: employee.phone ?? "",
        isActive: employee.isActive,
      });
    } else {
      reset({
        name: "",
        email: "",
        password: "",
        role: "cashier",
        phone: "",
        isActive: true,
      });
    }
  }, [employee, reset, open]);

  const onSubmit = async (data: EmployeeCreateInput | EmployeeUpdateInput) => {
    const url = isEdit ? `/api/employees/${employee!._id}` : "/api/employees";
    const method = isEdit ? "PUT" : "POST";
    const payload = isEdit
      ? {
          ...data,
          password: (data as EmployeeUpdateInput).password || undefined,
        }
      : data;

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await response.json();
    if (!json.success) {
      toast.error(json.error ?? "Failed to save employee");
      return;
    }

    toast.success(isEdit ? "Employee updated" : "Employee created");
    onOpenChange(false);
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Employee" : "Add Employee"}</DialogTitle>
          <DialogDescription>
            Manage user access, role, and active status for your team.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Name *</Label>
            <Input {...register("name")} />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Email *</Label>
            <Input type="email" {...register("email")} />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Role *</Label>
              <select
                {...register("role")}
                className="flex h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              >
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="cashier">Cashier</option>
                <option value="staff">Staff</option>
              </select>
              {errors.role && <p className="text-sm text-red-500">{errors.role.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input {...register("phone")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{isEdit ? "New Password" : "Password"} {isEdit ? "(leave blank to keep current)" : "*"}</Label>
            <Input type="password" {...register("password")} />
            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
          </div>
          <div className="flex items-center gap-3">
            <input id="isActive" type="checkbox" className="h-4 w-4 rounded border-zinc-300 text-emerald-600" {...register("isActive")} />
            <label htmlFor="isActive" className="text-sm text-zinc-700 dark:text-zinc-300">
              Active employee
            </label>
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
