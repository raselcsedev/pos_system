import { ModulePage } from "@/components/shared/module-page";
import { ExpensesPage } from "@/components/expenses/expenses-page";

export const metadata = { title: "Expenses" };

export default function Page() {
  return (
    <ModulePage title="Expenses" description="Business expenses and monthly reports">
      <ExpensesPage />
    </ModulePage>
  );
}
