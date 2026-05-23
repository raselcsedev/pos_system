import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { connectDB } from "@/lib/db";
import { DashboardService } from "@/services/dashboard.service";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard" };

const dashboardService = new DashboardService();

export default async function DashboardPage() {
  await connectDB();
  const overview = await dashboardService.getOverview();
  const chart = await dashboardService.getSalesChart(7);

  return (
    <DashboardShell title="Dashboard">
      <div className="space-y-6">
        <StatsCards
          today={overview.today}
          week={overview.week}
          lowStockCount={overview.lowStockAlerts.length}
        />

        <div className="grid gap-6 lg:grid-cols-3">
          <SalesChart data={chart} />
          <RecentTransactions
            transactions={overview.recentTransactions as never[]}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {overview.topProducts.map(
                  (p: { _id: unknown; name: string; quantity: number; revenue: number }) => (
                    <div key={String(p._id)} className="flex justify-between text-sm">
                      <span>{p.name}</span>
                      <span className="font-medium">
                        {p.quantity} sold · {formatCurrency(p.revenue)}
                      </span>
                    </div>
                  )
                )}
                {overview.topProducts.length === 0 && (
                  <p className="text-sm text-zinc-500">No sales data yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Low Stock Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {overview.lowStockAlerts.map((p) => (
                    <div
                      key={String(p._id)}
                      className="flex justify-between rounded-lg bg-amber-50 p-2 text-sm dark:bg-amber-950"
                    >
                      <span>{p.name}</span>
                      <span className="font-medium text-amber-600">
                        {p.stock} left
                      </span>
                    </div>
                ))}
                {overview.lowStockAlerts.length === 0 && (
                  <p className="text-sm text-zinc-500">All stock levels OK</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
