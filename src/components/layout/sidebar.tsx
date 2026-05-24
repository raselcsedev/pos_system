"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Warehouse,
  Users,
  Truck,
  ShoppingBag,
  Receipt,
  Wallet,
  UserCog,
  BarChart3,
  Settings,
  Bell,
  Building2,
  Tags,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pos", label: "POS", icon: ShoppingCart },
  { href: "/products", label: "Products", icon: Package },
  { href: "/categories", label: "Categories", icon: Tags },
  { href: "/brands", label: "Brands", icon: Award },
  { href: "/inventory", label: "Inventory", icon: Warehouse },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/suppliers", label: "Suppliers", icon: Truck },
  { href: "/purchases", label: "Purchases", icon: ShoppingBag },
  { href: "/sales", label: "Sales", icon: Receipt },
  { href: "/expenses", label: "Expenses", icon: Wallet },
  { href: "/employees", label: "Employees", icon: UserCog },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/branches", label: "Branches", icon: Building2 },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 bg-sky-50 shadow-sm shadow-sky-200/50 dark:bg-sky-950 dark:shadow-sky-950/40 lg:flex lg:flex-col">
      <div className="flex h-16 items-center px-6 shadow-sm shadow-sky-200/30 dark:shadow-sky-950/30">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg text-slate-900 dark:text-slate-100">
          <ShoppingCart className="h-6 w-6 text-sky-600" />
          <span>
            <span className="text-sky-700 dark:text-sky-300">Retail</span>
            <span className="text-slate-900 dark:text-slate-100">POS</span>
          </span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sky-200 text-sky-900 shadow-sm shadow-sky-200/30 dark:bg-sky-900 dark:text-sky-100 dark:shadow-sky-950/50"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100"
              )}
            >
              <Icon className={cn("h-4 w-4", active ? "text-sky-500" : "text-slate-400 dark:text-slate-500")} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
