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

  title?: string | {
    current?: string;
  };

  slug?: string;

  category?: string | {
    current?: string;
  };

  publishedAt?: string;
  updatedAt?: string;
  timeAgo?: string;

  authorName?: string;

  excerpt?: string;

  imageUrl?: string;

  alt?: string | {
    current?: string;
  };

  caption?: string | {
    current?: string;
  };

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

  if (
    typeof value === "string"
  ) {
    return value.trim() || fallback;
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
      return (
        current.trim() ||
        fallback
      );
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
// PORTABLE TEXT COMPONENTS
// ============================================================================
//
// `any` sengaja dipertahankan agar kompatibel dengan versi
// @portabletext/react yang digunakan project sekarang.
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
        <figure className="my-6 w-full">

          <div className="aspect-[16/9] w-full overflow-hidden bg-slate-100">

            <img
              src={imageUrl}
              alt={altText}
              width={800}
              height={450}
              loading="lazy"
              decoding="async"
              className="block h-full w-full object-cover"
            />

          </div>

          {caption && (
            <figcaption className="mt-2 px-1 text-center text-[11px] font-medium italic leading-relaxed text-slate-500 sm:text-xs">
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
          className="font-semibold text-[#0d5c91] underline decoration-sky-300 underline-offset-2 transition-colors hover:text-sky-900"
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
      <code className="break-words bg-slate-100 px-1.5 py-0.5 text-[0.9em] text-slate-800">
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
      <p className="mb-5 text-[15px] leading-[1.85] text-slate-700 sm:text-base">
        {children}
      </p>
    ),

    // ------------------------------------------------------------------------
    // H1 dari Sanity diubah menjadi H2.
    // H1 halaman hanya judul artikel utama.
    // ------------------------------------------------------------------------

    h1: ({
      children,
    }: any) => (
      <h2 className="mb-3 mt-8 text-xl font-extrabold leading-snug tracking-tight text-slate-900 sm:text-[22px]">
        {children}
      </h2>
    ),

    h2: ({
      children,
    }: any) => (
      <h2 className="mb-3 mt-8 text-xl font-extrabold leading-snug tracking-tight text-slate-900 sm:text-[22px]">
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
      <blockquote className="my-6 border-l-4 border-[#0d5c91] bg-sky-50/70 px-4 py-3.5 text-[15px] italic leading-[1.8] text-slate-700 sm:text-base">
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
      <ul className="mb-5 list-disc space-y-2 pl-5 text-[15px] leading-[1.8] text-slate-700 sm:text-base">
        {children}
      </ul>
    ),

    number: ({
      children,
    }: any) => (
      <ol className="mb-5 list-decimal space-y-2 pl-5 text-[15px] leading-[1.8] text-slate-700 sm:text-base">
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
    <main className="min-h-screen w-full bg-slate-50 pb-28">

      {/* ==================================================================== */}
      {/* MOBILE-FIRST CONTAINER                                              */}
      {/* ==================================================================== */}
      {/*
          Penting:
          Header, homepage, article dan bottom navigation sekarang sama-sama
          mengikuti max-w-md.
      */}

      <div className="mx-auto w-full max-w-md">

        {/* ================================================================== */}
        {/* ARTICLE */}
        {/* ================================================================== */}

        <article
          itemScope
          itemType="https://schema.org/Article"
          className="w-full bg-white"
        >

          <div className="w-full px-4 pb-6 pt-5 sm:px-5 sm:pt-6">

            {/* ============================================================== */}
            {/* BREADCRUMB */}
            {/* ============================================================== */}

            <nav
              aria-label="Breadcrumb"
              className="mb-4 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-medium text-slate-400 sm:text-xs"
            >

              <Link
                href="/"
                className="shrink-0 transition-colors hover:text-[#0d5c91]"
              >
                Beranda
              </Link>

              <span
                aria-hidden="true"
                className="shrink-0 text-slate-300"
              >
                /
              </span>

              <Link
                href="/news"
                className="shrink-0 transition-colors hover:text-[#0d5c91]"
              >
                Artikel
              </Link>

              {categoryString && (
                <>
                  <span
                    aria-hidden="true"
                    className="shrink-0 text-slate-300"
                  >
                    /
                  </span>

                  <span
                    aria-current="page"
                    className="min-w-0 max-w-[150px] truncate text-slate-500 sm:max-w-[190px]"
                  >
                    {categoryString}
                  </span>
                </>
              )}

            </nav>

            {/* ============================================================== */}
            {/* ARTICLE HEADER */}
            {/* ============================================================== */}

            <header className="mb-5">

              <h1
                itemProp="headline"
                className="break-words text-[26px] font-extrabold leading-[1.2] tracking-tight text-slate-950 sm:text-[30px]"
              >
                {titleString}
              </h1>

              {/* ============================================================ */}
              {/* META */}
              {/* ============================================================ */}

              <div className="mt-4 flex flex-wrap items-center gap-x-1.5 gap-y-1.5 text-[11px] font-medium text-slate-500 sm:text-xs">

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

            <figure className="mb-6 w-full">

              <div className="aspect-[16/9] w-full overflow-hidden bg-slate-100">

                <img
                  itemProp="image"
                  src={mainImage}
                  alt={altString}
                  width={800}
                  height={450}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  className="block h-full w-full object-cover"
                />

              </div>

              {captionString && (
                <figcaption className="mt-2 px-1 text-center text-[11px] font-medium italic leading-relaxed text-slate-500">
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
              className="min-w-0 w-full overflow-hidden"
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
                  Isi artikel belum tersedia.
                </p>

              )}

            </section>

            {/* ============================================================== */}
            {/* ARTICLE FOOTER */}
            {/* ============================================================== */}

            <footer className="mt-8 border-t border-slate-100 pt-5">

              <div className="flex flex-wrap items-center justify-between gap-4">

                <div className="min-w-0">

                  <p className="text-[11px] text-slate-400">
                    Bagikan artikel ini
                  </p>

                  <p className="mt-0.5 text-sm font-bold text-slate-700">
                    Bermanfaat untuk orang lain?
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
            aria-label="Artikel terkait"
            className="mt-3 w-full bg-slate-50 px-3 pb-4 pt-2"
          >

            <RelatedNews
              currentSlug={
                slug
              }
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