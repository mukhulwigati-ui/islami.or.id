// app/news/[slug]/page.tsx

import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";

import BlogDetailClient, {
  type ArticleData,
  type RelatedArticleData,
} from "@/components/BlogDetailClient";

import { clientPublik as client } from "@/lib/sanity";

// ============================================================================
// CONFIG
// ============================================================================

const SITE_URL = "https://www.islami.or.id";
const SITE_NAME = "islami.or.id";

const DEFAULT_DESCRIPTION =
  "Baca artikel Islam terbaru seputar Al-Qur'an, hadis, fikih, doa, sejarah Islam, keluarga Muslim, zakat, sedekah, wakaf, dan inspirasi kebaikan.";

const DEFAULT_IMAGE = `${SITE_URL}/images/banner.png`;

// ISR.
// Artikel tetap cepat, tetapi perubahan Sanity dapat diperbarui berkala.
export const revalidate = 60;

// ============================================================================
// TYPES
// ============================================================================

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

interface NewsPageData {
  article: ArticleData | null;
  allNews: RelatedArticleData[];
}

// ============================================================================
// GROQ QUERY
// ============================================================================

const NEWS_DETAIL_QUERY = `
{
  "article": *[
    _type == "news" &&
    defined(slug.current) &&
    lower(slug.current) == lower($slug)
  ][0] {

    "id": _id,

    title,

    "slug": slug.current,

    excerpt,

    "imageUrl": coalesce(
      image.asset->url,
      mainImage.asset->url,
      banner.asset->url
    ),

    "caption": coalesce(
      image.caption,
      mainImage.caption,
      banner.caption
    ),

    "alt": coalesce(
      image.alt,
      mainImage.alt,
      banner.alt,
      title
    ),

    "publishedAt": coalesce(
      publishedAt,
      _createdAt
    ),

    "updatedAt": coalesce(
      _updatedAt,
      publishedAt,
      _createdAt
    ),

    "category": coalesce(
      category->title,
      category.title,
      category,
      "Artikel Islam"
    ),

    "authorName": coalesce(
      author->name,
      author.name,
      authorName,
      "Redaksi islami.or.id"
    ),

    content[] {
      ...,

      asset-> {
        ...,
        url
      },

      markDefs[] {
        ...,

        _type == "reference" => {
          "slug": @->slug.current
        }
      }
    }
  },

  "allNews": *[
    _type == "news" &&
    defined(slug.current) &&
    lower(slug.current) != lower($slug)
  ]
  | order(
      coalesce(
        publishedAt,
        _createdAt
      ) desc
    )[0...6] {

    "id": _id,

    title,

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

    "updatedAt": _updatedAt,

    "category": coalesce(
      category->title,
      category.title,
      category,
      "Artikel Islam"
    )
  }
}
`;

// ============================================================================
// HELPERS
// ============================================================================

function normalizeSlug(value: string): string {
  try {
    return decodeURIComponent(value).trim();
  } catch {
    return value.trim();
  }
}

function absoluteImageUrl(value?: string): string {
  if (!value) {
    return DEFAULT_IMAGE;
  }

  if (
    value.startsWith("https://") ||
    value.startsWith("http://")
  ) {
    return value;
  }

  if (value.startsWith("/")) {
    return `${SITE_URL}${value}`;
  }

  return `${SITE_URL}/${value}`;
}

function cleanDescription(value?: string): string {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    return DEFAULT_DESCRIPTION;
  }

  const cleaned = value
    .replace(/\s+/g, " ")
    .trim();

  if (cleaned.length <= 160) {
    return cleaned;
  }

  return `${cleaned.slice(0, 157).trim()}...`;
}

function safeString(
  value: unknown,
  fallback: string
): string {
  if (
    typeof value === "string" &&
    value.trim()
  ) {
    return value.trim();
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
      typeof current === "string" &&
      current.trim()
    ) {
      return current.trim();
    }
  }

  return fallback;
}

// ============================================================================
// DATA FETCH
// ============================================================================
//
// cache() membantu generateMetadata() dan page menggunakan hasil fetch yang sama
// pada request/render yang sama.
// ============================================================================

const getNewsData = cache(
  async (
    slug: string
  ): Promise<NewsPageData> => {
    try {
      const data =
        await client.fetch<NewsPageData>(
          NEWS_DETAIL_QUERY,
          {
            slug,
          }
        );

      return {
        article:
          data?.article || null,

        allNews:
          Array.isArray(data?.allNews)
            ? data.allNews
            : [],
      };
    } catch (error) {
      console.error(
        "[NEWS DETAIL] Gagal mengambil data artikel:",
        error
      );

      return {
        article: null,
        allNews: [],
      };
    }
  }
);

