// app/page.tsx

import React, { Suspense } from "react";
import type { Metadata } from "next";
import { createClient } from "@sanity/client";

import Hero, {
  type HeroBanner,
} from "@/components/Hero";

import TotalAccumulationWidget from "@/components/TotalAccumulationWidget";
import Campaign from "@/components/Campaign";
import News from "@/components/News";
import Footer from "@/components/Footer";
import ReferralTracker from "@/components/ReferralTracker";

// ============================================================================
// KONFIGURASI SITUS
// ============================================================================

const SITE_URL = "https://www.islami.or.id";
const SITE_NAME = "islami.or.id";

const SITE_DESCRIPTION =
  "islami.or.id adalah portal Islam Indonesia yang menyajikan artikel Al-Qur'an, hadis, fikih, doa, sejarah Islam, keluarga Muslim, zakat, sedekah, wakaf, serta berbagai program dan inspirasi kebaikan.";

const OG_IMAGE = `${SITE_URL}/images/banner.png`;

// ============================================================================
// RENDERING STRATEGY
// ============================================================================
//
// Homepage memiliki beberapa komponen yang berpotensi membutuhkan:
// - browser API
// - search params
// - localStorage
// - runtime data
//
// Karena itu homepage tidak dipaksa prerender/ISR.
//
// force-dynamic tetap SERVER RENDERING.
// Ini bukan client-side rendering.
//
// Google tetap menerima HTML dari Next.js server.
// ============================================================================

export const dynamic = "force-dynamic";
export const revalidate = 0;

// ============================================================================
// SEO METADATA HOMEPAGE
// ============================================================================

export const metadata: Metadata = {
  title: "Portal Islam & Inspirasi Muslim Indonesia",

  description: SITE_DESCRIPTION,

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
        url: OG_IMAGE,
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

    images: [OG_IMAGE],
  },
};

// ============================================================================
// SANITY CONFIGURATION
// ============================================================================

const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
  "xqggeww8";

const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET ||
  "production";

const serverClient = createClient({
  projectId,
  dataset,
  apiVersion: "2026-06-20",
  useCdn: false,
});

// ============================================================================
// TYPES
// ============================================================================

interface SanityHeroBanner {
  id?: string;
  title?: string;
  imageUrl?: string;
  linkUrl?: string;
}

interface HomePageData {
  heroBanners?: SanityHeroBanner[];
  mendesak?: any[];
  unggulan?: any[];
  pilihan?: any[];
}

// ============================================================================
// GROQ HOMEPAGE
// ============================================================================

const HOME_QUERY = `
{
  "heroBanners": *[
    _type in ["heroBanner", "banner"] &&
    active != false
  ]
  | order(
      order asc,
      _createdAt desc
    )[0...10] {

    "id": _id,

    "title": coalesce(
      title,
      name,
      "islami.or.id"
    ),

    "imageUrl": coalesce(
      image.asset->url,
      banner.asset->url
    ),

    "linkUrl": coalesce(
      link,
      linkUrl
    )
  },

  "mendesak": *[
    _type == "program" &&
    sectionType == "mendesak" &&
    defined(slug.current)
  ]
  | order(
      _createdAt desc
    )[0...5] {

    "id": _id,

    "title": coalesce(
      title,
      "Program Kebaikan"
    ),

    "slug": slug.current,

    "image": coalesce(
      image.asset->url,
      ""
    ),

    "collectedAmount": coalesce(
      collectedAmount,
      collectedRaw,
      0
    ),

    "collectedRaw": coalesce(
      collectedRaw,
      collectedAmount,
      0
    ),

    "targetAmount": coalesce(
      targetAmount,
      50000000
    ),

    "daysLeft": coalesce(
      daysLeft,
      0
    ),

    "donors": coalesce(
      donors,
      []
    ),

    "donorsCount": count(
      coalesce(
        donors,
        []
      )
    )
  },

  "unggulan": *[
    _type == "program" &&
    sectionType == "unggulan" &&
    defined(slug.current)
  ]
  | order(
      _createdAt desc
    )[0...5] {

    "id": _id,

    "title": coalesce(
      title,
      "Program Kebaikan"
    ),

    "slug": slug.current,

    "image": coalesce(
      image.asset->url,
      ""
    ),

    "collectedAmount": coalesce(
      collectedAmount,
      collectedRaw,
      0
    ),

    "collectedRaw": coalesce(
      collectedRaw,
      collectedAmount,
      0
    ),

    "targetAmount": coalesce(
      targetAmount,
      50000000
    ),

    "daysLeft": coalesce(
      daysLeft,
      0
    ),

    "donors": coalesce(
      donors,
      []
    ),

    "donorsCount": count(
      coalesce(
        donors,
        []
      )
    )
  },

  "pilihan": *[
    _type == "program" &&
    (
      sectionType == "pilihan" ||
      !defined(sectionType)
    ) &&
    defined(slug.current)
  ]
  | order(
      _createdAt desc
    )[0...5] {

    "id": _id,

    "title": coalesce(
      title,
      "Program Kebaikan"
    ),

    "slug": slug.current,

    "image": coalesce(
      image.asset->url,
      ""
    ),

    "collectedAmount": coalesce(
      collectedAmount,
      collectedRaw,
      0
    ),

    "collectedRaw": coalesce(
      collectedRaw,
      collectedAmount,
      0
    ),

    "targetAmount": coalesce(
      targetAmount,
      50000000
    ),

    "daysLeft": coalesce(
      daysLeft,
      0
    ),

    "donors": coalesce(
      donors,
      []
    ),

    "donorsCount": count(
      coalesce(
        donors,
        []
      )
    )
  }
}
`;

