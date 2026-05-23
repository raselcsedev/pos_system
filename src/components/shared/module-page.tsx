import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ModulePageProps {
  title: string;
  description: string;
  children?: React.ReactNode;
}

export function ModulePage({ title, description, children }: ModulePageProps) {
  return (
    <DashboardShell title={title}>
      {children ?? (
        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-500">
              Full CRUD interface connected to MongoDB APIs. Extend this page with
              TanStack Table, React Hook Form, and server actions as needed.
            </p>
          </CardContent>
        </Card>
      )}
    </DashboardShell>
  );
}
