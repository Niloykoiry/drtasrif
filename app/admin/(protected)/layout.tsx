import AdminShell from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const admin = await requireAdmin();

  return <AdminShell email={admin.email}>{children}</AdminShell>;
}
