// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import LayoutClientWrapper from "@/components/LayoutClientWrapper";
import BottomNav from "@/components/BottomNav";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://www.islami.or.id";
const SITE_NAME = "islami.or.id";

// ============================================================================
// MASTER SEO METADATA
// ============================================================================
// Metadata global sengaja dibuat lebih luas daripada sekadar donasi,
// karena islami.or.id akan dibangun sebagai portal Islam sekaligus
// platform program kebaikan.
// ============================================================================
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: "islami.or.id | Portal Islam & Inspirasi Muslim Indonesia",
    template: "%s | islami.or.id",
  },

  description:
    "Portal Islam Indonesia yang menyajikan artikel keislaman, Al-Qur'an, hadis, fikih, doa, sejarah Islam, keluarga Muslim, zakat, sedekah, wakaf, dan berbagai inspirasi kebaikan.",

  applicationName: SITE_NAME,

  manifest: "/manifest.json",

  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Islami",
  },

  authors: [
    {
      name: SITE_NAME,
      url: SITE_URL,
    },
  ],

  creator: SITE_NAME,
  publisher: SITE_NAME,

  // --------------------------------------------------------------------------
  // ROBOTS
  // --------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------
  // OPEN GRAPH
  // --------------------------------------------------------------------------
  openGraph: {
    title: "islami.or.id | Portal Islam & Inspirasi Muslim Indonesia",

    description:
      "Temukan artikel Islam, Al-Qur'an, hadis, fikih, doa, sejarah Islam, keluarga Muslim, zakat, sedekah, wakaf, dan berbagai inspirasi kebaikan.",

    url: SITE_URL,
    siteName: SITE_NAME,

    locale: "id_ID",
    type: "website",

    images: [
      {
        url: "/images/banner.png",
        width: 1200,
        height: 630,
        type: "image/png",
        alt: "islami.or.id - Portal Islam & Inspirasi Muslim Indonesia",
      },
    ],
  },

  // --------------------------------------------------------------------------
  // TWITTER / X
  // --------------------------------------------------------------------------
  twitter: {
    card: "summary_large_image",

    title: "islami.or.id | Portal Islam & Inspirasi Muslim Indonesia",

    description:
      "Artikel Islam, Al-Qur'an, hadis, fikih, doa, sejarah Islam, keluarga Muslim, zakat, sedekah, wakaf, dan inspirasi kebaikan.",

    images: ["/images/banner.png"],
  },

  // --------------------------------------------------------------------------
  // ICON
  // --------------------------------------------------------------------------
  icons: {
    icon: [
      {
        url: "/favicon.ico",
      },
    ],
    apple: [
      {
        url: "/apple-touch-icon.png",
      },
    ],
  },

  // ==========================================================================
  // GOOGLE SEARCH CONSOLE
  // ==========================================================================
  // JANGAN masukkan token palsu.
  //
  // Setelah mendapatkan verification code dari Google Search Console,
  // aktifkan bagian berikut:
  //
  // verification: {
  //   google: "MASUKKAN_TOKEN_GOOGLE_SEARCH_CONSOLE_DI_SINI",
  // },
  // ==========================================================================
};

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

              function gtag(){
                dataLayer.push(arguments);
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