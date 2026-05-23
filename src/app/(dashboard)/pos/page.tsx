import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PosScreen } from "@/components/pos/pos-screen";

export const metadata = { title: "POS" };

export default function PosPage() {
  return (
    <DashboardShell title="Point of Sale">
      <PosScreen />
    </DashboardShell>
  );
}
