// app/tentang-kami/page.tsx

import type { Metadata } from "next";
import Link from "next/link";

import {
  BookOpenText,
  HandHeart,
  ShieldCheck,
  Lightbulb,
  UsersRound,
  ArrowRight,
  Home,
} from "lucide-react";

// ============================================================================
// CONFIG
// ============================================================================

const SITE_URL = "https://www.islami.or.id";
const SITE_NAME = "islami.or.id";

const PAGE_URL = `${SITE_URL}/tentang-kami`;

const PAGE_TITLE = "Tentang Kami";

const PAGE_DESCRIPTION =
  "Mengenal islami.or.id, platform digital yang menghadirkan artikel Islam, informasi keislaman, program kebaikan, serta layanan donasi dan sosial secara terintegrasi.";

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
        alt: `Tentang ${SITE_NAME}`,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title: `${PAGE_TITLE} | ${SITE_NAME}`,

    description: PAGE_DESCRIPTION,

    images: [`${SITE_URL}/images/banner.png`],
  },
};

// ============================================================================
// PAGE
// ============================================================================

export default function TentangKamiPage() {
  // ==========================================================================
  // STRUCTURED DATA
  // ==========================================================================

  const aboutPageSchema = {
    "@context": "https://schema.org",

    "@type": "AboutPage",

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
        name: "Tentang Kami",
        item: PAGE_URL,
      },
    ],
  };

  const jsonLd = JSON.stringify([
    aboutPageSchema,
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
        {/* MOBILE FIRST WRAPPER */}
        {/* ================================================================== */}

        <div className="mx-auto w-full max-w-md px-3 pt-3">

          {/* ================================================================ */}
          {/* MAIN PANEL */}
          {/* ================================================================ */}

          <article className="w-full border border-slate-200/80 bg-white shadow-sm">

            {/* ============================================================== */}
            {/* HERO */}
            {/* ============================================================== */}

            <header className="relative overflow-hidden bg-[#102a43] px-4 pb-6 pt-5 text-white sm:px-5">

              {/* Decorative circles */}
              <div className="pointer-events-none absolute -right-20 -top-24 h-52 w-52 rounded-full border border-white/10" />
              <div className="pointer-events-none absolute -bottom-24 -left-16 h-44 w-44 rounded-full border border-[#d7b66a]/15" />

              <div className="relative z-10">

                {/* Breadcrumb */}

                <nav
                  aria-label="Breadcrumb"
                  className="mb-5 flex items-center gap-2 text-[10px] font-medium text-slate-300"
                >
                  <Link
                    href="/"
                    className="transition-colors hover:text-white"
                  >
                    Beranda
                  </Link>

                  <span
                    aria-hidden="true"
                    className="text-slate-500"
                  >
                    /
                  </span>

                  <span
                    aria-current="page"
                    className="text-slate-200"
                  >
                    Tentang Kami
                  </span>
                </nav>

                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#d7b66a]/30 bg-white/10">
                  <BookOpenText className="h-5 w-5 text-[#e5c979]" />
                </div>

                <p className="mt-4 text-[9px] font-bold uppercase tracking-[0.2em] text-[#d7b66a]">
                  Profil islami.or.id
                </p>

                <h1 className="mt-1.5 text-[25px] font-extrabold leading-[1.2] tracking-tight text-white sm:text-[28px]">
                  Tentang islami.or.id
                </h1>

                <p className="mt-3 max-w-[350px] text-[11px] leading-[1.75] text-slate-300 sm:text-xs">
                  islami.or.id hadir sebagai platform digital yang
                  menggabungkan konten keislaman, informasi, dan
                  berbagai program kebaikan dalam satu ekosistem
                  yang mudah diakses.
                </p>

              </div>

            </header>

            {/* ============================================================== */}
            {/* WHO WE ARE */}
            {/* ============================================================== */}

            <section className="px-4 py-6 sm:px-5">

              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#0d5c91]">
                Siapa Kami
              </p>

              <h2 className="mt-1.5 text-[18px] font-extrabold leading-tight tracking-tight text-slate-950">
                Media Islam dan Platform Kebaikan Digital
              </h2>

              <div className="mt-4 space-y-4 text-[12px] leading-[1.8] text-slate-600 sm:text-[13px]">

                <p>
                  <strong className="font-bold text-slate-900">
                    islami.or.id
                  </strong>{" "}
                  dikembangkan sebagai ruang digital yang memudahkan
                  masyarakat memperoleh informasi keislaman sekaligus
                  menemukan berbagai program sosial dan kebaikan.
                </p>

                <p>
                  Konten yang dihadirkan mencakup berbagai tema Islam,
                  seperti Al-Qur&apos;an, hadis, fikih, doa, sejarah Islam,
                  keluarga, zakat, sedekah, wakaf, serta informasi
                  sosial dan kemanusiaan.
                </p>

                <p>
                  Di sisi lain, teknologi digital digunakan untuk
                  mempermudah akses terhadap program kebaikan,
                  informasi transaksi, pembaruan kegiatan, dan
                  layanan pengguna dalam satu platform.
                </p>

              </div>

            </section>

            {/* ============================================================== */}
            {/* VISION */}
            {/* ============================================================== */}

            <section className="border-t border-slate-100 px-4 py-6 sm:px-5">

              <div className="flex items-start gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-50">
                  <Lightbulb className="h-4 w-4 text-[#0d5c91]" />
                </div>

                <div className="min-w-0 flex-1">

                  <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#0d5c91]">
                    Visi
                  </p>

                  <h2 className="mt-1 text-[15px] font-bold text-slate-900">
                    Menjadi ruang digital Islam yang bermanfaat
                  </h2>

                  <p className="mt-2 text-[12px] leading-[1.75] text-slate-600 sm:text-[13px]">
                    Menghadirkan platform digital Islam yang informatif,
                    mudah digunakan, relevan, dan dapat menjadi sarana
                    untuk memperluas manfaat serta semangat berbagi
                    kebaikan di tengah masyarakat.
                  </p>

                </div>

              </div>

            </section>

            {/* ============================================================== */}
            {/* MISSION */}
            {/* ============================================================== */}

            <section className="border-t border-slate-100 px-4 py-6 sm:px-5">

              <div className="flex items-start gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-50">
                  <HandHeart className="h-4 w-4 text-[#0d5c91]" />
                </div>

                <div className="min-w-0 flex-1">

                  <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#0d5c91]">
                    Misi
                  </p>

                  <h2 className="mt-1 text-[15px] font-bold text-slate-900">
                    Menghubungkan ilmu, informasi, dan aksi kebaikan
                  </h2>

                </div>

              </div>

              <ul className="mt-4 space-y-3">

                <li className="flex items-start gap-3">

                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[8px] font-extrabold text-[#0d5c91]">
                    01
                  </span>

                  <p className="pt-0.5 text-[12px] leading-[1.7] text-slate-600 sm:text-[13px]">
                    Menghadirkan konten keislaman yang mudah dipahami
                    dan relevan bagi masyarakat.
                  </p>

                </li>

                <li className="flex items-start gap-3">

                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[8px] font-extrabold text-[#0d5c91]">
                    02
                  </span>

                  <p className="pt-0.5 text-[12px] leading-[1.7] text-slate-600 sm:text-[13px]">
                    Memanfaatkan teknologi untuk mempermudah akses
                    terhadap layanan, informasi, dan program sosial.
                  </p>

                </li>

                <li className="flex items-start gap-3">

                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[8px] font-extrabold text-[#0d5c91]">
                    03
                  </span>

                  <p className="pt-0.5 text-[12px] leading-[1.7] text-slate-600 sm:text-[13px]">
                    Mendorong budaya berbagi, kepedulian sosial, dan
                    partisipasi masyarakat dalam berbagai bentuk
                    kebaikan.
                  </p>

                </li>

                <li className="flex items-start gap-3">

                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[8px] font-extrabold text-[#0d5c91]">
                    04
                  </span>

                  <p className="pt-0.5 text-[12px] leading-[1.7] text-slate-600 sm:text-[13px]">
                    Mengembangkan layanan digital yang sederhana,
                    responsif, dan mudah digunakan pada berbagai
                    perangkat.
                  </p>

                </li>

              </ul>

            </section>

            {/* ============================================================== */}
            {/* VALUES */}
            {/* ============================================================== */}

            <section className="border-t border-slate-100 px-4 py-6 sm:px-5">

              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#0d5c91]">
                Nilai Utama
              </p>

              <h2 className="mt-1.5 text-[17px] font-extrabold text-slate-900">
                Prinsip yang Kami Bangun
              </h2>

              <div className="mt-5 divide-y divide-slate-100 border-y border-slate-100">

                {/* 01 */}

                <div className="flex items-start gap-3 py-4">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-50">
                    <ShieldCheck className="h-4 w-4 text-[#0d5c91]" />
                  </div>

                  <div>

                    <h3 className="text-[13px] font-bold text-slate-900">
                      Kepercayaan
                    </h3>

                    <p className="mt-1.5 text-[11px] leading-[1.7] text-slate-600 sm:text-[12px]">
                      Mengembangkan layanan dengan komunikasi yang jelas
                      dan informasi yang dapat dipahami pengguna.
                    </p>

                  </div>

                </div>

                {/* 02 */}

                <div className="flex items-start gap-3 py-4">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-50">
                    <UsersRound className="h-4 w-4 text-[#0d5c91]" />
                  </div>

                  <div>

                    <h3 className="text-[13px] font-bold text-slate-900">
                      Kemanfaatan
                    </h3>

                    <p className="mt-1.5 text-[11px] leading-[1.7] text-slate-600 sm:text-[12px]">
                      Setiap fitur dan konten diarahkan agar memberikan
                      manfaat nyata bagi pengguna dan masyarakat.
                    </p>

                  </div>

                </div>

                {/* 03 */}

                <div className="flex items-start gap-3 py-4">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-50">
                    <Lightbulb className="h-4 w-4 text-[#0d5c91]" />
                  </div>

                  <div>

                    <h3 className="text-[13px] font-bold text-slate-900">
                      Inovasi
                    </h3>

                    <p className="mt-1.5 text-[11px] leading-[1.7] text-slate-600 sm:text-[12px]">
                      Memanfaatkan teknologi secara tepat untuk membuat
                      pengalaman pengguna semakin sederhana dan efisien.
                    </p>

                  </div>

                </div>

              </div>

            </section>

            {/* ============================================================== */}
            {/* POSITIONING */}
            {/* ============================================================== */}

            <section className="border-t border-slate-100 bg-slate-50 px-4 py-6 sm:px-5">

              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#0d5c91]">
                Arah Pengembangan
              </p>

              <h2 className="mt-1.5 text-[16px] font-extrabold leading-snug text-slate-900">
                Bukan hanya platform donasi
              </h2>

              <p className="mt-3 text-[12px] leading-[1.8] text-slate-600 sm:text-[13px]">
                islami.or.id dikembangkan sebagai portal Islam yang lebih
                luas. Program donasi dan layanan sosial menjadi salah satu
                bagian dari ekosistem, berdampingan dengan artikel,
                pengetahuan, berita, dan konten keislaman lainnya.
              </p>

            </section>

            {/* ============================================================== */}
            {/* CTA */}
            {/* ============================================================== */}

            <footer className="border-t border-slate-200 px-4 py-6 text-center sm:px-5">

              <h2 className="text-[15px] font-extrabold text-slate-900">
                Jelajahi islami.or.id
              </h2>

              <p className="mx-auto mt-2 max-w-[330px] text-[11px] leading-[1.7] text-slate-500 sm:text-xs">
                Temukan artikel Islam terbaru dan berbagai program
                kebaikan yang tersedia di islami.or.id.
              </p>

              <div className="mt-5 grid grid-cols-1 gap-2">

                <Link
                  href="/news"
                  className="flex w-full items-center justify-center gap-2 bg-[#0d5c91] py-3 text-[10px] font-bold uppercase tracking-wider text-white transition hover:bg-sky-900"
                >
                  Lihat Artikel Terbaru
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>

                <Link
                  href="/"
                  className="flex w-full items-center justify-center gap-2 border border-slate-300 bg-white py-3 text-[10px] font-bold uppercase tracking-wider text-slate-700 transition hover:bg-slate-100"
                >
                  <Home className="h-3.5 w-3.5" />
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