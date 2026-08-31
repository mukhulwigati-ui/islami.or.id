// next.config.ts

import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

// ============================================================================
// CONTENT SECURITY POLICY
// ============================================================================
//
// CATATAN:
//
// 1. Midtrans sudah TIDAK digunakan.
//    Seluruh domain Midtrans dihapus dari CSP.
//
// 2. Sanity Studio berada di:
//      /studio
//
//    Studio membutuhkan akses ke:
//      *.api.sanity.io
//      *.apicdn.sanity.io
//      cdn.sanity.io
//      core.sanity-cdn.com
//
// 3. 'unsafe-eval' masih dipertahankan karena Sanity Studio / tooling
//    tertentu dapat membutuhkannya.
//
// 4. CASAKU_LICENSE_KEY tidak pernah dikirim ke browser.
//    Komunikasi Casaku dilakukan server-side dari API Route.
//
// ============================================================================

const contentSecurityPolicy = `
  default-src 'self';

  script-src
    'self'
    'unsafe-inline'
    'unsafe-eval'
    https://core.sanity-cdn.com
    https://www.googletagmanager.com;

  style-src
    'self'
    'unsafe-inline';

  img-src
    'self'
    data:
    blob:
    https://cdn.sanity.io
    https://*.sanity.io
    https://*.apicdn.sanity.io
    https://www.google-analytics.com
    https://www.googletagmanager.com
    https://*.googleusercontent.com
    https://*.gstatic.com;

  font-src
    'self'
    data:;

  connect-src
    'self'
    https://*.api.sanity.io
    https://*.apicdn.sanity.io
    https://cdn.sanity.io
    https://core.sanity-cdn.com
    https://vnneqinjvfxqkukvcyzm.supabase.co
    wss://vnneqinjvfxqkukvcyzm.supabase.co
    https://www.google-analytics.com
    https://analytics.google.com
    https://region1.google-analytics.com
    https://stats.g.doubleclick.net;

  frame-src
    'self';

  worker-src
    'self'
    blob:;

  manifest-src
    'self';

  media-src
    'self'
    data:
    blob:;

  object-src
    'none';

  base-uri
    'self';

  form-action
    'self';

  frame-ancestors
    'self';

  upgrade-insecure-requests;
`
  .replace(/\s{2,}/g, " ")
  .trim();

// ============================================================================
// NEXT.JS CONFIGURATION
// ============================================================================

const nextConfig: NextConfig = {
  // ==========================================================================
  // IMAGE OPTIMIZATION
  // ==========================================================================

  images: {
    remotePatterns: [
      // ----------------------------------------------------------------------
      // SANITY IMAGE CDN
      // ----------------------------------------------------------------------
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        port: "",
        pathname: "/images/**",
      },

      // ----------------------------------------------------------------------
      // GOOGLE ACCOUNT / PROFILE IMAGES
      // ----------------------------------------------------------------------
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

  async redirects() {
    return [
      // ----------------------------------------------------------------------
      // BLOG LAMA → NEWS
      // ----------------------------------------------------------------------

      {
        source: "/blog",
        destination: "/news",
        permanent: true,
      },

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
            value: contentSecurityPolicy,
          },

          // ==================================================================
          // MIME SNIFFING PROTECTION
          // ==================================================================

          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },

          // ==================================================================
          // REFERRER POLICY
          // ==================================================================

          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },

          // ==================================================================
          // PERMISSIONS POLICY
          // ==================================================================

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

  disable:
    process.env.NODE_ENV ===
    "development",
})(nextConfig);