// ============================================================================
// GET HOMEPAGE DATA
// ============================================================================

async function getHomePageData(): Promise<HomePageData> {
  try {
    const data =
      await serverClient.fetch<HomePageData>(
        HOME_QUERY
      );

    return {
      heroBanners:
        Array.isArray(data?.heroBanners)
          ? data.heroBanners
          : [],

      mendesak:
        Array.isArray(data?.mendesak)
          ? data.mendesak
          : [],

      unggulan:
        Array.isArray(data?.unggulan)
          ? data.unggulan
          : [],

      pilihan:
        Array.isArray(data?.pilihan)
          ? data.pilihan
          : [],
    };
  } catch (error) {
    console.error(
      "[HOMEPAGE] Gagal mengambil data dari Sanity:",
      error
    );

    return {
      heroBanners: [],
      mendesak: [],
      unggulan: [],
      pilihan: [],
    };
  }
}

// ============================================================================
// HOMEPAGE
// ============================================================================

export default async function HomePage() {
  const data = await getHomePageData();

  // ==========================================================================
  // HERO
  // ==========================================================================

  const heroBanners: HeroBanner[] =
    (data.heroBanners || [])
      .filter(
        (
          item
        ): item is SanityHeroBanner & {
          imageUrl: string;
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
          item.linkUrl ||
          undefined,
      }));

  // ==========================================================================
  // PROGRAM DATA
  // ==========================================================================

  const mendesakPrograms =
    Array.isArray(data.mendesak)
      ? data.mendesak
      : [];

  const unggulanPrograms =
    Array.isArray(data.unggulan)
      ? data.unggulan
      : [];

  const pilihanPrograms =
    Array.isArray(data.pilihan)
      ? data.pilihan
      : [];

  // ==========================================================================
  // STRUCTURED DATA
  // ==========================================================================

  const structuredData = {
    "@context": "https://schema.org",

    "@graph": [
      // ----------------------------------------------------------------------
      // WEBSITE
      // ----------------------------------------------------------------------

      {
        "@type": "WebSite",

        "@id":
          `${SITE_URL}/#website`,

        url:
          SITE_URL,

        name:
          SITE_NAME,

        alternateName:
          "Islami",

        description:
          SITE_DESCRIPTION,

        inLanguage:
          "id-ID",

        publisher: {
          "@id":
            `${SITE_URL}/#organization`,
        },
      },

      // ----------------------------------------------------------------------
      // ORGANIZATION
      // ----------------------------------------------------------------------

      {
        "@type": "Organization",

        "@id":
          `${SITE_URL}/#organization`,

        name:
          SITE_NAME,

        alternateName:
          "Islami",

        url:
          SITE_URL,
      },

      // ----------------------------------------------------------------------
      // HOMEPAGE
      // ----------------------------------------------------------------------

      {
        "@type": "WebPage",

        "@id":
          `${SITE_URL}/#webpage`,

        url:
          SITE_URL,

        name:
          "islami.or.id | Portal Islam & Inspirasi Muslim Indonesia",

        description:
          SITE_DESCRIPTION,

        inLanguage:
          "id-ID",

        isPartOf: {
          "@id":
            `${SITE_URL}/#website`,
        },

        about: {
          "@id":
            `${SITE_URL}/#organization`,
        },

        primaryImageOfPage: {
          "@type":
            "ImageObject",

          url:
            OG_IMAGE,
        },
      },
    ],
  };

  const jsonLd =
    JSON.stringify(
      structuredData
    ).replace(
      /</g,
      "\\u003c"
    );

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <>
      {/* ================================================================== */}
      {/* STRUCTURED DATA */}
      {/* ================================================================== */}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd,
        }}
      />

      {/* ================================================================== */}
      {/* REFERRAL TRACKER */}
      {/* ================================================================== */}

      <Suspense fallback={null}>
        <ReferralTracker />
      </Suspense>

      {/* ================================================================== */}
      {/* MAIN CONTENT */}
      {/* ================================================================== */}

      <main className="flex min-h-screen w-full flex-col items-center justify-start overflow-x-hidden bg-gray-50 pb-24">

        <div className="mx-auto w-full max-w-md space-y-4 px-3 py-4">

          {/* HERO */}
          <Hero
            initialBanners={
              heroBanners
            }
          />

          {/* TOTAL AKUMULASI */}
          <TotalAccumulationWidget />

          {/* PROGRAM KEBAIKAN */}
          <Campaign
            mendesak={
              mendesakPrograms
            }
            unggulan={
              unggulanPrograms
            }
            pilihan={
              pilihanPrograms
            }
          />

          {/* ARTIKEL */}
          <News />

          {/* FOOTER */}
          <Footer />

        </div>

      </main>
    </>
  );
}