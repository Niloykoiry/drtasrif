import MediaLibrary from "@/components/admin/MediaLibrary";
import { db } from "@/lib/db";

export default async function AdminMediaPage() {
  const media = await db.media.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      url: true,
      publicId: true,
      fileName: true,
      altText: true,
    },
  });

  return (
    <MediaLibrary
      initialMedia={media.map((item) => ({
        ...item,
        altText:
          item.altText &&
          typeof item.altText === "object" &&
          !Array.isArray(item.altText)
            ? {
                en:
                  typeof item.altText.en === "string" ? item.altText.en : "",
                bn:
                  typeof item.altText.bn === "string" ? item.altText.bn : "",
              }
            : { en: "", bn: "" },
      }))}
    />
  );
}
