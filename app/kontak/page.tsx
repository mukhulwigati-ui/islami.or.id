// app/kontak/page.tsx

import type { Metadata } from "next";
import Link from "next/link";

import {
  MapPin,
  Mail,
  MessageCircle,
  Clock3,
  Home,
  CircleHelp,
  ExternalLink,
} from "lucide-react";

// ============================================================================
// SITE CONFIG
// ============================================================================

const SITE_URL = "https://www.islami.or.id";
const SITE_NAME = "islami.or.id";

const PAGE_URL = `${SITE_URL}/kontak`;

const PAGE_TITLE = "Hubungi Kami";

const PAGE_DESCRIPTION =
  "Hubungi tim islami.or.id melalui WhatsApp, email, atau informasi kontak resmi untuk pertanyaan seputar akun, transaksi, program kebaikan, dan layanan platform.";

// ============================================================================
// OFFICIAL CONTACT
// ============================================================================

const CONTACT = {
  address: "Purwokerto, Banyumas, Indonesia",

  whatsappDisplay: "0895-3243-83400",

  whatsappInternational: "+62 895-3243-83400",

  whatsappNumber: "62895324383400",

  email: "ibnusuparmin@gmail.com",
};

const whatsappMessage =
  "Assalamualaikum Admin islami.or.id, saya ingin bertanya mengenai layanan islami.or.id.";

const whatsappUrl =
  `https://wa.me/${CONTACT.whatsappNumber}?text=${encodeURIComponent(
    whatsappMessage
  )}`;

const emailUrl =
  `mailto:${CONTACT.email}`;

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
        alt: `Kontak resmi ${SITE_NAME}`,
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

