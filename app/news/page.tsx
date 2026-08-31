// app/news/page.tsx

import type { Metadata } from "next";
import Link from "next/link";

import { clientPublik as client } from "@/lib/sanity";

// ============================================================================
// CONFIG
// ============================================================================

const SITE_URL = "https://www.islami.or.id";
const SITE_NAME = "islami.or.id";

const PAGE_TITLE = "Artikel Islam Terbaru";

const PAGE_DESCRIPTION =
  "Baca artikel Islam terbaru seputar Al-Qur'an, hadis, fikih, doa, sejarah Islam, keluarga Muslim, zakat, sedekah, wakaf, dan inspirasi kehidupan Muslim.";

const DEFAULT_IMAGE = "/images/banner.png";

// ============================================================================
// ISR
// ============================================================================

export const revalidate = 300;

// ============================================================================
// METADATA
// ============================================================================

export const metadata: Metadata = {
  title: PAGE_TITLE,

  description: PAGE_DESCRIPTION,

  alternates: {
    canonical: `${SITE_URL}/news`,
  },

  robots: {
    index: true,
    follow: true,

    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: SITE_NAME,

    url: `${SITE_URL}/news`,

    title: `${PAGE_TITLE} | ${SITE_NAME}`,

    description: PAGE_DESCRIPTION,

    images: [
      {
        url: `${SITE_URL}/images/banner.png`,
        width: 1200,
        height: 630,
        alt: "Artikel Islam terbaru di islami.or.id",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title: `${PAGE_TITLE} | ${SITE_NAME}`,

    description: PAGE_DESCRIPTION,

    images: [`${SITE_URL}/images/banner.png`],
  },
};

// ============================================================================
// TYPES
// ============================================================================

interface NewsItem {
  id: string;
  title: string;
  slug: string;

  excerpt?: string;
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
  )[0...30] {

  "id": _id,

  "title": coalesce(
    title,
    "Artikel Islam"
  ),

  "slug": slug.current,

  excerpt,

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
    month: "long",
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

function cleanText(
  value?: string,
  maxLength = 120
): string {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    return "";
  }

  const text = value
    .replace(/\s+/g, " ")
    .trim();

  if (text.length <= maxLength) {
    return text;
  }

  return `${text
    .slice(0, maxLength - 3)
    .trim()}...`;
}

// ============================================================================
// DATA
// ============================================================================

async function getNews(): Promise<NewsItem[]> {
  try {
    const data =
      await client.fetch<NewsItem[]>(
        NEWS_QUERY
      );

    if (!Array.isArray(data)) {
      return [];
    }

    return data.filter(
      (item) =>
        item &&
        typeof item.slug === "string" &&
        item.slug.trim() &&
        typeof item.title === "string" &&
        item.title.trim()
    );
  } catch (error) {
    console.error(
      "[NEWS PAGE] Gagal mengambil daftar artikel:",
      error
    );

    return [];
  }
}

// ============================================================================
// PAGE
// ============================================================================

export default async function NewsPage() {
  const newsList = await getNews();

  // ==========================================================================
  // STRUCTURED DATA
  // ==========================================================================

  const collectionSchema = {
    "@context": "https://schema.org",

    "@type": "CollectionPage",

    "@id": `${SITE_URL}/news#webpage`,

    url: `${SITE_URL}/news`,

    name: PAGE_TITLE,

    description: PAGE_DESCRIPTION,

    inLanguage: "id-ID",

    isPartOf: {
      "@id": `${SITE_URL}/#website`,
    },

    breadcrumb: {
      "@id": `${SITE_URL}/news#breadcrumb`,
    },

    mainEntity: {
      "@type": "ItemList",

      numberOfItems:
        newsList.length,

      itemListElement:
        newsList.map(
          (post, index) => ({
            "@type": "ListItem",

            position:
              index + 1,

            url:
              `${SITE_URL}/news/${encodeURIComponent(
                post.slug
              )}`,

            name:
              post.title,
          })
        ),
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",

    "@type": "BreadcrumbList",

    "@id": `${SITE_URL}/news#breadcrumb`,

    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Beranda",
        item: SITE_URL,
      },

      {
        "@type": "ListItem",
        position: 2,
        name: "Artikel",
        item: `${SITE_URL}/news`,
      },
    ],
  };

  const jsonLd =
    JSON.stringify([
      collectionSchema,
      breadcrumbSchema,
    ]).replace(
      /</g,
      "\\u003c"
    );

  // ==========================================================================
  // OUTPUT
  // ==========================================================================

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd,
        }}
      />

      <main className="min-h-screen w-full bg-gray-50 pb-28">

        {/* ================================================================== */}
        {/* MOBILE-FIRST WRAPPER */}
        {/* ================================================================== */}

        <div className="mx-auto w-full max-w-md">

          {/* ================================================================ */}
          {/* HEADER */}
          {/* ================================================================ */}

          <header className="bg-white px-4 pb-5 pt-5 text-center">

            <nav
              aria-label="Breadcrumb"
              className="mb-3 flex items-center justify-center gap-2 text-[11px] font-medium text-slate-400"
            >
              <Link
                href="/"
                className="transition-colors hover:text-[#0d5c91]"
              >
                Beranda
              </Link>

              <span
                aria-hidden="true"
                className="text-slate-300"
              >
                /
              </span>

              <span
                aria-current="page"
                className="text-slate-500"
              >
                Artikel
              </span>
            </nav>

            <h1 className="text-[24px] font-extrabold leading-tight tracking-tight text-slate-950 sm:text-[28px]">
              Artikel Islam Terbaru
            </h1>

            <p className="mx-auto mt-2.5 max-w-sm text-[13px] leading-relaxed text-slate-500 sm:text-sm">
              Temukan artikel seputar Al-Qur&apos;an,
              hadis, fikih, doa, sejarah Islam,
              keluarga Muslim, zakat, sedekah, wakaf,
              dan inspirasi kehidupan Islami.
            </p>

          </header>

          {/* ================================================================ */}
          {/* CONTENT */}
          {/* ================================================================ */}

          <div className="px-3 pb-5 pt-3">

            {newsList.length === 0 ? (

              <section className="bg-white px-5 py-14 text-center">
                <h2 className="text-sm font-bold text-slate-700">
                  Belum ada artikel
                </h2>

                <p className="mt-2 text-xs text-slate-400">
                  Artikel terbaru akan ditampilkan di halaman ini.
                </p>
              </section>

            ) : (

              <section
                aria-label="Daftar artikel Islam terbaru"
                className="space-y-3"
              >
                {newsList.map((post) => {
                  const image =
                    normalizeImage(
                      post.imageUrl
                    );

                  const excerpt =
                    cleanText(
                      post.excerpt
                    );

                  const dateLabel =
                    formatDate(
                      post.publishedAt
                    );

                  const category =
                    post.category?.trim() ||
                    "Artikel Islam";

                  return (
                    <article
                      key={
                        post.id ||
                        post.slug
                      }
                      className="group w-full overflow-hidden bg-white shadow-sm transition-all duration-300 hover:shadow-md"
                    >

                      <Link
                        href={`/news/${encodeURIComponent(
                          post.slug
                        )}`}
                        aria-label={`Baca artikel: ${post.title}`}
                        className="flex w-full items-center gap-3 p-3"
                      >

                        {/* ================================================== */}
                        {/* THUMBNAIL */}
                        {/* ================================================== */}

                        <div className="aspect-[16/10] w-28 shrink-0 overflow-hidden bg-slate-100">

                          <img
                            src={image}
                            alt={post.title}
                            width={320}
                            height={200}
                            loading="lazy"
                            decoding="async"
                            className="block h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />

                        </div>

                        {/* ================================================== */}
                        {/* ARTICLE INFO */}
                        {/* ================================================== */}

                        <div className="min-w-0 flex-1 py-0.5">

                          <div className="mb-1 text-[9px] font-bold uppercase tracking-wide text-[#0d5c91] sm:text-[10px]">
                            {category}
                          </div>

                          <h2 className="line-clamp-2 text-[13px] font-bold leading-[1.4] tracking-tight text-slate-800 transition-colors group-hover:text-[#0d5c91] sm:text-sm">
                            {post.title}
                          </h2>

                          {excerpt && (
                            <p className="mt-1 hidden line-clamp-2 text-xs leading-relaxed text-slate-500 sm:block">
                              {excerpt}
                            </p>
                          )}

                          <time
                            dateTime={
                              post.publishedAt
                            }
                            className="mt-2 block text-[10px] font-medium text-slate-400"
                          >
                            {dateLabel}
                          </time>

                        </div>

                      </Link>
                    </article>
                  );
                })}
              </section>
            )}

          </div>

        </div>

      </main>
    </>
  );
}