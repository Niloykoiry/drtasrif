import BlogForm from "@/components/admin/BlogForm";
import { db } from "@/lib/db";

export default async function CreateBlogPage() {
  const [categories, media] = await Promise.all([
    db.blogCategory.findMany({ orderBy: { slug: "asc" }, select: { slug: true } }),
    db.media.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      select: { id: true, url: true, fileName: true },
    }),
  ]);

  return (
    <BlogForm
      categories={categories.map((category) => category.slug)}
      media={media}
    />
  );
}
