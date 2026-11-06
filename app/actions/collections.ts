"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import type { CollectionName } from "@/lib/cms-collections";

const localizedFieldsSchema = z.object({
  title: z.string().trim().min(1).max(500),
  description: z.string().max(20_000),
  detail: z.string().max(20_000),
  fieldOne: z.string().max(500),
  fieldTwo: z.string().max(500),
  url: z.string().max(2_000),
});

const inputSchema = z.object({
  collection: z.enum([
    "services",
    "achievements",
    "publications",
    "faq",
    "testimonials",
  ]),
  id: z.string().optional(),
  content: z.object({
    en: localizedFieldsSchema,
    bn: localizedFieldsSchema,
  }),
  imageUrl: z.string().url().or(z.literal("")),
  isPublished: z.boolean(),
  displayOrder: z.number().int().min(0).max(100_000),
  date: z.string().max(40),
});

function makeSlug(value: string) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}

async function serviceSlug(title: string, id?: string) {
  const base = makeSlug(title) || "service";
  let slug = base;
  let suffix = 2;

  while (true) {
    const existing = await db.service.findUnique({ where: { slug } });
    if (!existing || existing.id === id) return slug;
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
}

export async function saveCollectionItem(input: unknown) {
  await requireAdmin();
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Please check the required fields and try again." };
  }

  const item = parsed.data;
  if (item.collection === "publications") {
    for (const language of [item.content.en, item.content.bn]) {
      if (language.url) {
        const validUrl = z.string().url().safeParse(language.url);
        if (!validUrl.success || !["http:", "https:"].includes(new URL(language.url).protocol)) {
          return { success: false, error: "Publication links must use http or https." };
        }
      }
    }
  }

  const content = item.content;
  const imageUrl = item.imageUrl || null;
  const displayOrder = item.displayOrder;
  const isPublished = item.isPublished;
  const date = item.date ? new Date(item.date) : null;
  if (date && Number.isNaN(date.getTime())) {
    return { success: false, error: "Enter a valid date." };
  }

  await saveByCollection(item.collection, {
    id: item.id,
    content,
    imageUrl,
    displayOrder,
    isPublished,
    date,
  });

  revalidatePath("/");
  revalidatePath(`/admin/${item.collection === "faq" ? "faq" : item.collection}`);
  return { success: true };
}

async function saveByCollection(
  collection: CollectionName,
  data: {
    id?: string;
    content: z.infer<typeof inputSchema>["content"];
    imageUrl: string | null;
    displayOrder: number;
    isPublished: boolean;
    date: Date | null;
  },
) {
  const { id, content, imageUrl, displayOrder, isPublished, date } = data;

  if (collection === "services") {
    const slug = await serviceSlug(content.en.title, id);
    const values = {
      slug,
      content,
      imageUrl,
      isPublished,
      displayOrder,
    };
    if (id) await db.service.update({ where: { id }, data: values });
    else await db.service.create({ data: values });
    return;
  }

  if (collection === "achievements") {
    const values = {
      content,
      imageUrl,
      isPublished,
      displayOrder,
      achievedAt: date,
    };
    if (id) await db.achievement.update({ where: { id }, data: values });
    else await db.achievement.create({ data: values });
    return;
  }

  if (collection === "publications") {
    const values = {
      content,
      imageUrl,
      isPublished,
      displayOrder,
      publishedAt: date,
    };
    if (id) await db.publication.update({ where: { id }, data: values });
    else await db.publication.create({ data: values });
    return;
  }

  if (collection === "faq") {
    const values = { content, isPublished, displayOrder };
    if (id) await db.fAQ.update({ where: { id }, data: values });
    else await db.fAQ.create({ data: values });
    return;
  }

  const values = { content, imageUrl, isPublished, displayOrder };
  if (id) await db.testimonial.update({ where: { id }, data: values });
  else await db.testimonial.create({ data: values });
}

export async function deleteCollectionItem(
  collectionValue: string,
  id: string,
) {
  await requireAdmin();
  const collection = z
    .enum(["services", "achievements", "publications", "faq", "testimonials"])
    .safeParse(collectionValue);
  if (!collection.success || !id || id.length > 100) {
    return { success: false, error: "Invalid item." };
  }

  switch (collection.data) {
    case "services":
      await db.service.delete({ where: { id } });
      break;
    case "achievements":
      await db.achievement.delete({ where: { id } });
      break;
    case "publications":
      await db.publication.delete({ where: { id } });
      break;
    case "faq":
      await db.fAQ.delete({ where: { id } });
      break;
    case "testimonials":
      await db.testimonial.delete({ where: { id } });
      break;
  }

  revalidatePath("/");
  revalidatePath(`/admin/${collection.data}`);
  return { success: true };
}
