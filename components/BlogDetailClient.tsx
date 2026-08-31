// components/BlogDetailClient.tsx

import React from "react";
import Link from "next/link";
import { PortableText } from "@portabletext/react";

import RelatedNews from "@/components/RelatedNews";
import ShareButton from "@/components/ShareButton";

// ============================================================================
// TYPES
// ============================================================================

export interface ArticleData {
  id?: string;
  title?: string | { current?: string };
  slug?: string;

  category?: string | { current?: string };

  publishedAt?: string;
  updatedAt?: string;
  timeAgo?: string;

  authorName?: string;

  excerpt?: string;

  imageUrl?: string;

  alt?: string | { current?: string };
  caption?: string | { current?: string };

  content?: any[];
}

export interface RelatedArticleData {
  id?: string;
  title?: string;
  slug?: string;
  imageUrl?: string;
  publishedAt?: string;
  updatedAt?: string;
  category?: string;
}

interface BlogDetailClientProps {
  slug: string;
  article: ArticleData;
  allNews?: RelatedArticleData[];
}

// ============================================================================
// HELPERS
// ============================================================================

function renderSafeString(
  value: unknown,
  fallback = ""
): string {
  if (!value) {
    return fallback;
  }

  if (typeof value === "string") {
    return value;
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "current" in value
  ) {
    const current = (
      value as {
        current?: unknown;
      }
    ).current;

    if (
      typeof current === "string"
    ) {
      return current;
    }
  }

  return fallback;
}

function formatArticleDate(
  publishedAt?: string,
  fallback?: string
): string {
  if (!publishedAt) {
    return (
      fallback ||
      "Artikel Terbaru"
    );
  }

  const date =
    new Date(publishedAt);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return (
      fallback ||
      "Artikel Terbaru"
    );
  }

  return date.toLocaleDateString(
    "id-ID",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
}

// ============================================================================
// PORTABLE TEXT
// ============================================================================
//
// `any` sengaja dipertahankan untuk kompatibilitas dengan versi
// @portabletext/react yang sekarang terpasang di project.
//
// ============================================================================

