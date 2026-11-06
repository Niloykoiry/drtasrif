import "server-only";

import { generateHTML } from "@tiptap/html";
import { type JSONContent } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import sanitizeHtml from "sanitize-html";
import { db } from "@/lib/db";

export type PublicBlog = {
  id: string;
  slug: string;
  title: { en: string; bn: string };
  excerpt: { en: string; bn: string };
  bodyHtml: { en: string; bn: string };
  author: string;
  tags: string[];
  publishedAt: Date | null;
  featuredImage: { url: string; altText: { en: string; bn: string } } | null;
  seo: {
    en: { title: string; description: string; canonicalUrl: string };
    bn: { title: string; description: string; canonicalUrl: string };
  };
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function localizedString(value: unknown, language: "en" | "bn") {
  if (!isRecord(value)) return "";
  const text = value[language];
  return typeof text === "string" ? text : "";
}

function localizedSeo(value: unknown, language: "en" | "bn") {
  if (!isRecord(value) || !isRecord(value[language])) {
    return { title: "", description: "", canonicalUrl: "" };
  }
  const localized = value[language];
  return {
    title: typeof localized.title === "string" ? localized.title : "",
    description:
      typeof localized.description === "string" ? localized.description : "",
    canonicalUrl:
      typeof localized.canonicalUrl === "string" ? localized.canonicalUrl : "",
  };
}

function isJsonContent(value: unknown): value is JSONContent {
  if (!isRecord(value) || typeof value.type !== "string") return false;
  if (
    value.content !== undefined &&
    (!Array.isArray(value.content) || !value.content.every(isJsonContent))
  ) {
    return false;
  }
  if (value.text !== undefined && typeof value.text !== "string") return false;
  return true;
}

function renderBody(value: unknown, language: "en" | "bn") {
  if (!isRecord(value) || !isJsonContent(value[language])) {
    throw new Error(`The ${language} blog body is not valid structured content.`);
  }
  const html = generateHTML(value[language], [
    StarterKit,
    Link.configure({ openOnClick: false }),
  ]);
  return sanitizeHtml(html, {
    allowedTags: [
      ...sanitizeHtml.defaults.allowedTags,
      "h1",
      "h2",
      "h3",
      "img",
    ],
    allowedAttributes: {
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "width", "height"],
      "*": ["class"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        rel: "noopener noreferrer",
        target: "_blank",
      }),
    },
  });
}

export function toPublicBlog(post: {
  id: string;
  slug: string;
  content: unknown;
  excerpt: unknown;
  body: unknown;
  seo: unknown;
  author: string;
  tags: string[];
  publishedAt: Date | null;
  featuredImage: { url: string; altText: unknown } | null;
}): PublicBlog {
  return {
    id: post.id,
    slug: post.slug,
    title: {
      en: localizedString(post.content, "en"),
      bn: localizedString(post.content, "bn"),
    },
    excerpt: {
      en: localizedString(post.excerpt, "en"),
      bn: localizedString(post.excerpt, "bn"),
    },
    bodyHtml: {
      en: renderBody(post.body, "en"),
      bn: renderBody(post.body, "bn"),
    },
    author: post.author,
    tags: post.tags,
    publishedAt: post.publishedAt,
    featuredImage: post.featuredImage
      ? {
          url: post.featuredImage.url,
          altText: {
            en: localizedString(post.featuredImage.altText, "en"),
            bn: localizedString(post.featuredImage.altText, "bn"),
          },
        }
      : null,
    seo: {
      en: localizedSeo(post.seo, "en"),
      bn: localizedSeo(post.seo, "bn"),
    },
  };
}

export async function getPublishedBlogBySlug(slug: string) {
  if (!process.env.DATABASE_URL) return null;
  const post = await db.blogPost.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: { featuredImage: { select: { url: true, altText: true } } },
  });
  return post ? toPublicBlog(post) : null;
}

export async function getPublishedBlogs(take = 20, skip = 0) {
  if (!process.env.DATABASE_URL) return [];
  const posts = await db.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take,
    skip,
    include: { featuredImage: { select: { url: true, altText: true } } },
  });
  return posts.map(toPublicBlog);
}
