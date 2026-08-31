// app/referral/page.tsx
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
  ArrowLeft,
  Sparkles,
  Copy,
  Check,
  TrendingUp,
  Loader2,
  Search,
  Lock,
  Wallet,
  Users,
  ExternalLink,
  ChevronDown,
} from "lucide-react";

export default function ReferralPage() {
  const [profile, setProfile] =
    useState<any>(null);

  const [stats, setStats] =
    useState<any>(null);

  const [allPrograms, setAllPrograms] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [
    statsLoading,
    setStatsLoading,
  ] = useState(false);

  const [
    selectedSlug,
    setSelectedSlug,
  ] = useState("");

  const [
    searchProgram,
    setSearchProgram,
  ] = useState("");

  const [copied, setCopied] =
    useState(false);

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

    const fetchProfileStatsAndPrograms =
      async () => {
        try {
          setLoading(true);

          const {
            data: {
              user,
            },
            error:
              userError,
          } =
            await supabase.auth.getUser();

          if (
            userError
          ) {
            console.error(
              "[REFERRAL] Auth error:",
              userError
            );
          }

          if (user) {
            const {
              data:
                prof,
              error:
                profileError,
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
              profileError
            ) {
              console.error(
                "[REFERRAL] Profile error:",
                profileError
              );
            }

            if (
              active &&
              prof
            ) {
              setProfile(
                prof
              );
            }

            if (
              prof?.phone
            ) {
              setStatsLoading(
                true
              );

              try {
                const resStats =
                  await fetch(
                    `/api/fundraiser/stats?phone=${encodeURIComponent(
                      prof.phone
                    )}`
                  );

                const jsonStats =
                  await resStats.json();

                if (
                  active &&
                  jsonStats.success
                ) {
                  setStats(
                    jsonStats
                  );
                } else if (
                  active
                ) {
                  setStats({
                    totalEarnings:
                      0,

                    donationCount:
                      0,

                    history:
                      [],
                  });
                }
              } catch (
                error
              ) {
                console.error(
                  "Gagal memuat statistik afiliasi:",
                  error
                );

                if (
                  active
                ) {
                  setStats({
                    totalEarnings:
                      0,

                    donationCount:
                      0,

                    history:
                      [],
                  });
                }
              } finally {
                if (
                  active
                ) {
                  setStatsLoading(
                    false
                  );
                }
              }
            } else if (
              active
            ) {
              setStats({
                totalEarnings:
                  0,

                donationCount:
                  0,

                history:
                  [],
              });
            }
          }

          const resProg =
            await fetch(
              "/api/programs"
            );

          const jsonProg =
            await resProg.json();

          if (
            active &&
            jsonProg.success &&
            Array.isArray(
              jsonProg.data
            )
          ) {
            setAllPrograms(
              jsonProg.data
            );
          }
        } catch (
          error
        ) {
          console.error(
            "Error loading referral data:",
            error
          );
        } finally {
          if (
            active
          ) {
            setLoading(
              false
            );
          }
        }
      };

    fetchProfileStatsAndPrograms();

    return () => {
      active = false;
    };
  }, [
    supabase,
  ]);

  // ==========================================================================
  // COPY
  // ==========================================================================

  const handleCopy =
    async (
      text:
        string
    ) => {
      if (
        !text
      ) {
        return;
      }

      try {
        await navigator.clipboard.writeText(
          text
        );

        setCopied(
          true
        );

        setTimeout(
          () => {
            setCopied(
              false
            );
          },
          2000
        );
      } catch (
        error
      ) {
        console.error(
          "Gagal menyalin link:",
          error
        );
      }
    };

  // ==========================================================================
  // LOADING
  // ==========================================================================

  if (
    loading
  ) {
    return (
      <main className="min-h-screen w-full bg-[#f7f8fa]">

        <div className="mx-auto flex min-h-screen w-full max-w-md items-center justify-center px-3">

          <div className="flex flex-col items-center gap-4">

            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0b2742] shadow-lg">

              <Loader2 className="h-5 w-5 animate-spin text-white" />

            </div>

            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Memuat pusat afiliasi
            </span>

          </div>

        </div>

      </main>
    );
  }

  // ==========================================================================
  // VALUES
  // ==========================================================================

  const hasPhone =
    Boolean(
      profile?.phone &&
      profile.phone.trim().length >=
        9
    );

  const cleanPhone =
    hasPhone
      ? profile.phone.replace(
          /[^0-9]/g,
          ""
        )
      : "";

  const baseUrl =
    typeof window !==
    "undefined"
      ? window.location.origin
      : "";

  const defaultReferralLink =
    hasPhone
      ? `${baseUrl}/?ref=${cleanPhone}`
      : "";

  const filteredPrograms =
    allPrograms.filter(
      (
        program
      ) =>
        (
          program.title ||
          ""
        )
          .toLowerCase()
          .includes(
            searchProgram.toLowerCase()
          )
    );

  const totalEarnings =
    Number(
      stats?.totalEarnings ||
        0
    );

  const donationCount =
    Number(
      stats?.donationCount ||
        0
    );

  const totalUjrah =
    Math.round(
      totalEarnings *
        0.1
    );

  const feePaid =
    Number(
      stats?.profile
        ?.feePaid ||
        0
    );

  const availableFee =
    Math.max(
      0,
      totalUjrah -
        feePaid
    );

  // ==========================================================================
  // OUTPUT
  // ==========================================================================

  return (
    <main className="min-h-screen w-full bg-[#f7f8fa] pb-28 text-slate-900">

      {/* ==================================================================== */}
      {/* MOBILE-FIRST WRAPPER */}
      {/* ==================================================================== */}

      <div className="mx-auto w-full max-w-md space-y-3 px-3 pt-3">

        {/* ================================================================== */}
        {/* HEADER */}
        {/* ================================================================== */}

        <header className="flex w-full items-center justify-between gap-3 bg-white px-3 py-3 shadow-sm">

          <Link
            href="/akun"
            aria-label="Kembali ke akun"
            className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200/70 bg-white transition hover:border-slate-300"
          >
            <ArrowLeft className="h-[17px] w-[17px] text-slate-600 transition group-hover:-translate-x-0.5" />
          </Link>

          <div className="min-w-0 flex-1 text-center">

            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Fundraiser Center
            </p>

            <h1 className="truncate text-[15px] font-bold tracking-tight text-[#102a43]">
              Afiliasi & Performa
            </h1>

          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#102a43] shadow-sm">

            <Sparkles className="h-[16px] w-[16px] text-[#d8b76a]" />

          </div>

        </header>

        {/* ================================================================== */}
        {/* HERO */}
        {/* ================================================================== */}

        <section className="relative w-full overflow-hidden bg-[#102a43] p-5 shadow-sm">

          <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full border border-white/10" />

          <div className="pointer-events-none absolute -right-8 -top-12 h-32 w-32 rounded-full border border-[#d8b76a]/20" />

          <div className="pointer-events-none absolute bottom-5 right-5 h-20 w-20 rounded-full bg-[#d8b76a]/5 blur-2xl" />

          <div className="relative z-10">

            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5">

              <span className="h-1.5 w-1.5 rounded-full bg-[#d8b76a]" />

              <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#e8d7aa]">
                Program Kebaikan Berkelanjutan
              </span>

            </div>

            <h2 className="mt-5 text-[22px] font-bold leading-[1.2] tracking-tight text-white">
              Sebarkan Kebaikan.
              <br />
              Tumbuhkan Kebermanfaatan.
            </h2>

            <p className="mt-3 max-w-[290px] text-[11px] leading-[1.8] text-slate-300">
              Bagikan campaign melalui tautan afiliasi Anda dan pantau setiap dukungan yang berhasil dihimpun secara transparan.
            </p>

            <div className="mt-5 flex items-center gap-2 text-[#d8b76a]">

              <span className="h-px w-8 bg-[#d8b76a]/50" />

              <span className="text-[9px] font-semibold uppercase tracking-[0.15em]">
                Berbagi • Menghimpun • Memberi Manfaat
              </span>

            </div>

          </div>

        </section>

        {/* ================================================================== */}
        {/* LOCKED */}
        {/* ================================================================== */}

        {!hasPhone ? (

          <section className="w-full border border-slate-200/70 bg-white p-6 text-center shadow-sm">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#f0dfb5] bg-[#fff8e8]">

              <Lock className="h-6 w-6 text-[#b4862c]" />

            </div>

            <h2 className="mt-4 text-[14px] font-bold text-[#102a43]">
              Aktivasi Afiliasi Diperlukan
            </h2>

            <p className="mx-auto mt-2 max-w-[280px] text-[11px] leading-[1.7] text-slate-500">
              Lengkapi nomor WhatsApp Anda untuk mengaktifkan kode referral dan mendapatkan tautan promosi pribadi.
            </p>

            <Link
              href="/pengaturan"
              className="mt-5 inline-flex items-center justify-center bg-[#102a43] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-white transition hover:bg-[#173d5d]"
            >
              Lengkapi Sekarang
            </Link>

          </section>

        ) : (
          <>

            {/* ============================================================ */}
            {/* PERFORMANCE */}
            {/* ============================================================ */}

            {statsLoading ? (

              <section className="w-full border border-slate-200/70 bg-white p-6 text-center shadow-sm">

                <Loader2 className="mx-auto h-5 w-5 animate-spin text-[#102a43]" />

                <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                  Mengambil performa
                </p>

              </section>

            ) : (

              <section className="w-full overflow-hidden border border-slate-200/70 bg-white shadow-sm">

                {/* ======================================================== */}
                {/* HEADING */}
                {/* ======================================================== */}

                <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-4">

                  <div>

                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">
                      Performance Overview
                    </p>

                    <h2 className="mt-1 text-[14px] font-bold text-[#102a43]">
                      Statistik Penghimpunan
                    </h2>

                  </div>

                  <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1">

                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                    <span className="text-[8px] font-bold uppercase tracking-wider text-emerald-700">
                      Aktif
                    </span>

                  </div>

                </div>

                {/* ======================================================== */}
                {/* STATS */}
                {/* ======================================================== */}

                <div className="grid grid-cols-2 border-b border-slate-100">

                  <div className="border-r border-slate-100 p-4">

                    <div className="flex items-center gap-2 text-slate-400">

                      <Wallet className="h-3.5 w-3.5" />

                      <span className="text-[9px] font-bold uppercase tracking-wider">
                        Dana Dihimpun
                      </span>

                    </div>

                    <p className="mt-3 break-words text-[19px] font-bold tracking-tight text-[#102a43]">
                      Rp{" "}
                      {totalEarnings.toLocaleString(
                        "id-ID"
                      )}
                    </p>

                  </div>

                  <div className="p-4">

                    <div className="flex items-center gap-2 text-slate-400">

                      <Users className="h-3.5 w-3.5" />

                      <span className="text-[9px] font-bold uppercase tracking-wider">
                        Transaksi
                      </span>

                    </div>

                    <p className="mt-3 text-[19px] font-bold tracking-tight text-[#102a43]">
                      {donationCount}
                    </p>

                    <p className="mt-0.5 text-[9px] text-slate-400">
                      transaksi berhasil
                    </p>

                  </div>

                </div>

                {/* ======================================================== */}
                {/* UJRAH */}
                {/* ======================================================== */}

                <div className="bg-[#f8f7f3] p-4">

                  <div className="flex items-center justify-between">

                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                      Ringkasan Ujrah
                    </span>

                    <span className="rounded-full border border-[#e7ddc4] bg-white px-2 py-1 text-[9px] font-semibold text-[#9b7528]">
                      10%
                    </span>

                  </div>

                  <div className="mt-4 space-y-3">

                    <div className="flex items-center justify-between gap-3">

                      <span className="text-[10px] text-slate-500">
                        Total hak Anda
                      </span>

                      <span className="text-right text-[11px] font-bold text-slate-700">
                        Rp{" "}
                        {totalUjrah.toLocaleString(
                          "id-ID"
                        )}
                      </span>

                    </div>

                    <div className="flex items-center justify-between gap-3">

                      <span className="text-[10px] text-slate-500">
                        Telah dibayarkan
                      </span>

                      <span className="text-right text-[11px] font-semibold text-slate-600">
                        Rp{" "}
                        {feePaid.toLocaleString(
                          "id-ID"
                        )}
                      </span>

                    </div>

                    <div className="flex items-center justify-between gap-3 border-t border-[#e9e3d4] pt-3">

                      <span className="text-[10px] font-bold text-[#102a43]">
                        Saldo tersedia
                      </span>

                      <span className="text-right text-[14px] font-bold text-[#9b7528]">
                        Rp{" "}
                        {availableFee.toLocaleString(
                          "id-ID"
                        )}
                      </span>

                    </div>

                  </div>

                </div>

              </section>

            )}

            {/* ============================================================ */}
            {/* LINK GENERATOR */}
            {/* ============================================================ */}

            <section className="w-full border border-slate-200/70 bg-white shadow-sm">

              <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-4">

                <div>

                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Referral Tools
                  </p>

                  <h2 className="mt-1 text-[14px] font-bold text-[#102a43]">
                    Tautan Afiliasi
                  </h2>

                </div>

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f3f6f8]">

                  <ExternalLink className="h-4 w-4 text-[#102a43]" />

                </div>

              </div>

              <div className="p-4">

                {/* ======================================================== */}
                {/* GENERAL LINK */}
                {/* ======================================================== */}

                <div>

                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    Tautan Umum Platform
                  </label>

                  <div className="mt-2 flex items-center border border-slate-200 bg-[#f7f8fa]">

                    <input
                      type="text"
                      readOnly
                      value={
                        defaultReferralLink
                      }
                      className="min-w-0 flex-1 bg-transparent px-3 py-3 text-[10px] font-mono text-slate-600 outline-none"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(
                          defaultReferralLink
                        )
                      }
                      className={`flex h-full shrink-0 items-center gap-1.5 px-3.5 py-3 text-[9px] font-bold text-white transition ${
                        copied
                          ? "bg-emerald-600"
                          : "bg-[#102a43] hover:bg-[#173d5d]"
                      }`}
                    >
                      {copied ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}

                      {copied
                        ? "Tersalin"
                        : "Salin"}
                    </button>

                  </div>

                </div>

                {/* ======================================================== */}
                {/* CAMPAIGN */}
                {/* ======================================================== */}

                <div className="mt-5 border-t border-slate-100 pt-5">

                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    Campaign Spesifik
                  </label>

                  <div className="relative mt-2">

                    <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />

                    <input
                      type="search"
                      placeholder="Cari campaign..."
                      value={
                        searchProgram
                      }
                      onChange={(
                        event
                      ) =>
                        setSearchProgram(
                          event
                            .target
                            .value
                        )
                      }
                      className="w-full border border-slate-200 bg-[#f7f8fa] py-3 pl-10 pr-3 text-[10px] font-medium text-slate-700 outline-none transition focus:border-[#9b7528]"
                    />

                  </div>

                  <div className="relative mt-2">

                    <select
                      value={
                        selectedSlug
                      }
                      onChange={(
                        event
                      ) => {
                        setSelectedSlug(
                          event
                            .target
                            .value
                        );

                        setCopied(
                          false
                        );
                      }}
                      className="w-full appearance-none border border-slate-200 bg-[#f7f8fa] px-3.5 py-3 pr-10 text-[10px] font-semibold text-slate-700 outline-none focus:border-[#9b7528]"
                    >
                      <option value="">
                        Pilih dari{" "}
                        {
                          filteredPrograms.length
                        }{" "}
                        campaign
                      </option>

                      {filteredPrograms.map(
                        (
                          program:
                            any,
                          index:
                            number
                        ) => (
                          <option
                            key={
                              program._id ||
                              index
                            }
                            value={
                              program.slug
                            }
                          >
                            {
                              program.title
                            }
                          </option>
                        )
                      )}

                    </select>

                    <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />

                  </div>

                  {/* ====================================================== */}
                  {/* GENERATED LINK */}
                  {/* ====================================================== */}

                  {selectedSlug &&
                    (() => {
                      const affiliateUrl =
                        `${baseUrl}/campaign/${selectedSlug}?ref=${cleanPhone}`;

                      return (
                        <div className="mt-3 border border-[#eee9dc] bg-[#f8f7f3]">

                          <div className="flex items-center justify-between gap-3 p-3.5">

                            <div>

                              <p className="text-[8px] font-bold uppercase tracking-wider text-[#9b7528]">
                                Link Campaign
                              </p>

                              <p className="mt-1 text-[9px] text-slate-500">
                                Siap dibagikan
                              </p>

                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                handleCopy(
                                  affiliateUrl
                                )
                              }
                              className={`flex items-center gap-1.5 px-3 py-2 text-[9px] font-bold text-white ${
                                copied
                                  ? "bg-emerald-600"
                                  : "bg-[#102a43]"
                              }`}
                            >
                              {copied ? (
                                <>
                                  <Check className="h-3 w-3" />
                                  Tersalin
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3 w-3" />
                                  Salin
                                </>
                              )}
                            </button>

                          </div>

                          <div className="border-t border-[#eee9dc] bg-white px-3 py-2.5">

                            <p className="truncate font-mono text-[9px] text-slate-500">
                              {
                                affiliateUrl
                              }
                            </p>

                          </div>

                        </div>
                      );
                    })()}

                </div>

              </div>

            </section>

            {/* ============================================================ */}
            {/* HISTORY */}
            {/* ============================================================ */}

            <section className="w-full overflow-hidden border border-slate-200/70 bg-white shadow-sm">

              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">

                <div>

                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Activity
                  </p>

                  <h2 className="mt-1 text-[14px] font-bold text-[#102a43]">
                    Riwayat Dukungan
                  </h2>

                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f7f2e7]">

                  <TrendingUp className="h-4 w-4 text-[#9b7528]" />

                </div>

              </div>

              {stats?.history &&
              stats.history.length >
                0 ? (

                <div className="max-h-72 divide-y divide-slate-100 overflow-y-auto">

                  {stats.history.map(
                    (
                      item:
                        any,
                      idx:
                        number
                    ) => (

                      <div
                        key={
                          idx
                        }
                        className="flex items-center gap-3 px-4 py-4"
                      >

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50">

                          <Check className="h-4 w-4 text-emerald-600" />

                        </div>

                        <div className="min-w-0 flex-1">

                          <p className="truncate text-[11px] font-bold text-slate-800">
                            {
                              item.donorName ||
                              "Hamba Allah"
                            }
                          </p>

                          <p className="mt-1 truncate text-[9px] text-slate-400">
                            {
                              item.programTitle ||
                              "Sedekah Umum"
                            }
                          </p>

                        </div>

                        <div className="shrink-0 text-right">

                          <p className="text-[11px] font-bold text-emerald-600">
                            +Rp{" "}
                            {Number(
                              item.amount ||
                                0
                            ).toLocaleString(
                              "id-ID"
                            )}
                          </p>

                          <p className="mt-1 text-[8px] text-slate-400">
                            Berhasil
                          </p>

                        </div>

                      </div>

                    )
                  )}

                </div>

              ) : (

                <div className="px-5 py-10 text-center">

                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-slate-50">

                    <Wallet className="h-5 w-5 text-slate-300" />

                  </div>

                  <p className="mt-3 text-[11px] font-semibold text-slate-500">
                    Belum ada transaksi
                  </p>

                  <p className="mt-1 text-[9px] leading-relaxed text-slate-400">
                    Transaksi melalui tautan afiliasi Anda akan muncul di sini.
                  </p>

                </div>

              )}

            </section>

            {/* ============================================================ */}
            {/* FOOTNOTE */}
            {/* ============================================================ */}

            <div className="px-4 pb-2 pt-1 text-center">

              <p className="text-[8px] leading-relaxed text-slate-400">
                Terima kasih telah menjadi bagian dari gerakan kebaikan dan membantu memperluas manfaat.
              </p>

            </div>

          </>
        )}

      </div>

    </main>
  );
}