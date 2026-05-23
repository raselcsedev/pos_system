import { DollarSign, ShoppingBag, TrendingUp, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface StatsCardsProps {
  today: { revenue: number; sales: number; avgOrder: number };
  week: { revenue: number; sales: number };
  lowStockCount: number;
}

export function StatsCards({ today, week, lowStockCount }: StatsCardsProps) {
  const stats = [
    {
      title: "Today's Revenue",
      value: formatCurrency(today.revenue),
      icon: DollarSign,
      change: `${today.sales} sales`,
    },
    {
      title: "Weekly Revenue",
      value: formatCurrency(week.revenue),
      icon: TrendingUp,
      change: `${week.sales} orders`,
    },
    {
      title: "Avg Order Value",
      value: formatCurrency(today.avgOrder),
      icon: ShoppingBag,
      change: "Today",
    },
    {
      title: "Low Stock Alerts",
      value: String(lowStockCount),
      icon: AlertTriangle,
      change: "Needs attention",
      alert: lowStockCount > 0,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-500">
                {stat.title}
              </CardTitle>
              <Icon
                className={`h-4 w-4 ${stat.alert ? "text-amber-500" : "text-zinc-400"}`}
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-zinc-500 mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
