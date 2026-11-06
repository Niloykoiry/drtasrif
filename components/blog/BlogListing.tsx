"use client";

import Link from "next/link";
import type { PublicBlog } from "@/lib/blog-content";
import { useI18n } from "@/lib/i18n";

export default function BlogListing({ posts }: { posts: PublicBlog[] }) {
  const { lang } = useI18n();

  return (
    <>
      <section className="bg-gradient-to-br from-sky-50 via-white to-teal-50 py-16">
        <div className="container-x">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
            Dr. Tasrif Ahmed
          </p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
            {lang === "bn" ? "প্রবন্ধ ও আপডেট" : "Articles & Updates"}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
            {lang === "bn"
              ? "মুখ ও চোয়ালের স্বাস্থ্য, সার্জারি এবং পেশাগত শিক্ষার বিষয়ে লেখা।"
              : "Writing on oral and facial health, surgery, and professional learning."}
          </p>
        </div>
      </section>
      <section className="container-x py-12">
        {posts.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                {post.featuredImage && (
                  <img
                    src={post.featuredImage.url}
                    alt={post.featuredImage.altText[lang] || post.title[lang]}
                    className="aspect-[16/10] w-full object-cover"
                  />
                )}
                <div className="p-5">
                  <p className="text-xs text-slate-500">
                    {post.publishedAt?.toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US")}
                  </p>
                  <h2 className="mt-2 text-lg font-bold leading-snug text-navy">
                    {post.title[lang]}
                  </h2>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">
                    {post.excerpt[lang]}
                  </p>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="mt-4 inline-flex text-sm font-semibold text-teal-700 hover:text-teal-900"
                  >
                    {lang === "bn" ? "প্রবন্ধ পড়ুন" : "Read article"}
                    <span className="sr-only">: {post.title[lang]}</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-slate-300 py-14 text-center text-sm text-slate-500">
            {lang === "bn"
              ? "এখনো কোনো প্রবন্ধ প্রকাশিত হয়নি।"
              : "No articles have been published yet."}
          </p>
        )}
      </section>
    </>
  );
}
