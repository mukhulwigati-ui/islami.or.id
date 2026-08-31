// app/api/news/[slug]/route.ts

import { NextResponse } from "next/server";
import { clientPublik as client } from "@/lib/sanity";

// ============================================================================
// ROUTE CONFIG
// ============================================================================
//
// Detail artikel harus membaca data terbaru dari Sanity.
//
// Cache publik tetap kita atur melalui Cache-Control di response:
// s-maxage=60 + stale-while-revalidate.
//
// Karena menggunakan force-dynamic, export revalidate tidak diperlukan.
// ============================================================================

export const dynamic = "force-dynamic";

// ============================================================================
// TYPES
// ============================================================================

interface RouteContext {
  params: Promise<{
    slug: string;
  }>;
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

    "updatedAt": _updatedAt,

    "category": coalesce(
      category->title,
      category.title,
      category,
      "Artikel Islam"
    ),

    "authorName": coalesce(
      author->name,
      author.name,
      author,
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
      coalesce(publishedAt, _createdAt) desc
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
// GET /api/news/[slug]
// ============================================================================

export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    // ========================================================================
    // PARAM
    // ========================================================================

    const { slug: rawSlug } =
      await context.params;

    let slug = rawSlug;

    try {
      slug =
        decodeURIComponent(
          rawSlug
        ).trim();
    } catch {
      slug =
        rawSlug.trim();
    }

    // ========================================================================
    // VALIDATION
    // ========================================================================

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Slug artikel tidak valid.",
        },
        {
          status: 400,

          headers: {
            "Cache-Control":
              "no-store",
          },
        }
      );
    }

    // Batasi panjang slug untuk menghindari request aneh/tidak masuk akal.
    if (slug.length > 200) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Slug artikel terlalu panjang.",
        },
        {
          status: 400,

          headers: {
            "Cache-Control":
              "no-store",
          },
        }
      );
    }

    // ========================================================================
    // SANITY
    // ========================================================================

    const data =
      await client.fetch(
        NEWS_DETAIL_QUERY,
        {
          slug,
        }
      );

    // ========================================================================
    // ARTICLE NOT FOUND
    // ========================================================================

    if (!data?.article) {
      return NextResponse.json(
        {
          success: false,

          error:
            "Artikel tidak ditemukan.",
        },
        {
          status: 404,

          headers: {
            /*
             * Jangan cache 404 terlalu lama.
             *
             * Ini penting jika artikel baru saja diterbitkan dan CDN
             * sebelumnya sempat menerima request sebelum artikelnya tersedia.
             */
            "Cache-Control":
              "public, s-maxage=10, stale-while-revalidate=10",
          },
        }
      );
    }

    // ========================================================================
    // SUCCESS
    // ========================================================================

    return NextResponse.json(
      {
        success: true,

        data: {
          article:
            data.article,

          allNews:
            Array.isArray(
              data.allNews
            )
              ? data.allNews
              : [],
        },
      },
      {
        status: 200,

        headers: {
          /*
           * Browser/CDN dapat menyimpan response selama 60 detik.
           *
           * Setelah 60 detik, response lama masih boleh digunakan selama
           * 30 detik sambil CDN mengambil versi terbaru di background.
           */
          "Cache-Control":
            "public, s-maxage=60, stale-while-revalidate=30",
        },
      }
    );
  } catch (error: unknown) {
    console.error(
      "[API NEWS DETAIL] Error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan pada server.";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      {
        status: 500,

        headers: {
          /*
           * Error server jangan disimpan CDN.
           */
          "Cache-Control":
            "no-store",
        },
      }
    );
  }
}