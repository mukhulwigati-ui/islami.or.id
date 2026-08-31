// components/News.tsx

import Link from "next/link";

import { clientPublik as client } from "@/lib/sanity";

// ============================================================================
// CONFIG
// ============================================================================

const DEFAULT_IMAGE = "/images/banner.png";

// ============================================================================
// TYPES
// ============================================================================

interface NewsItem {
  id: string;
  title: string;
  slug: string;

  imageUrl?: string;

  publishedAt?: string;

  category?: string;
}

// ============================================================================
// GROQ
// ============================================================================

const NEWS_QUERY = `
*[
  _type == "news" &&
  defined(slug.current)
]
| order(
    coalesce(
      publishedAt,
      _createdAt
    ) desc
  )[0...4] {

  "id": _id,

  "title": coalesce(
    title,
    "Artikel Islam"
  ),

  "slug": slug.current,

  "imageUrl": coalesce(
    image.asset->url,
    mainImage.asset->url,
    banner.asset->url
  ),

  "publishedAt": coalesce(
    publishedAt,
    _createdAt
  ),

  "category": coalesce(
    category->title,
    category.title,
    "Artikel Islam"
  )
}
`;

// ============================================================================
// HELPERS
// ============================================================================

function formatDate(value?: string): string {
  if (!value) {
    return "Artikel terbaru";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Artikel terbaru";
  }

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function normalizeImage(value?: string): string {
  if (
    typeof value === "string" &&
    value.trim()
  ) {
    return value.trim();
  }

  return DEFAULT_IMAGE;
}

async function getLatestNews(): Promise<NewsItem[]> {
  try {
    const data = await client.fetch<NewsItem[]>(
      NEWS_QUERY
    );

    if (!Array.isArray(data)) {
      return [];
    }

    return data.filter(
      (item) =>
        item &&
        typeof item.title === "string" &&
        item.title.trim() &&
        typeof item.slug === "string" &&
        item.slug.trim()
    );
  } catch (error) {
    console.error(
      "[HOME NEWS] Gagal mengambil artikel terbaru:",
      error
    );

    return [];
  }
}

// ============================================================================
// COMPONENT
// ============================================================================

export default async function News() {
  const newsList = await getLatestNews();

  return (
    <section
      className="w-full max-w-md mx-auto space-y-4 pt-2 pb-6"
      aria-labelledby="latest-news-heading"
    >
      {/* ================================================================ */}
      {/* HEADER */}
      {/* ================================================================ */}

      <div className="flex items-center justify-between gap-3 px-1">
        <h2
          id="latest-news-heading"
          className="text-xl font-bold text-slate-800 tracking-tight"
        >
          Artikel Terbaru
        </h2>

        <Link
          href="/news"
          className="text-xs font-semibold text-sky-700 transition-colors hover:text-sky-900"
        >
          Lihat Semua
        </Link>
      </div>

      {/* ================================================================ */}
      {/* LIST */}
      {/* ================================================================ */}

      {newsList.length === 0 ? (
        <div className="border border-gray-100 bg-white py-8 text-center text-xs font-medium text-gray-400">
          Belum ada artikel terbaru.
        </div>
      ) : (
        <div className="space-y-3.5">
          {newsList.map((news) => {
            const image =
              normalizeImage(news.imageUrl);

            const dateLabel =
              formatDate(news.publishedAt);

            const category =
              news.category?.trim() ||
              "Artikel Islam";

            return (
              <article
                key={news.id || news.slug}
                className="group border border-gray-100/80 bg-white shadow-sm transition-all duration-300 hover:shadow-md"
              >
                <Link
                  href={`/news/${encodeURIComponent(
                    news.slug
                  )}`}
                  className="flex items-center gap-3.5 p-3"
                  aria-label={`Baca artikel: ${news.title}`}
                >
                  {/* ====================================================== */}
                  {/* IMAGE */}
                  {/* ====================================================== */}

                  <div className="relative aspect-[16/10] w-28 shrink-0 overflow-hidden bg-gray-100 sm:w-32">
                    <img
                      src={image}
                      alt={news.title}
                      width={320}
                      height={200}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>

                  {/* ====================================================== */}
                  {/* CONTENT */}
                  {/* ====================================================== */}

                  <div className="flex min-w-0 flex-1 flex-col justify-between pr-1">

                    <div>
                      <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-sky-700">
                        {category}
                      </div>

                      <h3 className="line-clamp-2 text-xs font-semibold leading-snug tracking-normal text-slate-700 transition-colors group-hover:text-sky-600 sm:text-sm">
                        {news.title}
                      </h3>
                    </div>

                    <time
                      dateTime={news.publishedAt}
                      className="mt-2.5 block text-[11px] font-normal text-slate-400"
                    >
                      {dateLabel}
                    </time>

                  </div>
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}