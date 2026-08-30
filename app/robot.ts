// app/robots.ts
import type { MetadataRoute } from "next";

const BASE_URL = "https://www.islami.or.id";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // ======================================================================
      // DEFAULT CRAWLER RULE
      // ======================================================================
      {
        userAgent: "*",

        // Semua konten publik boleh dirayapi.
        allow: "/",

        // Area private, transaksi, API, dan dashboard tidak perlu dirayapi.
        disallow: [
          "/api/",
          "/admin/",
          "/dashboard/",
          "/auth/",
          "/login/",
          "/register/",
          "/profile/",
          "/donasi-saya/",
          "/checkout/",
          "/payment/",
          "/fundraiser/stats/",
        ],
      },

      // ======================================================================
      // GOOGLEBOT
      // ======================================================================
      {
        userAgent: "Googlebot",

        allow: "/",

        disallow: [
          "/api/",
          "/admin/",
          "/dashboard/",
          "/auth/",
          "/login/",
          "/register/",
          "/profile/",
          "/donasi-saya/",
          "/checkout/",
          "/payment/",
          "/fundraiser/stats/",
        ],
      },
    ],

    // Sitemap utama
    sitemap: `${BASE_URL}/sitemap.xml`,

    // Preferred host
    host: BASE_URL,
  };
}