// app/syarat-ketentuan/page.tsx

import type { Metadata } from "next";
import Link from "next/link";

// ============================================================================
// CONFIG
// ============================================================================

const SITE_URL = "https://www.islami.or.id";
const SITE_NAME = "islami.or.id";

const PAGE_URL = `${SITE_URL}/syarat-ketentuan`;

const PAGE_TITLE =
  "Syarat & Ketentuan Penggunaan";

const PAGE_DESCRIPTION =
  "Syarat dan ketentuan resmi penggunaan platform islami.or.id yang menjelaskan hak, kewajiban pengguna, mekanisme layanan, transaksi, perlindungan data, dan ketentuan operasional.";

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
        alt: `Syarat dan Ketentuan ${SITE_NAME}`,
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

export default function SyaratKetentuanPage() {
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
        name: "Syarat & Ketentuan",
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
                  Syarat & Ketentuan
                </span>
              </nav>

              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#0d5c91]">
                Dokumen Ketentuan
              </p>

              <h1 className="mt-1.5 text-[24px] font-extrabold leading-tight tracking-tight text-slate-950 sm:text-[27px]">
                Syarat & Ketentuan Penggunaan
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
                  Selamat datang di{" "}
                  <strong className="font-bold text-slate-900">
                    islami.or.id
                  </strong>
                  . Syarat & Ketentuan ini mengatur
                  penggunaan layanan, fitur, akun,
                  transaksi, serta interaksi pengguna
                  di dalam platform.
                </p>

                <p>
                  Dengan mengakses atau menggunakan
                  islami.or.id, Anda dianggap telah
                  membaca dan memahami ketentuan yang
                  berlaku pada layanan yang Anda
                  gunakan.
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

                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-50 text-[10px] font-extrabold text-[#0d5c91]">
                      01
                    </div>

                    <div className="min-w-0">

                      <h2 className="text-[14px] font-bold leading-snug text-slate-900 sm:text-[15px]">
                        Ketentuan Pengguna
                      </h2>

                      <p className="mt-2 text-[12px] leading-[1.75] text-slate-600 sm:text-[13px]">
                        Pengguna bertanggung jawab
                        menggunakan platform secara
                        wajar, sah, dan tidak
                        bertentangan dengan ketentuan
                        yang berlaku.
                      </p>

                    </div>

                  </div>

                  <ul className="mt-4 list-disc space-y-2 pl-11 text-[12px] leading-[1.75] text-slate-600 sm:text-[13px]">

                    <li>
                      Informasi yang diberikan kepada
                      platform harus benar sejauh
                      diketahui oleh pengguna.
                    </li>

                    <li>
                      Pengguna tidak diperkenankan
                      menggunakan layanan untuk
                      aktivitas yang melanggar hukum,
                      merugikan pihak lain, atau
                      mengganggu operasional sistem.
                    </li>

                    <li>
                      Data kontak seperti email atau
                      nomor WhatsApp dapat digunakan
                      untuk konfirmasi, notifikasi,
                      atau komunikasi terkait layanan.
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
                        Mekanisme Layanan dan Transaksi
                      </h2>

                      <p className="mt-2 text-[12px] leading-[1.75] text-slate-600 sm:text-[13px]">
                        Fitur dan transaksi pada
                        islami.or.id dapat melibatkan
                        sistem internal maupun layanan
                        pihak ketiga yang terintegrasi.
                      </p>

                    </div>

                  </div>

                  <ul className="mt-4 list-disc space-y-2 pl-11 text-[12px] leading-[1.75] text-slate-600 sm:text-[13px]">

                    <li>
                      Nominal minimum, metode
                      pembayaran, biaya tertentu, atau
                      ketentuan teknis dapat mengikuti
                      konfigurasi layanan yang sedang
                      berlaku.
                    </li>

                    <li>
                      Status transaksi mengikuti hasil
                      yang tercatat pada sistem dan
                      penyedia layanan pembayaran yang
                      digunakan.
                    </li>

                    <li>
                      Pengguna bertanggung jawab
                      memastikan detail transaksi
                      sebelum menyelesaikan pembayaran.
                    </li>

                    <li>
                      Gangguan dari jaringan,
                      perangkat, perbankan, payment
                      gateway, atau layanan pihak
                      ketiga dapat memengaruhi proses
                      transaksi.
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
                        Pengelolaan Program dan Layanan
                      </h2>

                      <p className="mt-2 text-[12px] leading-[1.75] text-slate-600 sm:text-[13px]">
                        Pengelola dapat menyesuaikan,
                        memperbarui, menambah, atau
                        menghentikan fitur dan program
                        tertentu sesuai kebutuhan
                        operasional, kebijakan
                        pengelolaan, dan kondisi
                        layanan.
                      </p>

                      <p className="mt-3 text-[12px] leading-[1.75] text-slate-600 sm:text-[13px]">
                        Informasi program yang
                        ditampilkan pada platform
                        diupayakan agar tetap relevan
                        dan dapat diperbarui apabila
                        terdapat perubahan kondisi atau
                        kebutuhan.
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
                        Perlindungan Data Pribadi
                      </h2>

                      <p className="mt-2 text-[12px] leading-[1.75] text-slate-600 sm:text-[13px]">
                        Informasi pribadi pengguna
                        dikelola sesuai kebutuhan
                        layanan dan ketentuan yang
                        dijelaskan dalam Kebijakan
                        Privasi islami.or.id.
                      </p>

                      <p className="mt-3 text-[12px] leading-[1.75] text-slate-600 sm:text-[13px]">
                        islami.or.id tidak menjual atau
                        memperdagangkan data pribadi
                        pengguna untuk kepentingan
                        komersial pihak lain. Data
                        tertentu dapat diproses oleh
                        penyedia layanan yang
                        mendukung operasional platform
                        sejauh diperlukan.
                      </p>

                      <Link
                        href="/kebijakan-privasi"
                        className="mt-3 inline-flex text-[11px] font-bold text-[#0d5c91] underline decoration-sky-300 underline-offset-2"
                      >
                        Baca Kebijakan Privasi
                      </Link>

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
                        Akun dan Keamanan Pengguna
                      </h2>

                      <p className="mt-2 text-[12px] leading-[1.75] text-slate-600 sm:text-[13px]">
                        Apabila suatu fitur memerlukan
                        akun, pengguna bertanggung
                        jawab menjaga akses ke akun,
                        perangkat, email, nomor
                        telepon, dan informasi
                        autentikasi yang digunakan.
                      </p>

                      <p className="mt-3 text-[12px] leading-[1.75] text-slate-600 sm:text-[13px]">
                        Pengguna disarankan segera
                        menghubungi pengelola apabila
                        mengetahui adanya penggunaan
                        akun yang tidak dikenali.
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
                        Ketersediaan Layanan
                      </h2>

                      <p className="mt-2 text-[12px] leading-[1.75] text-slate-600 sm:text-[13px]">
                        Kami berupaya menjaga layanan
                        tetap tersedia dan berfungsi
                        dengan baik. Namun,
                        ketersediaan layanan dapat
                        dipengaruhi oleh pemeliharaan,
                        gangguan teknis, layanan pihak
                        ketiga, konektivitas, atau
                        keadaan lain di luar kendali
                        langsung pengelola.
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
                        Konten dan Hak Kekayaan Intelektual
                      </h2>

                      <p className="mt-2 text-[12px] leading-[1.75] text-slate-600 sm:text-[13px]">
                        Materi, desain, tulisan, logo,
                        ilustrasi, dan elemen lain pada
                        platform dapat dilindungi oleh
                        hak kekayaan intelektual
                        masing-masing pemiliknya.
                      </p>

                      <p className="mt-3 text-[12px] leading-[1.75] text-slate-600 sm:text-[13px]">
                        Pengguna tidak diperkenankan
                        menyalin, memodifikasi, atau
                        menggunakan materi tertentu
                        untuk tujuan yang melanggar hak
                        pihak lain.
                      </p>

                    </div>

                  </div>

                </section>

                {/* ========================================================== */}
                {/* 08 */}
                {/* ========================================================== */}

                <section className="py-6">

                  <div className="flex items-start gap-3">

                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-50 text-[10px] font-extrabold text-[#0d5c91]">
                      08
                    </div>

                    <div className="min-w-0">

                      <h2 className="text-[14px] font-bold leading-snug text-slate-900 sm:text-[15px]">
                        Perubahan Syarat & Ketentuan
                      </h2>

                      <p className="mt-2 text-[12px] leading-[1.75] text-slate-600 sm:text-[13px]">
                        Syarat & Ketentuan ini dapat
                        diperbarui dari waktu ke waktu
                        untuk menyesuaikan perubahan
                        layanan, fitur, teknologi, atau
                        ketentuan yang berlaku.
                      </p>

                      <p className="mt-3 text-[12px] leading-[1.75] text-slate-600 sm:text-[13px]">
                        Versi terbaru akan ditampilkan
                        pada halaman ini beserta
                        informasi tanggal pembaruan.
                      </p>

                    </div>

                  </div>

                </section>

              </div>

            </div>

            {/* ============================================================== */}
            {/* FOOTER / CONTACT */}
            {/* ============================================================== */}

            <footer className="border-t border-slate-200 bg-slate-50 px-4 py-5 text-center sm:px-5">

              <h2 className="text-[13px] font-bold text-slate-800">
                Butuh penjelasan lebih lanjut?
              </h2>

              <p className="mx-auto mt-2 max-w-sm text-[11px] leading-relaxed text-slate-500 sm:text-xs">
                Hubungi kami apabila Anda memiliki
                pertanyaan mengenai penggunaan
                platform, transaksi, akun, atau
                ketentuan layanan islami.or.id.
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