import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

interface Transaction {
  _id: string;
  invoiceNumber: string;
  total: number;
  createdAt: string;
  cashierId?: { name?: string };
}

export function RecentTransactions({ transactions }: { transactions: Transaction[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {transactions.length === 0 && (
            <p className="text-sm text-zinc-500">No transactions yet</p>
          )}
          {transactions.map((tx) => (
            <div
              key={tx._id}
              className="flex items-center justify-between rounded-lg border border-zinc-100 p-3 dark:border-zinc-800"
            >
              <div>
                <p className="text-sm font-medium">{tx.invoiceNumber}</p>
                <p className="text-xs text-zinc-500">
                  {new Date(tx.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-emerald-600">
                  {formatCurrency(tx.total)}
                </p>
                <Badge variant="secondary" className="text-xs">
                  {tx.cashierId?.name ?? "Staff"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
