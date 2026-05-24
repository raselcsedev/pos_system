import { ModulePage } from "@/components/shared/module-page";
import { PurchasesPage } from "@/components/purchases/purchases-page";

export const metadata = { title: "Purchases" };

export default function Page() {
  return (
    <ModulePage title="Purchases" description="Purchase orders, history, and returns">
      <PurchasesPage />
    </ModulePage>
  );
}
