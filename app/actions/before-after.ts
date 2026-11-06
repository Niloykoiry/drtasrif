"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";

const localizedCaseSchema = z.object({
  en: z.object({
    title: z.string().trim().min(1).max(500),
    description: z.string().trim().min(1).max(20_000),
  }),
  bn: z.object({
    title: z.string().trim().min(1).max(500),
    description: z.string().trim().min(1).max(20_000),
  }),
});

const saveSchema = z.object({
  id: z.string().max(100).optional(),
  content: localizedCaseSchema,
  beforeImageId: z.string().min(1).max(100),
  afterImageId: z.string().min(1).max(100),
  isPublished: z.boolean(),
  displayOrder: z.number().int().min(0).max(100_000),
});

export async function saveBeforeAfterCase(input: unknown) {
  await requireAdmin();

  const parsed = saveSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Complete both languages, upload both images, and try again." };
  }

  const item = parsed.data;
  const imageIds = [...new Set([item.beforeImageId, item.afterImageId])];
  const imageCount = await db.media.count({
    where: { id: { in: imageIds } },
  });
  if (imageCount !== imageIds.length) {
    return { success: false, error: "One or both uploaded images could not be found. Upload them again." };
  }

  const data = {
    content: item.content,
    beforeImageId: item.beforeImageId,
    afterImageId: item.afterImageId,
    isPublished: item.isPublished,
    displayOrder: item.displayOrder,
  };

  if (item.id) {
    const existing = await db.beforeAfterCase.findUnique({
      where: { id: item.id },
      select: { id: true },
    });
    if (!existing) return { success: false, error: "This case no longer exists." };

    await db.beforeAfterCase.update({ where: { id: item.id }, data });
  } else {
    await db.beforeAfterCase.create({ data });
  }

  revalidatePath("/", "page");
  revalidatePath("/admin/before-after");
  return { success: true };
}

export async function deleteBeforeAfterCase(id: string) {
  await requireAdmin();

  const parsedId = z.string().min(1).max(100).safeParse(id);
  if (!parsedId.success) return { success: false, error: "Invalid case." };

  const existing = await db.beforeAfterCase.findUnique({
    where: { id: parsedId.data },
    select: { id: true },
  });
  if (!existing) return { success: false, error: "This case no longer exists." };

  await db.beforeAfterCase.delete({ where: { id: parsedId.data } });
  revalidatePath("/", "page");
  revalidatePath("/admin/before-after");
  return { success: true };
}
