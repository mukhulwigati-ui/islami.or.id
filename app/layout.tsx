// app/layout.tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";

import LayoutClientWrapper from "@/components/LayoutClientWrapper";
import BottomNav from "@/components/BottomNav";

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

const DEFAULT_SOCIAL_DESCRIPTION =
  "Temukan artikel Islam, Al-Qur'an, hadis, fikih, doa, sejarah Islam, keluarga Muslim, zakat, sedekah, wakaf, dan berbagai inspirasi kebaikan.";

// ============================================================================
// SOCIAL IMAGE
// ============================================================================
//
// Gunakan Next.js File-Based Metadata:
//
// app/opengraph-image.jpg
// app/twitter-image.jpg
//
// Ukuran:
// 1200 x 630 px
//
// Karena file tersebut berada langsung di folder app,
// Next.js otomatis membuat:
//
// og:image
// twitter:image
//
// Jadi gambar TIDAK perlu didefinisikan manual di metadata root.
//
// Halaman dinamis seperti:
//
// /news/[slug]
// /campaign/[slug]
//
// tetap boleh mempunyai gambar Open Graph sendiri melalui generateMetadata().
// ============================================================================

// ============================================================================
// MASTER SEO METADATA
// ============================================================================

export const metadata: Metadata = {
  // ==========================================================================
  // BASE URL
  // ==========================================================================

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
  // KEYWORDS
  // ==========================================================================

  keywords: [
    "Islam",
    "islami",
    "artikel Islam",
    "Al-Qur'an",
    "hadis",
    "fikih",
    "doa",
    "sejarah Islam",
    "keluarga Muslim",
    "zakat",
    "sedekah",
    "wakaf",
    "infak",
    "dakwah",
    "inspirasi Muslim",
  ],

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
  // Gambar otomatis berasal dari:
  //
  // app/opengraph-image.jpg
  //
  // ==========================================================================

  openGraph: {
    type: "website",

    locale: "id_ID",

    url: SITE_URL,

    siteName: SITE_NAME,

    title: DEFAULT_TITLE,

    description: DEFAULT_SOCIAL_DESCRIPTION,
  },

  // ==========================================================================
  // TWITTER / X
  // ==========================================================================
  //
  // Gambar otomatis berasal dari:
  //
  // app/twitter-image.jpg
  //
  // ==========================================================================

  twitter: {
    card: "summary_large_image",

    title: DEFAULT_TITLE,

    description: DEFAULT_SOCIAL_DESCRIPTION,
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

    shortcut: [
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
  // REFERRER
  // ==========================================================================

  referrer: "origin-when-cross-origin",

  // ==========================================================================
  // GOOGLE SEARCH CONSOLE
  // ==========================================================================
  //
  // Kalau property Google Search Console Anda sudah diverifikasi melalui DNS,
  // bagian verification ini TIDAK perlu ditambahkan.
  //
  // Kalau memakai meta verification, baru aktifkan:
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
        {/* MAIN APPLICATION */}
        {/* ================================================================ */}

        <LayoutClientWrapper>
          {children}
        </LayoutClientWrapper>

        {/* ================================================================ */}
        {/* GLOBAL BOTTOM NAVIGATION */}
        {/* ================================================================ */}

        <BottomNav />
      </body>
    </html>
  );
}