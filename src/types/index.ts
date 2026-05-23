export type UserRole = "admin" | "manager" | "cashier" | "staff";

export type Permission =
  | "dashboard.view"
  | "pos.access"
  | "products.manage"
  | "inventory.manage"
  | "customers.manage"
  | "suppliers.manage"
  | "purchases.manage"
  | "sales.manage"
  | "expenses.manage"
  | "employees.manage"
  | "reports.view"
  | "settings.manage"
  | "branches.manage";

export interface CartItem {
  productId: string;
  name: string;
  sku: string;
  barcode?: string;
  price: number;
  quantity: number;
  discount: number;
  tax: number;
  image?: string;
  variantId?: string;
  variantName?: string;
}

export interface PaymentSplit {
  method: "cash" | "card" | "mobile" | "bank" | "credit";
  amount: number;
  reference?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
