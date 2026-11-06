"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { saveBlog } from "@/app/actions/blogs";
import RichTextEditor from "@/components/admin/RichTextEditor";
import type { JSONContent } from "@tiptap/core";

export type AdminBlogDraft = {
  id?: string;
  slug: string;
  title: { en: string; bn: string };
  excerpt: { en: string; bn: string };
  body: { en: JSONContent; bn: JSONContent };
  seo: {
    en: { title: string; description: string; canonicalUrl: string };
    bn: { title: string; description: string; canonicalUrl: string };
  };
  category: string;
  author: string;
  tags: string[];
  featuredImageId: string;
  status: "DRAFT" | "PUBLISHED";
};

const emptyDocument: JSONContent = { type: "doc", content: [{ type: "paragraph" }] };

export default function BlogForm({
  initialValue,
  categories,
  media,
}: {
  initialValue?: AdminBlogDraft;
  categories: string[];
  media: { id: string; url: string; fileName: string }[];
}) {
  const [value, setValue] = useState<AdminBlogDraft>(
    initialValue ?? {
      slug: "",
      title: { en: "", bn: "" },
      excerpt: { en: "", bn: "" },
      body: { en: emptyDocument, bn: emptyDocument },
      seo: {
        en: { title: "", description: "", canonicalUrl: "" },
        bn: { title: "", description: "", canonicalUrl: "" },
      },
      category: "",
      author: "Dr. Tasrif Ahmed",
      tags: [],
      featuredImageId: "",
      status: "DRAFT",
    },
  );
  const [tagsText, setTagsText] = useState(value.tags.join(", "));
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  function updateTitle(language: "en" | "bn", title: string) {
    setValue((current) => ({ ...current, title: { ...current.title, [language]: title } }));
  }

  function updateExcerpt(language: "en" | "bn", excerpt: string) {
    setValue((current) => ({
      ...current,
      excerpt: { ...current.excerpt, [language]: excerpt },
    }));
  }

  function updateSeo(
    language: "en" | "bn",
    field: "title" | "description" | "canonicalUrl",
    text: string,
  ) {
    setValue((current) => ({
      ...current,
      seo: {
        ...current.seo,
        [language]: { ...current.seo[language], [field]: text },
      },
    }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const result = await saveBlog({
        ...value,
        tags: tagsText
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      });
      if (!result.success) {
        setMessage(result.error || "Could not save this post.");
      } else {
        router.push(`/admin/blogs/${result.id}/edit`);
        router.refresh();
      }
    } catch (error) {
      console.error("Could not save blog post", error);
      setMessage("Could not save this post. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-teal-700">Blog</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            {value.id ? "Edit blog post" : "Create blog post"}
          </h1>
        </div>
        <label className="text-xs font-medium text-slate-600">
          Status
          <select
            value={value.status}
            onChange={(event) =>
              setValue((current) => ({
                ...current,
                status: event.target.value as AdminBlogDraft["status"],
              }))
            }
            className="ml-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </select>
        </label>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-slate-800">Content</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {(["en", "bn"] as const).map((language) => (
            <div key={language} className="space-y-4">
              <h3 className="text-xs font-semibold text-teal-800">
                {language === "en" ? "English" : "বাংলা"}
              </h3>
              <label className="block text-xs font-medium text-slate-600">
                Title
                <input
                  required
                  maxLength={300}
                  value={value.title[language]}
                  onChange={(event) => updateTitle(language, event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-800"
                />
              </label>
              <label className="block text-xs font-medium text-slate-600">
                Excerpt
                <textarea
                  value={value.excerpt[language]}
                  maxLength={20_000}
                  rows={3}
                  onChange={(event) => updateExcerpt(language, event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-800"
                />
              </label>
              <RichTextEditor
                label="Article content"
                content={value.body[language]}
                onChange={(body) =>
                  setValue((current) => ({
                    ...current,
                    body: { ...current.body, [language]: body },
                  }))
                }
              />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-slate-800">Post details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-xs font-medium text-slate-600">
            URL slug
            <input
              value={value.slug}
              onChange={(event) => setValue((current) => ({ ...current, slug: event.target.value }))}
              placeholder="Generated from the English title"
              maxLength={180}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-800"
            />
          </label>
          <label className="text-xs font-medium text-slate-600">
            Author
            <input
              required
              value={value.author}
              onChange={(event) => setValue((current) => ({ ...current, author: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-800"
            />
          </label>
          <label className="text-xs font-medium text-slate-600">
            Category
            <input
              list="blog-categories"
              value={value.category}
              onChange={(event) => setValue((current) => ({ ...current, category: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-800"
            />
            <datalist id="blog-categories">
              {categories.map((category) => <option key={category} value={category} />)}
            </datalist>
          </label>
          <label className="text-xs font-medium text-slate-600">
            Tags
            <input
              value={tagsText}
              onChange={(event) => setTagsText(event.target.value)}
              placeholder="Separate tags with commas"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-800"
            />
          </label>
          <label className="text-xs font-medium text-slate-600 sm:col-span-2">
            Featured image
            <select
              value={value.featuredImageId}
              onChange={(event) =>
                setValue((current) => ({ ...current, featuredImageId: event.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-800"
            >
              <option value="">No featured image</option>
              {media.map((image) => (
                <option key={image.id} value={image.id}>
                  {image.fileName}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-slate-800">SEO</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {(["en", "bn"] as const).map((language) => (
            <div key={language} className="space-y-3">
              <h3 className="text-xs font-semibold text-teal-800">
                {language === "en" ? "English" : "বাংলা"}
              </h3>
              {(["title", "description", "canonicalUrl"] as const).map((field) => (
                <label key={field} className="block text-xs font-medium text-slate-600">
                  {field === "canonicalUrl" ? "Canonical URL" : `SEO ${field}`}
                  <input
                    type={field === "canonicalUrl" ? "url" : "text"}
                    value={value.seo[language][field]}
                    onChange={(event) => updateSeo(language, field, event.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal text-slate-800"
                  />
                </label>
              ))}
            </div>
          ))}
        </div>
      </section>

      <div className="sticky bottom-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur">
        <p role="status" className="text-sm text-red-700">{message}</p>
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
        >
          {saving ? "Saving…" : value.status === "PUBLISHED" ? "Publish post" : "Save draft"}
        </button>
      </div>
    </form>
  );
}
