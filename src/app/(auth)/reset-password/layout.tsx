import { Suspense } from "react";

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>{children}</Suspense>;
}
