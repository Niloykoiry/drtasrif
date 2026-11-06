export type CollectionName =
  | "services"
  | "achievements"
  | "publications"
  | "faq"
  | "testimonials";

export type CollectionContent = {
  en: {
    title: string;
    description: string;
    detail: string;
    fieldOne: string;
    fieldTwo: string;
    url: string;
  };
  bn: {
    title: string;
    description: string;
    detail: string;
    fieldOne: string;
    fieldTwo: string;
    url: string;
  };
};

export type CollectionItem = {
  id: string;
  content: CollectionContent;
  imageUrl: string;
  isPublished: boolean;
  displayOrder: number;
  date: string;
};

export const collectionTitles: Record<CollectionName, string> = {
  services: "Services",
  achievements: "Achievements",
  publications: "Publications",
  faq: "FAQs",
  testimonials: "Testimonials",
};

export const collectionFieldLabels: Record<
  CollectionName,
  Partial<Record<keyof CollectionContent["en"], string>>
> = {
  services: {
    title: "Service title",
    description: "Short description",
    detail: "Detailed content",
    fieldOne: "Icon name",
    fieldTwo: "Image alt text",
  },
  achievements: {
    title: "Achievement title",
    description: "Description",
    fieldOne: "Year or date",
  },
  publications: {
    title: "Publication title",
    description: "Description",
    detail: "Authors",
    fieldOne: "Journal",
    fieldTwo: "Publication date",
    url: "External URL",
  },
  faq: {
    title: "Question",
    description: "Answer",
  },
  testimonials: {
    title: "Name",
    description: "Testimonial",
    detail: "Designation or relationship",
  },
};

export function parseCollectionContent(value: unknown): CollectionContent {
  const isRecord = (item: unknown): item is Record<string, unknown> =>
    item !== null && typeof item === "object" && !Array.isArray(item);
  const language = (item: unknown) => (isRecord(item) ? item : {});
  const read = (item: Record<string, unknown>, key: string) =>
    typeof item[key] === "string" ? item[key] : "";
  const record = language(value);
  const en = language(record.en);
  const bn = language(record.bn);

  return {
    en: {
      title: read(en, "title"),
      description: read(en, "description"),
      detail: read(en, "detail"),
      fieldOne: read(en, "fieldOne"),
      fieldTwo: read(en, "fieldTwo"),
      url: read(en, "url"),
    },
    bn: {
      title: read(bn, "title"),
      description: read(bn, "description"),
      detail: read(bn, "detail"),
      fieldOne: read(bn, "fieldOne"),
      fieldTwo: read(bn, "fieldTwo"),
      url: read(bn, "url"),
    },
  };
}
