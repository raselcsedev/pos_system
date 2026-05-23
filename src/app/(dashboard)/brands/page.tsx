import { ModulePage } from "@/components/shared/module-page";
import { BrandsPage } from "@/components/brands/brands-page";

export const metadata = { title: "Brands" };

export default function Page() {
  return (
    <ModulePage title="Brands" description="Brand management for products">
      <BrandsPage />
    </ModulePage>
  );
}
