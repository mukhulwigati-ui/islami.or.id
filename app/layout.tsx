// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import LayoutClientWrapper from "@/components/LayoutClientWrapper";
import BottomNav from "@/components/BottomNav"; // 🚀 Import BottomNav Global
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 🚀 MASTER SEO & PWA METADATA ISLAMI.OR.ID
export const metadata: Metadata = {
  title: {
    default: "islami.or.id | Platform Sedekah, Infaq & Zakat Online Amanah",
    template: "%s | islami.or.id"
  },
  description: "Salurkan sedekah, infaq, zakat, dan wakaf Anda secara instan dan amanah melalui islami.or.id. Mengalirkan keberkahan dan kepedulian untuk pemberdayaan ummat, yatim, dhuafa, dan program sosial kemanusiaan.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Islami",
  },
  keywords: [
    "islami",
    "islami or id",
    "sedekah online",
    "infaq online",
    "bayar zakat online",
    "wakaf quran",
    "sedekah subuh",
    "donasi yatim dhuafa",
    "lembaga amil zakat amanah",
    "donasi qris instant",
  ],
  authors: [{ name: "islami.or.id", url: "https://www.islami.or.id" }],
  creator: "islami.or.id",
  publisher: "islami.or.id",
  metadataBase: new URL("https://www.islami.or.id"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "islami.or.id | Platform Sedekah, Infaq & Zakat Online Amanah",
    description: "Tunaikan kepedulian Anda dengan mudah. Salurkan sedekah subuh, infaq produktif, dan zakat mal/fitrah secara transparan dan otomatis via QRIS & Virtual Account bersama islami.or.id.",
    url: "https://www.islami.or.id",
    siteName: "islami.or.id",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "https://www.islami.or.id/images/banner.png",
        width: 1200,
        height: 630,
        type: "image/png",
        alt: "islami.or.id - Mengalirkan Keberkahan Melalui Sedekah dan Infaq",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "islami.or.id | Sedekah & Infaq Online Mudah",
    description: "Platform resmi galang donasi, sedekah, infaq, dan zakat amanah bersama islami.or.id.",
    images: ["https://www.islami.or.id/images/banner.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "google-site-verification-token-anda",
  },
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
      <body className="min-h-screen bg-gray-100 flex flex-col text-gray-800" suppressHydrationWarning>
        
        {/* 🚀 LAYOUT CLIENT WRAPPER */}
        <LayoutClientWrapper>
          {children}
        </LayoutClientWrapper>

        {/* 🚀 GLOBAL BOTTOM NAVIGATION */}
        <BottomNav />

      </body>
    </html>
  );
}