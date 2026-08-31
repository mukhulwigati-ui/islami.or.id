// next.config.ts

import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

// ============================================================================
// NEXT.JS CONFIGURATION
// ============================================================================

const nextConfig: NextConfig = {
  // ==========================================================================
  // IMAGE OPTIMIZATION
  // ==========================================================================

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        port: "",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
    ],
  },

  // ==========================================================================
  // TURBOPACK
  // ==========================================================================

  turbopack: {},

  // ==========================================================================
  // SEO REDIRECTS
  // ==========================================================================
  //
  // Redirect permanen dari struktur URL lama:
  //
  // /blog
  // /blog/:slug
  //
  // menuju struktur URL baru:
  //
  // /news
  // /news/:slug
  //
  // permanent: true akan menghasilkan permanent redirect
  // sehingga Google dapat memindahkan sinyal URL lama ke URL baru.
  //
  // ==========================================================================

  async redirects() {
    return [
      // ----------------------------------------------------------------------
      // Halaman utama blog lama
      // ----------------------------------------------------------------------
      {
        source: "/blog",
        destination: "/news",
        permanent: true,
      },

      // ----------------------------------------------------------------------
      // Seluruh artikel blog lama
      //
      // Contoh:
      //
      // /blog/judul-artikel
      //
      // menjadi:
      //
      // /news/judul-artikel
      //
      // ----------------------------------------------------------------------
      {
        source: "/blog/:path*",
        destination: "/news/:path*",
        permanent: true,
      },
    ];
  },

  // ==========================================================================
  // SECURITY HEADERS
  // ==========================================================================

  async headers() {
    return [
      {
        source: "/:path*",

        headers: [
          // ==================================================================
          // CONTENT SECURITY POLICY
          // ==================================================================

          {
            key: "Content-Security-Policy",

            value: `
              default-src 'self';

              script-src
                'self'
                'unsafe-inline'
                'unsafe-eval'
                https://app.midtrans.com
                https://app.sandbox.midtrans.com
                https://snap-assets.midtrans.com
                https://www.googletagmanager.com;

              style-src
                'self'
                'unsafe-inline';

              img-src
                'self'
                data:
                blob:
                https://cdn.sanity.io
                https://www.google-analytics.com
                https://app.midtrans.com
                https://app.sandbox.midtrans.com
                https://*.googleusercontent.com
                https://*.gstatic.com;

              font-src
                'self'
                data:;

              frame-src
                'self'
                https://app.midtrans.com
                https://app.sandbox.midtrans.com
                https://api.midtrans.com;

              connect-src
                'self'
                https://vnneqinjvfxqkukvcyzm.supabase.co
                https://api.midtrans.com
                https://api.sandbox.midtrans.com
                https://app.midtrans.com
                https://app.sandbox.midtrans.com
                https://www.google-analytics.com
                https://stats.g.doubleclick.net;

              object-src 'none';

              base-uri 'self';

              form-action 'self';

              frame-ancestors 'self';

              upgrade-insecure-requests;
            `
              .replace(/\s{2,}/g, " ")
              .trim(),
          },

          // ==================================================================
          // SECURITY HEADERS TAMBAHAN
          // ==================================================================

          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },

          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },

          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
    ];
  },
};

// ============================================================================
// PWA CONFIGURATION
// ============================================================================

export default withPWA({
  dest: "public",

  cacheOnFrontEndNav: true,

  aggressiveFrontEndNavCaching: true,

  reloadOnOnline: true,

  disable: process.env.NODE_ENV === "development",
})(nextConfig);