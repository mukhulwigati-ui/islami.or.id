// app/layout.tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import LayoutClientWrapper from "@/components/LayoutClientWrapper";
import BottomNav from "@/components/BottomNav";
import Script from "next/script";
import "./globals.css";

// ============================================================================
// FONT
// ============================================================================

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// ============================================================================
// SITE CONFIG
// ============================================================================

const SITE_URL = "https://www.islami.or.id";
const SITE_NAME = "islami.or.id";

const DEFAULT_TITLE =
  "islami.or.id | Portal Islam & Inspirasi Muslim Indonesia";

const DEFAULT_DESCRIPTION =
  "Portal Islam Indonesia yang menyajikan artikel keislaman, Al-Qur'an, hadis, fikih, doa, sejarah Islam, keluarga Muslim, zakat, sedekah, wakaf, dan berbagai inspirasi kebaikan.";

// ============================================================================
// OPEN GRAPH IMAGE
// ============================================================================
//
// File harus berada di:
//
// public/og-image.jpg
//
// dan harus bisa dibuka langsung:
//
// https://www.islami.or.id/og-image.jpg
//
// Ukuran disarankan:
// 1200 x 630 px
//
// ============================================================================

const OG_IMAGE = `${SITE_URL}/og-image.jpg`;

// ============================================================================
// MASTER SEO METADATA
// ============================================================================

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  // ==========================================================================
  // TITLE
  // ==========================================================================

  title: {
    default: DEFAULT_TITLE,
    template: "%s | islami.or.id",
  },

  // ==========================================================================
  // DESCRIPTION
  // ==========================================================================

  description: DEFAULT_DESCRIPTION,

  // ==========================================================================
  // SITE INFORMATION
  // ==========================================================================

  applicationName: SITE_NAME,

  authors: [
    {
      name: SITE_NAME,
      url: SITE_URL,
    },
  ],

  creator: SITE_NAME,
  publisher: SITE_NAME,

  // ==========================================================================
  // CANONICAL
  // ==========================================================================

  alternates: {
    canonical: SITE_URL,
  },

  // ==========================================================================
  // PWA
  // ==========================================================================

  manifest: "/manifest.json",

  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Islami",
  },

  // ==========================================================================
  // ROBOTS
  // ==========================================================================

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

  // ==========================================================================
  // OPEN GRAPH
  // ==========================================================================
  //
  // Dipakai oleh:
  // - WhatsApp
  // - Facebook
  // - Telegram
  // - LinkedIn
  // dan platform lain yang membaca Open Graph.
  //
  // ==========================================================================

  openGraph: {
    type: "website",

    locale: "id_ID",

    url: SITE_URL,

    siteName: SITE_NAME,

    title: DEFAULT_TITLE,

    description:
      "Temukan artikel Islam, Al-Qur'an, hadis, fikih, doa, sejarah Islam, keluarga Muslim, zakat, sedekah, wakaf, dan berbagai inspirasi kebaikan.",

    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        type: "image/jpeg",
        alt: "islami.or.id - Portal Islam & Inspirasi Muslim Indonesia",
      },
    ],
  },

  // ==========================================================================
  // TWITTER / X
  // ==========================================================================

  twitter: {
    card: "summary_large_image",

    title: DEFAULT_TITLE,

    description:
      "Artikel Islam, Al-Qur'an, hadis, fikih, doa, sejarah Islam, keluarga Muslim, zakat, sedekah, wakaf, dan inspirasi kebaikan.",

    images: [OG_IMAGE],
  },

  // ==========================================================================
  // ICONS
  // ==========================================================================

  icons: {
    icon: [
      {
        url: "/favicon.ico",
        type: "image/x-icon",
      },
    ],

    apple: [
      {
        url: "/apple-touch-icon.png",
      },
    ],
  },

  // ==========================================================================
  // FORMAT DETECTION
  // ==========================================================================

  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  // ==========================================================================
  // GOOGLE SEARCH CONSOLE
  // ==========================================================================
  //
  // Jangan memasukkan token palsu.
  //
  // Jika nanti sudah mendapatkan verification code dari Google Search Console,
  // aktifkan:
  //
  // verification: {
  //   google: "TOKEN_GOOGLE_SEARCH_CONSOLE",
  // },
  //
  // ==========================================================================
};

// ============================================================================
// ROOT LAYOUT
// ============================================================================

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body
        className="min-h-screen bg-slate-100 flex flex-col text-slate-800"
        suppressHydrationWarning
      >
        {/* ================================================================ */}
        {/* GOOGLE ANALYTICS GA4 */}
        {/* ================================================================ */}

        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-FG813S8GLF"
        />

        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];

              function gtag() {
                window.dataLayer.push(arguments);
              }

              gtag('js', new Date());

              gtag('config', 'G-FG813S8GLF', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />

        {/* ================================================================ */}
        {/* MIDTRANS SNAP */}
        {/* ================================================================ */}

        <Script
          src="https://app.midtrans.com/snap/snap.js"
          data-client-key={
            process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ||
            "Mid-client-NVjY5ccbH7M47czA"
          }
          strategy="lazyOnload"
          crossOrigin="anonymous"
        />

        {/* ================================================================ */}
        {/* MAIN APPLICATION */}
        {/* ================================================================ */}

        <LayoutClientWrapper>{children}</LayoutClientWrapper>

        {/* ================================================================ */}
        {/* GLOBAL BOTTOM NAVIGATION */}
        {/* ================================================================ */}

        <BottomNav />
      </body>
    </html>
  );
}