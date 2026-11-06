import Link from "next/link";
import {
  ArrowUpRight,
  CircleHelp,
  FileImage,
  FileText,
  LayoutDashboard,
  BriefcaseMedical,
} from "lucide-react";
import { db } from "@/lib/db";

export default async function AdminDashboardPage() {
  const [
    totalBlogs,
    publishedBlogs,
    draftBlogs,
    totalFaqs,
    totalServices,
    totalMedia,
    recentBlogs,
  ] = await Promise.all([
    db.blogPost.count(),
    db.blogPost.count({ where: { status: "PUBLISHED" } }),
    db.blogPost.count({ where: { status: "DRAFT" } }),
    db.fAQ.count(),
    db.service.count(),
    db.media.count(),
    db.blogPost.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { id: true, slug: true, content: true, status: true, updatedAt: true },
    }),
  ]);

  const metrics = [
    { label: "Total blog posts", value: totalBlogs, icon: FileText },
    { label: "Published posts", value: publishedBlogs, icon: LayoutDashboard },
    { label: "Draft posts", value: draftBlogs, icon: FileText },
    { label: "FAQs", value: totalFaqs, icon: CircleHelp },
    { label: "Services", value: totalServices, icon: BriefcaseMedical },
    { label: "Media assets", value: totalMedia, icon: FileImage },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-teal-700">Dashboard</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            A live overview of the portfolio content.
          </p>
        </div>
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-teal-300 hover:text-teal-800"
        >
          View website
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <section
        aria-label="Content metrics"
        className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        {metrics.map(({ label, value, icon: Icon }) => (
          <article
            key={label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">{label}</p>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-5 text-3xl font-bold tracking-tight text-slate-900">
              {value}
            </p>
          </article>
        ))}
      </section>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="font-semibold text-slate-900">Recently updated blogs</h2>
            <p className="mt-1 text-xs text-slate-500">Latest saved content</p>
          </div>
          <Link
            href="/admin/blogs"
            className="text-sm font-semibold text-teal-700 hover:text-teal-900"
          >
            Manage blogs
          </Link>
        </div>
        {recentBlogs.length ? (
          <ul className="divide-y divide-slate-100">
            {recentBlogs.map((post) => {
              const content = post.content as { en?: { title?: string } };
              return (
                <li
                  key={post.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {content.en?.title || post.slug}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Updated {post.updatedAt.toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      post.status === "PUBLISHED"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {post.status === "PUBLISHED" ? "Published" : "Draft"}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="px-5 py-12 text-center">
            <p className="text-sm font-medium text-slate-700">No blog posts yet</p>
            <p className="mt-1 text-xs text-slate-500">
              Create a post when you are ready to publish.
            </p>
            <Link
              href="/admin/blogs/create"
              className="mt-4 inline-flex rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
            >
              Create blog post
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
