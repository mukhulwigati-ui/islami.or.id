// app/bantuan/page.tsx

import type { Metadata } from "next";
import Link from "next/link";

import {
  CircleHelp,
  UserRound,
  CreditCard,
  HandHeart,
  FileQuestion,
  MessageCircle,
  Mail,
  ArrowLeft,
} from "lucide-react";

// ============================================================================
// CONFIG
// ============================================================================

const SITE_URL = "https://www.islami.or.id";
const SITE_NAME = "islami.or.id";

const PAGE_URL = `${SITE_URL}/bantuan`;

const PAGE_TITLE =
  "Pusat Bantuan";

const PAGE_DESCRIPTION =
  "Temukan panduan dan bantuan seputar akun, donasi, pembayaran, transaksi, program kebaikan, serta layanan islami.or.id.";

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
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
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
        alt: `Pusat Bantuan ${SITE_NAME}`,
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
// HELP DATA
// ============================================================================

const helpItems = [
  {
    title:
      "Kendala Akun & Donasi",

    description:
      "Temukan bantuan apabila Anda mengalami kendala saat masuk ke akun, memperbarui data pengguna, atau menemukan transaksi yang belum muncul pada riwayat donasi.",

    icon:
      UserRound,
  },

  {
    title:
      "Metode Pembayaran",

    description:
      "Pelajari metode pembayaran yang tersedia pada saat transaksi, termasuk QRIS, Virtual Account, atau metode lain yang ditampilkan oleh sistem.",

    icon:
      CreditCard,
  },

  {
    title:
      "Program & Penyaluran",

    description:
      "Lihat informasi mengenai program kebaikan, perkembangan penghimpunan, serta pembaruan penyaluran yang tersedia pada halaman program dan artikel terkait.",

    icon:
      HandHeart,
  },

  {
    title:
      "Pertanyaan Umum",

    description:
      "Temukan jawaban atas pertanyaan yang sering diajukan seputar penggunaan platform, transaksi, donasi, akun, dan layanan islami.or.id.",

    icon:
      FileQuestion,

    href:
      "/faq",
  },
];

// ============================================================================
// PAGE
// ============================================================================

export default function BantuanPage() {
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
          "Pusat Bantuan",

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

              {/* Breadcrumb */}

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
                  Bantuan
                </span>
              </nav>

              {/* Icon */}

              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-50">
                <CircleHelp className="h-5 w-5 text-[#0d5c91]" />
              </div>

              <p className="mt-4 text-[9px] font-bold uppercase tracking-[0.2em] text-[#0d5c91]">
                Pusat Layanan Pengguna
              </p>

              <h1 className="mt-1.5 text-[24px] font-extrabold leading-tight tracking-tight text-slate-950 sm:text-[27px]">
                Bagaimana Kami Bisa Membantu?
              </h1>

              <p className="mt-2 text-[11px] leading-[1.7] text-slate-500 sm:text-xs">
                Temukan panduan cepat seputar akun,
                donasi, pembayaran, transaksi, dan
                layanan digital di islami.or.id.
              </p>

            </header>

            {/* ============================================================== */}
            {/* HELP ITEMS */}
            {/* ============================================================== */}

            <div className="divide-y divide-slate-100">

              {helpItems.map(
                (
                  item
                ) => {
                  const Icon =
                    item.icon;

                  const content = (
                    <div className="flex items-start gap-3 px-4 py-5 transition-colors hover:bg-slate-50/70 sm:px-5">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-50">

                        <Icon className="h-4 w-4 text-[#0d5c91]" />

                      </div>

                      <div className="min-w-0 flex-1">

                        <h2 className="text-[13px] font-bold leading-[1.5] text-slate-900 sm:text-[14px]">
                          {item.title}
                        </h2>

                        <p className="mt-1.5 text-[11px] leading-[1.75] text-slate-600 sm:text-[12px]">
                          {item.description}
                        </p>

                        {item.href && (
                          <p className="mt-2 text-[9px] font-bold uppercase tracking-wider text-[#0d5c91]">
                            Buka FAQ
                          </p>
                        )}

                      </div>

                    </div>
                  );

                  if (
                    item.href
                  ) {
                    return (
                      <Link
                        key={
                          item.title
                        }
                        href={
                          item.href
                        }
                        className="block"
                      >
                        {content}
                      </Link>
                    );
                  }

                  return (
                    <div
                      key={
                        item.title
                      }
                    >
                      {content}
                    </div>
                  );
                }
              )}

            </div>

            {/* ============================================================== */}
            {/* CONTACT SECTION */}
            {/* ============================================================== */}

            <section className="border-t border-slate-200 bg-[#102a43] px-4 py-5 text-white sm:px-5">

              <div className="flex items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/10">

                  <MessageCircle className="h-[18px] w-[18px] text-[#d8b76a]" />

                </div>

                <div className="min-w-0 flex-1">

                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#d8b76a]">
                    Bantuan Langsung
                  </p>

                  <h2 className="mt-1 text-[15px] font-bold text-white">
                    Hubungi Tim Layanan
                  </h2>

                  <p className="mt-2 text-[11px] leading-[1.7] text-slate-300">
                    Jika panduan di atas belum menjawab
                    kendala Anda, hubungi tim layanan
                    melalui halaman kontak resmi.
                  </p>

                </div>

              </div>

              <Link
                href="/kontak"
                className="mt-5 flex w-full items-center justify-center gap-2 bg-[#0d5c91] border border-white/15 py-3 text-[10px] font-bold uppercase tracking-wider text-white transition hover:bg-[#164b70]"
              >
                <MessageCircle className="h-4 w-4" />

                Hubungi Tim Layanan
              </Link>

            </section>

            {/* ============================================================== */}
            {/* SECONDARY LINKS */}
            {/* ============================================================== */}

            <footer className="border-t border-slate-200 bg-slate-50 px-4 py-5 sm:px-5">

              <p className="text-center text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
                Informasi Lainnya
              </p>

              <div className="mt-4 grid grid-cols-1 gap-2">

                <Link
                  href="/faq"
                  className="flex w-full items-center justify-center gap-2 border border-slate-300 bg-white py-3 text-[10px] font-bold uppercase tracking-wider text-slate-700 transition hover:bg-slate-100"
                >
                  <FileQuestion className="h-3.5 w-3.5" />

                  Lihat FAQ
                </Link>

                <Link
                  href="/kontak"
                  className="flex w-full items-center justify-center gap-2 border border-slate-300 bg-white py-3 text-[10px] font-bold uppercase tracking-wider text-slate-700 transition hover:bg-slate-100"
                >
                  <Mail className="h-3.5 w-3.5" />

                  Halaman Kontak
                </Link>

                <Link
                  href="/akun"
                  className="flex w-full items-center justify-center gap-2 bg-[#0d5c91] py-3 text-[10px] font-bold uppercase tracking-wider text-white transition hover:bg-sky-900"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />

                  Kembali ke Menu Akun
                </Link>

              </div>

            </footer>

          </section>

        </div>

      </main>
    </>
  );
}