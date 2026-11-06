"use client";

import Link from "next/link";
import LangToggle from "@/components/LangToggle";

export default function BlogHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="container-x flex h-16 items-center justify-between">
        <Link href="/" className="text-sm font-bold text-navy">
          Dr. Tasrif Ahmed
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/blog" className="text-sm font-semibold text-slate-600 hover:text-teal-700">
            Blog
          </Link>
          <LangToggle />
        </div>
      </div>
    </header>
  );
}