// ============================================================================
// METADATA
// ============================================================================

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const {
    slug: rawSlug,
  } = await params;

  const slug =
    normalizeSlug(rawSlug);

  const {
    article,
  } = await getNewsData(slug);

  if (
    !article ||
    !article.title ||
    !article.slug
  ) {
    return {
      title:
        "Artikel Tidak Ditemukan",

      description:
        "Artikel yang Anda cari tidak ditemukan di islami.or.id.",

      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title =
    safeString(
      article.title,
      "Artikel Islam"
    );

  const description =
    cleanDescription(
      article.excerpt
    );

  const image =
    absoluteImageUrl(
      article.imageUrl
    );

  const canonical =
    `${SITE_URL}/news/${encodeURIComponent(
      article.slug
    )}`;

  const altText =
    safeString(
      article.alt,
      title
    );

  return {
    title,

    description,

    alternates: {
      canonical,
    },

    robots: {
      index: true,
      follow: true,

      googleBot: {
        index: true,
        follow: true,

        "max-image-preview":
          "large",

        "max-snippet":
          -1,

        "max-video-preview":
          -1,
      },
    },

    openGraph: {
      type: "article",

      locale: "id_ID",

      siteName:
        SITE_NAME,

      url:
        canonical,

      title,

      description,

      publishedTime:
        article.publishedAt,

      modifiedTime:
        article.updatedAt,

      authors:
        article.authorName
          ? [
              article.authorName,
            ]
          : [
              "Redaksi islami.or.id",
            ],

      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: altText,
        },
      ],
    },

    twitter: {
      card:
        "summary_large_image",

      title,

      description,

      images: [
        image,
      ],
    },
  };
}

// ============================================================================
// PAGE
// ============================================================================

export default async function NewsDetailPage({
  params,
}: PageProps) {
  const {
    slug: rawSlug,
  } = await params;

  const slug =
    normalizeSlug(rawSlug);

  const {
    article,
    allNews,
  } = await getNewsData(slug);

  // ==========================================================================
  // REAL SERVER-SIDE 404
  // ==========================================================================

  if (
    !article ||
    !article.title ||
    !article.slug
  ) {
    notFound();
  }

  // ==========================================================================
  // BASIC VALUES
  // ==========================================================================

  const title =
    safeString(
      article.title,
      "Artikel Islam"
    );

  const description =
    cleanDescription(
      article.excerpt
    );

  const image =
    absoluteImageUrl(
      article.imageUrl
    );

  const canonical =
    `${SITE_URL}/news/${encodeURIComponent(
      article.slug
    )}`;

  const authorName =
    typeof article.authorName === "string" &&
    article.authorName.trim()
      ? article.authorName.trim()
      : "Redaksi islami.or.id";

  const category =
    safeString(
      article.category,
      "Artikel Islam"
    );

  // ==========================================================================
  // ARTICLE JSON-LD
  // ==========================================================================

  const articleSchema = {
    "@context":
      "https://schema.org",

    "@type":
      "Article",

    "@id":
      `${canonical}#article`,

    headline:
      title,

    description,

    url:
      canonical,

    mainEntityOfPage: {
      "@type":
        "WebPage",

      "@id":
        canonical,
    },

    image: [
      image,
    ],

    ...(article.publishedAt
      ? {
          datePublished:
            article.publishedAt,
        }
      : {}),

    ...(article.updatedAt
      ? {
          dateModified:
            article.updatedAt,
        }
      : {}),

    author: {
      "@type":
        "Organization",

      name:
        authorName,
    },

    publisher: {
      "@type":
        "Organization",

      "@id":
        `${SITE_URL}/#organization`,

      name:
        SITE_NAME,

      url:
        SITE_URL,
    },

    articleSection:
      category,

    inLanguage:
      "id-ID",

    isAccessibleForFree:
      true,
  };

  // ==========================================================================
  // BREADCRUMB JSON-LD
  // ==========================================================================

  const breadcrumbSchema = {
    "@context":
      "https://schema.org",

    "@type":
      "BreadcrumbList",

    "@id":
      `${canonical}#breadcrumb`,

    itemListElement: [
      {
        "@type":
          "ListItem",

        position: 1,

        name:
          "Beranda",

        item:
          SITE_URL,
      },

      {
        "@type":
          "ListItem",

        position: 2,

        name:
          "Artikel",

        item:
          `${SITE_URL}/news`,
      },

      {
        "@type":
          "ListItem",

        position: 3,

        name:
          title,

        item:
          canonical,
      },
    ],
  };

  // ==========================================================================
  // WEBPAGE JSON-LD
  // ==========================================================================

  const webPageSchema = {
    "@context":
      "https://schema.org",

    "@type":
      "WebPage",

    "@id":
      canonical,

    url:
      canonical,

    name:
      title,

    description,

    isPartOf: {
      "@type":
        "WebSite",

      "@id":
        `${SITE_URL}/#website`,

      name:
        SITE_NAME,

      url:
        SITE_URL,
    },

    breadcrumb: {
      "@id":
        `${canonical}#breadcrumb`,
    },

    primaryImageOfPage: {
      "@type":
        "ImageObject",

      url:
        image,
    },

    inLanguage:
      "id-ID",
  };

  // ==========================================================================
  // SAFE JSON-LD
  // ==========================================================================

  const jsonLd =
    JSON.stringify([
      articleSchema,
      breadcrumbSchema,
      webPageSchema,
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

      <BlogDetailClient
        slug={article.slug}
        article={article}
        allNews={allNews}
      />
    </>
  );
}