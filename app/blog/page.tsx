import type { Metadata } from "next";
import BlogHeader from "@/components/blog/BlogHeader";
import BlogListing from "@/components/blog/BlogListing";
import { getPublishedBlogs } from "@/lib/blog-content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Articles & Updates | Dr. Tasrif Ahmed",
  description: "Articles on oral and facial health, surgery, and professional learning.",
};

export default async function BlogPage() {
  const posts = await getPublishedBlogs();

  return (
    <>
      <BlogHeader />
      <main>
        <BlogListing posts={posts} />
      </main>
    </>
  );
}
