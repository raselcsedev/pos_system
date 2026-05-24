"use client";

import { useEffect, useState } from "react";
import { Plus, Edit3, Trash2 } from "lucide-react";
import { EmployeeFormDialog, type EmployeeRecord } from "@/components/employees/employee-form-dialog";
import { ModulePage } from "@/components/shared/module-page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";

export function EmployeesPage() {
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeRecord | null>(null);

  const loadEmployees = async (query = "") => {
    setIsLoading(true);
    try {
      const url = `/api/employees${query ? `?search=${encodeURIComponent(query)}` : ""}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setEmployees(json.data.items ?? []);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees(debouncedSearch);
  }, [debouncedSearch]);

  const openCreate = () => {
    setSelectedEmployee(null);
    setDialogOpen(true);
  };

  const openEdit = (employee: EmployeeRecord) => {
    setSelectedEmployee(employee);
    setDialogOpen(true);
  };

  const handleDelete = async (employee: EmployeeRecord) => {
    const confirmed = window.confirm(`Delete employee "${employee.name}"?`);
    if (!confirmed) return;

    const res = await fetch(`/api/employees/${employee._id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) {
      setEmployees((current) => current.filter((item) => item._id !== employee._id));
    }
  };

  return (
    <ModulePage title="Employees" description="Manage employee accounts, roles, and access.">
      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Employee Directory</CardTitle>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Add, edit, or deactivate team members and assign the right access role.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              placeholder="Search employees..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="max-w-sm"
            />
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-zinc-500 dark:text-zinc-400">
                <th className="pb-3 pr-4 font-medium">Name</th>
                <th className="pb-3 pr-4 font-medium">Email</th>
                <th className="pb-3 pr-4 font-medium">Role</th>
                <th className="pb-3 pr-4 font-medium">Phone</th>
                <th className="pb-3 pr-4 font-medium">Status</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee._id} className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="py-3 pr-4">{employee.name}</td>
                  <td className="py-3 pr-4 text-zinc-500 dark:text-zinc-400">{employee.email}</td>
                  <td className="py-3 pr-4 capitalize">{employee.role}</td>
                  <td className="py-3 pr-4">{employee.phone || "—"}</td>
                  <td className="py-3 pr-4">
                    <Badge variant={employee.isActive ? "success" : "secondary"}>
                      {employee.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="py-3 flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => openEdit(employee)}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="destructive" size="sm" onClick={() => handleDelete(employee)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!isLoading && employees.length === 0 && (
            <p className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
              No employees found. Add your first employee to get started.
            </p>
          )}
          {isLoading && (
            <p className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">Loading employees...</p>
          )}
        </CardContent>
      </Card>

      <EmployeeFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        employee={selectedEmployee}
        onSuccess={() => loadEmployees(debouncedSearch)}
      />
    </ModulePage>
  );
}