export default function KontakPage() {
  // ==========================================================================
  // STRUCTURED DATA
  // ==========================================================================

  const contactPageSchema = {
    "@context": "https://schema.org",

    "@type": "ContactPage",

    "@id": `${PAGE_URL}#webpage`,

    url: PAGE_URL,

    name: PAGE_TITLE,

    description: PAGE_DESCRIPTION,

    inLanguage: "id-ID",

    isPartOf: {
      "@id": `${SITE_URL}/#website`,
    },

    about: {
      "@id": `${SITE_URL}/#organization`,
    },
  };

  const organizationSchema = {
    "@context": "https://schema.org",

    "@type": "Organization",

    "@id": `${SITE_URL}/#organization`,

    name: SITE_NAME,

    url: SITE_URL,

    email: CONTACT.email,

    telephone: CONTACT.whatsappInternational,

    address: {
      "@type": "PostalAddress",

      addressLocality: "Purwokerto",

      addressRegion: "Banyumas",

      addressCountry: "ID",
    },

    contactPoint: [
      {
        "@type": "ContactPoint",

        contactType: "customer service",

        telephone: CONTACT.whatsappInternational,

        email: CONTACT.email,

        availableLanguage: [
          "Indonesian",
        ],
      },
    ],
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

        name: "Kontak",

        item: PAGE_URL,
      },
    ],
  };

  const jsonLd =
    JSON.stringify([
      contactPageSchema,
      organizationSchema,
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
        {/* MOBILE FIRST WRAPPER */}
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
                  Kontak
                </span>
              </nav>

              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-50">

                <MessageCircle className="h-5 w-5 text-[#0d5c91]" />

              </div>

              <p className="mt-4 text-[9px] font-bold uppercase tracking-[0.2em] text-[#0d5c91]">
                Pusat Informasi
              </p>

              <h1 className="mt-1.5 text-[24px] font-extrabold leading-tight tracking-tight text-slate-950 sm:text-[27px]">
                Hubungi Kami
              </h1>

              <p className="mt-2 text-[11px] leading-[1.75] text-slate-500 sm:text-xs">
                Hubungi tim islami.or.id apabila Anda
                membutuhkan bantuan seputar akun,
                transaksi, program kebaikan,
                pembayaran, atau layanan platform.
              </p>

            </header>

            {/* ============================================================== */}
            {/* CONTACT INFO */}
            {/* ============================================================== */}

            <section className="divide-y divide-slate-100">

              {/* ============================================================ */}
              {/* ADDRESS */}
              {/* ============================================================ */}

              <div className="flex items-start gap-3 px-4 py-5 sm:px-5">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-50">

                  <MapPin className="h-4 w-4 text-[#0d5c91]" />

                </div>

                <div className="min-w-0 flex-1">

                  <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
                    Alamat
                  </p>

                  <h2 className="mt-1 text-[13px] font-bold text-slate-900 sm:text-[14px]">
                    Purwokerto, Banyumas
                  </h2>

                  <p className="mt-1 text-[11px] leading-[1.7] text-slate-600 sm:text-[12px]">
                    {CONTACT.address}
                  </p>

                </div>

              </div>

              {/* ============================================================ */}
              {/* WHATSAPP */}
              {/* ============================================================ */}

              <div className="flex items-start gap-3 px-4 py-5 sm:px-5">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50">

                  <MessageCircle className="h-4 w-4 text-emerald-700" />

                </div>

                <div className="min-w-0 flex-1">

                  <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
                    WhatsApp
                  </p>

                  <h2 className="mt-1 text-[13px] font-bold text-slate-900 sm:text-[14px]">
                    {CONTACT.whatsappDisplay}
                  </h2>

                  <p className="mt-1 text-[11px] leading-[1.7] text-slate-600 sm:text-[12px]">
                    Gunakan WhatsApp untuk menghubungi tim
                    layanan secara langsung.
                  </p>

                </div>

              </div>

              {/* ============================================================ */}
              {/* EMAIL */}
              {/* ============================================================ */}

              <div className="flex items-start gap-3 px-4 py-5 sm:px-5">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-50">

                  <Mail className="h-4 w-4 text-[#0d5c91]" />

                </div>

                <div className="min-w-0 flex-1">

                  <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
                    Email
                  </p>

                  <h2 className="mt-1 break-all text-[13px] font-bold text-slate-900 sm:text-[14px]">
                    {CONTACT.email}
                  </h2>

                  <p className="mt-1 text-[11px] leading-[1.7] text-slate-600 sm:text-[12px]">
                    Untuk pertanyaan atau korespondensi yang
                    membutuhkan penjelasan lebih rinci.
                  </p>

                </div>

              </div>

            </section>

            {/* ============================================================== */}
            {/* DIRECT CONTACT ACTIONS */}
            {/* ============================================================== */}

            <section className="border-t border-slate-200 bg-[#102a43] px-4 py-5 text-white sm:px-5">

              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#d7b66a]">
                Layanan Langsung
              </p>

              <h2 className="mt-1 text-[16px] font-bold text-white">
                Butuh bantuan?
              </h2>

              <p className="mt-2 text-[11px] leading-[1.75] text-slate-300">
                Pilih saluran komunikasi yang paling
                nyaman. Untuk pertanyaan singkat,
                WhatsApp biasanya menjadi pilihan
                paling praktis.
              </p>

              <div className="mt-5 space-y-2">

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 bg-[#25D366] py-3 text-[10px] font-bold uppercase tracking-wider text-white transition hover:bg-[#20ba56]"
                >
                  <MessageCircle className="h-4 w-4" />

                  Chat WhatsApp

                  <ExternalLink className="h-3.5 w-3.5" />
                </a>

                <a
                  href={emailUrl}
                  className="flex w-full items-center justify-center gap-2 border border-white/15 bg-white/10 py-3 text-[10px] font-bold uppercase tracking-wider text-white transition hover:bg-white/15"
                >
                  <Mail className="h-4 w-4" />

                  Kirim Email
                </a>

              </div>

            </section>

            {/* ============================================================== */}
            {/* SERVICE INFO */}
            {/* ============================================================== */}

            <section className="border-t border-slate-200 px-4 py-5 sm:px-5">

              <div className="flex items-start gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100">

                  <Clock3 className="h-4 w-4 text-slate-500" />

                </div>

                <div className="min-w-0 flex-1">

                  <h2 className="text-[13px] font-bold text-slate-900">
                    Waktu Respons
                  </h2>

                  <p className="mt-1.5 text-[11px] leading-[1.75] text-slate-600 sm:text-[12px]">
                    Pesan akan ditanggapi sesuai
                    ketersediaan tim layanan.
                    Beberapa pertanyaan yang
                    membutuhkan pemeriksaan data
                    transaksi dapat memerlukan waktu
                    verifikasi lebih lanjut.
                  </p>

                </div>

              </div>

            </section>

            {/* ============================================================== */}
            {/* LOCATION INFO */}
            {/* ============================================================== */}

            <section className="border-t border-slate-200 bg-slate-50 px-4 py-5 sm:px-5">

              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#0d5c91]">
                Lokasi
              </p>

              <h2 className="mt-1 text-[14px] font-bold text-slate-900">
                Purwokerto, Banyumas, Indonesia
              </h2>

              <p className="mt-2 text-[11px] leading-[1.75] text-slate-600">
                Informasi lokasi pada halaman ini
                menggunakan tingkat kota/kabupaten.
                Peta spesifik tidak ditampilkan agar
                tidak menunjukkan lokasi yang keliru.
              </p>

              <a
                href="https://www.google.com/maps/search/?api=1&query=Purwokerto%2C+Banyumas%2C+Indonesia"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex w-full items-center justify-center gap-2 border border-slate-300 bg-white py-3 text-[10px] font-bold uppercase tracking-wider text-slate-700 transition hover:bg-slate-100"
              >
                <MapPin className="h-3.5 w-3.5" />

                Buka Purwokerto di Maps

                <ExternalLink className="h-3.5 w-3.5" />
              </a>

            </section>

            {/* ============================================================== */}
            {/* FOOTER NAVIGATION */}
            {/* ============================================================== */}

            <footer className="border-t border-slate-200 px-4 py-5 sm:px-5">

              <div className="grid grid-cols-1 gap-2">

                <Link
                  href="/bantuan"
                  className="flex w-full items-center justify-center gap-2 border border-slate-300 bg-white py-3 text-[10px] font-bold uppercase tracking-wider text-slate-700 transition hover:bg-slate-100"
                >
                  <CircleHelp className="h-3.5 w-3.5" />

                  Pusat Bantuan
                </Link>

                <Link
                  href="/"
                  className="flex w-full items-center justify-center gap-2 bg-[#0d5c91] py-3 text-[10px] font-bold uppercase tracking-wider text-white transition hover:bg-sky-900"
                >
                  <Home className="h-3.5 w-3.5" />

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