import Link from "next/link";
import { db } from "@/lib/db";
import BlogList, { type AdminBlogListItem } from "@/components/admin/BlogList";

type SearchParams = {
  q?: string;
  status?: string;
  category?: string;
  page?: string;
};

function readTitle(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return "";
  const localized = (value as Record<string, unknown>).en;
  return typeof localized === "string" ? localized : "";
}

export default async function AdminBlogsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const status = ["DRAFT", "PUBLISHED"].includes(params.status ?? "")
    ? (params.status as "DRAFT" | "PUBLISHED")
    : undefined;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const pageSize = 20;
  const where = {
    ...(status ? { status } : {}),
    ...(params.category ? { categoryId: params.category } : {}),
    ...(query
      ? {
          OR: [
            { slug: { contains: query, mode: "insensitive" as const } },
            { tags: { has: query } },
          ],
        }
      : {}),
  };

  const [total, posts, categories] = await Promise.all([
    db.blogPost.count({ where }),
    db.blogPost.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { category: { select: { content: true } } },
    }),
    db.blogCategory.findMany({
      orderBy: { slug: "asc" },
      select: { id: true, slug: true },
    }),
  ]);
  const items: AdminBlogListItem[] = posts.map((post) => ({
    id: post.id,
    slug: post.slug,
    title: readTitle(post.content),
    category: readTitle(post.category?.content),
    status: post.status,
    updatedAt: post.updatedAt.toLocaleDateString(),
  }));
  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-teal-700">Publishing</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Blog posts
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {total} {total === 1 ? "post" : "posts"} · Drafts stay private.
          </p>
        </div>
        <Link
          href="/admin/blogs/create"
          className="rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
        >
          Create post
        </Link>
      </div>

      <form className="mt-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-4">
        <input
          name="q"
          defaultValue={query}
          placeholder="Search slug or tag"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm sm:col-span-2"
        />
        <select
          name="status"
          defaultValue={params.status ?? ""}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
        </select>
        <select
          name="category"
          defaultValue={params.category ?? ""}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.slug}
            </option>
          ))}
        </select>
        <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white sm:col-span-4 sm:justify-self-end">
          Apply filters
        </button>
      </form>

      <BlogList posts={items} />
      {pages > 1 && (
        <nav className="mt-4 flex items-center justify-between text-sm">
          <span className="text-slate-500">
            Page {page} of {pages}
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/admin/blogs?${new URLSearchParams({
                  q: query,
                  status: params.status ?? "",
                  category: params.category ?? "",
                  page: String(page - 1),
                })}`}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2"
              >
                Previous
              </Link>
            )}
            {page < pages && (
              <Link
                href={`/admin/blogs?${new URLSearchParams({
                  q: query,
                  status: params.status ?? "",
                  category: params.category ?? "",
                  page: String(page + 1),
                })}`}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2"
              >
                Next
              </Link>
            )}
          </div>
        </nav>
      )}
    </div>
  );
}
