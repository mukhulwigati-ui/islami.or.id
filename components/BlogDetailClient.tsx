// components/BlogDetailClient.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  PortableText,
  type PortableTextComponents,
} from "@portabletext/react";
import RelatedNews from "@/components/RelatedNews";

// ============================================================================
// TYPES
// ============================================================================

interface ArticleData {
  title?: string | { current?: string };
  category?: string | { current?: string };

  publishedAt?: string;
  timeAgo?: string;

  imageUrl?: string;

  alt?: string | { current?: string };
  caption?: string | { current?: string };

  content?: any;
}

interface BlogApiData {
  article?: ArticleData;
  allNews?: any[];
}

interface ApiResponse {
  success?: boolean;
  data?: BlogApiData;
}

interface BlogDetailClientProps {
  slug: string;
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

    if (typeof current === "string") {
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
    return fallback || "Artikel Terbaru";
  }

  const date = new Date(publishedAt);

  if (Number.isNaN(date.getTime())) {
    return fallback || "Artikel Terbaru";
  }

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ============================================================================
// PORTABLE TEXT COMPONENTS
// ============================================================================
//
// PENTING:
// Kita memakai tipe resmi PortableTextComponents.
//
// Dengan cara ini TypeScript memahami bahwa:
// - children dapat optional
// - value memiliki struktur Portable Text
// - block, marks, list, dan listItem memakai signature resmi library
//
// ============================================================================

const portableTextComponents: PortableTextComponents = {
  // ==========================================================================
  // CUSTOM TYPES
  // ==========================================================================

  types: {
    image: ({ value }) => {
      const imageValue = value as any;

      const imageUrl =
        imageValue?.asset?.url;

      if (!imageUrl) {
        return null;
      }

      const altText =
        typeof imageValue?.alt === "string" &&
        imageValue.alt.trim()
          ? imageValue.alt.trim()
          : "Gambar artikel islami.or.id";

      const caption =
        typeof imageValue?.caption === "string"
          ? imageValue.caption.trim()
          : "";

      return (
        <figure className="my-6 w-full space-y-2 text-left">
          <div className="aspect-[16/9] overflow-hidden border border-gray-200/90 bg-gray-50 shadow-sm">
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
            <figcaption className="text-center text-xs font-medium italic text-slate-500 sm:text-sm">
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
    link: ({ children, value }) => {
      const markValue =
        value as
          | {
              href?: string;
            }
          | undefined;

      const href =
        typeof markValue?.href === "string" &&
        markValue.href.trim()
          ? markValue.href.trim()
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
          rel={
            isInternal
              ? undefined
              : "noopener noreferrer"
          }
          target={
            isInternal
              ? undefined
              : "_blank"
          }
          className="font-bold text-[#0d5c91] underline underline-offset-2 hover:text-sky-900"
        >
          {children}
        </a>
      );
    },

    strong: ({ children }) => (
      <strong className="font-bold text-slate-900">
        {children}
      </strong>
    ),

    em: ({ children }) => (
      <em className="italic">
        {children}
      </em>
    ),
  },

  // ==========================================================================
  // BLOCKS
  // ==========================================================================

  block: {
    normal: ({ children }) => (
      <p className="mb-5 text-base leading-relaxed text-slate-800 sm:text-lg">
        {children}
      </p>
    ),

    // Jangan menghasilkan H1 kedua.
    //
    // H1 halaman sudah berasal dari judul artikel.
    // Jika editor memasukkan heading H1 di Sanity,
    // kita tampilkan sebagai H2.
    h1: ({ children }) => (
      <h2 className="mb-4 mt-8 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
        {children}
      </h2>
    ),

    h2: ({ children }) => (
      <h2 className="mb-3 mt-7 text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
        {children}
      </h2>
    ),

    h3: ({ children }) => (
      <h3 className="mb-2.5 mt-6 text-base font-bold text-slate-800 sm:text-lg">
        {children}
      </h3>
    ),

    h4: ({ children }) => (
      <h4 className="mb-2 mt-5 text-base font-bold text-slate-800">
        {children}
      </h4>
    ),

    blockquote: ({ children }) => (
      <blockquote className="my-5 border-l-4 border-[#0d5c91] bg-sky-50/60 py-3 pl-4 pr-3 italic text-slate-700">
        {children}
      </blockquote>
    ),
  },

  // ==========================================================================
  // LIST
  // ==========================================================================

  list: {
    bullet: ({ children }) => (
      <ul className="mb-5 list-disc space-y-2 pl-6 text-base text-slate-800 sm:text-lg">
        {children}
      </ul>
    ),

    number: ({ children }) => (
      <ol className="mb-5 list-decimal space-y-2 pl-6 text-base text-slate-800 sm:text-lg">
        {children}
      </ol>
    ),
  },

  // ==========================================================================
  // LIST ITEM
  // ==========================================================================

  listItem: {
    bullet: ({ children }) => (
      <li className="pl-1">
        {children}
      </li>
    ),

    number: ({ children }) => (
      <li className="pl-1">
        {children}
      </li>
    ),
  },

  // ==========================================================================
  // UNKNOWN BLOCK FALLBACK
  // ==========================================================================

  unknownBlockStyle: ({ children }) => (
    <p className="mb-5 text-base leading-relaxed text-slate-800 sm:text-lg">
      {children}
    </p>
  ),
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function BlogDetailClient({
  slug,
}: BlogDetailClientProps) {
  const [data, setData] =
    useState<BlogApiData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [copied, setCopied] =
    useState(false);

  // ==========================================================================
  // FETCH ARTICLE
  // ==========================================================================

  useEffect(() => {
    const controller =
      new AbortController();

    async function loadArticle() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/news/${encodeURIComponent(slug)}`,
          {
            cache: "no-store",
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status}`
          );
        }

        const json: ApiResponse =
          await response.json();

        if (
          !json?.success ||
          !json?.data?.article
        ) {
          setData(null);

          setError(
            "Artikel tidak ditemukan."
          );

          return;
        }

        setData(json.data);
      } catch (err) {
        if (
          err instanceof DOMException &&
          err.name === "AbortError"
        ) {
          return;
        }

        console.error(
          "Fetch article detail error:",
          err
        );

        setData(null);

        setError(
          "Gagal memuat artikel. Silakan coba lagi."
        );
      } finally {
        if (
          !controller.signal.aborted
        ) {
          setLoading(false);
        }
      }
    }

    void loadArticle();

    return () => {
      controller.abort();
    };
  }, [slug]);

  // ==========================================================================
  // LOADING
  // ==========================================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24 pt-6">
        <div className="mx-auto w-full max-w-md space-y-4 px-3 animate-pulse">

          <div className="mx-auto h-5 w-2/3 bg-gray-200" />

          <div className="h-8 w-full bg-gray-200" />

          <div className="h-4 w-1/3 bg-gray-200" />

          <div className="aspect-[16/9] w-full bg-gray-200" />

          <div className="space-y-3 pt-2">
            <div className="h-4 w-full bg-gray-200" />
            <div className="h-4 w-full bg-gray-200" />
            <div className="h-4 w-5/6 bg-gray-200" />
            <div className="h-4 w-2/3 bg-gray-200" />
          </div>

        </div>
      </div>
    );
  }

  // ==========================================================================
  // NOT FOUND / ERROR
  // ==========================================================================

  if (!data?.article) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 pb-24 pt-16 text-center">
        <div className="mx-auto max-w-md">

          <h1 className="text-xl font-extrabold text-slate-900">
            Artikel tidak ditemukan
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            {error ||
              "Artikel yang Anda cari mungkin sudah dipindahkan atau tidak tersedia."}
          </p>

          <Link
            href="/news"
            className="mt-5 inline-block border border-sky-100 bg-sky-50 px-4 py-2.5 text-xs font-bold text-[#0d5c91] transition hover:bg-sky-100"
          >
            ← Kembali ke Artikel
          </Link>

        </div>
      </main>
    );
  }

  // ==========================================================================
  // ARTICLE DATA
  // ==========================================================================

  const {
    article,
    allNews = [],
  } = data;

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
    typeof article.imageUrl === "string" &&
    article.imageUrl.trim()
      ? article.imageUrl.trim()
      : "/images/placeholder.jpg";

  // ==========================================================================
  // SHARE
  // ==========================================================================

  async function handleShare() {
    if (
      typeof window === "undefined"
    ) {
      return;
    }

    const shareData = {
      title: titleString,
      text: titleString,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(
          shareData
        );

        return;
      }

      await navigator.clipboard.writeText(
        window.location.href
      );

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      if (
        err instanceof DOMException &&
        err.name === "AbortError"
      ) {
        return;
      }

      console.error(
        "Share article error:",
        err
      );
    }
  }

  // ==========================================================================
  // OUTPUT
  // ==========================================================================

  return (
    <main className="min-h-screen bg-gray-50 pb-28 pt-4">
      <div className="mx-auto w-full max-w-md space-y-4 px-3">

        {/* ================================================================== */}
        {/* ARTICLE */}
        {/* ================================================================== */}

        <article className="space-y-4 border border-gray-200/90 bg-white p-4 shadow-sm sm:p-6">

          {/* ================================================================ */}
          {/* BREADCRUMB */}
          {/* ================================================================ */}

          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-400"
          >
            <Link
              href="/"
              className="transition hover:text-[#0d5c91]"
            >
              Beranda
            </Link>

            <span aria-hidden="true">
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
                <span aria-hidden="true">
                  /
                </span>

                <span className="truncate text-slate-500">
                  {categoryString}
                </span>
              </>
            )}
          </nav>

          {/* ================================================================ */}
          {/* ARTICLE HEADER */}
          {/* ================================================================ */}

          <header className="space-y-3">

            <h1 className="text-xl font-extrabold leading-snug tracking-tight text-slate-900 sm:text-2xl">
              {titleString}
            </h1>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-gray-100 pb-3 text-xs font-semibold text-slate-500 sm:text-sm">

              <time
                dateTime={
                  article.publishedAt ||
                  undefined
                }
              >
                📅 {formattedDate}
              </time>

              {categoryString && (
                <>
                  <span
                    aria-hidden="true"
                    className="text-slate-300"
                  >
                    •
                  </span>

                  <span>
                    {categoryString}
                  </span>
                </>
              )}

            </div>
          </header>

          {/* ================================================================ */}
          {/* MAIN IMAGE */}
          {/* ================================================================ */}

          <figure className="w-full space-y-2 pt-1">

            <div className="aspect-[16/9] w-full overflow-hidden border border-gray-200/80 bg-gray-100 shadow-inner">

              <img
                src={mainImage}
                alt={altString}
                width={800}
                height={450}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                className="h-full w-full object-cover"
              />

            </div>

            {captionString && (
              <figcaption className="text-center text-xs font-medium italic text-slate-500 sm:text-sm">
                Foto: {captionString}
              </figcaption>
            )}

          </figure>

          {/* ================================================================ */}
          {/* ARTICLE CONTENT */}
          {/* ================================================================ */}

          <section
            aria-label="Isi artikel"
            className="border-b border-gray-100 pb-6 pt-2"
          >

            {article.content ? (
              <PortableText
                value={article.content}
                components={
                  portableTextComponents
                }
              />
            ) : (
              <p className="text-base italic text-slate-400">
                Isi artikel belum tersedia.
              </p>
            )}

          </section>

          {/* ================================================================ */}
          {/* SHARE */}
          {/* ================================================================ */}

          <footer className="flex items-center justify-between gap-3 pt-1">

            <span className="text-xs font-bold text-slate-600 sm:text-sm">
              Bagikan artikel ini:
            </span>

            <button
              type="button"
              onClick={() => {
                void handleShare();
              }}
              className="border border-sky-100 bg-sky-50 px-4 py-2.5 text-xs font-bold text-[#0d5c91] shadow-sm transition hover:bg-sky-100 sm:text-sm"
            >
              {copied
                ? "✓ Tautan Tersalin"
                : "🔗 Bagikan"}
            </button>

          </footer>

        </article>

        {/* ================================================================== */}
        {/* RELATED ARTICLES */}
        {/* ================================================================== */}

        <section
          aria-label="Artikel terkait"
          className="pt-2"
        >
          <RelatedNews
            currentSlug={slug}
            category={categoryString}
            allNews={
              Array.isArray(allNews)
                ? allNews
                : []
            }
          />
        </section>

      </div>
    </main>
  );
}