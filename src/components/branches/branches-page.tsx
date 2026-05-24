"use client";

import { useEffect, useState } from "react";
import { Plus, Edit3, Trash2 } from "lucide-react";
import { BranchFormDialog, type BranchRecord } from "@/components/branches/branch-form-dialog";
import { ModulePage } from "@/components/shared/module-page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";

export function BranchesPage() {
  const [branches, setBranches] = useState<BranchRecord[]>([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<BranchRecord | null>(null);

  const loadBranches = async (query = "") => {
    setIsLoading(true);
    try {
      const url = `/api/branches${query ? `?search=${encodeURIComponent(query)}` : ""}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setBranches(json.data.items ?? []);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBranches(debouncedSearch);
  }, [debouncedSearch]);

  const openCreate = () => {
    setSelectedBranch(null);
    setDialogOpen(true);
  };

  const openEdit = (branch: BranchRecord) => {
    setSelectedBranch(branch);
    setDialogOpen(true);
  };

  const handleDelete = async (branch: BranchRecord) => {
    const confirmed = window.confirm(`Delete branch "${branch.name}"?`);
    if (!confirmed) return;

    const res = await fetch(`/api/branches/${branch._id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) {
      setBranches((current) => current.filter((item) => item._id !== branch._id));
    }
  };

  return (
    <ModulePage title="Branches" description="Manage store branches and contact details.">
      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Branch Directory</CardTitle>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Create, edit, and deactivate branches for your multi-location store.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              placeholder="Search branches..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="max-w-sm"
            />
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Branch
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-zinc-500 dark:text-zinc-400">
                <th className="pb-3 pr-4 font-medium">Name</th>
                <th className="pb-3 pr-4 font-medium">Code</th>
                <th className="pb-3 pr-4 font-medium">Phone</th>
                <th className="pb-3 pr-4 font-medium">Email</th>
                <th className="pb-3 pr-4 font-medium">Status</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {branches.map((branch) => (
                <tr key={branch._id} className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="py-3 pr-4">{branch.name}</td>
                  <td className="py-3 pr-4 text-zinc-500 dark:text-zinc-400">{branch.code}</td>
                  <td className="py-3 pr-4">{branch.phone || "—"}</td>
                  <td className="py-3 pr-4">{branch.email || "—"}</td>
                  <td className="py-3 pr-4">
                    <Badge variant={branch.isActive ? "success" : "secondary"}>
                      {branch.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="py-3 flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => openEdit(branch)}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="destructive" size="sm" onClick={() => handleDelete(branch)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!isLoading && branches.length === 0 && (
            <p className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
              No branches found. Add a branch to get started.
            </p>
          )}
          {isLoading && (
            <p className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">Loading branches...</p>
          )}
        </CardContent>
      </Card>

      <BranchFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        branch={selectedBranch}
        onSuccess={() => loadBranches(debouncedSearch)}
      />
    </ModulePage>
  );
}
