// app/peta-situs/page.tsx

export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@sanity/client";

import {
  Map,
  Home,
  Newspaper,
  HandHeart,
  Calculator,
  CircleHelp,
  Info,
  FileText,
  ShieldCheck,
  Mail,
} from "lucide-react";

// ============================================================================
// SITE CONFIG
// ============================================================================

const SITE_URL = "https://www.islami.or.id";
const SITE_NAME = "islami.or.id";
const PAGE_URL = `${SITE_URL}/peta-situs`;

const PAGE_TITLE = "Peta Situs";
const PAGE_DESCRIPTION =
  "Peta situs HTML islami.or.id untuk membantu pengguna menemukan halaman utama, artikel Islam, program kebaikan, layanan akun, serta halaman informasi penting lainnya.";

// ============================================================================
// SANITY CONFIG
// ============================================================================

const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;

const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET ||
  "production";

if (!projectId) {
  throw new Error(
    "NEXT_PUBLIC_SANITY_PROJECT_ID belum disetel di environment variables."
  );
}

const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion: "2026-06-20",
  useCdn: false,
});

// ============================================================================
// METADATA
// ============================================================================

export const metadata: Metadata = {
  title: PAGE_TITLE,

  description: PAGE_DESCRIPTION,

  alternates: {
    canonical: PAGE_URL,
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
    type: "website",
    locale: "id_ID",
    siteName: SITE_NAME,
    url: PAGE_URL,

    title: `${PAGE_TITLE} | ${SITE_NAME}`,

    description: PAGE_DESCRIPTION,

    images: [
      {
        url: `${SITE_URL}/images/banner.png`,
        width: 1200,
        height: 630,
        alt: `Peta Situs ${SITE_NAME}`,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title: `${PAGE_TITLE} | ${SITE_NAME}`,

    description: PAGE_DESCRIPTION,

    images: [
      `${SITE_URL}/images/banner.png`,
    ],
  },
};

// ============================================================================
// TYPES
// ============================================================================

interface SitemapItem {
  title: string;
  slug: string;
}

interface SitemapData {
  programs?: SitemapItem[];
  news?: SitemapItem[];
}

// ============================================================================
// STATIC PAGES
// ============================================================================

const halamanInti = [
  {
    title: "Beranda",
    url: "/",
    description:
      "Halaman utama islami.or.id.",
    icon: Home,
  },

  {
    title: "Artikel Islam",
    url: "/news",
    description:
      "Kumpulan artikel, informasi, dan pembaruan islami.or.id.",
    icon: Newspaper,
  },

  {
    title: "Kalkulator Zakat",
    url: "/zakat",
    description:
      "Fitur kalkulator untuk membantu perhitungan zakat.",
    icon: Calculator,
  },

  {
    title: "Tentang Kami",
    url: "/tentang-kami",
    description:
      "Informasi mengenai profil dan arah pengembangan islami.or.id.",
    icon: Info,
  },

  {
    title: "Pusat Bantuan",
    url: "/bantuan",
    description:
      "Panduan penggunaan platform dan layanan pengguna.",
    icon: CircleHelp,
  },

  {
    title: "FAQ",
    url: "/faq",
    description:
      "Jawaban atas pertanyaan yang sering diajukan.",
    icon: FileText,
  },

  {
    title: "Kebijakan Privasi",
    url: "/kebijakan-privasi",
    description:
      "Informasi mengenai pengelolaan dan perlindungan data.",
    icon: ShieldCheck,
  },

  {
    title: "Syarat & Ketentuan",
    url: "/syarat-ketentuan",
    description:
      "Ketentuan penggunaan layanan islami.or.id.",
    icon: FileText,
  },

  {
    title: "Kebijakan Pengembalian Dana",
    url: "/refund-policy",
    description:
      "Informasi mengenai kebijakan pengembalian dana.",
    icon: FileText,
  },

  {
    title: "Kontak",
    url: "/kontak",
    description:
      "Hubungi tim layanan islami.or.id.",
    icon: Mail,
  },
];

// ============================================================================
// PAGE
// ============================================================================

export default async function PetaSitusPage() {
  let programs: SitemapItem[] = [];
  let news: SitemapItem[] = [];

  // ==========================================================================
  // SANITY QUERY
  // ==========================================================================

  try {
    const query = `
      {
        "programs":
          *[
            _type == "program" &&
            defined(slug.current)
          ]
          | order(_createdAt desc)
          {
            title,
            "slug": slug.current
          },

        "news":
          *[
            _type == "news" &&
            defined(slug.current)
          ]
          | order(
            coalesce(
              publishedAt,
              _createdAt
            ) desc
          )
          {
            title,
            "slug": slug.current
          }
      }
    `;

    const data =
      await sanityClient.fetch<SitemapData>(
        query
      );

    programs =
      Array.isArray(
        data?.programs
      )
        ? data.programs
        : [];

    news =
      Array.isArray(
        data?.news
      )
        ? data.news
        : [];
  } catch (error) {
    console.error(
      "[PETA SITUS] Gagal mengambil data Sanity:",
      error
    );
  }

  // ==========================================================================
  // STRUCTURED DATA
  // ==========================================================================

  const webPageSchema = {
    "@context":
      "https://schema.org",

    "@type":
      "WebPage",

    "@id":
      `${PAGE_URL}#webpage`,

    url:
      PAGE_URL,

    name:
      PAGE_TITLE,

    description:
      PAGE_DESCRIPTION,

    inLanguage:
      "id-ID",

    isPartOf: {
      "@id":
        `${SITE_URL}/#website`,
    },
  };

  const breadcrumbSchema = {
    "@context":
      "https://schema.org",

    "@type":
      "BreadcrumbList",

    "@id":
      `${PAGE_URL}#breadcrumb`,

    itemListElement: [
      {
        "@type":
          "ListItem",

        position:
          1,

        name:
          "Beranda",

        item:
          SITE_URL,
      },

      {
        "@type":
          "ListItem",

        position:
          2,

        name:
          "Peta Situs",

        item:
          PAGE_URL,
      },
    ],
  };

  const jsonLd =
    JSON.stringify([
      webPageSchema,
      breadcrumbSchema,
    ]).replace(
      /</g,
      "\\u003c"
    );

  // ==========================================================================
  // OUTPUT
  // ==========================================================================

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            jsonLd,
        }}
      />

      <main className="min-h-screen w-full bg-slate-50 pb-28 text-slate-900">

        {/* ================================================================== */}
        {/* MOBILE-FIRST WRAPPER */}
        {/* ================================================================== */}

        <div className="mx-auto w-full max-w-md px-3 pt-3">

          {/* ================================================================ */}
          {/* MAIN PANEL */}
          {/* ================================================================ */}

          <section className="w-full border border-slate-200/80 bg-white shadow-sm">

            {/* ============================================================== */}
            {/* HEADER */}
            {/* ============================================================== */}

            <header className="border-b border-slate-200 px-4 pb-5 pt-5 sm:px-5">

              <nav
                aria-label="Breadcrumb"
                className="mb-4 flex items-center gap-2 text-[10px] font-medium text-slate-400"
              >
                <Link
                  href="/"
                  className="transition-colors hover:text-[#0d5c91]"
                >
                  Beranda
                </Link>

                <span
                  aria-hidden="true"
                  className="text-slate-300"
                >
                  /
                </span>

                <span
                  aria-current="page"
                  className="text-slate-500"
                >
                  Peta Situs
                </span>
              </nav>

              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-50">

                <Map className="h-5 w-5 text-[#0d5c91]" />

              </div>

              <p className="mt-4 text-[9px] font-bold uppercase tracking-[0.2em] text-[#0d5c91]">
                Navigasi islami.or.id
              </p>

              <h1 className="mt-1.5 text-[24px] font-extrabold leading-tight tracking-tight text-slate-950 sm:text-[27px]">
                Peta Situs
              </h1>

              <p className="mt-2 text-[11px] leading-[1.7] text-slate-500 sm:text-xs">
                Temukan halaman utama, artikel,
                program kebaikan, dan berbagai
                layanan penting yang tersedia di
                islami.or.id.
              </p>

            </header>

            {/* ============================================================== */}
            {/* CORE PAGES */}
            {/* ============================================================== */}

            <section className="border-b border-slate-200">

              <div className="px-4 pb-3 pt-5 sm:px-5">

                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#0d5c91]">
                  Halaman Utama
                </p>

                <h2 className="mt-1 text-[16px] font-extrabold text-slate-900">
                  Navigasi & Layanan
                </h2>

              </div>

              <div className="divide-y divide-slate-100">

                {halamanInti.map(
                  (
                    item
                  ) => {
                    const Icon =
                      item.icon;

                    return (
                      <Link
                        key={
                          item.url
                        }
                        href={
                          item.url
                        }
                        className="group flex items-start gap-3 px-4 py-4 transition-colors hover:bg-slate-50 sm:px-5"
                      >

                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-50">

                          <Icon className="h-3.5 w-3.5 text-[#0d5c91]" />

                        </div>

                        <div className="min-w-0 flex-1">

                          <h3 className="text-[12px] font-bold text-slate-900 transition-colors group-hover:text-[#0d5c91] sm:text-[13px]">
                            {
                              item.title
                            }
                          </h3>

                          <p className="mt-1 text-[10px] leading-[1.6] text-slate-500 sm:text-[11px]">
                            {
                              item.description
                            }
                          </p>

                          <p className="mt-1.5 break-all text-[9px] text-slate-400">
                            {
                              item.url ===
                              "/"
                                ? SITE_URL
                                : `${SITE_URL}${item.url}`
                            }
                          </p>

                        </div>

                      </Link>
                    );
                  }
                )}

              </div>

            </section>

            {/* ============================================================== */}
            {/* PROGRAMS */}
            {/* ============================================================== */}

            <section className="border-b border-slate-200">

              <div className="px-4 pb-3 pt-5 sm:px-5">

                <div className="flex items-center justify-between gap-3">

                  <div>

                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#0d5c91]">
                      Program Kebaikan
                    </p>

                    <h2 className="mt-1 text-[16px] font-extrabold text-slate-900">
                      Campaign
                    </h2>

                  </div>

                  <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[9px] font-bold text-[#0d5c91]">
                    {
                      programs.length
                    }
                  </span>

                </div>

              </div>

              {programs.length >
              0 ? (

                <div className="divide-y divide-slate-100">

                  {programs.map(
                    (
                      item
                    ) => (

                      <Link
                        key={
                          item.slug
                        }
                        href={`/campaign/${item.slug}`}
                        className="group flex items-start gap-3 px-4 py-4 transition-colors hover:bg-slate-50 sm:px-5"
                      >

                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50">

                          <HandHeart className="h-3.5 w-3.5 text-emerald-700" />

                        </div>

                        <div className="min-w-0 flex-1">

                          <h3 className="text-[12px] font-bold leading-[1.5] text-slate-900 transition-colors group-hover:text-[#0d5c91] sm:text-[13px]">
                            {
                              item.title
                            }
                          </h3>

                          <p className="mt-1.5 break-all text-[9px] leading-relaxed text-slate-400">
                            {`${SITE_URL}/campaign/${item.slug}`}
                          </p>

                        </div>

                      </Link>

                    )
                  )}

                </div>

              ) : (

                <div className="px-4 pb-5 sm:px-5">

                  <p className="text-[11px] leading-relaxed text-slate-400">
                    Belum ada program yang tersedia.
                  </p>

                </div>

              )}

            </section>

            {/* ============================================================== */}
            {/* NEWS */}
            {/* ============================================================== */}

            <section>

              <div className="px-4 pb-3 pt-5 sm:px-5">

                <div className="flex items-center justify-between gap-3">

                  <div>

                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#0d5c91]">
                      Artikel
                    </p>

                    <h2 className="mt-1 text-[16px] font-extrabold text-slate-900">
                      Artikel & Informasi
                    </h2>

                  </div>

                  <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[9px] font-bold text-[#0d5c91]">
                    {
                      news.length
                    }
                  </span>

                </div>

              </div>

              {news.length >
              0 ? (

                <div className="divide-y divide-slate-100">

                  {news.map(
                    (
                      item
                    ) => (

                      <Link
                        key={
                          item.slug
                        }
                        href={`/news/${item.slug}`}
                        className="group flex items-start gap-3 px-4 py-4 transition-colors hover:bg-slate-50 sm:px-5"
                      >

                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-50">

                          <Newspaper className="h-3.5 w-3.5 text-[#0d5c91]" />

                        </div>

                        <div className="min-w-0 flex-1">

                          <h3 className="text-[12px] font-bold leading-[1.5] text-slate-900 transition-colors group-hover:text-[#0d5c91] sm:text-[13px]">
                            {
                              item.title
                            }
                          </h3>

                          <p className="mt-1.5 break-all text-[9px] leading-relaxed text-slate-400">
                            {`${SITE_URL}/news/${item.slug}`}
                          </p>

                        </div>

                      </Link>

                    )
                  )}

                </div>

              ) : (

                <div className="px-4 pb-5 sm:px-5">

                  <p className="text-[11px] leading-relaxed text-slate-400">
                    Belum ada artikel yang diterbitkan.
                  </p>

                </div>

              )}

            </section>

            {/* ============================================================== */}
            {/* FOOTER */}
            {/* ============================================================== */}

            <footer className="border-t border-slate-200 bg-slate-50 px-4 py-5 text-center sm:px-5">

              <p className="text-[10px] leading-[1.7] text-slate-500">
                Peta situs ini diperbarui berdasarkan
                halaman dan konten yang tersedia di
                islami.or.id.
              </p>

              <p className="mt-2 text-[9px] font-medium text-slate-400">
                © {new Date().getFullYear()} {SITE_NAME}
              </p>

              <Link
                href="/"
                className="mt-4 flex w-full items-center justify-center bg-[#0d5c91] py-3 text-[10px] font-bold uppercase tracking-wider text-white transition hover:bg-sky-900"
              >
                Kembali ke Beranda
              </Link>

            </footer>

          </section>

        </div>

      </main>
    </>
  );
}