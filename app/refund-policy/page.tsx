// app/refund-policy/page.tsx

import type { Metadata } from "next";
import Link from "next/link";

// ============================================================================
// CONFIG
// ============================================================================

const SITE_URL = "https://www.islami.or.id";
const SITE_NAME = "islami.or.id";

const PAGE_URL = `${SITE_URL}/refund-policy`;

const PAGE_TITLE =
  "Kebijakan Pengembalian Dana";

const PAGE_DESCRIPTION =
  "Pelajari kebijakan pengembalian dana untuk transaksi donasi, infak, zakat, wakaf, dan layanan sosial di islami.or.id, termasuk kondisi pengajuan, verifikasi, dan proses refund.";

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
        alt: `Kebijakan Pengembalian Dana ${SITE_NAME}`,
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

export default function RefundPolicyPage() {
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
        name: "Kebijakan Pengembalian Dana",
        item: PAGE_URL,
      },
    ],
  };

  const jsonLd = JSON.stringify([
    webPageSchema,
    breadcrumbSchema,
  ]).replace(/</g, "\\u003c");

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
                  Refund Policy
                </span>
              </nav>

              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#0d5c91]">
                Kebijakan Keuangan & Donasi
              </p>

              <h1 className="mt-1.5 text-[24px] font-extrabold leading-tight tracking-tight text-slate-950 sm:text-[27px]">
                Kebijakan Pengembalian Dana
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
                  Terima kasih telah menyalurkan
                  kebaikan melalui{" "}
                  <strong className="font-bold text-slate-900">
                    islami.or.id
                  </strong>
                  . Kami berupaya mengelola setiap
                  transaksi secara tertib,
                  transparan, dan bertanggung jawab.
                </p>

                <p>
                  Karena sebagian transaksi pada
                  platform berkaitan dengan donasi,
                  infak, zakat, wakaf, atau bentuk
                  kontribusi sosial lainnya,
                  pengembalian dana tidak selalu
                  dapat dilakukan setelah transaksi
                  dinyatakan berhasil.
                </p>

                <p>
                  Namun, dalam kondisi tertentu,
                  pengajuan pengembalian dana dapat
                  dipertimbangkan setelah dilakukan
                  pemeriksaan dan verifikasi.
                </p>

              </div>

              {/* ============================================================ */}
              {/* POLICY SECTIONS */}
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
                        Sifat Transaksi Donasi
                      </h2>

                      <p className="mt-2 text-[12px] leading-[1.75] text-slate-600 sm:text-[13px]">
                        Transaksi yang telah
                        dinyatakan berhasil oleh
                        sistem pembayaran umumnya
                        dianggap final karena dana
                        dapat segera masuk ke proses
                        pencatatan, pengalokasian,
                        atau pengelolaan program.
                      </p>

                      <p className="mt-3 text-[12px] leading-[1.75] text-slate-600 sm:text-[13px]">
                        Karena itu, pengembalian dana
                        tidak dapat dilakukan secara
                        otomatis hanya karena pengguna
                        berubah pikiran setelah
                        transaksi selesai.
                      </p>

                    </div>

                  </div>

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
                        Kondisi Pengajuan Refund
                      </h2>

                      <p className="mt-2 text-[12px] leading-[1.75] text-slate-600 sm:text-[13px]">
                        Pengembalian dana dapat
                        dipertimbangkan apabila
                        terdapat keadaan khusus yang
                        dapat diverifikasi.
                      </p>

                    </div>

                  </div>

                  <ul className="mt-4 list-disc space-y-2 pl-11 text-[12px] leading-[1.75] text-slate-600 sm:text-[13px]">

                    <li>
                      Terjadi pendebetan atau
                      pembayaran ganda untuk transaksi
                      yang sama akibat gangguan teknis
                      atau kesalahan pemrosesan.
                    </li>

                    <li>
                      Terjadi kesalahan nominal yang
                      dapat dibuktikan dan masih
                      memungkinkan untuk dilakukan
                      penyesuaian.
                    </li>

                    <li>
                      Transaksi tercatat tidak sesuai
                      karena kendala pada sistem
                      pembayaran atau integrasi
                      layanan.
                    </li>

                    <li>
                      Terdapat kondisi lain yang
                      setelah diperiksa oleh pengelola
                      dinilai layak untuk diproses
                      lebih lanjut.
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
                        Cara Mengajukan Pengembalian Dana
                      </h2>

                      <p className="mt-2 text-[12px] leading-[1.75] text-slate-600 sm:text-[13px]">
                        Pengguna yang mengalami
                        kendala disarankan segera
                        menghubungi tim layanan agar
                        transaksi dapat diperiksa
                        sebelum proses pengelolaan
                        dana berlangsung lebih lanjut.
                      </p>

                    </div>

                  </div>

                  <p className="mt-4 text-[12px] leading-[1.75] text-slate-600 sm:text-[13px]">
                    Saat mengajukan permintaan,
                    sertakan informasi yang membantu
                    proses verifikasi, seperti:
                  </p>

                  <ul className="mt-3 list-disc space-y-2 pl-11 text-[12px] leading-[1.75] text-slate-600 sm:text-[13px]">

                    <li>
                      Nama atau identitas yang
                      digunakan saat transaksi.
                    </li>

                    <li>
                      Nomor transaksi atau invoice
                      apabila tersedia.
                    </li>

                    <li>
                      Waktu dan nominal pembayaran.
                    </li>

                    <li>
                      Metode pembayaran yang
                      digunakan.
                    </li>

                    <li>
                      Bukti pembayaran atau dokumen
                      lain yang relevan.
                    </li>

                    <li>
                      Penjelasan mengenai kendala yang
                      terjadi.
                    </li>

                  </ul>

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
                        Verifikasi Pengajuan
                      </h2>

                      <p className="mt-2 text-[12px] leading-[1.75] text-slate-600 sm:text-[13px]">
                        Setiap permintaan pengembalian
                        dana akan diperiksa berdasarkan
                        data transaksi yang tersedia,
                        informasi dari pengguna, serta
                        catatan dari penyedia layanan
                        pembayaran apabila diperlukan.
                      </p>

                      <p className="mt-3 text-[12px] leading-[1.75] text-slate-600 sm:text-[13px]">
                        Pengajuan refund tidak
                        otomatis disetujui. Keputusan
                        akan mempertimbangkan status
                        transaksi, kondisi dana, serta
                        hasil verifikasi yang
                        dilakukan.
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
                        Proses Pengembalian Dana
                      </h2>

                      <p className="mt-2 text-[12px] leading-[1.75] text-slate-600 sm:text-[13px]">
                        Jika pengajuan disetujui,
                        proses pengembalian dana dapat
                        melibatkan payment gateway,
                        bank, penyedia e-wallet, atau
                        penyedia layanan pembayaran
                        lainnya.
                      </p>

                      <p className="mt-3 text-[12px] leading-[1.75] text-slate-600 sm:text-[13px]">
                        Waktu penyelesaian dapat
                        berbeda tergantung metode
                        pembayaran, proses administrasi
                        penyedia layanan, dan
                        ketentuan perbankan yang
                        berlaku.
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
                        Dana yang Telah Disalurkan
                      </h2>

                      <p className="mt-2 text-[12px] leading-[1.75] text-slate-600 sm:text-[13px]">
                        Pengembalian dana mungkin
                        tidak dapat dilakukan apabila
                        dana telah disalurkan,
                        dialokasikan, atau digunakan
                        untuk kebutuhan program sesuai
                        tujuan transaksi.
                      </p>

                      <p className="mt-3 text-[12px] leading-[1.75] text-slate-600 sm:text-[13px]">
                        Karena itu, pengguna
                        dianjurkan memeriksa kembali
                        nominal, program, dan metode
                        pembayaran sebelum
                        menyelesaikan transaksi.
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
                        Perubahan Kebijakan
                      </h2>

                      <p className="mt-2 text-[12px] leading-[1.75] text-slate-600 sm:text-[13px]">
                        Kebijakan pengembalian dana
                        dapat diperbarui dari waktu ke
                        waktu untuk menyesuaikan
                        perubahan sistem pembayaran,
                        layanan, prosedur operasional,
                        atau ketentuan yang berlaku.
                      </p>

                    </div>

                  </div>

                </section>

              </div>

            </div>

            {/* ============================================================== */}
            {/* CONTACT CTA */}
            {/* ============================================================== */}

            <footer className="border-t border-slate-200 bg-slate-50 px-4 py-5 text-center sm:px-5">

              <h2 className="text-[13px] font-bold text-slate-900">
                Mengalami kendala transaksi?
              </h2>

              <p className="mx-auto mt-2 max-w-sm text-[11px] leading-[1.7] text-slate-500 sm:text-xs">
                Hubungi tim layanan kami apabila
                terjadi pembayaran ganda, kesalahan
                nominal, atau kendala lain yang
                memerlukan pemeriksaan transaksi.
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

          </article>

        </div>

      </main>
    </>
  );
}