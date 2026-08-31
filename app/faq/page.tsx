// app/faq/page.tsx

import type { Metadata } from "next";
import Link from "next/link";

// ============================================================================
// CONFIG
// ============================================================================

const SITE_URL = "https://www.islami.or.id";
const SITE_NAME = "islami.or.id";

const PAGE_URL = `${SITE_URL}/faq`;

const PAGE_TITLE =
  "FAQ / Pertanyaan Umum";

const PAGE_DESCRIPTION =
  "Temukan jawaban atas pertanyaan umum seputar cara berdonasi, metode pembayaran, konfirmasi transaksi, penyaluran zakat, infak, sedekah, dan layanan islami.or.id.";

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
        alt: `FAQ ${SITE_NAME}`,
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
// FAQ DATA
// ============================================================================

interface FaqItem {
  question: string;
  answer: string;
}

const faqList: FaqItem[] = [
  {
    question:
      "Bagaimana cara melakukan donasi atau sedekah di islami.or.id?",

    answer:
      "Pilih program kebaikan atau campaign yang ingin Anda dukung, tentukan nominal donasi, isi data yang diperlukan atau pilih opsi anonim apabila tersedia, lalu ikuti petunjuk pembayaran yang ditampilkan pada halaman transaksi.",
  },

  {
    question:
      "Apakah transaksi donasi di islami.or.id aman?",

    answer:
      "islami.or.id menggunakan sistem pembayaran dan layanan teknologi yang terintegrasi untuk memproses transaksi. Pengguna tetap disarankan memastikan bahwa pembayaran dilakukan melalui halaman resmi islami.or.id dan mengikuti instruksi transaksi yang ditampilkan oleh sistem.",
  },

  {
    question:
      "Metode pembayaran apa saja yang tersedia?",

    answer:
      "Metode pembayaran dapat mencakup QRIS, Virtual Account, atau metode lain yang tersedia pada saat transaksi. Pilihan pembayaran dapat berbeda tergantung konfigurasi layanan dan penyedia pembayaran yang digunakan.",
  },

  {
    question:
      "Bagaimana cara mengonfirmasi donasi jika terjadi kendala?",

    answer:
      "Apabila Anda mengalami kendala pembayaran atau status transaksi belum diperbarui, silakan hubungi tim layanan melalui halaman Kontak dengan menyertakan informasi transaksi yang diperlukan agar dapat dilakukan pengecekan.",
  },

  {
    question:
      "Bagaimana dana donasi disalurkan?",

    answer:
      "Dana yang dihimpun melalui program atau campaign dikelola dan disalurkan sesuai tujuan masing-masing program, kebutuhan penerima manfaat, serta mekanisme pengelolaan yang berlaku pada platform.",
  },
];

// ============================================================================
// PAGE
// ============================================================================

export default function FaqPage() {
  // ==========================================================================
  // STRUCTURED DATA
  // ==========================================================================

  const faqSchema = {
    "@context": "https://schema.org",

    "@type": "FAQPage",

    "@id": `${PAGE_URL}#faq`,

    mainEntity:
      faqList.map(
        (
          item
        ) => ({
          "@type":
            "Question",

          name:
            item.question,

          acceptedAnswer:
            {
              "@type":
                "Answer",

              text:
                item.answer,
            },
        })
      ),
  };

  const webPageSchema = {
    "@context": "https://schema.org",

    "@type": "WebPage",

    "@id": `${PAGE_URL}#webpage`,

    url: PAGE_URL,

    name: PAGE_TITLE,

    description:
      PAGE_DESCRIPTION,

    inLanguage:
      "id-ID",

    isPartOf: {
      "@id": `${SITE_URL}/#website`,
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",

    "@type": "BreadcrumbList",

    "@id": `${PAGE_URL}#breadcrumb`,

    itemListElement: [
      {
        "@type": "ListItem",

        position: 1,

        name: "Beranda",

        item: SITE_URL,
      },

      {
        "@type": "ListItem",

        position: 2,

        name: "FAQ",

        item: PAGE_URL,
      },
    ],
  };

  const jsonLd =
    JSON.stringify([
      webPageSchema,
      breadcrumbSchema,
      faqSchema,
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
          __html: jsonLd,
        }}
      />

      <main className="min-h-screen w-full bg-slate-50 pb-28 text-slate-900">

        {/* ================================================================== */}
        {/* MOBILE-FIRST WRAPPER */}
        {/* ================================================================== */}

        <div className="mx-auto w-full max-w-md px-3 pt-3">

          {/* ================================================================ */}
          {/* MAIN DOCUMENT */}
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
                  FAQ
                </span>
              </nav>

              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#0d5c91]">
                Pusat Bantuan
              </p>

              <h1 className="mt-1.5 text-[24px] font-extrabold leading-tight tracking-tight text-slate-950 sm:text-[27px]">
                Pertanyaan yang Sering Diajukan
              </h1>

              <p className="mt-2 text-[11px] leading-[1.7] text-slate-500 sm:text-xs">
                Temukan jawaban seputar proses
                donasi, metode pembayaran,
                transaksi, penyaluran program, dan
                layanan islami.or.id.
              </p>

            </header>

            {/* ============================================================== */}
            {/* FAQ LIST */}
            {/* ============================================================== */}

            <div className="divide-y divide-slate-100">

              {faqList.map(
                (
                  item,
                  index
                ) => (

                  <article
                    key={
                      item.question
                    }
                    className="px-4 py-5 transition-colors hover:bg-slate-50/70 sm:px-5"
                  >

                    {/* ====================================================== */}
                    {/* QUESTION */}
                    {/* ====================================================== */}

                    <div className="flex items-start gap-3">

                      {/* Nomor kecil boleh bulat */}

                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-50 text-[9px] font-extrabold text-[#0d5c91]">
                        {String(
                          index +
                            1
                        ).padStart(
                          2,
                          "0"
                        )}
                      </div>

                      <div className="min-w-0 flex-1">

                        <h2 className="text-[13px] font-bold leading-[1.55] text-slate-900 sm:text-[14px]">
                          {
                            item.question
                          }
                        </h2>

                        <p className="mt-2 text-[12px] leading-[1.8] text-slate-600 sm:text-[13px]">
                          {
                            item.answer
                          }
                        </p>

                      </div>

                    </div>

                  </article>

                )
              )}

            </div>

            {/* ============================================================== */}
            {/* CTA */}
            {/* ============================================================== */}

            <footer className="border-t border-slate-200 bg-slate-50 px-4 py-5 text-center sm:px-5">

              <h2 className="text-[13px] font-bold text-slate-900">
                Masih memiliki pertanyaan?
              </h2>

              <p className="mx-auto mt-2 max-w-sm text-[11px] leading-[1.7] text-slate-500 sm:text-xs">
                Hubungi tim layanan kami apabila
                Anda membutuhkan bantuan terkait
                akun, transaksi, donasi, atau
                penggunaan platform.
              </p>

              <div className="mt-4 grid grid-cols-1 gap-2">

                <Link
                  href="/kontak"
                  className="flex w-full items-center justify-center bg-[#0d5c91] py-3 text-[10px] font-bold uppercase tracking-wider text-white transition hover:bg-sky-900"
                >
                  Hubungi Kami
                </Link>

                <Link
                  href="/"
                  className="flex w-full items-center justify-center border border-slate-300 bg-white py-3 text-[10px] font-bold uppercase tracking-wider text-slate-700 transition hover:bg-slate-100"
                >
                  Kembali ke Beranda
                </Link>

              </div>

            </footer>

          </section>

        </div>

      </main>
    </>
  );
}