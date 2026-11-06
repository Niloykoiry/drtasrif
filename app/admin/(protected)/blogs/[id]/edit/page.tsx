import { notFound } from "next/navigation";
import { type JSONContent } from "@tiptap/core";
import BlogForm, { type AdminBlogDraft } from "@/components/admin/BlogForm";
import { db } from "@/lib/db";

const emptyDocument: JSONContent = { type: "doc", content: [{ type: "paragraph" }] };

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function readLocalizedText(value: unknown, language: "en" | "bn") {
  if (!isRecord(value)) return "";
  const text = value[language];
  return typeof text === "string" ? text : "";
}

function readDocument(value: unknown, language: "en" | "bn"): JSONContent {
  if (!isRecord(value) || !isRecord(value[language])) return emptyDocument;
  const document = value[language];
  return typeof document.type === "string"
    ? (document as JSONContent)
    : emptyDocument;
}

function readSeo(value: unknown, language: "en" | "bn") {
  const seo = isRecord(value) && isRecord(value[language]) ? value[language] : {};
  return {
    title: typeof seo.title === "string" ? seo.title : "",
    description: typeof seo.description === "string" ? seo.description : "",
    canonicalUrl: typeof seo.canonicalUrl === "string" ? seo.canonicalUrl : "",
  };
}

export default async function EditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [post, categories, media] = await Promise.all([
    db.blogPost.findUnique({
      where: { id },
      include: { category: { select: { slug: true } } },
    }),
    db.blogCategory.findMany({ orderBy: { slug: "asc" }, select: { slug: true } }),
    db.media.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      select: { id: true, url: true, fileName: true },
    }),
  ]);

  if (!post) notFound();

  const initialValue: AdminBlogDraft = {
    id: post.id,
    slug: post.slug,
    title: {
      en: readLocalizedText(post.content, "en"),
      bn: readLocalizedText(post.content, "bn"),
    },
    excerpt: {
      en: readLocalizedText(post.excerpt, "en"),
      bn: readLocalizedText(post.excerpt, "bn"),
    },
    body: {
      en: readDocument(post.body, "en"),
      bn: readDocument(post.body, "bn"),
    },
    seo: { en: readSeo(post.seo, "en"), bn: readSeo(post.seo, "bn") },
    category: post.category?.slug ?? "",
    author: post.author,
    tags: post.tags,
    featuredImageId: post.featuredImageId ?? "",
    status: post.status,
  };

  return (
    <BlogForm
      initialValue={initialValue}
      categories={categories.map((category) => category.slug)}
      media={media}
    />
  );
}
