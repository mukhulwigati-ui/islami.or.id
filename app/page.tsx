```tsx
// app/page.tsx

import React from "react";
import type { Metadata } from "next";
import { createClient } from "@sanity/client";

import Hero, { HeroBanner } from "@/components/Hero";
import TotalAccumulationWidget from "@/components/TotalAccumulationWidget";
import Campaign from "@/components/Campaign";
import News from "@/components/News";
import Footer from "@/components/Footer";

// ============================================================================
// KONFIGURASI SITUS
// ============================================================================

const SITE_URL = "https://www.islami.or.id";
const SITE_NAME = "islami.or.id";

// ============================================================================
// SEO METADATA HOMEPAGE
// ============================================================================
//
// Catatan:
// Root layout menggunakan:
//
// title: {
//   default: "...",
//   template: "%s | islami.or.id",
// }
//
// Karena itu title di halaman ini TIDAK perlu menulis "islami.or.id" lagi.
// Hasil akhir otomatis menjadi:
//
// Portal Islam & Inspirasi Muslim Indonesia | islami.or.id
//
// ============================================================================

export const metadata: Metadata = {
  title: "Portal Islam & Inspirasi Muslim Indonesia",

  description:
    "islami.or.id adalah portal Islam Indonesia yang menyajikan artikel Al-Qur'an, hadis, fikih, doa, sejarah Islam, keluarga Muslim, zakat, sedekah, wakaf, serta berbagai program dan inspirasi kebaikan.",

  alternates: {
    canonical: SITE_URL,
  },

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

  openGraph: {
    title: "islami.or.id | Portal Islam & Inspirasi Muslim Indonesia",

    description:
      "Temukan artikel Islam, Al-Qur'an, hadis, fikih, doa, sejarah Islam, keluarga Muslim, zakat, sedekah, wakaf, serta berbagai inspirasi dan program kebaikan.",

    url: SITE_URL,
    siteName: SITE_NAME,

    locale: "id_ID",
    type: "website",

    images: [
      {
        url: `${SITE_URL}/images/banner.png`,
        width: 1200,
        height: 630,
        type: "image/png",
        alt: "islami.or.id - Portal Islam dan Inspirasi Muslim Indonesia",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title: "islami.or.id | Portal Islam & Inspirasi Muslim Indonesia",

    description:
      "Artikel Islam, Al-Qur'an, hadis, fikih, doa, sejarah Islam, keluarga Muslim, zakat, sedekah, wakaf, dan inspirasi kebaikan.",

    images: [`${SITE_URL}/images/banner.png`],
  },
};

// ============================================================================
// SANITY CONFIGURATION
// ============================================================================

const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "xqggeww8";

const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

if (!projectId) {
  throw new Error(
    "NEXT_PUBLIC_SANITY_PROJECT_ID belum disetel di environment variables."
  );
}

const serverClient = createClient({
  projectId,
  dataset,

  // Gunakan versi API yang konsisten dan modern.
  apiVersion: "2026-06-20",

  // Homepage menampilkan nominal donasi yang perlu relatif aktual.
  useCdn: false,

  // Token hanya digunakan di server.
  token: process.env.SANITY_API_TOKEN,
});

// ============================================================================
// RENDERING STRATEGY
// ============================================================================
//
// Data campaign dan nominal donasi bersifat dinamis.
//
// force-dynamic memastikan halaman dirender menggunakan data terbaru.
//
// ============================================================================

export const dynamic = "force-dynamic";
export const revalidate = 0;

// ============================================================================
// TYPES
// ============================================================================

interface ProgramItem {
  id: string;
  title?: string;
  slug?: string;
  image?: string;

  collectedAmount?: number;
  collectedRaw?: number;
  targetAmount?: number;

  daysLeft?: number;

  donors?: unknown[];
  donorsCount?: number;
}

interface HomePageData {
  heroBanners?: Array<{
    id?: string;
    title?: string;
    imageUrl?: string;
    linkUrl?: string;
  }>;

  mendesak?: ProgramItem[];
  unggulan?: ProgramItem[];
  pilihan?: ProgramItem[];
}

// ============================================================================
// HOMEPAGE
// ============================================================================

export default async function HomePage() {
  let heroBanners: HeroBanner[] = [];

  let mendesakPrograms: ProgramItem[] = [];
  let unggulanPrograms: ProgramItem[] = [];
  let pilihanPrograms: ProgramItem[] = [];

  try {
    // ========================================================================
    // GROQ QUERY
    // ========================================================================
    //
    // Semua data homepage diambil dalam satu request agar lebih efisien.
    //
    // coalesce() digunakan untuk menjaga kompatibilitas dengan field lama
    // seperti collectedRaw.
    //
    // ========================================================================

    const query = `
      {
        "heroBanners":
          *[
            _type in ["heroBanner", "banner"] &&
            active != false
          ]
          | order(order asc, _createdAt desc)
          [0...10]
          {
            "id": _id,
            "title": coalesce(title, name),
            "imageUrl": coalesce(
              image.asset->url,
              banner.asset->url
            ),
            "linkUrl": link
          },

        "mendesak":
          *[
            _type == "program" &&
            sectionType == "mendesak" &&
            defined(slug.current)
          ]
          | order(_createdAt desc)
          [0...5]
          {
            "id": _id,
            "title": title,
            "slug": slug.current,

            "image": image.asset->url,

            "collectedAmount":
              coalesce(collectedAmount, collectedRaw, 0),

            "collectedRaw":
              coalesce(collectedAmount, collectedRaw, 0),

            "targetAmount":
              coalesce(targetAmount, 50000000),

            "daysLeft": daysLeft,

            "donors": coalesce(donors, [])
          },

        "unggulan":
          *[
            _type == "program" &&
            sectionType == "unggulan" &&
            defined(slug.current)
          ]
          | order(_createdAt desc)
          [0...5]
          {
            "id": _id,
            "title": title,
            "slug": slug.current,

            "image": image.asset->url,

            "collectedAmount":
              coalesce(collectedAmount, collectedRaw, 0),

            "collectedRaw":
              coalesce(collectedAmount, collectedRaw, 0),

            "targetAmount":
              coalesce(targetAmount, 50000000),

            "donors": coalesce(donors, [])
          },

        "pilihan":
          *[
            _type == "program" &&
            (
              sectionType == "pilihan" ||
              !defined(sectionType)
            ) &&
            defined(slug.current)
          ]
          | order(_createdAt desc)
          [0...5]
          {
            "id": _id,
            "title": title,
            "slug": slug.current,

            "image": image.asset->url,

            "collectedAmount":
              coalesce(collectedAmount, collectedRaw, 0),

            "collectedRaw":
              coalesce(collectedAmount, collectedRaw, 0),

            "targetAmount":
              coalesce(targetAmount, 50000000),

            "donors": coalesce(donors, []),

            "donorsCount":
              count(coalesce(donors, []))
          }
      }
    `;

    const data = await serverClient.fetch<HomePageData>(query);

    // ========================================================================
    // HERO BANNER
    // ========================================================================

    if (Array.isArray(data?.heroBanners)) {
      heroBanners = data.heroBanners
        .filter(
          (
            item
          ): item is {
            id?: string;
            title?: string;
            imageUrl: string;
            linkUrl?: string;
          } =>
            Boolean(
              item &&
                typeof item.imageUrl === "string" &&
                item.imageUrl.trim().length > 0
            )
        )
        .map((item, index) => ({
          _id:
            item.id ||
            `homepage-hero-${index}`,

          title:
            item.title ||
            "islami.or.id",

          imageUrl:
            item.imageUrl,

          linkUrl:
            item.linkUrl || undefined,
        }));
    }

    // ========================================================================
    // CAMPAIGN SECTIONS
    // ========================================================================

    mendesakPrograms =
      Array.isArray(data?.mendesak)
        ? data.mendesak
        : [];

    unggulanPrograms =
      Array.isArray(data?.unggulan)
        ? data.unggulan
        : [];

    pilihanPrograms =
      Array.isArray(data?.pilihan)
        ? data.pilihan
        : [];
  } catch (error) {
    // Jangan membuat homepage crash jika Sanity sedang bermasalah.
    console.error(
      "[HOMEPAGE] Gagal mengambil data dari Sanity:",
      error
    );
  }

  // ==========================================================================
  // STRUCTURED DATA
  // ==========================================================================
  //
  // WebSite + Organization memberikan sinyal entity dasar kepada search engine.
  //
  // Jangan memasukkan rating/review palsu.
  //
  // ==========================================================================

  const structuredData = {
    "@context": "https://schema.org",

    "@graph": [
      {
        "@type": "WebSite",

        "@id": `${SITE_URL}/#website`,

        url: SITE_URL,

        name: SITE_NAME,

        alternateName: "Islami",

        inLanguage: "id-ID",

        description:
          "Portal Islam Indonesia yang menyajikan artikel keislaman dan berbagai program kebaikan.",
      },

      {
        "@type": "Organization",

        "@id": `${SITE_URL}/#organization`,

        name: SITE_NAME,

        url: SITE_URL,

        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/images/banner.png`,
        },
      },
    ],
  };

  // ==========================================================================
  // PAGE OUTPUT
  // ==========================================================================

  return (
    <>
      {/* ==================================================================== */}
      {/* STRUCTURED DATA */}
      {/* ==================================================================== */}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />

      {/* ==================================================================== */}
      {/* HOMEPAGE CONTENT */}
      {/* ==================================================================== */}

      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-start w-full overflow-x-hidden pb-24">
        <div className="w-full max-w-md mx-auto px-3 py-4 space-y-4">

          {/* ================================================================ */}
          {/* HERO */}
          {/* ================================================================ */}

          <Hero initialBanners={heroBanners} />

          {/* ================================================================ */}
          {/* TOTAL DONATION ACCUMULATION */}
          {/* ================================================================ */}

          <TotalAccumulationWidget />

          {/* ================================================================ */}
          {/* CAMPAIGNS */}
          {/* ================================================================ */}

          <Campaign
            mendesak={mendesakPrograms}
            unggulan={unggulanPrograms}
            pilihan={pilihanPrograms}
          />

          {/* ================================================================ */}
          {/* ISLAMIC ARTICLES / NEWS */}
          {/* ================================================================ */}

          <News />

          {/* ================================================================ */}
          {/* FOOTER */}
          {/* ================================================================ */}

          <Footer />
        </div>
      </main>
    </>
  );
}
```
