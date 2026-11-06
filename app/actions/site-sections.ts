"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import type {
  EditableSection,
  LocalizedSectionOverrides,
} from "@/lib/content-translations";

const editableSectionSchema = z.enum([
  "hero",
  "about",
  "spec",
  "beforeAfter",
  "gallery",
  "appt",
  "contact",
  "footer",
  "brand",
  "nav",
  "chat",
  "base",
]);

const localizedOverridesSchema = z.object({
  en: z.record(z.string(), z.string().max(20_000)),
  bn: z.record(z.string(), z.string().max(20_000)),
});

const routeBySection: Record<EditableSection, string> = {
  hero: "hero",
  about: "about",
  spec: "services",
  beforeAfter: "before-after-text",
  gallery: "gallery-text",
  appt: "appointment",
  contact: "contact",
  footer: "footer",
  brand: "settings",
  nav: "settings",
  chat: "settings",
  base: "settings",
};

export async function saveSiteSection(
  sectionValue: string,
  contentValue: LocalizedSectionOverrides,
) {
  await requireAdmin();

  const sectionResult = editableSectionSchema.safeParse(sectionValue);
  const contentResult = localizedOverridesSchema.safeParse(contentValue);
  if (!sectionResult.success || !contentResult.success) {
    return { success: false, error: "Please review the section content and try again." };
  }

  const section = sectionResult.data;
  const content = contentResult.data;

  await db.siteSection.upsert({
    where: { key: section },
    create: { key: section, content, isPublished: true },
    update: { content, isPublished: true },
  });

  revalidatePath("/", "page");
  revalidatePath(`/admin/${routeBySection[section]}`);

  return { success: true };
}
