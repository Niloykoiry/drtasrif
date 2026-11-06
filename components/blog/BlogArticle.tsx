"use client";

import Link from "next/link";
import type { PublicBlog } from "@/lib/blog-content";
import { useI18n } from "@/lib/i18n";

export default function BlogArticle({ post }: { post: PublicBlog }) {
  const { lang } = useI18n();

  return (
    <article className="container-x max-w-4xl py-10 sm:py-16">
      <Link href="/blog" className="text-sm font-semibold text-teal-700 hover:text-teal-900">
        ← {lang === "bn" ? "সব প্রবন্ধ" : "All articles"}
      </Link>
      <header className="mt-8">
        <p className="text-xs font-medium text-slate-500">
          {post.author}
          {post.publishedAt &&
            ` · ${post.publishedAt.toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US")}`}
        </p>
        <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-navy sm:text-5xl">
          {post.title[lang]}
        </h1>
        {post.excerpt[lang] && (
          <p className="mt-5 text-lg leading-relaxed text-slate-600">
            {post.excerpt[lang]}
          </p>
        )}
      </header>
      {post.featuredImage && (
        <img
          src={post.featuredImage.url}
          alt={post.featuredImage.altText[lang] || post.title[lang]}
          className="mt-8 max-h-[34rem] w-full rounded-2xl object-cover"
        />
      )}
      <div
        className="prose prose-slate mt-10 max-w-none prose-headings:text-navy prose-a:text-teal-700"
        dangerouslySetInnerHTML={{ __html: post.bodyHtml[lang] }}
      />
      {post.tags.length > 0 && (
        <ul className="mt-10 flex flex-wrap gap-2 border-t border-slate-200 pt-6">
          {post.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600"
            >
              {tag}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
