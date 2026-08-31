// app/news/[slug]/page.tsx

import type { Metadata } from "next";
import { createClient } from "@sanity/client";
import BlogDetailClient from "@/components/BlogDetailClient";

// ============================================================================
// TYPES
// ============================================================================

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

interface PortableTextChild {
  text?: string;
}

interface PortableTextBlock {
  _type?: string;
  children?: PortableTextChild[];
}

interface ArticleMetadataData {
  title?: string;
  excerpt?: string;

  content?: string | PortableTextBlock[];

  imageUrl?: string;

  publishedAt?: string;
  updatedAt?: string;

  authorName?: string;
}

// ============================================================================
// SITE CONFIGURATION
// ============================================================================

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://www.islami.or.id";

const SITE_NAME = "islami.or.id";

const DEFAULT_IMAGE =
  `${SITE_URL}/images/banner.png`;

const DEFAULT_TITLE =
  "Artikel Islam & Inspirasi Muslim";

const DEFAULT_DESCRIPTION =
  "Baca artikel Islam, Al-Qur'an, hadis, fikih, doa, sejarah Islam, keluarga Muslim, zakat, sedekah, wakaf, dan berbagai inspirasi kebaikan di islami.or.id.";

// ============================================================================
// SANITY CONFIGURATION
// ============================================================================

const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
  "915u7hh1";

const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET ||
  "production";

const serverClient = createClient({
  projectId,
  dataset,
  useCdn: false,
  apiVersion: "2026-06-20",
  token: process.env.SANITY_API_TOKEN,
});

// ============================================================================
// RENDERING
// ============================================================================

export const dynamic = "force-dynamic";
export const revalidate = 60;

// ============================================================================
// HELPER: PORTABLE TEXT → PLAIN TEXT
// ============================================================================

function portableTextToPlainText(
  content?: string | PortableTextBlock[]
): string {
  if (!content) {
    return "";
  }

  if (typeof content === "string") {
    return content
      .replace(/\s+/g, " ")
      .trim();
  }

  if (!Array.isArray(content)) {
    return "";
  }

  return content
    .filter(
      (block) =>
        block?._type === "block" &&
        Array.isArray(block.children)
    )
    .map((block) =>
      (block.children || [])
        .map((child) => child?.text || "")
        .join("")
    )
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

// ============================================================================
// HELPER: DESCRIPTION
// ============================================================================

function createDescription(
  article: ArticleMetadataData,
  title: string
): string {
  let description = "";

  if (
    typeof article.excerpt === "string" &&
    article.excerpt.trim()
  ) {
    description = article.excerpt.trim();
  }

  if (!description) {
    description = portableTextToPlainText(
      article.content
    );
  }

  if (!description) {
    description =
      `Baca pembahasan lengkap "${title}" di islami.or.id, portal Islam dan inspirasi Muslim Indonesia.`;
  }

  // Hindari meta description terlalu panjang.
  if (description.length > 160) {
    return `${description.slice(0, 157).trim()}...`;
  }

  return description;
}

// ============================================================================
// HELPER: IMAGE URL
// ============================================================================

function normalizeImageUrl(
  imageUrl?: string
): string {
  if (
    !imageUrl ||
    typeof imageUrl !== "string"
  ) {
    return DEFAULT_IMAGE;
  }

  if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://")
  ) {
    return imageUrl;
  }

  return `${SITE_URL}${
    imageUrl.startsWith("/") ? "" : "/"
  }${imageUrl}`;
}

// ============================================================================
// DYNAMIC METADATA
// ============================================================================

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params;

  const canonicalUrl =
    `${SITE_URL}/news/${encodeURIComponent(slug)}`;

  let articleTitle = DEFAULT_TITLE;
  let articleDescription =
    DEFAULT_DESCRIPTION;

  let articleImage = DEFAULT_IMAGE;

  let publishedAt: string | undefined;
  let updatedAt: string | undefined;

  try {
    const article =
      await serverClient.fetch<ArticleMetadataData | null>(
        `
          *[
            _type in ["news", "post", "article"] &&
            slug.current == $slug
          ][0] {
            title,
            excerpt,
            content,

            "imageUrl": coalesce(
              mainImage.asset->url,
              image.asset->url,
              banner.asset->url
            ),

            publishedAt,

            "updatedAt": _updatedAt,

            "authorName": coalesce(
              author->name,
              author.name,
              author,
              "Redaksi islami.or.id"
            )
          }
        `,
        {
          slug,
        }
      );

    if (article) {
      if (
        typeof article.title === "string" &&
        article.title.trim()
      ) {
        articleTitle =
          article.title.trim();
      }

      articleDescription =
        createDescription(
          article,
          articleTitle
        );

      articleImage =
        normalizeImageUrl(
          article.imageUrl
        );

      publishedAt =
        article.publishedAt;

      updatedAt =
        article.updatedAt;
    }
  } catch (error) {
    console.error(
      "[NEWS METADATA] Gagal mengambil metadata artikel:",
      error
    );
  }

  return {
    // Root layout sudah memiliki:
    // template: "%s | islami.or.id"
    //
    // Jadi jangan tambahkan islami.or.id lagi di sini.
    title: articleTitle,

    description:
      articleDescription,

    alternates: {
      canonical:
        canonicalUrl,
    },

    robots: {
      index: true,
      follow: true,

      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },

    openGraph: {
      title:
        articleTitle,

      description:
        articleDescription,

      url:
        canonicalUrl,

      siteName:
        SITE_NAME,

      locale:
        "id_ID",

      type:
        "article",

      publishedTime:
        publishedAt,

      modifiedTime:
        updatedAt,

      images: [
        {
          url:
            articleImage,

          width:
            1200,

          height:
            630,

          alt:
            articleTitle,
        },
      ],
    },

    twitter: {
      card:
        "summary_large_image",

      title:
        articleTitle,

      description:
        articleDescription,

      images: [
        articleImage,
      ],
    },
  };
}

// ============================================================================
// PAGE
// ============================================================================

export default async function NewsDetailPage({
  params,
}: Props) {
  const { slug } = await params;

  return (
    <BlogDetailClient
      slug={slug}
    />
  );
}