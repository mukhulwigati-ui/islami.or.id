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

const SITE_URL =
  "https://www.islami.or.id";

const SITE_NAME =
  "islami.or.id";

const SITE_DESCRIPTION =
  "islami.or.id adalah portal Islam Indonesia yang menyajikan artikel Al-Qur'an, hadis, fikih, doa, sejarah Islam, keluarga Muslim, zakat, sedekah, wakaf, serta berbagai program dan inspirasi kebaikan.";

const OG_IMAGE =
  `${SITE_URL}/images/banner.png`;

// ============================================================================
// RENDERING STRATEGY
// ============================================================================

export const dynamic =
  "force-dynamic";

export const revalidate =
  0;

// ============================================================================
// SEO METADATA
// ============================================================================

export const metadata: Metadata = {
  title:
    "Portal Islam & Inspirasi Muslim Indonesia",

  description:
    SITE_DESCRIPTION,

  alternates: {
    canonical:
      SITE_URL,
  },

  robots: {
    index: true,
    follow: true,

    googleBot: {
      index: true,
      follow: true,

      "max-video-preview":
        -1,

      "max-image-preview":
        "large",

      "max-snippet":
        -1,
    },
  },

  openGraph: {
    title:
      "islami.or.id | Portal Islam & Inspirasi Muslim Indonesia",

    description:
      "Temukan artikel Islam, Al-Qur'an, hadis, fikih, doa, sejarah Islam, keluarga Muslim, zakat, sedekah, wakaf, serta berbagai inspirasi dan program kebaikan.",

    url:
      SITE_URL,

    siteName:
      SITE_NAME,

    locale:
      "id_ID",

    type:
      "website",

    images: [
      {
        url:
          OG_IMAGE,

        width:
          1200,

        height:
          630,

        type:
          "image/png",

        alt:
          "islami.or.id - Portal Islam dan Inspirasi Muslim Indonesia",
      },
    ],
  },

  twitter: {
    card:
      "summary_large_image",

    title:
      "islami.or.id | Portal Islam & Inspirasi Muslim Indonesia",

    description:
      "Artikel Islam, Al-Qur'an, hadis, fikih, doa, sejarah Islam, keluarga Muslim, zakat, sedekah, wakaf, dan inspirasi kebaikan.",

    images: [
      OG_IMAGE,
    ],
  },
};

// ============================================================================
// SANITY
// ============================================================================

const projectId =
  process.env
    .NEXT_PUBLIC_SANITY_PROJECT_ID ||
  "xqggeww8";

const dataset =
  process.env
    .NEXT_PUBLIC_SANITY_DATASET ||
  "production";

