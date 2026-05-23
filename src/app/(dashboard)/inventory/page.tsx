import { ModulePage } from "@/components/shared/module-page";
import { InventoryPage } from "@/components/inventory/inventory-page";

export const metadata = { title: "Inventory" };

export default function Page() {
  return (
    <ModulePage
      title="Inventory"
      description="Stock tracking, adjustments, transfers, and warehouse management"
    >
      <InventoryPage />
    </ModulePage>
  );
}
