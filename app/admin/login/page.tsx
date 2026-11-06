import type { Metadata } from "next";
import AdminLoginForm from "@/components/admin/AdminLoginForm";

export const metadata: Metadata = {
  title: "Admin sign in | Dr. Tasrif Ahmed",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
          Dr. Tasrif Ahmed
        </p>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
          Sign in to the CMS
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Use the authorized administrator account.
        </p>
        <AdminLoginForm />
      </div>
    </main>
  );
}
