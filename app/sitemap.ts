// app/sitemap.ts
import type { MetadataRoute } from "next";
import { createClient } from "@sanity/client";

// ============================================================================
// CONFIGURATION
// ============================================================================

const BASE_URL = "https://www.islami.or.id";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

if (!projectId) {
  throw new Error(
    "NEXT_PUBLIC_SANITY_PROJECT_ID belum disetel di environment variables."
  );
}

// ============================================================================
// SANITY CLIENT
// ============================================================================

const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion: "2026-06-20",
  useCdn: true,
});

// ============================================================================
// SITEMAP
// ============================================================================

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // --------------------------------------------------------------------------
  // STATIC PUBLIC PAGES
  // --------------------------------------------------------------------------
  //
  // Hanya masukkan halaman yang memang:
  // - dapat diakses publik
  // - ingin diindeks Google
  // - memiliki nilai pencarian
  //
  // Jangan masukkan:
  // /api
  // /admin
  // /dashboard
  // /checkout
  // /profile
  // /donasi-saya
  // halaman statistik internal
  //
  // --------------------------------------------------------------------------

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      changeFrequency: "daily",
      priority: 1,
    },

    {
      url: `${BASE_URL}/news`,
      changeFrequency: "daily",
      priority: 0.9,
    },

    {
      url: `${BASE_URL}/zakat`,
      changeFrequency: "weekly",
      priority: 0.8,
    },

    {
      url: `${BASE_URL}/peta-situs`,
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ];

  let campaignRoutes: MetadataRoute.Sitemap = [];
  let newsRoutes: MetadataRoute.Sitemap = [];

  try {
    // ========================================================================
    // FETCH SEO-INDEXABLE CONTENT FROM SANITY
    // ========================================================================

    const query = `
      {
        "programs": *[
          _type == "program" &&
          defined(slug.current)
        ] {
          "slug": slug.current,
          _updatedAt
        },

        "news": *[
          _type == "news" &&
          defined(slug.current)
        ] {
          "slug": slug.current,
          publishedAt,
          _updatedAt
        }
      }
    `;

    const data = await sanityClient.fetch(query);

    // ========================================================================
    // CAMPAIGN / PROGRAM
    // ========================================================================

    if (Array.isArray(data?.programs)) {
      campaignRoutes = data.programs
        .filter(
          (program: any) =>
            typeof program?.slug === "string" &&
            program.slug.trim().length > 0
        )
        .map((program: any) => {
          const route: MetadataRoute.Sitemap[number] = {
            url: `${BASE_URL}/campaign/${encodeURIComponent(
              program.slug.trim()
            )}`,
            changeFrequency: "daily",
            priority: 0.8,
          };

          if (program._updatedAt) {
            route.lastModified = new Date(program._updatedAt);
          }

          return route;
        });
    }

    // ========================================================================
    // NEWS / ARTICLES
    // ========================================================================

    if (Array.isArray(data?.news)) {
      newsRoutes = data.news
        .filter(
          (article: any) =>
            typeof article?.slug === "string" &&
            article.slug.trim().length > 0
        )
        .map((article: any) => {
          const route: MetadataRoute.Sitemap[number] = {
            url: `${BASE_URL}/news/${encodeURIComponent(
              article.slug.trim()
            )}`,
            changeFrequency: "weekly",
            priority: 0.7,
          };

          // _updatedAt lebih tepat untuk lastModified sitemap
          // karena menunjukkan perubahan terakhir dokumen.
          if (article._updatedAt) {
            route.lastModified = new Date(article._updatedAt);
          } else if (article.publishedAt) {
            route.lastModified = new Date(article.publishedAt);
          }

          return route;
        });
    }
  } catch (error) {
    console.error(
      "[SITEMAP] Gagal mengambil data sitemap dari Sanity:",
      error
    );
  }

  // ==========================================================================
  // REMOVE DUPLICATE URL
  // ==========================================================================

  const allRoutes: MetadataRoute.Sitemap = [
    ...staticRoutes,
    ...campaignRoutes,
    ...newsRoutes,
  ];

  return Array.from(
    new Map(allRoutes.map((route) => [route.url, route])).values()
  );
}