const serverClient =
  createClient({
    projectId,

    dataset,

    apiVersion:
      "2026-08-31",

    useCdn:
      false,

    perspective:
      "published",
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

interface ProgramDonor {
  name?: string;

  amount?: number;

  date?: string;

  orderId?: string;

  transactionId?: string;
}

interface SanityProgram {
  id: string;

  title?: string;

  slug?: string;

  category?: string;

  sectionType?: string;

  image?: string;

  collectedAmount?: number;

  collectedRaw?: number;

  collected?: number;

  targetAmount?: number;

  daysLeft?: number;

  donors?: ProgramDonor[];
}

interface SuccessTransaction {
  id?: string;

  orderId?: string;

  transactionId?: string;

  donorName?: string;

  amount?: number;

  paymentAmount?: number;

  paidAt?: string;

  createdAt?: string;

  programId?: string;

  programSlug?: string;

  programTitle?: string;
}

interface HomePageData {
  heroBanners?:
    SanityHeroBanner[];

  mendesak?:
    SanityProgram[];

  unggulan?:
    SanityProgram[];

  pilihan?:
    SanityProgram[];

  transactions?:
    SuccessTransaction[];
}

interface HomeProgram {
  id: string;

  _id: string;

  title: string;

  slug: string;

  category: string;

  sectionType: string;

  image: string;

  collectedAmount: number;

  collectedRaw: number;

  collected: string;

  targetAmount: number;

  target: string;

  daysLeft: number;

  donors: ProgramDonor[];

  donorsCount: number;
}

// ============================================================================
// HELPERS
// ============================================================================

function safeNumber(
  value: unknown
): number {
  const result =
    Number(
      value ?? 0
    );

  if (
    !Number.isFinite(
      result
    ) ||
    result < 0
  ) {
    return 0;
  }

  return result;
}

function normalizeText(
  value: unknown
): string {
  return String(
    value ?? ""
  )
    .trim()
    .toLowerCase();
}

function formatRupiah(
  value: number
): string {
  return `Rp ${value.toLocaleString(
    "id-ID"
  )}`;
}

function formatDonationDate(
  value?: string
): string {
  if (!value) {
    return "Baru saja";
  }

  const date =
    new Date(
      value
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Baru saja";
  }

  try {
    return new Intl.DateTimeFormat(
      "id-ID",
      {
        day:
          "numeric",

        month:
          "short",

        year:
          "numeric",

        timeZone:
          "Asia/Jakarta",
      }
    ).format(
      date
    );
  } catch {
    return "Baru saja";
  }
}

// ============================================================================
// GROQ HOMEPAGE
// ============================================================================
//
// donationTransaction sukses diambil langsung bersama data homepage.
//
// Jadi homepage TIDAK lagi bergantung penuh pada:
//
// collectedAmount
// collectedRaw
//
// Kedua field tersebut hanya menjadi fallback untuk data legacy.
// ============================================================================

const HOME_QUERY = `
{
  "heroBanners": *[
    _type in [
      "heroBanner",
      "banner"
    ] &&
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

      title,

      "slug":
        slug.current,

      category,

      sectionType,

      "image": coalesce(
        image.asset->url,
        mainImage.asset->url,
        thumbnail.asset->url,
        banner.asset->url,
        ""
      ),

      collectedAmount,

      collectedRaw,

      collected,

      targetAmount,

      daysLeft,

      donors[] {
        name,
        amount,
        date,
        orderId,
        transactionId
      }
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

      title,

      "slug":
        slug.current,

      category,

      sectionType,

      "image": coalesce(
        image.asset->url,
        mainImage.asset->url,
        thumbnail.asset->url,
        banner.asset->url,
        ""
      ),

      collectedAmount,

      collectedRaw,

      collected,

      targetAmount,

      daysLeft,

      donors[] {
        name,
        amount,
        date,
        orderId,
        transactionId
      }
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

      title,

      "slug":
        slug.current,

      category,

      sectionType,

      "image": coalesce(
        image.asset->url,
        mainImage.asset->url,
        thumbnail.asset->url,
        banner.asset->url,
        ""
      ),

      collectedAmount,

      collectedRaw,

      collected,

      targetAmount,

      daysLeft,

      donors[] {
        name,
        amount,
        date,
        orderId,
        transactionId
      }
  },

  "transactions": *[
    _type ==
      "donationTransaction" &&
    status ==
      "success"
  ]
  | order(
      coalesce(
        paidAt,
        _createdAt
      ) desc
    ) {
      "id": _id,

      orderId,

      transactionId,

      donorName,

      amount,

      paymentAmount,

      paidAt,

      "createdAt":
        _createdAt,

      "programId":
        programName->_id,

      "programSlug":
        programName->slug.current,

      "programTitle":
        programName->title
  }
}
`;

// ============================================================================
// FORMAT PROGRAM
// ============================================================================

function formatPrograms(
  programs:
    SanityProgram[],

  transactions:
    SuccessTransaction[]
): HomeProgram[] {
  return programs.map(
    (program) => {
      // ======================================================================
      // TRANSAKSI SUKSES MILIK PROGRAM
      // ======================================================================

      const matchingTransactions =
        transactions.filter(
          (tx) => {
            // ---------------------------------------------------------------
            // Reference Sanity adalah pencocokan utama.
            // ---------------------------------------------------------------

            if (
              tx.programId &&
              tx.programId ===
                program.id
            ) {
              return true;
            }

            // ---------------------------------------------------------------
            // Fallback slug.
            // ---------------------------------------------------------------

            if (
              tx.programSlug &&
              program.slug &&
              normalizeText(
                tx.programSlug
              ) ===
                normalizeText(
                  program.slug
                )
            ) {
              return true;
            }

            // ---------------------------------------------------------------
            // Legacy fallback judul.
            // ---------------------------------------------------------------

            if (
              tx.programTitle &&
              program.title &&
              normalizeText(
                tx.programTitle
              ) ===
                normalizeText(
                  program.title
                )
            ) {
              return true;
            }

            return false;
          }
        );

      // ======================================================================
      // TOTAL TRANSAKSI SUKSES
      //
      // amount = nominal donasi sebenarnya.
      // paymentAmount = nominal QRIS yang mungkin mengandung kode unik.
      //
      // TOTAL CAMPAIGN HARUS menggunakan amount.
      // ======================================================================

      const transactionTotal =
        matchingTransactions.reduce(
          (
            total,
            tx
          ) =>
            total +
            safeNumber(
              tx.amount
            ),
          0
        );

      // ======================================================================
      // DATA LEGACY
      // ======================================================================

      const storedCollectedAmount =
        safeNumber(
          program.collectedAmount
        );

      const storedCollectedRaw =
        safeNumber(
          program.collectedRaw
        );

      const storedCollected =
        safeNumber(
          program.collected
        );

      const legacyAmount =
        Math.max(
          storedCollectedAmount,
          storedCollectedRaw,
          storedCollected
        );

      // ======================================================================
      // TOTAL FINAL
      //
      // Jika sudah mempunyai transaction success:
      // donationTransaction menjadi sumber utama.
      //
      // Jika belum:
      // fallback data lama.
      // ======================================================================

      const finalCollectedAmount =
        matchingTransactions.length >
        0
          ? transactionTotal
          : legacyAmount;

      // ======================================================================
      // DONATUR DARI TRANSAKSI SUKSES
      // ======================================================================

      const transactionDonors:
        ProgramDonor[] =
        matchingTransactions.map(
          (tx) => ({
            name:
              tx.donorName?.trim() ||
              "Hamba Allah",

            amount:
              safeNumber(
                tx.amount
              ),

            date:
              formatDonationDate(
                tx.paidAt ||
                  tx.createdAt
              ),

            orderId:
              tx.orderId,

            transactionId:
              tx.transactionId,
          })
        );

      // ======================================================================
      // DONATUR LEGACY
      // ======================================================================

      const legacyDonors =
        Array.isArray(
          program.donors
        )
          ? program.donors
          : [];

      // ======================================================================
      // ANTI DUPLIKAT
      //
      // Webhook Casaku dapat memasukkan donor ke program.donors.
      // Transaksi yang sama juga ada di donationTransaction.
      //
      // Kita hilangkan duplikat berdasarkan transactionId dan orderId.
      // ======================================================================

      const transactionIds =
        new Set(
          transactionDonors
            .map(
              (donor) =>
                donor.transactionId
            )
            .filter(
              (
                value
              ): value is string =>
                Boolean(
                  value
                )
            )
        );

      const orderIds =
        new Set(
          transactionDonors
            .map(
              (donor) =>
                donor.orderId
            )
            .filter(
              (
                value
              ): value is string =>
                Boolean(
                  value
                )
            )
        );

      const filteredLegacyDonors =
        legacyDonors.filter(
          (donor) => {
            if (
              donor.transactionId &&
              transactionIds.has(
                donor.transactionId
              )
            ) {
              return false;
            }

            if (
              donor.orderId &&
              orderIds.has(
                donor.orderId
              )
            ) {
              return false;
            }

            return true;
          }
        );

      const combinedDonors =
        [
          ...transactionDonors,
          ...filteredLegacyDonors,
        ];

      // ======================================================================
      // TARGET
      // ======================================================================

      const targetAmount =
        safeNumber(
          program.targetAmount
        ) ||
        50_000_000;

      // ======================================================================
      // OUTPUT
      // ======================================================================

      return {
        id:
          program.id,

        _id:
          program.id,

        title:
          program.title ||
          "Program Kebaikan",

        slug:
          program.slug ||
          "",

        category:
          program.category ||
          "Kemanusiaan",

        sectionType:
          program.sectionType ||
          "pilihan",

        image:
          program.image ||
          "",

        collectedAmount:
          finalCollectedAmount,

        collectedRaw:
          finalCollectedAmount,

        collected:
          formatRupiah(
            finalCollectedAmount
          ),

        targetAmount,

        target:
          formatRupiah(
            targetAmount
          ),

        daysLeft:
          safeNumber(
            program.daysLeft
          ),

        donors:
          combinedDonors,

        donorsCount:
          combinedDonors.length,
      };
    }
  );
}

// ============================================================================
// GET HOMEPAGE DATA
// ============================================================================

async function getHomePageData(): Promise<HomePageData> {
  try {
    const data =
      await serverClient.fetch<HomePageData>(
        HOME_QUERY,
        {},
        {
          cache:
            "no-store",
        }
      );

    return {
      heroBanners:
        Array.isArray(
          data?.heroBanners
        )
          ? data.heroBanners
          : [],

      mendesak:
        Array.isArray(
          data?.mendesak
        )
          ? data.mendesak
          : [],

      unggulan:
        Array.isArray(
          data?.unggulan
        )
          ? data.unggulan
          : [],

      pilihan:
        Array.isArray(
          data?.pilihan
        )
          ? data.pilihan
          : [],

      transactions:
        Array.isArray(
          data?.transactions
        )
          ? data.transactions
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
      transactions: [],
    };
  }
}

// ============================================================================
// HOMEPAGE
// ============================================================================

export default async function HomePage() {
  const data =
    await getHomePageData();

  // ==========================================================================
  // HERO
  // ==========================================================================

  const heroBanners:
    HeroBanner[] =
    (
      data.heroBanners ||
      []
    )
      .filter(
        (
          item
        ): item is SanityHeroBanner & {
          imageUrl: string;
        } =>
          Boolean(
            item &&
              typeof item.imageUrl ===
                "string" &&
              item.imageUrl
                .trim()
                .length >
                0
          )
      )
      .map(
        (
          item,
          index
        ) => ({
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
        })
      );

  // ==========================================================================
  // TRANSACTIONS
  // ==========================================================================

  const successTransactions =
    Array.isArray(
      data.transactions
    )
      ? data.transactions
      : [];

  // ==========================================================================
  // PROGRAM
  // ==========================================================================

  const mendesakPrograms =
    formatPrograms(
      Array.isArray(
        data.mendesak
      )
        ? data.mendesak
        : [],

      successTransactions
    );

  const unggulanPrograms =
    formatPrograms(
      Array.isArray(
        data.unggulan
      )
        ? data.unggulan
        : [],

      successTransactions
    );

  const pilihanPrograms =
    formatPrograms(
      Array.isArray(
        data.pilihan
      )
        ? data.pilihan
        : [],

      successTransactions
    );

  // ==========================================================================
  // STRUCTURED DATA
  // ==========================================================================

  const structuredData = {
    "@context":
      "https://schema.org",

    "@graph": [
      {
        "@type":
          "WebSite",

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

      {
        "@type":
          "Organization",

        "@id":
          `${SITE_URL}/#organization`,

        name:
          SITE_NAME,

        alternateName:
          "Islami",

        url:
          SITE_URL,
      },

      {
        "@type":
          "WebPage",

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
      {/* ==================================================================== */}
      {/* STRUCTURED DATA */}
      {/* ==================================================================== */}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            jsonLd,
        }}
      />

      {/* ==================================================================== */}
      {/* REFERRAL TRACKER */}
      {/* ==================================================================== */}

      <Suspense
        fallback={
          null
        }
      >
        <ReferralTracker />
      </Suspense>

      {/* ==================================================================== */}
      {/* MAIN */}
      {/* ==================================================================== */}

      <main className="flex min-h-screen w-full flex-col items-center justify-start overflow-x-hidden bg-gray-50 pb-24">
        <div className="mx-auto w-full max-w-md space-y-4 px-3 py-4">

          {/* ================================================================ */}
          {/* HERO */}
          {/* ================================================================ */}

          <Hero
            initialBanners={
              heroBanners
            }
          />

          {/* ================================================================ */}
          {/* TOTAL AKUMULASI */}
          {/* ================================================================ */}

          <TotalAccumulationWidget />

          {/* ================================================================ */}
          {/* PROGRAM */}
          {/* ================================================================ */}

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

          {/* ================================================================ */}
          {/* NEWS */}
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