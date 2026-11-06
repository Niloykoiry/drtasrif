"use client";

import Link from "next/link";
import { useState } from "react";
import { deleteBlog, setBlogStatus } from "@/app/actions/blogs";

export type AdminBlogListItem = {
  id: string;
  slug: string;
  title: string;
  category: string;
  status: "DRAFT" | "PUBLISHED";
  updatedAt: string;
};

export default function BlogList({
  posts,
}: {
  posts: AdminBlogListItem[];
}) {
  const [items, setItems] = useState(posts);
  const [message, setMessage] = useState("");

  async function toggle(post: AdminBlogListItem) {
    const status = post.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    const result = await setBlogStatus(post.id, status);
    if (!result.success) {
      setMessage(result.error || "Could not update this post.");
      return;
    }
    setItems((current) =>
      current.map((item) =>
        item.id === post.id ? { ...item, status } : item,
      ),
    );
    setMessage(`Post ${status === "PUBLISHED" ? "published" : "unpublished"}.`);
  }

  async function remove(post: AdminBlogListItem) {
    if (!window.confirm(`Delete “${post.title}”? This cannot be undone.`)) {
      return;
    }
    const result = await deleteBlog(post.id);
    if (!result.success) {
      setMessage(result.error || "Could not delete this post.");
      return;
    }
    setItems((current) => current.filter((item) => item.id !== post.id));
    setMessage("Blog post deleted.");
  }

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {message && (
        <p role="status" className="border-b border-slate-100 px-5 py-3 text-sm text-slate-600">
          {message}
        </p>
      )}
      {items.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Updated</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((post) => (
                <tr key={post.id}>
                  <td className="px-5 py-4">
                    <Link
                      href={`/admin/blogs/${post.id}/edit`}
                      className="font-semibold text-slate-800 hover:text-teal-800"
                    >
                      {post.title || post.slug}
                    </Link>
                    <p className="mt-1 text-xs text-slate-500">/{post.slug}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{post.category || "—"}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        post.status === "PUBLISHED"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {post.status === "PUBLISHED" ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-500">{post.updatedAt}</td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => void toggle(post)}
                        className="text-xs font-semibold text-teal-700 hover:text-teal-900"
                      >
                        {post.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void remove(post)}
                        className="text-xs font-semibold text-red-700 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="px-5 py-14 text-center">
          <p className="text-sm font-semibold text-slate-700">No blog posts found</p>
          <p className="mt-1 text-xs text-slate-500">
            Create a post or adjust your search filters.
          </p>
        </div>
      )}
    </div>
  );
}