const portableTextComponents: any = {
  // ==========================================================================
  // IMAGE
  // ==========================================================================

  types: {
    image: ({
      value,
    }: any) => {
      const imageUrl =
        value?.asset?.url;

      if (!imageUrl) {
        return null;
      }

      const altText =
        typeof value?.alt ===
          "string" &&
        value.alt.trim()
          ? value.alt.trim()
          : "Gambar artikel islami.or.id";

      const caption =
        typeof value?.caption ===
        "string"
          ? value.caption.trim()
          : "";

      return (
        <figure className="my-7 w-full space-y-2">
          <div className="aspect-[16/9] overflow-hidden border border-slate-200 bg-slate-50 shadow-sm">
            <img
              src={imageUrl}
              alt={altText}
              width={800}
              height={450}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </div>

          {caption && (
            <figcaption className="px-2 text-center text-xs font-medium italic leading-relaxed text-slate-500 sm:text-sm">
              {caption}
            </figcaption>
          )}
        </figure>
      );
    },
  },

  // ==========================================================================
  // MARKS
  // ==========================================================================

  marks: {
    link: ({
      children,
      value,
    }: any) => {
      const href =
        typeof value?.href ===
          "string" &&
        value.href.trim()
          ? value.href.trim()
          : "#";

      const isInternal =
        href.startsWith("/") ||
        href.startsWith(
          "https://www.islami.or.id"
        ) ||
        href.startsWith(
          "https://islami.or.id"
        );

      return (
        <a
          href={href}
          target={
            isInternal
              ? undefined
              : "_blank"
          }
          rel={
            isInternal
              ? undefined
              : "noopener noreferrer"
          }
          className="font-semibold text-[#0d5c91] underline decoration-sky-300 underline-offset-2 transition hover:text-sky-900"
        >
          {children}
        </a>
      );
    },

    strong: ({
      children,
    }: any) => (
      <strong className="font-bold text-slate-900">
        {children}
      </strong>
    ),

    em: ({
      children,
    }: any) => (
      <em className="italic">
        {children}
      </em>
    ),

    code: ({
      children,
    }: any) => (
      <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[0.9em] text-slate-800">
        {children}
      </code>
    ),
  },

  // ==========================================================================
  // BLOCK
  // ==========================================================================

  block: {
    normal: ({
      children,
    }: any) => (
      <p className="mb-5 text-base leading-[1.85] text-slate-800 sm:text-[17px]">
        {children}
      </p>
    ),

    // H1 dari editor Sanity sengaja dirender sebagai H2.
    // H1 halaman hanya judul artikel.
    h1: ({
      children,
    }: any) => (
      <h2 className="mb-4 mt-9 text-xl font-extrabold leading-snug tracking-tight text-slate-900 sm:text-2xl">
        {children}
      </h2>
    ),

    h2: ({
      children,
    }: any) => (
      <h2 className="mb-4 mt-9 text-xl font-extrabold leading-snug tracking-tight text-slate-900 sm:text-2xl">
        {children}
      </h2>
    ),

    h3: ({
      children,
    }: any) => (
      <h3 className="mb-3 mt-7 text-lg font-bold leading-snug text-slate-900 sm:text-xl">
        {children}
      </h3>
    ),

    h4: ({
      children,
    }: any) => (
      <h4 className="mb-2.5 mt-6 text-base font-bold leading-snug text-slate-900 sm:text-lg">
        {children}
      </h4>
    ),

    blockquote: ({
      children,
    }: any) => (
      <blockquote className="my-7 border-l-4 border-[#0d5c91] bg-sky-50/60 px-5 py-4 text-base italic leading-relaxed text-slate-700 sm:text-[17px]">
        {children}
      </blockquote>
    ),
  },

  // ==========================================================================
  // LIST
  // ==========================================================================

  list: {
    bullet: ({
      children,
    }: any) => (
      <ul className="mb-6 list-disc space-y-2.5 pl-6 text-base leading-relaxed text-slate-800 sm:text-[17px]">
        {children}
      </ul>
    ),

    number: ({
      children,
    }: any) => (
      <ol className="mb-6 list-decimal space-y-2.5 pl-6 text-base leading-relaxed text-slate-800 sm:text-[17px]">
        {children}
      </ol>
    ),
  },

  listItem: {
    bullet: ({
      children,
    }: any) => (
      <li className="pl-1">
        {children}
      </li>
    ),

    number: ({
      children,
    }: any) => (
      <li className="pl-1">
        {children}
      </li>
    ),
  },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
//
// CATATAN:
// Tidak ada lagi:
// - "use client"
// - useEffect
// - useState
// - fetch('/api/news/...')
// - skeleton akibat fetch browser
//
// Seluruh artikel datang langsung dari Server Component page.tsx.
//
// ============================================================================

export default function BlogDetailClient({
  slug,
  article,
  allNews = [],
}: BlogDetailClientProps) {
  // ==========================================================================
  // ARTICLE VALUES
  // ==========================================================================

  const titleString =
    renderSafeString(
      article.title,
      "Artikel Islam"
    );

  const categoryString =
    renderSafeString(
      article.category,
      "Artikel Islam"
    );

  const altString =
    renderSafeString(
      article.alt,
      titleString
    );

  const captionString =
    renderSafeString(
      article.caption,
      ""
    );

  const formattedDate =
    formatArticleDate(
      article.publishedAt,
      article.timeAgo
    );

  const mainImage =
    typeof article.imageUrl ===
      "string" &&
    article.imageUrl.trim()
      ? article.imageUrl.trim()
      : "/images/banner.png";

  const authorName =
    typeof article.authorName ===
      "string" &&
    article.authorName.trim()
      ? article.authorName.trim()
      : "Redaksi islami.or.id";

  // ==========================================================================
  // OUTPUT
  // ==========================================================================

  return (
    <main className="min-h-screen bg-slate-50 pb-28 pt-4">
      <div className="mx-auto w-full max-w-3xl px-3 sm:px-4">

        {/* ================================================================== */}
        {/* ARTICLE */}
        {/* ================================================================== */}

        <article
          itemScope
          itemType="https://schema.org/Article"
          className="overflow-hidden border border-slate-200/80 bg-white shadow-sm"
        >
          <div className="p-4 sm:p-6 md:p-8">

            {/* ============================================================== */}
            {/* BREADCRUMB */}
            {/* ============================================================== */}

            <nav
              aria-label="Breadcrumb"
              className="mb-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-slate-400 sm:text-sm"
            >
              <Link
                href="/"
                className="transition hover:text-[#0d5c91]"
              >
                Beranda
              </Link>

              <span
                aria-hidden="true"
                className="text-slate-300"
              >
                /
              </span>

              <Link
                href="/news"
                className="transition hover:text-[#0d5c91]"
              >
                Artikel
              </Link>

              {categoryString && (
                <>
                  <span
                    aria-hidden="true"
                    className="text-slate-300"
                  >
                    /
                  </span>

                  <span
                    aria-current="page"
                    className="max-w-[180px] truncate text-slate-500 sm:max-w-xs"
                  >
                    {categoryString}
                  </span>
                </>
              )}
            </nav>

            {/* ============================================================== */}
            {/* HEADER */}
            {/* ============================================================== */}

            <header className="mb-5">

              <h1
                itemProp="headline"
                className="text-2xl font-extrabold leading-[1.25] tracking-tight text-slate-950 sm:text-3xl md:text-[34px]"
              >
                {titleString}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-2 text-xs font-medium text-slate-500 sm:text-sm">

                <span>
                  Oleh{" "}
                  <span className="font-semibold text-slate-700">
                    {authorName}
                  </span>
                </span>

                <span
                  aria-hidden="true"
                  className="text-slate-300"
                >
                  •
                </span>

                <time
                  itemProp="datePublished"
                  dateTime={
                    article.publishedAt
                  }
                >
                  {formattedDate}
                </time>

                {categoryString && (
                  <>
                    <span
                      aria-hidden="true"
                      className="text-slate-300"
                    >
                      •
                    </span>

                    <span className="font-semibold text-[#0d5c91]">
                      {categoryString}
                    </span>
                  </>
                )}

              </div>

            </header>

            {/* ============================================================== */}
            {/* MAIN IMAGE */}
            {/* ============================================================== */}

            <figure className="mb-7">

              <div className="aspect-[16/9] overflow-hidden bg-slate-100">
                <img
                  itemProp="image"
                  src={mainImage}
                  alt={altString}
                  width={1200}
                  height={675}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>

              {captionString && (
                <figcaption className="mt-2 px-1 text-center text-xs font-medium italic leading-relaxed text-slate-500 sm:text-sm">
                  {captionString}
                </figcaption>
              )}

            </figure>

            {/* ============================================================== */}
            {/* ARTICLE CONTENT */}
            {/* ============================================================== */}

            <section
              itemProp="articleBody"
              aria-label="Isi artikel"
              className="article-content"
            >
              {Array.isArray(
                article.content
              ) &&
              article.content.length >
                0 ? (
                <PortableText
                  value={
                    article.content
                  }
                  components={
                    portableTextComponents
                  }
                />
              ) : (
                <p className="py-8 text-center text-sm italic text-slate-400">
                  Isi artikel belum
                  tersedia.
                </p>
              )}
            </section>

            {/* ============================================================== */}
            {/* FOOTER ARTICLE */}
            {/* ============================================================== */}

            <footer className="mt-8 border-t border-slate-100 pt-5">

              <div className="flex flex-wrap items-center justify-between gap-4">

                <div>
                  <p className="text-xs text-slate-400">
                    Bagikan artikel ini
                  </p>

                  <p className="mt-0.5 text-sm font-bold text-slate-700">
                    Bermanfaat untuk
                    orang lain?
                  </p>
                </div>

                <ShareButton
                  title={
                    titleString
                  }
                />

              </div>

            </footer>

          </div>
        </article>

        {/* ================================================================== */}
        {/* RELATED ARTICLES */}
        {/* ================================================================== */}

        {allNews.length > 0 && (
          <section
            aria-labelledby="related-news-heading"
            className="mt-5"
          >
            <RelatedNews
              currentSlug={slug}
              category={
                categoryString
              }
              allNews={
                allNews
              }
            />
          </section>
        )}

      </div>
    </main>
  );
}