"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";

const localizedGalleryFieldsSchema = z.object({
  title: z.string().trim().min(1).max(500),
  meta: z.string().trim().max(2_000),
  desc: z.string().trim().min(1).max(20_000),
  full: z.string().trim().min(1).max(20_000),
});

const saveSchema = z.object({
  id: z.string().max(100).optional(),
  content: z.object({
    en: localizedGalleryFieldsSchema,
    bn: localizedGalleryFieldsSchema,
  }),
  imageId: z.string().min(1).max(100),
  isPublished: z.boolean(),
  displayOrder: z.number().int().min(0).max(100_000),
});

export async function saveGalleryItem(input: unknown) {
  await requireAdmin();

  const parsed = saveSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Complete the required English and Bengali fields, add an image, and try again.",
    };
  }

  const item = parsed.data;
  const mediaExists = await db.media.findUnique({
    where: { id: item.imageId },
    select: { id: true },
  });
  if (!mediaExists) {
    return {
      success: false,
      error: "The uploaded image could not be found. Upload it again.",
    };
  }

  const data = {
    content: item.content,
    imageId: item.imageId,
    isPublished: item.isPublished,
    displayOrder: item.displayOrder,
  };

  if (item.id) {
    const existing = await db.galleryItem.findUnique({
      where: { id: item.id },
      select: { id: true },
    });
    if (!existing) return { success: false, error: "This gallery item no longer exists." };

    await db.galleryItem.update({ where: { id: item.id }, data });
  } else {
    await db.galleryItem.create({ data });
  }

  revalidatePath("/", "page");
  revalidatePath("/admin/gallery");
  return { success: true };
}

export async function deleteGalleryItem(id: string) {
  await requireAdmin();

  const parsedId = z.string().min(1).max(100).safeParse(id);
  if (!parsedId.success) return { success: false, error: "Invalid gallery item." };

  const existing = await db.galleryItem.findUnique({
    where: { id: parsedId.data },
    select: { id: true },
  });
  if (!existing) {
    return { success: false, error: "This gallery item no longer exists." };
  }

  await db.galleryItem.delete({ where: { id: parsedId.data } });
  revalidatePath("/", "page");
  revalidatePath("/admin/gallery");
  return { success: true };
}
