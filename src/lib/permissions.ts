import type { Permission, UserRole } from "@/types";

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    "dashboard.view",
    "pos.access",
    "products.manage",
    "inventory.manage",
    "customers.manage",
    "suppliers.manage",
    "purchases.manage",
    "sales.manage",
    "expenses.manage",
    "employees.manage",
    "reports.view",
    "settings.manage",
    "branches.manage",
  ],
  manager: [
    "dashboard.view",
    "pos.access",
    "products.manage",
    "inventory.manage",
    "customers.manage",
    "suppliers.manage",
    "purchases.manage",
    "sales.manage",
    "expenses.manage",
    "reports.view",
  ],
  cashier: ["dashboard.view", "pos.access", "customers.manage", "sales.manage"],
  staff: ["dashboard.view", "pos.access", "inventory.manage"],
};

export function getPermissionsForRole(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function hasPermission(
  role: UserRole,
  permission: Permission,
  customPermissions?: Permission[]
): boolean {
  const perms = new Set([
    ...getPermissionsForRole(role),
    ...(customPermissions ?? []),
  ]);
  return perms.has(permission);
}

export const ROUTE_PERMISSIONS: Record<string, Permission> = {
  "/dashboard": "dashboard.view",
  "/pos": "pos.access",
  "/products": "products.manage",
  "/categories": "products.manage",
  "/brands": "products.manage",
  "/inventory": "inventory.manage",
  "/customers": "customers.manage",
  "/suppliers": "suppliers.manage",
  "/purchases": "purchases.manage",
  "/sales": "sales.manage",
  "/expenses": "expenses.manage",
  "/employees": "employees.manage",
  "/reports": "reports.view",
  "/settings": "settings.manage",
  "/branches": "branches.manage",
};
