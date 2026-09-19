// app/sitemap.ts

import type { MetadataRoute } from "next";
import { createClient } from "@sanity/client";

// ============================================================================
// CONFIGURATION
// ============================================================================

const BASE_URL = "https://www.islami.or.id";

/**
 * Project ID dan dataset BUKAN secret,
 * jadi aman menggunakan NEXT_PUBLIC_.
 *
 * Fallback dipakai supaya build Vercel tidak gagal hanya karena
 * environment variable belum tersedia.
 */
const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
  "xqggeww8";

const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET ||
  "production";

// ============================================================================
// SITEMAP REVALIDATION
// ============================================================================
//
// Sitemap akan dapat diperbarui maksimal setiap 1 jam.
//
// Jadi artikel / campaign baru dari Sanity tidak harus menunggu
// deployment Vercel berikutnya.
// ============================================================================

export const revalidate = 3600;

// ============================================================================
// SANITY CLIENT
// ============================================================================

const sanityClient = createClient({
  projectId,
  dataset,

  apiVersion: "2026-09-19",

  /**
   * Sitemap hanya membutuhkan data publik/published.
   * CDN cocok karena ini bukan data transaksi realtime.
   */
  useCdn: true,

  perspective: "published",
});

// ============================================================================
// TYPES
// ============================================================================

interface SanityCampaignSitemapItem {
  slug?: string;
  updatedAt?: string;
  createdAt?: string;
}

interface SanityNewsSitemapItem {
  slug?: string;
  publishedAt?: string;
  updatedAt?: string;
  createdAt?: string;
}

interface SanitySitemapData {
  campaigns?: SanityCampaignSitemapItem[];
  news?: SanityNewsSitemapItem[];
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Membersihkan slug agar:
 *
 * " artikel-islam "
 * "/artikel-islam/"
 *
 * menjadi:
 *
 * "artikel-islam"
 */
function normalizeSlug(
  value: unknown
): string | null {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    return null;
  }

  const slug = value
    .trim()
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");

  if (!slug) {
    return null;
  }

  return slug;
}

/**
 * Encode setiap bagian URL.
 *
 * Lebih aman daripada encode seluruh path sekaligus.
 */
function encodeSlug(
  slug: string
): string {
  return slug
    .split("/")
    .filter(Boolean)
    .map((part) =>
      encodeURIComponent(part)
    )
    .join("/");
}

/**
 * Membuat objek Date hanya jika nilainya valid.
 *
 * Ini mencegah sitemap gagal dirender akibat Invalid Date.
 */
function safeDate(
  value?: string
): Date | undefined {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return undefined;
  }

  return date;
}

/**
 * Membuat URL absolut yang konsisten.
 *
 * Semua sitemap wajib menggunakan:
 *
 * https://www.islami.or.id
 */
function createUrl(
  pathname = ""
): string {
  const cleanPath =
    pathname
      .trim()
      .replace(/^\/+/, "")
      .replace(/\/+$/, "");

  if (!cleanPath) {
    return BASE_URL;
  }

  return `${BASE_URL}/${cleanPath}`;
}

