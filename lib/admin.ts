import "server-only";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getAuth } from "@/lib/auth/server";

export async function getCurrentAdmin() {
  const { data: session, error } = await getAuth().getSession();
  if (error) throw error;

  const sessionEmail = session?.user?.email?.trim().toLowerCase();
  const configuredEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  if (!sessionEmail || !configuredEmail || sessionEmail !== configuredEmail) return null;

  const admin = await db.adminUser.findUnique({
    where: { email: configuredEmail },
  });

  return admin?.isActive ? admin : null;
}

export async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  return admin;
}
