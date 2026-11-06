import "server-only";

import { db } from "@/lib/db";
import {
  type EditableSection,
  type LocalizedSectionOverrides,
  type PublishedSectionOverrides,
} from "@/lib/content-translations";
import {
  parseCollectionContent,
  type CollectionContent,
} from "@/lib/cms-collections";

export type PublicService = {
  id: string;
  imageUrl: string | null;
  content: CollectionContent;
};

const editableSections: EditableSection[] = [
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
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function localizedOverrides(value: unknown): LocalizedSectionOverrides | null {
  if (!isRecord(value) || !isRecord(value.en) || !isRecord(value.bn)) return null;

  const getStrings = (record: Record<string, unknown>) =>
    Object.fromEntries(
      Object.entries(record).filter(
        (entry): entry is [string, string] => typeof entry[1] === "string",
      ),
    );

  return { en: getStrings(value.en), bn: getStrings(value.bn) };
}

export async function getPublishedSectionOverrides(): Promise<PublishedSectionOverrides> {
  if (!process.env.DATABASE_URL) return {};

  const rows = await db.siteSection.findMany({
    where: { isPublished: true, key: { in: editableSections } },
    select: { key: true, content: true },
  });

  return rows.reduce<PublishedSectionOverrides>((result, row) => {
    if (!editableSections.includes(row.key as EditableSection)) return result;

    const content = localizedOverrides(row.content);
    if (content) {
      result[row.key as EditableSection] = content;
    }
    return result;
  }, {});
}

export async function getPublishedServices(): Promise<PublicService[]> {
  if (!process.env.DATABASE_URL) return [];

  const rows = await db.service.findMany({
    where: { isPublished: true },
    orderBy: { displayOrder: "asc" },
    select: { id: true, imageUrl: true, content: true },
  });

  return rows.map((row) => ({
    id: row.id,
    imageUrl: row.imageUrl,
    content: parseCollectionContent(row.content),
  }));
}

export async function getPublishedBeforeAfterCases() {
  if (!process.env.DATABASE_URL) return undefined;

  const [rows, total] = await Promise.all([
    db.beforeAfterCase.findMany({
      where: { isPublished: true },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        content: true,
        beforeImage: { select: { url: true } },
        afterImage: { select: { url: true } },
      },
    }),
    db.beforeAfterCase.count(),
  ]);
  if (total === 0) return undefined;

  return rows.map((row) => {
    const record = isRecord(row.content) ? row.content : {};
    const en = isRecord(record.en) ? record.en : {};
    const bn = isRecord(record.bn) ? record.bn : {};
    const read = (language: Record<string, unknown>, key: string) =>
      typeof language[key] === "string" ? language[key] : "";

    return {
      id: row.id,
      title: { en: read(en, "title"), bn: read(bn, "title") },
      description: {
        en: read(en, "description"),
        bn: read(bn, "description"),
      },
      beforeImage: row.beforeImage.url,
      afterImage: row.afterImage.url,
    };
  });
}

export async function getPublishedGalleryItems() {
  if (!process.env.DATABASE_URL) return undefined;

  const [rows, total] = await Promise.all([
    db.galleryItem.findMany({
      where: { isPublished: true },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        content: true,
        image: { select: { url: true } },
      },
    }),
    db.galleryItem.count(),
  ]);
  if (total === 0) return undefined;

  const readLocalizedFields = (value: unknown) => {
    const record = isRecord(value) ? value : {};
    const read = (key: string) =>
      typeof record[key] === "string" ? record[key] : "";
    return {
      title: read("title"),
      meta: read("meta"),
      desc: read("desc"),
      full: read("full"),
    };
  };

  return rows.map((row) => {
    const content = isRecord(row.content) ? row.content : {};
    const en = readLocalizedFields(content.en);
    const bn = readLocalizedFields(content.bn);
    return {
      id: row.id,
      title: { en: en.title, bn: bn.title },
      meta: { en: en.meta, bn: bn.meta },
      desc: { en: en.desc, bn: bn.desc },
      full: { en: en.full, bn: bn.full },
      imageUrl: row.image.url,
    };
  });
}
