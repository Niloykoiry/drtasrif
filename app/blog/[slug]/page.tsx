import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogArticle from "@/components/blog/BlogArticle";
import BlogHeader from "@/components/blog/BlogHeader";
import { getPublishedBlogBySlug } from "@/lib/blog-content";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedBlogBySlug(slug);
  if (!post) return { title: "Article not found" };

  const title = post.seo.en.title || post.title.en;
  const description = post.seo.en.description || post.excerpt.en;
  const canonical = post.seo.en.canonicalUrl || `/blog/${post.slug}`;
  const image = post.featuredImage?.url;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title,
      description,
      url: canonical,
      images: image ? [{ url: image }] : undefined,
      publishedTime: post.publishedAt?.toISOString(),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublishedBlogBySlug(slug);
  if (!post) notFound();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title.en,
    description: post.seo.en.description || post.excerpt.en,
    datePublished: post.publishedAt?.toISOString(),
    author: { "@type": "Person", name: post.author },
    image: post.featuredImage?.url,
    mainEntityOfPage: `/blog/${post.slug}`,
  };

  return (
    <>
      <BlogHeader />
      <main>
        <BlogArticle post={post} />
      </main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
    </>
  );
}
