import { ModulePage } from "@/components/shared/module-page";

export const metadata = { title: "Inventory" };

export default function InventoryPage() {
  return (
    <ModulePage
      title="Inventory"
      description="Stock tracking, adjustments, transfers, and warehouse management"
    />
  );
}
