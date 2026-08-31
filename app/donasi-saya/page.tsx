// app/donasi-saya/page.tsx
"use client";

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  createBrowserClient,
} from "@supabase/ssr";

import Link from "next/link";

import {
  Heart,
  CheckCircle2,
  Clock,
  Search,
  Download,
  RefreshCw,
  Sparkles,
  AlertCircle,
  ArrowRight,
  ChevronDown,
  X,
  ShieldCheck,
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

interface ProfileData {
  id?: string;
  name?: string;
  email?: string;
  avatar?: string;
  created_at?: string;
}

interface DonationData {
  id?: string;

  status?: string;

  amount?: number | string;

  category?: string;

  program_name?: string;
  programTitle?: string;

  created_at?: string;

  payment_url?: string;

  payment_method?: string;

  invoice_id?: string;

  slug?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function DonasiSayaPage() {
  const [donations, setDonations] =
    useState<DonationData[]>([]);

  const [profile, setProfile] =
    useState<ProfileData | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [
    activeTab,
    setActiveTab,
  ] = useState<
    | "semua"
    | "pending"
    | "sukses"
  >("semua");

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState(
    "Semua"
  );

  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");

  const [
    sortBy,
    setSortBy,
  ] = useState<
    | "terbaru"
    | "terlama"
    | "terbesar"
    | "terkecil"
  >("terbaru");

  const [
    selectedDonation,
    setSelectedDonation,
  ] =
    useState<DonationData | null>(
      null
    );

  // ==========================================================================
  // SUPABASE
  // ==========================================================================

  const supabase =
    useMemo(
      () =>
        createBrowserClient(
          process.env
            .NEXT_PUBLIC_SUPABASE_URL!,
          process.env
            .NEXT_PUBLIC_SUPABASE_ANON_KEY!
        ),
      []
    );

  // ==========================================================================
  // LOAD DATA
  // ==========================================================================

  useEffect(() => {
    let active = true;

    const fetchDashboardData =
      async () => {
        try {
          setLoading(
            true
          );

          const {
            data: {
              user,
            },
            error:
              userError,
          } =
            await supabase.auth.getUser();

          if (
            userError ||
            !user
          ) {
            if (active) {
              setLoading(
                false
              );
            }

            return;
          }

          const {
            data:
              prof,
          } =
            await supabase
              .from(
                "profiles"
              )
              .select("*")
              .eq(
                "id",
                user.id
              )
              .maybeSingle();

          if (
            active &&
            prof
          ) {
            setProfile(
              prof
            );
          }

          const {
            data:
              donData,
            error:
              donationError,
          } =
            await supabase
              .from(
                "donations"
              )
              .select("*")
              .eq(
                "user_id",
                user.id
              )
              .order(
                "created_at",
                {
                  ascending:
                    false,
                }
              );

          if (
            donationError
          ) {
            console.error(
              "[DONASI SAYA] Donation error:",
              donationError
            );
          }

          if (
            active &&
            Array.isArray(
              donData
            )
          ) {
            setDonations(
              donData
            );
          }
        } catch (
          error
        ) {
          console.error(
            "[DONASI SAYA] Gagal mengambil data:",
            error
          );
        } finally {
          if (active) {
            setLoading(
              false
            );
          }
        }
      };

    fetchDashboardData();

    return () => {
      active = false;
    };
  }, [
    supabase,
  ]);

  // ==========================================================================
  // STATS
  // ==========================================================================

  const successfulStatuses = [
    "success",
    "paid",
    "completed",
  ];

  const successfulDonations =
    donations.filter(
      (
        donation
      ) =>
        successfulStatuses.includes(
          (
            donation.status ||
            ""
          ).toLowerCase()
        )
    );

  const totalAmount =
    successfulDonations.reduce(
      (
        total,
        donation
      ) =>
        total +
        Number(
          donation.amount ||
            0
        ),
      0
    );

  const successfulDonationsCount =
    successfulDonations.length;

  const uniqueProgramsCount =
    new Set(
      donations
        .map(
          (
            donation
          ) =>
            donation.program_name ||
            donation.programTitle
        )
        .filter(
          Boolean
        )
    ).size;

  // ==========================================================================
  // BADGE
  // ==========================================================================

  let donorBadge = {
    title:
      "Sahabat Kebaikan",

    level:
      "LEVEL 1",

    icon:
      "♡",
  };

  if (
    totalAmount >
    2_000_000
  ) {
    donorBadge = {
      title:
        "Donatur Istimewa",

      level:
        "LEVEL 3",

      icon:
        "✦",
    };
  } else if (
    totalAmount >=
    500_000
  ) {
    donorBadge = {
      title:
        "Donatur Peduli",

      level:
        "LEVEL 2",

      icon:
        "◆",
    };
  }

  // ==========================================================================
  // FILTER
  // ==========================================================================

  const filteredDonations =
    donations
      .filter(
        (
          donation
        ) => {
          const status =
            (
              donation.status ||
              "pending"
            ).toLowerCase();

          const title =
            (
              donation.program_name ||
              donation.programTitle ||
              ""
            ).toLowerCase();

          const category =
            (
              donation.category ||
              ""
            ).toLowerCase();

          if (
            activeTab ===
              "pending" &&
            ![
              "pending",
              "unpaid",
            ].includes(
              status
            )
          ) {
            return false;
          }

          if (
            activeTab ===
              "sukses" &&
            !successfulStatuses.includes(
              status
            )
          ) {
            return false;
          }

          if (
            selectedCategory !==
              "Semua" &&
            category !==
              selectedCategory.toLowerCase()
          ) {
            return false;
          }

          if (
            searchQuery &&
            !title.includes(
              searchQuery.toLowerCase()
            )
          ) {
            return false;
          }

          return true;
        }
      )
      .sort(
        (
          a,
          b
        ) => {
          if (
            sortBy ===
            "terbaru"
          ) {
            return (
              new Date(
                b.created_at ||
                  0
              ).getTime() -
              new Date(
                a.created_at ||
                  0
              ).getTime()
            );
          }

          if (
            sortBy ===
            "terlama"
          ) {
            return (
              new Date(
                a.created_at ||
                  0
              ).getTime() -
              new Date(
                b.created_at ||
                  0
              ).getTime()
            );
          }

          if (
            sortBy ===
            "terbesar"
          ) {
            return (
              Number(
                b.amount ||
                  0
              ) -
              Number(
                a.amount ||
                  0
              )
            );
          }

          if (
            sortBy ===
            "terkecil"
          ) {
            return (
              Number(
                a.amount ||
                  0
              ) -
              Number(
                b.amount ||
                  0
              )
            );
          }

          return 0;
        }
      );

  // ==========================================================================
  // LOADING
  // ==========================================================================

  if (loading) {
    return (
      <main className="min-h-screen w-full bg-[#f8f8f6]">

        <div className="mx-auto flex min-h-screen w-full max-w-md items-center justify-center px-3">

          <div className="flex flex-col items-center gap-4">

            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#102a43] shadow-lg">

              <RefreshCw className="h-4 w-4 animate-spin text-white" />

            </div>

            <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-slate-400">
              Memuat riwayat donasi
            </p>

          </div>

        </div>

      </main>
    );
  }

  // ==========================================================================
  // PROFILE
  // ==========================================================================

  const profileName =
    profile?.name ||
    "Dermawan Islami";

  const initial =
    profileName
      .charAt(0)
      .toUpperCase();

  const memberSince =
    profile?.created_at
      ? new Date(
          profile.created_at
        ).toLocaleDateString(
          "id-ID",
          {
            month:
              "long",

            year:
              "numeric",
          }
        )
      : "Juli 2026";

  // ==========================================================================
  // OUTPUT
  // ==========================================================================

  return (
    <main className="min-h-screen w-full bg-[#f8f8f6] pb-28 text-slate-900">

      {/* ==================================================================== */}
      {/* MAIN MOBILE-FIRST WRAPPER                                           */}
      {/* ==================================================================== */}

      <div className="mx-auto w-full max-w-md space-y-3 px-3 pt-3">

        {/* ================================================================== */}
        {/* HEADER DONATION CENTER */}
        {/* ================================================================== */}

        <section className="relative w-full overflow-hidden bg-[#102a43] shadow-sm">

          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full border border-white/10" />

          <div className="pointer-events-none absolute -bottom-20 right-5 h-40 w-40 rounded-full border border-[#d8b76c]/15" />

          <div className="relative z-10 p-4">

            {/* ============================================================ */}
            {/* PROFILE */}
            {/* ============================================================ */}

            <div className="flex items-start justify-between gap-3">

              <div className="flex min-w-0 items-center gap-3">

                {/* ======================================================== */}
                {/* GLOWING AVATAR */}
                {/* ======================================================== */}

                <div className="relative h-[64px] w-[64px] shrink-0 rounded-full p-[3px] shadow-[0_0_12px_rgba(215,182,106,0.9),0_0_30px_rgba(215,182,106,0.45)]">

                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#fff5c8] via-[#d7b66a] to-[#886323]" />

                  <div className="relative h-full w-full overflow-hidden rounded-full border-2 border-[#fff1bd] bg-[#173d5d]">

                    {profile?.avatar ? (
                      <img
                        src={
                          profile.avatar
                        }
                        alt={
                          profileName
                        }
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center rounded-full bg-[#173d5d] text-xl font-extrabold text-white">
                        {initial}
                      </div>
                    )}

                  </div>

                </div>

                {/* ======================================================== */}
                {/* MEMBER INFO */}
                {/* ======================================================== */}

                <div className="min-w-0">

                  <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#d7b66a]">
                    Donation Center
                  </p>

                  <h1 className="mt-1 truncate text-[16px] font-bold text-white">
                    {profileName}
                  </h1>

                  <p className="mt-1 text-[9px] text-slate-300">
                    Member sejak{" "}
                    {memberSince}
                  </p>

                </div>

              </div>

              {/* ========================================================== */}
              {/* BADGE */}
              {/* ========================================================== */}

              <div className="shrink-0 text-right">

                <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-2.5 py-1.5">

                  <span className="text-[10px] text-[#d7b66a]">
                    {
                      donorBadge.icon
                    }
                  </span>

                  <span className="text-[8px] font-bold uppercase tracking-wider text-[#e6d19d]">
                    {
                      donorBadge.level
                    }
                  </span>

                </div>

                <p className="mt-1.5 max-w-[110px] text-[8px] leading-tight text-slate-300">
                  {
                    donorBadge.title
                  }
                </p>

              </div>

            </div>

            {/* ============================================================ */}
            {/* TOTAL DONASI */}
            {/* ============================================================ */}

            <div className="mt-6">

              <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Total Donasi Berhasil
              </p>

              <div className="mt-2 flex items-end justify-between gap-3">

                <p className="min-w-0 break-words text-[25px] font-bold leading-none tracking-tight text-white">
                  Rp{" "}
                  {totalAmount.toLocaleString(
                    "id-ID"
                  )}
                </p>

                <div className="flex shrink-0 items-center gap-1.5 text-[8px] font-semibold uppercase tracking-wider text-[#d7b66a]">

                  <ShieldCheck className="h-3 w-3" />

                  Terverifikasi

                </div>

              </div>

            </div>

            {/* ============================================================ */}
            {/* STATISTICS */}
            {/* ============================================================ */}

            <div className="mt-5 grid grid-cols-3 border-t border-white/10 pt-4">

              <div>

                <p className="text-[8px] uppercase tracking-wider text-slate-400">
                  Berhasil
                </p>

                <p className="mt-1 text-[15px] font-bold text-white">
                  {
                    successfulDonationsCount
                  }
                  x
                </p>

              </div>

              <div className="border-x border-white/10 px-4">

                <p className="text-[8px] uppercase tracking-wider text-slate-400">
                  Program
                </p>

                <p className="mt-1 text-[15px] font-bold text-white">
                  {
                    uniqueProgramsCount
                  }
                </p>

              </div>

              <div className="pl-4">

                <p className="text-[8px] uppercase tracking-wider text-slate-400">
                  Transaksi
                </p>

                <p className="mt-1 text-[15px] font-bold text-white">
                  {
                    donations.length
                  }
                </p>

              </div>

            </div>

          </div>

          <div className="h-[3px] bg-gradient-to-r from-[#a37c32] via-[#e0c37e] to-[#a37c32]" />

        </section>

        {/* ================================================================== */}
        {/* IMPACT */}
        {/* ================================================================== */}

        <section className="relative w-full overflow-hidden border border-slate-200/70 bg-white p-4 shadow-sm">

          <div className="pointer-events-none absolute -right-12 -top-12 h-24 w-24 rounded-full bg-[#f7f2e7]" />

          <div className="relative">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f7f2e7]">

                <Sparkles className="h-4 w-4 text-[#a37c32]" />

              </div>

              <div>

                <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Your Impact
                </p>

                <h2 className="mt-0.5 text-[12px] font-bold text-[#102a43]">
                  Kebaikan yang Anda Titipkan
                </h2>

              </div>

            </div>

            <p className="mt-4 text-[10px] leading-relaxed text-slate-500">
              Alhamdulillah, setiap donasi Anda menjadi bagian dari ikhtiar menghadirkan manfaat bagi mereka yang membutuhkan.
            </p>

            <div className="mt-4 space-y-2.5">

              {[
                "Penyaluran logistik & pangan yatim dhuafa",
                "Pembangunan fasilitas ibadah umat",
                "Program pendidikan & beasiswa santri",
              ].map(
                (
                  item
                ) => (
                  <div
                    key={
                      item
                    }
                    className="flex items-center gap-2.5"
                  >

                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#f5f8f6]">

                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />

                    </div>

                    <span className="text-[9px] font-medium text-slate-600">
                      {
                        item
                      }
                    </span>

                  </div>
                )
              )}

            </div>

          </div>

        </section>

        {/* ================================================================== */}
        {/* SEARCH / FILTER */}
        {/* ================================================================== */}

        <section className="w-full border border-slate-200/70 bg-white shadow-sm">

          {/* ================================================================ */}
          {/* TITLE */}
          {/* ================================================================ */}

          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-4">

            <div>

              <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Activity
              </p>

              <h2 className="mt-1 text-[14px] font-bold text-[#102a43]">
                Riwayat Donasi
              </h2>

            </div>

            <span className="text-[9px] font-semibold text-slate-400">
              {
                filteredDonations.length
              }{" "}
              transaksi
            </span>

          </div>

          {/* ================================================================ */}
          {/* FILTERS */}
          {/* ================================================================ */}

          <div className="space-y-3 p-4">

            {/* SEARCH */}

            <div className="relative">

              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="search"
                placeholder="Cari program donasi..."
                value={
                  searchQuery
                }
                onChange={(
                  event
                ) =>
                  setSearchQuery(
                    event
                      .target
                      .value
                  )
                }
                className="h-12 w-full border border-slate-200/80 bg-[#f8f8f6] pl-11 pr-4 text-[10px] font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#b18a3c] focus:bg-white"
              />

            </div>

            {/* ============================================================ */}
            {/* STATUS */}
            {/* ============================================================ */}

            <div className="grid grid-cols-3 border border-slate-200 bg-slate-50">

              <button
                type="button"
                onClick={() =>
                  setActiveTab(
                    "semua"
                  )
                }
                className={`border-r border-slate-200 py-2.5 text-[9px] font-bold transition ${
                  activeTab ===
                  "semua"
                    ? "bg-white text-[#102a43]"
                    : "text-slate-400"
                }`}
              >
                Semua{" "}
                <span className="ml-1 opacity-60">
                  {
                    donations.length
                  }
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setActiveTab(
                    "pending"
                  )
                }
                className={`border-r border-slate-200 py-2.5 text-[9px] font-bold transition ${
                  activeTab ===
                  "pending"
                    ? "bg-white text-[#a37c32]"
                    : "text-slate-400"
                }`}
              >
                Pending
              </button>

              <button
                type="button"
                onClick={() =>
                  setActiveTab(
                    "sukses"
                  )
                }
                className={`py-2.5 text-[9px] font-bold transition ${
                  activeTab ===
                  "sukses"
                    ? "bg-white text-emerald-600"
                    : "text-slate-400"
                }`}
              >
                Berhasil
              </button>

            </div>

            {/* ============================================================ */}
            {/* SELECTS */}
            {/* ============================================================ */}

            <div className="grid grid-cols-2 gap-2">

              <div className="relative">

                <select
                  value={
                    selectedCategory
                  }
                  onChange={(
                    event
                  ) =>
                    setSelectedCategory(
                      event
                        .target
                        .value
                    )
                  }
                  className="h-10 w-full appearance-none border border-slate-200 bg-white px-3 pr-8 text-[9px] font-semibold text-slate-600 outline-none focus:border-[#b18a3c]"
                >
                  <option value="Semua">
                    Semua Kategori
                  </option>

                  <option value="zakat">
                    Zakat
                  </option>

                  <option value="infak">
                    Infak
                  </option>

                  <option value="wakaf">
                    Wakaf
                  </option>

                  <option value="kemanusiaan">
                    Kemanusiaan
                  </option>
                </select>

                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" />

              </div>

              <div className="relative">

                <select
                  value={
                    sortBy
                  }
                  onChange={(
                    event
                  ) =>
                    setSortBy(
                      event
                        .target
                        .value as
                        | "terbaru"
                        | "terlama"
                        | "terbesar"
                        | "terkecil"
                    )
                  }
                  className="h-10 w-full appearance-none border border-slate-200 bg-white px-3 pr-8 text-[9px] font-semibold text-slate-600 outline-none focus:border-[#b18a3c]"
                >

                  <option value="terbaru">
                    Terbaru
                  </option>

                  <option value="terlama">
                    Terlama
                  </option>

                  <option value="terbesar">
                    Nominal Terbesar
                  </option>

                  <option value="terkecil">
                    Nominal Terkecil
                  </option>

                </select>

                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" />

              </div>

            </div>

          </div>

        </section>

        {/* ================================================================== */}
        {/* EMPTY */}
        {/* ================================================================== */}

        {filteredDonations.length ===
        0 ? (

          <section className="w-full border border-slate-200/70 bg-white p-8 text-center shadow-sm">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f7f2e7]">

              <AlertCircle className="h-6 w-6 text-[#a37c32]" />

            </div>

            <h3 className="mt-5 text-[13px] font-bold text-[#102a43]">
              Belum ada riwayat ditemukan
            </h3>

            <p className="mt-2 text-[9px] leading-relaxed text-slate-400">
              Coba ubah filter pencarian atau mulailah menebar kebaikan hari ini.
            </p>

            <Link
              href="/"
              className="mt-5 inline-flex items-center gap-2 bg-[#102a43] px-5 py-3 text-[9px] font-bold uppercase tracking-wider text-white transition hover:bg-[#173d5d]"
            >
              Mulai Berdonasi

              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

          </section>

        ) : (

          // ==================================================================
          // TRANSACTIONS
          // ==================================================================

          <section
            aria-label="Daftar transaksi donasi"
            className="w-full space-y-3"
          >

            {filteredDonations.map(
              (
                donation
              ) => {
                const status =
                  (
                    donation.status ||
                    "pending"
                  ).toLowerCase();

                const isPending =
                  status ===
                    "pending" ||
                  status ===
                    "unpaid";

                const isSuccessful =
                  successfulStatuses.includes(
                    status
                  );

                return (
                  <article
                    key={
                      donation.id
                    }
                    className="group w-full border border-slate-200/70 bg-white p-4 shadow-sm transition-all hover:border-[#d7b66a]/60 hover:shadow-md"
                  >

                    {/* ====================================================== */}
                    {/* TOP */}
                    {/* ====================================================== */}

                    <div className="flex items-start justify-between gap-3">

                      <div className="min-w-0">

                        <span className="inline-flex items-center rounded-full border border-[#eadfca] bg-[#f7f2e7] px-2.5 py-1 text-[7px] font-bold uppercase tracking-wider text-[#98752d]">
                          {
                            donation.category ||
                            "Kemanusiaan"
                          }
                        </span>

                        <h3 className="mt-2 text-[12px] font-bold leading-snug text-[#102a43] sm:text-[13px]">
                          {
                            donation.program_name ||
                            donation.programTitle ||
                            "Sedekah Umum"
                          }
                        </h3>

                      </div>

                      {isPending ? (

                        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#f0dfb7] bg-[#fff8e9] px-2.5 py-1.5 text-[7px] font-bold uppercase tracking-wider text-[#a37c32]">

                          <Clock className="h-3 w-3" />

                          Pending

                        </span>

                      ) : isSuccessful ? (

                        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#d6ebe0] bg-[#f0f8f4] px-2.5 py-1.5 text-[7px] font-bold uppercase tracking-wider text-emerald-600">

                          <CheckCircle2 className="h-3 w-3" />

                          Berhasil

                        </span>

                      ) : (

                        <span className="inline-flex shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[7px] font-bold uppercase tracking-wider text-slate-500">
                          {
                            donation.status ||
                            "Diproses"
                          }
                        </span>

                      )}

                    </div>

                    {/* ====================================================== */}
                    {/* AMOUNT */}
                    {/* ====================================================== */}

                    <div className="mt-4 flex items-end justify-between gap-3 border-t border-slate-100 pt-3">

                      <div>

                        <p className="text-[7px] font-bold uppercase tracking-[0.18em] text-slate-400">
                          Nominal Donasi
                        </p>

                        <p className="mt-1 text-[16px] font-bold tracking-tight text-[#102a43]">
                          Rp{" "}
                          {Number(
                            donation.amount ||
                              0
                          ).toLocaleString(
                            "id-ID"
                          )}
                        </p>

                      </div>

                      <div className="text-right">

                        <p className="text-[7px] font-bold uppercase tracking-wider text-slate-400">
                          Tanggal
                        </p>

                        <p className="mt-1 text-[9px] font-semibold text-slate-500">
                          {donation.created_at
                            ? new Date(
                                donation.created_at
                              ).toLocaleDateString(
                                "id-ID",
                                {
                                  day:
                                    "numeric",
                                  month:
                                    "short",
                                  year:
                                    "numeric",
                                }
                              )
                            : "-"}
                        </p>

                      </div>

                    </div>

                    {/* ====================================================== */}
                    {/* ACTIONS */}
                    {/* ====================================================== */}

                    <div className="mt-3 flex items-center justify-between gap-2">

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedDonation(
                            donation
                          )
                        }
                        className="text-[8px] font-bold uppercase tracking-wider text-slate-400 transition hover:text-[#a37c32]"
                      >
                        Lihat Detail
                      </button>

                      <div className="flex items-center gap-2">

                        {isPending &&
                          donation.payment_url && (

                            <a
                              href={
                                donation.payment_url
                              }
                              className="inline-flex items-center gap-1.5 bg-[#102a43] px-3 py-2 text-[8px] font-bold uppercase tracking-wider text-white transition hover:bg-[#173d5d]"
                            >
                              Bayar

                              <ArrowRight className="h-3 w-3" />
                            </a>

                          )}

                        {!isPending && (

                          <Link
                            href={`/campaign/${donation.slug || ""}`}
                            className="inline-flex items-center gap-1.5 bg-slate-100 px-3 py-2 text-[8px] font-bold uppercase tracking-wider text-slate-600 transition hover:bg-[#f7f2e7] hover:text-[#98752d]"
                          >
                            Donasi Lagi
                          </Link>

                        )}

                      </div>

                    </div>

                  </article>
                );
              }
            )}

          </section>
        )}

      </div>

      {/* ==================================================================== */}
      {/* DETAIL MODAL */}
      {/* ==================================================================== */}

      {selectedDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071521]/70 p-4 backdrop-blur-sm">

          <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto bg-white shadow-[0_30px_80px_rgba(0,0,0,0.25)]">

            <div className="h-[3px] bg-gradient-to-r from-[#a37c32] via-[#dfc27e] to-[#a37c32]" />

            <div className="p-5">

              {/* ========================================================== */}
              {/* MODAL HEADER */}
              {/* ========================================================== */}

              <div className="flex items-start justify-between gap-3">

                <div>

                  <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    Transaction Details
                  </p>

                  <h2 className="mt-1 text-[15px] font-bold text-[#102a43]">
                    Rincian Transaksi
                  </h2>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedDonation(
                      null
                    )
                  }
                  aria-label="Tutup"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >

                  <X className="h-4 w-4" />

                </button>

              </div>

              {/* ========================================================== */}
              {/* PROGRAM */}
              {/* ========================================================== */}

              <div className="mt-5 bg-[#102a43] p-4">

                <p className="text-[7px] font-bold uppercase tracking-[0.18em] text-[#d7b66a]">
                  Program Donasi
                </p>

                <p className="mt-1.5 text-[12px] font-bold leading-relaxed text-white">
                  {
                    selectedDonation.program_name ||
                    selectedDonation.programTitle ||
                    "Sedekah Umum"
                  }
                </p>

                <div className="mt-4">

                  <p className="text-[7px] uppercase tracking-wider text-slate-400">
                    Nominal
                  </p>

                  <p className="mt-1 text-[20px] font-bold text-white">
                    Rp{" "}
                    {Number(
                      selectedDonation.amount ||
                        0
                    ).toLocaleString(
                      "id-ID"
                    )}
                  </p>

                </div>

              </div>

              {/* ========================================================== */}
              {/* DETAILS */}
              {/* ========================================================== */}

              <div className="mt-4 overflow-hidden border border-slate-100">

                <div className="divide-y divide-slate-100">

                  <div className="flex justify-between gap-4 px-4 py-3">

                    <span className="text-[9px] text-slate-400">
                      Status
                    </span>

                    <span className="inline-flex items-center gap-1.5 text-[9px] font-bold text-emerald-600">

                      <CheckCircle2 className="h-3 w-3" />

                      {
                        selectedDonation.status ||
                        "Berhasil"
                      }

                    </span>

                  </div>

                  <div className="flex justify-between gap-4 px-4 py-3">

                    <span className="text-[9px] text-slate-400">
                      Metode Pembayaran
                    </span>

                    <span className="text-right text-[9px] font-bold uppercase text-slate-700">
                      {
                        selectedDonation.payment_method ||
                        "QRIS / VA"
                      }
                    </span>

                  </div>

                  <div className="flex justify-between gap-4 px-4 py-3">

                    <span className="text-[9px] text-slate-400">
                      Waktu Transaksi
                    </span>

                    <span className="text-right text-[9px] font-semibold text-slate-700">
                      {selectedDonation.created_at
                        ? new Date(
                            selectedDonation.created_at
                          ).toLocaleString(
                            "id-ID"
                          )
                        : "-"}
                    </span>

                  </div>

                  <div className="flex justify-between gap-4 px-4 py-3">

                    <span className="text-[9px] text-slate-400">
                      Invoice ID
                    </span>

                    <span className="break-all text-right font-mono text-[8px] text-slate-600">
                      {
                        selectedDonation.invoice_id ||
                        selectedDonation.id ||
                        "-"
                      }
                    </span>

                  </div>

                </div>

              </div>

              {/* ========================================================== */}
              {/* ACTIONS */}
              {/* ========================================================== */}

              <div className="mt-4 grid grid-cols-2 gap-2">

                <button
                  type="button"
                  onClick={() =>
                    alert(
                      "Fitur unduh kuitansi PDF segera hadir."
                    )
                  }
                  className="flex items-center justify-center gap-1.5 bg-slate-100 py-3 text-[8px] font-bold uppercase tracking-wider text-slate-700 transition hover:bg-slate-200"
                >

                  <Download className="h-3.5 w-3.5" />

                  Kuitansi

                </button>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      window.location.origin
                    );

                    alert(
                      "Tautan platform berhasil disalin untuk dibagikan!"
                    );
                  }}
                  className="flex items-center justify-center gap-1.5 bg-[#102a43] py-3 text-[8px] font-bold uppercase tracking-wider text-white transition hover:bg-[#173d5d]"
                >

                  <Heart className="h-3.5 w-3.5" />

                  Bagikan

                </button>

              </div>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}