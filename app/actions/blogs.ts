"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";

const localizedText = z.string().trim().max(20_000);
const languageContent = z.object({
  en: z.json(),
  bn: z.json(),
});
const inputSchema = z.object({
  id: z.string().optional(),
  slug: z.string().trim().max(180),
  title: z.object({ en: z.string().trim().min(1).max(300), bn: z.string().trim().min(1).max(300) }),
  excerpt: z.object({ en: localizedText, bn: localizedText }),
  body: languageContent,
  seo: z.object({
    en: z.object({
      title: z.string().max(300),
      description: z.string().max(1_000),
      canonicalUrl: z.string().max(2_000),
    }),
    bn: z.object({
      title: z.string().max(300),
      description: z.string().max(1_000),
      canonicalUrl: z.string().max(2_000),
    }),
  }),
  category: z.string().trim().max(100),
  author: z.string().trim().min(1).max(200),
  tags: z.array(z.string().trim().min(1).max(50)).max(20),
  featuredImageId: z.string().max(100),
  status: z.enum(["DRAFT", "PUBLISHED"]),
});

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 160);
}

async function uniqueSlug(value: string, id?: string) {
  const base = slugify(value) || "post";
  let slug = base;
  let suffix = 2;
  while (true) {
    const existing = await db.blogPost.findUnique({ where: { slug } });
    if (!existing || existing.id === id) return slug;
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
}

export async function saveBlog(input: unknown) {
  await requireAdmin();
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Review the required blog fields and try again." };
  }

  const value = parsed.data;
  for (const body of [value.body.en, value.body.bn]) {
    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body) ||
      !("type" in body) ||
      body.type !== "doc"
    ) {
      return { success: false, error: "Both language versions need valid article content." };
    }
  }
  for (const language of [value.seo.en, value.seo.bn]) {
    if (language.canonicalUrl) {
      try {
        const url = new URL(language.canonicalUrl);
        if (url.protocol !== "https:" && url.protocol !== "http:") {
          return { success: false, error: "Canonical URLs must use http or https." };
        }
      } catch {
        return { success: false, error: "Enter a valid canonical URL." };
      }
    }
  }

  const slug = await uniqueSlug(value.slug || value.title.en, value.id);
  let categoryId: string | null = null;
  if (value.category) {
    const categorySlug = slugify(value.category);
    if (!categorySlug) {
      return { success: false, error: "Enter a valid blog category." };
    }
    const category = await db.blogCategory.upsert({
      where: { slug: categorySlug },
      create: {
        slug: categorySlug,
        content: {
          en: { title: value.category },
          bn: { title: value.category },
        },
      },
      update: {},
      select: { id: true },
    });
    categoryId = category.id;
  }

  const featuredImageId = value.featuredImageId || null;
  if (featuredImageId) {
    const media = await db.media.findUnique({
      where: { id: featuredImageId },
      select: { id: true },
    });
    if (!media) return { success: false, error: "The selected image no longer exists." };
  }

  const existing = value.id
    ? await db.blogPost.findUnique({
        where: { id: value.id },
        select: { slug: true, publishedAt: true },
      })
    : null;
  if (value.id && !existing) return { success: false, error: "Blog post not found." };

  const publishedAt =
    value.status === "PUBLISHED" ? existing?.publishedAt ?? new Date() : null;
  const data = {
    slug,
    content: value.title,
    excerpt: value.excerpt,
    body: value.body,
    seo: value.seo,
    tags: value.tags,
    author: value.author,
    categoryId,
    featuredImageId,
    status: value.status,
    publishedAt,
  };
  const post = value.id
    ? await db.blogPost.update({ where: { id: value.id }, data })
    : await db.blogPost.create({ data });

  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath(`/blog/${post.slug}`);
  if (existing && existing.slug !== post.slug) {
    revalidatePath(`/blog/${existing.slug}`);
  }

  return { success: true, id: post.id, slug: post.slug };
}

export async function deleteBlog(id: string) {
  await requireAdmin();
  if (!id || id.length > 100) return { success: false, error: "Invalid blog post." };

  const post = await db.blogPost.findUnique({
    where: { id },
    select: { slug: true },
  });
  if (!post) return { success: false, error: "Blog post not found." };
  await db.blogPost.delete({ where: { id } });

  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath(`/blog/${post.slug}`);
  return { success: true };
}

export async function setBlogStatus(id: string, statusValue: string) {
  await requireAdmin();
  const status = z.enum(["DRAFT", "PUBLISHED"]).safeParse(statusValue);
  if (!id || id.length > 100 || !status.success) {
    return { success: false, error: "Invalid blog status change." };
  }

  const post = await db.blogPost.findUnique({
    where: { id },
    select: { slug: true, publishedAt: true },
  });
  if (!post) return { success: false, error: "Blog post not found." };

  await db.blogPost.update({
    where: { id },
    data: {
      status: status.data,
      publishedAt:
        status.data === "PUBLISHED" ? post.publishedAt ?? new Date() : null,
    },
  });

  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath(`/blog/${post.slug}`);
  return { success: true };
}
