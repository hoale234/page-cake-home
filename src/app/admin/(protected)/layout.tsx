import type { ReactNode } from "react";
import { Suspense } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth/require-admin";

async function ProtectedAdminContent({
  children,
}: {
  children: ReactNode;
}) {
  await requireAdmin();
  return <AdminShell>{children}</AdminShell>;
}

export default function ProtectedAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Suspense
      fallback={<div className="min-h-screen animate-pulse bg-cream" />}
    >
      <ProtectedAdminContent>{children}</ProtectedAdminContent>
    </Suspense>
  );
}