// ============================================================================
// SITEMAP
// ============================================================================

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ==========================================================================
  // STATIC PUBLIC ROUTES
  // ==========================================================================
  //
  // Masukkan hanya halaman publik yang:
  //
  // - ingin diindeks Google
  // - mempunyai nilai pencarian
  // - benar-benar tersedia
  //
  // Jangan masukkan:
  //
  // /api
  // /admin
  // /dashboard
  // /checkout
  // /profile
  // /donasi-saya
  // /login
  // halaman pembayaran
  // halaman sukses transaksi
  //
  // ==========================================================================

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,

      changeFrequency:
        "daily",

      priority:
        1,
    },

    {
      url:
        createUrl("news"),

      changeFrequency:
        "daily",

      priority:
        0.9,
    },

    {
      url:
        createUrl("zakat"),

      changeFrequency:
        "weekly",

      priority:
        0.8,
    },

    {
      url:
        createUrl(
          "peta-situs"
        ),

      changeFrequency:
        "weekly",

      priority:
        0.6,
    },
  ];

  // ==========================================================================
  // DYNAMIC ROUTES
  // ==========================================================================

  let campaignRoutes:
    MetadataRoute.Sitemap = [];

  let newsRoutes:
    MetadataRoute.Sitemap = [];

  try {
    // ========================================================================
    // GROQ
    // ========================================================================
    //
    // Campaign sekarang mendukung dua kemungkinan type:
    //
    // program
    // campaign
    //
    // karena route campaign Anda juga sudah mendukung keduanya.
    //
    // perspective: "published" pada client memastikan draft Sanity
    // tidak dimasukkan ke sitemap.
    //
    // ========================================================================

    const query = `
      {
        "campaigns": *[
          _type in ["program", "campaign"] &&
          defined(slug.current) &&
          length(slug.current) > 0
        ]
        | order(_updatedAt desc) {
          "slug": slug.current,

          "updatedAt": _updatedAt,

          "createdAt": _createdAt
        },

        "news": *[
          _type == "news" &&
          defined(slug.current) &&
          length(slug.current) > 0
        ]
        | order(
            coalesce(
              publishedAt,
              _createdAt
            ) desc
          ) {
          "slug": slug.current,

          publishedAt,

          "updatedAt": _updatedAt,

          "createdAt": _createdAt
        }
      }
    `;

    const data =
      await sanityClient.fetch<SanitySitemapData>(
        query,
        {},
        {
          /**
           * Sitemap tidak memerlukan request realtime.
           */
          next: {
            revalidate: 3600,
          },
        }
      );

    // ========================================================================
    // CAMPAIGN ROUTES
    // ========================================================================

    if (
      Array.isArray(
        data?.campaigns
      )
    ) {
      campaignRoutes =
        data.campaigns
          .map((campaign) => {
            const slug =
              normalizeSlug(
                campaign?.slug
              );

            if (!slug) {
              return null;
            }

            const lastModified =
              safeDate(
                campaign.updatedAt
              ) ||
              safeDate(
                campaign.createdAt
              );

            const route:
              MetadataRoute.Sitemap[number] =
              {
                url:
                  createUrl(
                    `campaign/${encodeSlug(
                      slug
                    )}`
                  ),

                /**
                 * Campaign bisa mengalami perubahan:
                 *
                 * - narasi
                 * - target
                 * - laporan
                 * - data program
                 */
                changeFrequency:
                  "daily",

                priority:
                  0.8,
              };

            if (
              lastModified
            ) {
              route.lastModified =
                lastModified;
            }

            return route;
          })
          .filter(
            (
              route
            ): route is MetadataRoute.Sitemap[number] =>
              route !== null
          );
    }

    // ========================================================================
    // NEWS ROUTES
    // ========================================================================

    if (
      Array.isArray(
        data?.news
      )
    ) {
      newsRoutes =
        data.news
          .map((article) => {
            const slug =
              normalizeSlug(
                article?.slug
              );

            if (!slug) {
              return null;
            }

            /**
             * _updatedAt menjadi prioritas karena menunjukkan
             * perubahan terakhir artikel.
             *
             * Jika tidak tersedia:
             *
             * publishedAt
             *
             * lalu:
             *
             * _createdAt
             */
            const lastModified =
              safeDate(
                article.updatedAt
              ) ||
              safeDate(
                article.publishedAt
              ) ||
              safeDate(
                article.createdAt
              );

            const route:
              MetadataRoute.Sitemap[number] =
              {
                url:
                  createUrl(
                    `news/${encodeSlug(
                      slug
                    )}`
                  ),

                changeFrequency:
                  "weekly",

                priority:
                  0.7,
              };

            if (
              lastModified
            ) {
              route.lastModified =
                lastModified;
            }

            return route;
          })
          .filter(
            (
              route
            ): route is MetadataRoute.Sitemap[number] =>
              route !== null
          );
    }
  } catch (error) {
    // ==========================================================================
    // FAIL SAFE
    // ==========================================================================
    //
    // Kalau Sanity sedang bermasalah, jangan membuat /sitemap.xml ikut 500.
    //
    // Sitemap tetap mengembalikan halaman statis.
    //
    // ==========================================================================

    console.error(
      "[SITEMAP] Gagal mengambil data sitemap dari Sanity:",
      error
    );
  }

  // ==========================================================================
  // COMBINE
  // ==========================================================================

  const allRoutes:
    MetadataRoute.Sitemap = [
      ...staticRoutes,
      ...campaignRoutes,
      ...newsRoutes,
    ];

  // ==========================================================================
  // REMOVE DUPLICATES
  // ==========================================================================

  const uniqueRoutes =
    Array.from(
      new Map(
        allRoutes.map(
          (route) => [
            route.url,
            route,
          ]
        )
      ).values()
    );

  // ==========================================================================
  // RETURN
  // ==========================================================================

  return uniqueRoutes;
}