// app/news/[slug]/page.tsx

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import BlogDetailClient from "@/components/BlogDetailClient";
import { clientPublik as client } from "@/lib/sanity";

// ============================================================================
// CONFIG
// ============================================================================

const SITE_URL = "https://www.islami.or.id";
const SITE_NAME = "islami.or.id";

const DEFAULT_DESCRIPTION =
  "Baca artikel Islam terbaru seputar Al-Qur'an, hadis, fikih, doa, sejarah Islam, keluarga Muslim, zakat, sedekah, wakaf, dan inspirasi kebaikan.";

const DEFAULT_IMAGE = `${SITE_URL}/images/banner.png`;

// Artikel publik cocok memakai ISR.
// Tidak perlu force-dynamic.
export const revalidate = 60;

// ============================================================================
// TYPES
// ============================================================================

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

interface NewsSeoData {
  id?: string;

  title?: string;

  slug?: string;

  excerpt?: string;

  imageUrl?: string;

  alt?: string;

  publishedAt?: string;

  updatedAt?: string;

  authorName?: string;

  category?: string;
}

// ============================================================================
// GROQ
// ============================================================================

const NEWS_SEO_QUERY = `
*[
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

  "authorName": coalesce(
    author->name,
    author.name,
    authorName,
    "Redaksi islami.or.id"
  ),

  "category": coalesce(
    category->title,
    category.title,
    category,
    "Artikel Islam"
  )
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

function normalizeImageUrl(
  imageUrl?: string
): string {
  if (!imageUrl) {
    return DEFAULT_IMAGE;
  }

  if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://")
  ) {
    return imageUrl;
  }

  if (imageUrl.startsWith("/")) {
    return `${SITE_URL}${imageUrl}`;
  }

  return `${SITE_URL}/${imageUrl}`;
}

function portableDescription(
  value?: string
): string {
  const fallback = DEFAULT_DESCRIPTION;

  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    return fallback;
  }

  const cleaned = value
    .replace(/\s+/g, " ")
    .trim();

  if (cleaned.length <= 160) {
    return cleaned;
  }

  return `${cleaned.slice(0, 157).trim()}...`;
}

async function getArticleSeo(
  slug: string
): Promise<NewsSeoData | null> {
  try {
    const data =
      await client.fetch<NewsSeoData | null>(
        NEWS_SEO_QUERY,
        {
          slug,
        }
      );

    return data || null;
  } catch (error) {
    console.error(
      "[NEWS PAGE] Gagal mengambil data SEO artikel:",
      error
    );

    return null;
  }
}

// ============================================================================
// METADATA
// ============================================================================

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug: rawSlug } =
    await params;

  const slug =
    normalizeSlug(rawSlug);

  const article =
    await getArticleSeo(slug);

  // Page component tetap akan menghasilkan 404 via notFound().
  if (!article?.title) {
    return {
      title: "Artikel Tidak Ditemukan",

      description:
        "Artikel yang Anda cari tidak ditemukan di islami.or.id.",

      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title =
    article.title.trim();

  const description =
    portableDescription(
      article.excerpt
    );

  const image =
    normalizeImageUrl(
      article.imageUrl
    );

  const canonical =
    `${SITE_URL}/news/${encodeURIComponent(
      article.slug || slug
    )}`;

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

        "max-snippet": -1,

        "max-video-preview":
          -1,
      },
    },

    openGraph: {
      type: "article",

      locale: "id_ID",

      siteName: SITE_NAME,

      url: canonical,

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
          : undefined,

      images: [
        {
          url: image,

          width: 1200,
          height: 630,

          alt:
            article.alt ||
            title,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",

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
  const { slug: rawSlug } =
    await params;

  const slug =
    normalizeSlug(rawSlug);

  const article =
    await getArticleSeo(slug);

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
    article.title.trim();

  const description =
    portableDescription(
      article.excerpt
    );

  const image =
    normalizeImageUrl(
      article.imageUrl
    );

  const canonical =
    `${SITE_URL}/news/${encodeURIComponent(
      article.slug
    )}`;

  const authorName =
    article.authorName ||
    "Redaksi islami.or.id";

  const category =
    article.category ||
    "Artikel Islam";

  // ==========================================================================
  // ARTICLE JSON-LD
  // ==========================================================================

  const articleSchema = {
    "@context":
      "https://schema.org",

    "@type": "Article",

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
  // WEBSITE / WEBPAGE RELATIONSHIP
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
  // SAFE JSON SERIALIZER
  // ==========================================================================

  const jsonLd = JSON.stringify([
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
      {/* ================================================================ */}
      {/* STRUCTURED DATA */}
      {/* ================================================================ */}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd,
        }}
      />

      {/* ================================================================ */}
      {/* ARTICLE UI */}
      {/* ================================================================ */}

      <BlogDetailClient
        slug={slug}
      />
    </>
  );
}