// app/kebijakan-privasi/page.tsx

import type { Metadata } from "next";
import Link from "next/link";

// ============================================================================
// CONFIG
// ============================================================================

const SITE_URL = "https://www.islami.or.id";
const SITE_NAME = "islami.or.id";

const PAGE_URL = `${SITE_URL}/kebijakan-privasi`;

const PAGE_TITLE = "Kebijakan Privasi";

const PAGE_DESCRIPTION =
  "Kebijakan Privasi islami.or.id mengenai pengumpulan, penggunaan, penyimpanan, perlindungan, dan pengelolaan data pribadi pengguna serta informasi transaksi.";

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

    url: PAGE_URL,

    siteName: SITE_NAME,

    title: `${PAGE_TITLE} | ${SITE_NAME}`,

    description: PAGE_DESCRIPTION,

    images: [
      {
        url: `${SITE_URL}/images/banner.png`,
        width: 1200,
        height: 630,
        alt: `Kebijakan Privasi ${SITE_NAME}`,
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
// PAGE
// ============================================================================

export default function KebijakanPrivasiPage() {
  // ==========================================================================
  // STRUCTURED DATA
  // ==========================================================================

  const webPageSchema = {
    "@context": "https://schema.org",

    "@type": "WebPage",

    "@id": `${PAGE_URL}#webpage`,

    url: PAGE_URL,

    name: PAGE_TITLE,

    description: PAGE_DESCRIPTION,

    inLanguage: "id-ID",

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
        name: "Kebijakan Privasi",
        item: PAGE_URL,
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

          <article className="w-full border border-slate-200/80 bg-white shadow-sm">

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
                  Kebijakan Privasi
                </span>
              </nav>

              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#0d5c91]">
                Dokumen Privasi
              </p>

              <h1 className="mt-1.5 text-[24px] font-extrabold leading-tight tracking-tight text-slate-950 sm:text-[27px]">
                Kebijakan Privasi
              </h1>

              <p className="mt-2 text-[10px] font-medium text-slate-400">
                Terakhir diperbarui: 31 Agustus 2026
              </p>

            </header>

            {/* ============================================================== */}
            {/* INTRO */}
            {/* ============================================================== */}

            <div className="px-4 py-5 sm:px-5">

              <div className="space-y-4 text-[13px] leading-[1.8] text-slate-700 sm:text-sm">

                <p>
                  <strong className="font-bold text-slate-900">
                    islami.or.id
                  </strong>{" "}
                  menghormati privasi setiap pengguna
                  dan berkomitmen untuk mengelola data
                  pribadi secara bertanggung jawab.
                  Kebijakan Privasi ini menjelaskan
                  jenis informasi yang dapat kami
                  kumpulkan, tujuan penggunaannya,
                  cara pengelolaannya, serta hak Anda
                  sebagai pengguna layanan
                  islami.or.id.
                </p>

                <p>
                  Dengan menggunakan layanan
                  islami.or.id, Anda memahami bahwa
                  informasi tertentu dapat diperlukan
                  untuk menjalankan fitur akun,
                  transaksi, konfirmasi donasi,
                  layanan komunikasi, dan fungsi
                  platform lainnya.
                </p>

              </div>

              {/* ============================================================ */}
              {/* SECTIONS */}
              {/* ============================================================ */}

              <div className="mt-7 divide-y divide-slate-100">

                {/* ========================================================== */}
                {/* 01 */}
                {/* ========================================================== */}

                <section className="pb-6">

                  <div className="flex items-start gap-3">

                    {/* Nomor dianggap elemen indikator kecil */}

                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-50 text-[10px] font-extrabold text-[#0d5c91]">
                      01
                    </div>

                    <div className="min-w-0">

                      <h2 className="text-[14px] font-bold leading-snug text-slate-900 sm:text-[15px]">
                        Informasi yang Kami Kumpulkan
                      </h2>

                      <p className="mt-2 text-[12px] leading-[1.75] text-slate-600 sm:text-[13px]">
                        Saat Anda menggunakan atau
                        bertransaksi melalui platform,
                        kami dapat menerima informasi
                        yang Anda berikan secara
                        langsung maupun data teknis
                        tertentu yang diperlukan untuk
                        menjalankan layanan.
                      </p>

                    </div>

                  </div>

                  <ul className="mt-4 list-disc space-y-2 pl-11 text-[12px] leading-[1.75] text-slate-600 sm:text-[13px]">

                    <li>
                      <strong className="font-semibold text-slate-800">
                        Identitas pengguna:
                      </strong>{" "}
                      seperti nama atau identitas lain
                      yang diberikan ketika membuat
                      akun atau melakukan transaksi.
                    </li>

                    <li>
                      <strong className="font-semibold text-slate-800">
                        Informasi kontak:
                      </strong>{" "}
                      seperti alamat email atau nomor
                      WhatsApp yang diberikan kepada
                      platform.
                    </li>

                    <li>
                      <strong className="font-semibold text-slate-800">
                        Data transaksi:
                      </strong>{" "}
                      termasuk nominal, program yang
                      dipilih, status pembayaran,
                      metode pembayaran, dan waktu
                      transaksi.
                    </li>

                    <li>
                      <strong className="font-semibold text-slate-800">
                        Data penggunaan:
                      </strong>{" "}
                      informasi tertentu mengenai
                      interaksi dengan fitur dan
                      layanan platform.
                    </li>

                  </ul>

                </section>

                {/* ========================================================== */}
                {/* 02 */}
                {/* ========================================================== */}

                <section className="py-6">

                  <div className="flex items-start gap-3">

                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-50 text-[10px] font-extrabold text-[#0d5c91]">
                      02
                    </div>

                    <div className="min-w-0">

                      <h2 className="text-[14px] font-bold leading-snug text-slate-900 sm:text-[15px]">
                        Penggunaan Informasi
                      </h2>

                      <p className="mt-2 text-[12px] leading-[1.75] text-slate-600 sm:text-[13px]">
                        Informasi yang diperoleh
                        digunakan sejauh diperlukan
                        untuk menjalankan dan
                        meningkatkan layanan
                        islami.or.id.
                      </p>

                    </div>

                  </div>

                  <ul className="mt-4 list-disc space-y-2 pl-11 text-[12px] leading-[1.75] text-slate-600 sm:text-[13px]">

                    <li>
                      Memproses dan mencatat
                      transaksi pada platform.
                    </li>

                    <li>
                      Menampilkan riwayat transaksi
                      serta informasi akun pengguna.
                    </li>

                    <li>
                      Memberikan konfirmasi,
                      pemberitahuan, atau informasi
                      penting terkait layanan.
                    </li>

                    <li>
                      Menangani permintaan bantuan
                      atau dukungan pengguna.
                    </li>

                    <li>
                      Meningkatkan keamanan,
                      keandalan, dan kualitas
                      layanan.
                    </li>

                    <li>
                      Melakukan analisis statistik
                      untuk pengembangan platform.
                    </li>

                  </ul>

                </section>

                {/* ========================================================== */}
                {/* 03 */}
                {/* ========================================================== */}

                <section className="py-6">

                  <div className="flex items-start gap-3">

                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-50 text-[10px] font-extrabold text-[#0d5c91]">
                      03
                    </div>

                    <div className="min-w-0">

                      <h2 className="text-[14px] font-bold leading-snug text-slate-900 sm:text-[15px]">
                        Keamanan dan Penyimpanan Data
                      </h2>

                      <p className="mt-2 text-[12px] leading-[1.75] text-slate-600 sm:text-[13px]">
                        Kami menerapkan langkah
                        teknis dan organisatoris yang
                        wajar untuk membantu
                        melindungi informasi pribadi
                        dari akses, penggunaan,
                        perubahan, atau pengungkapan
                        yang tidak sah.
                      </p>

                      <p className="mt-3 text-[12px] leading-[1.75] text-slate-600 sm:text-[13px]">
                        Meskipun demikian, tidak ada
                        sistem penyimpanan atau
                        transmisi data melalui
                        internet yang dapat dijamin
                        sepenuhnya bebas dari risiko.
                        Karena itu, kami terus
                        berupaya meningkatkan
                        perlindungan sesuai kebutuhan
                        layanan.
                      </p>

                    </div>

                  </div>

                </section>

                {/* ========================================================== */}
                {/* 04 */}
                {/* ========================================================== */}

                <section className="py-6">

                  <div className="flex items-start gap-3">

                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-50 text-[10px] font-extrabold text-[#0d5c91]">
                      04
                    </div>

                    <div className="min-w-0">

                      <h2 className="text-[14px] font-bold leading-snug text-slate-900 sm:text-[15px]">
                        Pihak Ketiga dan Penyedia Layanan
                      </h2>

                      <p className="mt-2 text-[12px] leading-[1.75] text-slate-600 sm:text-[13px]">
                        islami.or.id tidak menjual
                        atau memperdagangkan data
                        pribadi pengguna untuk
                        kepentingan komersial pihak
                        lain.
                      </p>

                      <p className="mt-3 text-[12px] leading-[1.75] text-slate-600 sm:text-[13px]">
                        Namun, informasi tertentu
                        dapat diproses oleh penyedia
                        layanan yang mendukung
                        operasional platform, seperti
                        layanan pembayaran,
                        autentikasi, penyimpanan
                        data, analitik, atau
                        infrastruktur teknologi,
                        sejauh diperlukan untuk
                        menyediakan layanan kepada
                        pengguna.
                      </p>

                    </div>

                  </div>

                </section>

                {/* ========================================================== */}
                {/* 05 */}
                {/* ========================================================== */}

                <section className="py-6">

                  <div className="flex items-start gap-3">

                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-50 text-[10px] font-extrabold text-[#0d5c91]">
                      05
                    </div>

                    <div className="min-w-0">

                      <h2 className="text-[14px] font-bold leading-snug text-slate-900 sm:text-[15px]">
                        Hak Pengguna
                      </h2>

                      <p className="mt-2 text-[12px] leading-[1.75] text-slate-600 sm:text-[13px]">
                        Sesuai ketentuan yang berlaku
                        dan sejauh dapat diterapkan,
                        pengguna dapat meminta
                        informasi mengenai data yang
                        tersimpan, memperbarui data
                        yang tidak tepat, atau
                        mengajukan permintaan
                        penghapusan data tertentu.
                      </p>

                    </div>

                  </div>

                </section>

                {/* ========================================================== */}
                {/* 06 */}
                {/* ========================================================== */}

                <section className="py-6">

                  <div className="flex items-start gap-3">

                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-50 text-[10px] font-extrabold text-[#0d5c91]">
                      06
                    </div>

                    <div className="min-w-0">

                      <h2 className="text-[14px] font-bold leading-snug text-slate-900 sm:text-[15px]">
                        Penyimpanan Data
                      </h2>

                      <p className="mt-2 text-[12px] leading-[1.75] text-slate-600 sm:text-[13px]">
                        Data dapat disimpan selama
                        masih diperlukan untuk tujuan
                        layanan, pencatatan transaksi,
                        kepatuhan terhadap kewajiban
                        yang berlaku, penyelesaian
                        sengketa, dan kebutuhan
                        keamanan platform.
                      </p>

                    </div>

                  </div>

                </section>

                {/* ========================================================== */}
                {/* 07 */}
                {/* ========================================================== */}

                <section className="py-6">

                  <div className="flex items-start gap-3">

                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-50 text-[10px] font-extrabold text-[#0d5c91]">
                      07
                    </div>

                    <div className="min-w-0">

                      <h2 className="text-[14px] font-bold leading-snug text-slate-900 sm:text-[15px]">
                        Perubahan Kebijakan Privasi
                      </h2>

                      <p className="mt-2 text-[12px] leading-[1.75] text-slate-600 sm:text-[13px]">
                        Kebijakan Privasi ini dapat
                        diperbarui dari waktu ke
                        waktu untuk menyesuaikan
                        perubahan layanan,
                        teknologi, atau ketentuan
                        yang berlaku. Tanggal
                        pembaruan terbaru akan
                        ditampilkan pada bagian atas
                        halaman ini.
                      </p>

                    </div>

                  </div>

                </section>

              </div>

            </div>

            {/* ============================================================== */}
            {/* CONTACT */}
            {/* ============================================================== */}

            <footer className="border-t border-slate-200 bg-slate-50 px-4 py-5 text-center sm:px-5">

              <h2 className="text-[13px] font-bold text-slate-800">
                Ada pertanyaan mengenai privasi?
              </h2>

              <p className="mx-auto mt-2 max-w-sm text-[11px] leading-relaxed text-slate-500 sm:text-xs">
                Hubungi kami apabila Anda memerlukan
                penjelasan mengenai pengelolaan data
                pribadi atau ingin mengajukan
                permintaan terkait informasi akun
                Anda.
              </p>

              <div className="mt-4 grid grid-cols-1 gap-2">

                <Link
                  href="/kontak"
                  className="flex w-full items-center justify-center border border-slate-300 bg-white py-3 text-[10px] font-bold uppercase tracking-wider text-slate-700 transition-colors hover:bg-slate-100"
                >
                  Hubungi Kami
                </Link>

                <Link
                  href="/"
                  className="flex w-full items-center justify-center bg-[#0d5c91] py-3 text-[10px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-sky-900"
                >
                  Kembali ke Beranda
                </Link>

              </div>

            </footer>

          </article>

        </div>

      </main>
    </>
  );
}