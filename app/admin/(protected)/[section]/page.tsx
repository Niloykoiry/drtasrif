import { notFound } from "next/navigation";
import BeforeAfterManager from "@/components/admin/BeforeAfterManager";
import CollectionManager from "@/components/admin/CollectionManager";
import GalleryManager, {
  type AdminGalleryItem,
} from "@/components/admin/GalleryManager";
import type { UploadedMedia } from "@/components/admin/ImageUploader";
import SectionEditor from "@/components/admin/SectionEditor";
import {
  collectionTitles,
  parseCollectionContent,
  type CollectionItem,
  type CollectionName,
} from "@/lib/cms-collections";
import type {
  EditableSection,
  LocalizedSectionOverrides,
} from "@/lib/content-translations";
import { db } from "@/lib/db";

const pages: Record<
  string,
  { section: EditableSection; title: string }
> = {
  hero: { section: "hero", title: "Hero section" },
  about: { section: "about", title: "About section" },
  services: { section: "spec", title: "Services and specializations" },
  "before-after-text": {
    section: "beforeAfter",
    title: "Before & After section text",
  },
  "gallery-text": { section: "gallery", title: "Gallery section text" },
  appointment: { section: "appt", title: "Appointments" },
  contact: { section: "contact", title: "Contact details" },
  footer: { section: "footer", title: "Footer" },
  settings: { section: "brand", title: "Website settings" },
};

const collectionNames: CollectionName[] = [
  "services",
  "achievements",
  "publications",
  "faq",
  "testimonials",
];

function parseSavedValues(value: unknown): LocalizedSectionOverrides | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;

  const toStringMap = (item: unknown) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return null;
    return Object.fromEntries(
      Object.entries(item).filter(
        (entry): entry is [string, string] => typeof entry[1] === "string",
      ),
    );
  };

  const en = toStringMap(record.en);
  const bn = toStringMap(record.bn);
  return en && bn ? { en, bn } : null;
}

function parseGalleryContent(value: unknown): AdminGalleryItem["content"] {
  const record =
    value !== null && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  const parseLanguage = (language: unknown) => {
    const fields =
      language !== null && typeof language === "object" && !Array.isArray(language)
        ? (language as Record<string, unknown>)
        : {};
    const read = (key: string) =>
      typeof fields[key] === "string" ? fields[key] : "";
    return {
      title: read("title"),
      meta: read("meta"),
      desc: read("desc"),
      full: read("full"),
    };
  };
  return { en: parseLanguage(record.en), bn: parseLanguage(record.bn) };
}

async function getCollectionItems(
  collection: CollectionName,
): Promise<CollectionItem[]> {
  if (collection === "services") {
    const items = await db.service.findMany({
      orderBy: { displayOrder: "asc" },
      take: 200,
    });
    return items.map((item) => ({
      id: item.id,
      content: parseCollectionContent(item.content),
      imageUrl: item.imageUrl ?? "",
      isPublished: item.isPublished,
      displayOrder: item.displayOrder,
      date: "",
    }));
  }
  if (collection === "achievements") {
    const items = await db.achievement.findMany({
      orderBy: { displayOrder: "asc" },
      take: 200,
    });
    return items.map((item) => ({
      id: item.id,
      content: parseCollectionContent(item.content),
      imageUrl: item.imageUrl ?? "",
      isPublished: item.isPublished,
      displayOrder: item.displayOrder,
      date: item.achievedAt?.toISOString().slice(0, 10) ?? "",
    }));
  }
  if (collection === "publications") {
    const items = await db.publication.findMany({
      orderBy: { displayOrder: "asc" },
      take: 200,
    });
    return items.map((item) => ({
      id: item.id,
      content: parseCollectionContent(item.content),
      imageUrl: item.imageUrl ?? "",
      isPublished: item.isPublished,
      displayOrder: item.displayOrder,
      date: item.publishedAt?.toISOString().slice(0, 10) ?? "",
    }));
  }
  if (collection === "faq") {
    const items = await db.fAQ.findMany({
      orderBy: { displayOrder: "asc" },
      take: 200,
    });
    return items.map((item) => ({
      id: item.id,
      content: parseCollectionContent(item.content),
      imageUrl: "",
      isPublished: item.isPublished,
      displayOrder: item.displayOrder,
      date: "",
    }));
  }

  const items = await db.testimonial.findMany({
    orderBy: { displayOrder: "asc" },
    take: 200,
  });
  return items.map((item) => ({
    id: item.id,
    content: parseCollectionContent(item.content),
    imageUrl: item.imageUrl ?? "",
    isPublished: item.isPublished,
    displayOrder: item.displayOrder,
    date: "",
  }));
}

export default async function AdminSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section: routeSection } = await params;
  if (routeSection === "before-after") {
    const items = await db.beforeAfterCase.findMany({
      orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
      take: 200,
      include: { beforeImage: true, afterImage: true },
    });

    const toUploadedMedia = (
      media: (typeof items)[number]["beforeImage"],
    ): UploadedMedia => ({
      id: media.id,
      url: media.url,
      publicId: media.publicId,
      fileName: media.fileName,
      altText: { en: "", bn: "" },
    });

    return (
      <BeforeAfterManager
        initialItems={items.map((item) => {
          const content = item.content as {
            en?: { title?: string; description?: string };
            bn?: { title?: string; description?: string };
          };
          return {
            id: item.id,
            content: {
              en: {
                title: content.en?.title ?? "",
                description: content.en?.description ?? "",
              },
              bn: {
                title: content.bn?.title ?? "",
                description: content.bn?.description ?? "",
              },
            },
            beforeImage: toUploadedMedia(item.beforeImage),
            afterImage: toUploadedMedia(item.afterImage),
            isPublished: item.isPublished,
            displayOrder: item.displayOrder,
          };
        })}
      />
    );
  }

  if (routeSection === "gallery") {
    const items = await db.galleryItem.findMany({
      orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
      take: 200,
      include: { image: true },
    });

    return (
      <GalleryManager
        initialItems={items.map((item) => ({
          id: item.id,
          content: parseGalleryContent(item.content),
          image: {
            id: item.image.id,
            url: item.image.url,
            publicId: item.image.publicId,
            fileName: item.image.fileName,
            altText: { en: "", bn: "" },
          },
          isPublished: item.isPublished,
          displayOrder: item.displayOrder,
        }))}
      />
    );
  }

  if (collectionNames.includes(routeSection as CollectionName)) {
    const collection = routeSection as CollectionName;
    return (
      <CollectionManager
        collection={collection}
        title={collectionTitles[collection]}
        initialItems={await getCollectionItems(collection)}
      />
    );
  }

  const page = pages[routeSection];
  if (!page) notFound();

  const saved = await db.siteSection.findUnique({
    where: { key: page.section },
    select: { content: true },
  });

  return (
    <SectionEditor
      section={page.section}
      title={page.title}
      savedValues={parseSavedValues(saved?.content)}
      excludePaths={
        routeSection === "before-after-text"
          ? ["cases"]
          : routeSection === "gallery-text"
            ? ["items"]
            : undefined
      }
    />
  );
}
