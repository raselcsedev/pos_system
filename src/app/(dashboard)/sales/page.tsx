import { ModulePage } from "@/components/shared/module-page";
import { SalesPage } from "@/components/sales/sales-page";

export const metadata = { title: "Sales" };

export default function Page() {
  return (
    <ModulePage title="Sales" description="Sales history, returns, refunds, and invoices">
      <SalesPage />
    </ModulePage>
  );
}
