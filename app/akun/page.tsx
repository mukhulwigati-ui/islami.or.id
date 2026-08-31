// app/akun/page.tsx

"use client";

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  createBrowserClient,
} from "@supabase/ssr";

import {
  useRouter,
} from "next/navigation";

import Link from "next/link";

import {
  History,
  FileText,
  Bookmark,
  Phone,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  Target,
  Sparkles,
  X,
  Loader2,
  Eye,
  ShieldCheck,
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

interface ProfileData {
  id?: string;
  email?: string;
  name?: string;
  avatar?: string;
  phone?: string;
}

interface DonationData {
  id?: string;
  status?: string;
  amount?: number | string;
  program_name?: string;
  programTitle?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function AkunPage() {
  // ==========================================================================
  // STATE
  // ==========================================================================

  const [user, setUser] =
    useState<any>(null);

  const [profile, setProfile] =
    useState<ProfileData | null>(
      null
    );

  const [donations, setDonations] =
    useState<DonationData[]>([]);

  const [
    referralClicks,
    setReferralClicks,
  ] = useState<number>(0);

  const [loading, setLoading] =
    useState(true);

  const [
    isModalOpen,
    setIsModalOpen,
  ] = useState(false);

  const [newPhone, setNewPhone] =
    useState("");

  const [
    savingPhone,
    setSavingPhone,
  ] = useState(false);

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

  const router = useRouter();

  // ==========================================================================
  // LOAD ACCOUNT
  // ==========================================================================

  useEffect(() => {
    let active = true;

    const fetchAkunData =
      async () => {
        try {
          setLoading(true);

          const {
            data: {
              user: authUser,
            },
            error:
              userError,
          } =
            await supabase.auth.getUser();

          if (
            userError ||
            !authUser
          ) {
            router.replace(
              "/login"
            );

            return;
          }

          if (!active) {
            return;
          }

          setUser(
            authUser
          );

          // ================================================================
          // PROFILE
          // ================================================================

          const {
            data:
              existingProfile,
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
                authUser.id
              )
              .maybeSingle();

          if (
            profileError
          ) {
            console.error(
              "[AKUN] Profile error:",
              profileError
            );
          }

          let prof:
            | ProfileData
            | null =
            existingProfile;

          if (!prof) {
            const meta =
              authUser.user_metadata ||
              {};

            prof = {
              id:
                authUser.id,

              email:
                authUser.email,

              name:
                meta.full_name ||
                meta.name ||
                authUser.email?.split(
                  "@"
                )[0] ||
                "Dermawan",

              avatar:
                meta.avatar_url ||
                meta.picture ||
                "",

              phone:
                "",
            };

            const {
              error:
                upsertError,
            } =
              await supabase
                .from(
                  "profiles"
                )
                .upsert(
                  prof
                );

            if (
              upsertError
            ) {
              console.error(
                "[AKUN] Gagal membuat profile:",
                upsertError
              );
            }
          }

          if (!active) {
            return;
          }

          setProfile(
            prof
          );

          setNewPhone(
            prof?.phone ||
              ""
          );

          // ================================================================
          // DONATIONS
          // ================================================================

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
                authUser.id
              );

          if (
            donationError
          ) {
            console.error(
              "[AKUN] Donation error:",
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

          // ================================================================
          // REFERRAL
          // ================================================================

          try {
            const phoneKey =
              prof?.phone ||
              authUser.id;

            const {
              count,
              error:
                countErr,
            } =
              await supabase
                .from(
                  "referral_visits"
                )
                .select(
                  "*",
                  {
                    count:
                      "exact",
                    head:
                      true,
                  }
                )
                .eq(
                  "ref_code",
                  phoneKey
                );

            if (
              !countErr &&
              count !==
                null &&
              active
            ) {
              setReferralClicks(
                count
              );
            }
          } catch {
            console.log(
              "Belum ada tabel pelacakan referral."
            );
          }
        } catch (
          error
        ) {
          console.error(
            "[AKUN] Gagal memuat akun:",
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

    fetchAkunData();

    return () => {
      active = false;
    };
  }, [
    supabase,
    router,
  ]);

  // ==========================================================================
  // DONATION STATS
  // ==========================================================================

  const successfulDonations =
    donations.filter(
      (donation) =>
        [
          "success",
          "paid",
          "completed",
        ].includes(
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
  // LEVEL
  // ==========================================================================

  let levelInfo = {
    name: "Dermawan",
    level: "LEVEL 1",
  };

  if (
    totalAmount >=
    5_000_000
  ) {
    levelInfo = {
      name: "Wakif",
      level: "LEVEL 5",
    };
  } else if (
    totalAmount >=
    2_000_000
  ) {
    levelInfo = {
      name: "Muhsin",
      level: "LEVEL 4",
    };
  } else if (
    totalAmount >=
    1_000_000
  ) {
    levelInfo = {
      name: "Pejuang",
      level: "LEVEL 3",
    };
  } else if (
    totalAmount >=
    500_000
  ) {
    levelInfo = {
      name: "Sahabat",
      level: "LEVEL 2",
    };
  }

  // ==========================================================================
  // TARGET
  // ==========================================================================

  const targetBulanan =
    500_000;

  const progressPercent =
    Math.min(
      Math.round(
        (
          totalAmount /
          targetBulanan
        ) * 100
      ),
      100
    );

  // ==========================================================================
  // UPDATE WHATSAPP
  // ==========================================================================

  const handleUpdatePhone =
    async (
      event:
        React.FormEvent
    ) => {
      event.preventDefault();

      if (!user?.id) {
        return;
      }

      const clean =
        newPhone.replace(
          /[^0-9]/g,
          ""
        );

      if (
        clean.length <
        9
      ) {
        alert(
          "Masukkan nomor WhatsApp yang valid!"
        );

        return;
      }

      setSavingPhone(
        true
      );

      try {
        const {
          error,
        } =
          await supabase
            .from(
              "profiles"
            )
            .update({
              phone:
                clean,

              updated_at:
                new Date().toISOString(),
            })
            .eq(
              "id",
              user.id
            );

        if (error) {
          throw error;
        }

        setProfile(
          (
            previous
          ) => ({
            ...(previous ||
              {}),
            phone:
              clean,
          })
        );

        setIsModalOpen(
          false
        );

        alert(
          "Nomor WhatsApp berhasil diperbarui!"
        );
      } catch (
        error:
          any
      ) {
        alert(
          "Gagal memperbarui: " +
            (
              error?.message ||
              "Terjadi kesalahan"
            )
        );
      } finally {
        setSavingPhone(
          false
        );
      }
    };

  // ==========================================================================
  // LOGOUT
  // ==========================================================================

  const handleLogout =
    async () => {
      await supabase.auth.signOut();

      router.replace(
        "/login"
      );

      router.refresh();
    };

  // ==========================================================================
  // LOADING
  // ==========================================================================

  if (loading) {
    return (
      <main className="min-h-screen w-full bg-[#f8f8f6]">
        <div className="mx-auto flex min-h-screen w-full max-w-md items-center justify-center px-3">

          <div className="flex flex-col items-center gap-4">

            {/* Icon tetap rounded */}
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#102a43] shadow-lg">
              <Loader2 className="h-5 w-5 animate-spin text-white" />
            </div>

            <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-slate-400">
              Memuat akun
            </span>

          </div>

        </div>
      </main>
    );
  }

  // ==========================================================================
  // VALUES
  // ==========================================================================

  const profileName =
    profile?.name ||
    "Dermawan Islami";

  const profileEmail =
    profile?.email ||
    user?.email ||
    "";

  const initial =
    profileName
      .charAt(0)
      .toUpperCase();

  // ==========================================================================
  // OUTPUT
  // ==========================================================================

  return (
    <main className="min-h-screen w-full bg-[#f8f8f6] pb-28 text-slate-900">

      {/* ==================================================================== */}
      {/* MOBILE-FIRST CONTAINER                                               */}
      {/* ==================================================================== */}
      {/*
        Konsisten dengan halaman lain:

        max-w-md = lebar aplikasi
        px-3     = inset kiri kanan agar sejajar dengan header/bottomnav
      */}

      <div className="mx-auto w-full max-w-md space-y-3 px-3 pt-3">

        {/* ================================================================== */}
        {/* PROFILE HEADER */}
        {/* ================================================================== */}

        <section className="relative w-full overflow-hidden bg-[#102a43] px-4 py-5 shadow-sm">

          {/* Decorative background.
              Rounded hanya decorative element, bukan card. */}

          <div className="pointer-events-none absolute -right-14 -top-20 h-44 w-44 rounded-full border border-white/10" />

          <div className="pointer-events-none absolute -bottom-16 -right-5 h-32 w-32 rounded-full border border-[#d7b66a]/20" />

          <div className="relative z-10 flex items-center gap-4">

            {/* ============================================================ */}
            {/* AVATAR */}
            {/* ============================================================ */}

            <div
              className="
                relative
                h-[68px]
                w-[68px]
                shrink-0
                rounded-full
                p-[3px]
                shadow-[0_0_12px_rgba(215,182,106,0.85),0_0_28px_rgba(215,182,106,0.45)]
              "
            >
              {/* Glow ring */}

              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#fff4c7] via-[#d7b66a] to-[#8c6622]" />

              <div className="relative h-full w-full overflow-hidden rounded-full border-2 border-[#fff1bf] bg-[#173d5d]">

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

            {/* ============================================================ */}
            {/* PROFILE INFO */}
            {/* ============================================================ */}

            <div className="min-w-0 flex-1">

              <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-[#d7b66a]">
                Member Area
              </p>

              <h1 className="mt-1 truncate text-[17px] font-bold text-white">
                {profileName}
              </h1>

              {profileEmail && (
                <p className="mt-0.5 truncate text-[10px] text-slate-300">
                  {profileEmail}
                </p>
              )}

              <div className="mt-2 flex items-center gap-1.5">

                {/* Icon boleh rounded secara visual */}

                <ShieldCheck className="h-3 w-3 shrink-0 text-[#d7b66a]" />

                <span className="text-[8px] font-semibold uppercase tracking-wider text-[#e7d5a4]">
                  Member Islami.or.id
                </span>

              </div>

            </div>

            {/* ============================================================ */}
            {/* SETTINGS ICON */}
            {/* ============================================================ */}

            <Link
              href="/pengaturan"
              aria-label="Pengaturan akun"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 transition hover:bg-white/20"
            >
              <Settings className="h-4 w-4 text-slate-200" />
            </Link>

          </div>

        </section>

        {/* ================================================================== */}
        {/* DONATION SUMMARY */}
        {/* ================================================================== */}

        <section className="w-full overflow-hidden border border-slate-200/70 bg-white shadow-sm">

          <div className="p-4">

            <div className="flex items-start justify-between gap-4">

              <div className="min-w-0">

                <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Total Donasi
                </p>

                <p className="mt-2 break-words text-[24px] font-bold leading-none tracking-tight text-[#102a43]">
                  Rp{" "}
                  {totalAmount.toLocaleString(
                    "id-ID"
                  )}
                </p>

              </div>

              <div className="shrink-0 text-right">

                {/* Badge boleh rounded */}

                <span className="inline-flex items-center rounded-full border border-[#eadfca] bg-[#f7f2e7] px-2.5 py-1">

                  <span className="text-[8px] font-bold uppercase tracking-wider text-[#98752d]">
                    {levelInfo.level}
                  </span>

                </span>

                <p className="mt-2 text-[11px] font-bold text-[#102a43]">
                  {levelInfo.name}
                </p>

              </div>

            </div>

            {/* ============================================================ */}
            {/* STATS */}
            {/* ============================================================ */}

            <div className="mt-5 grid grid-cols-3 border-t border-slate-100 pt-4">

              <div className="text-center">

                <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400">
                  Program
                </p>

                <p className="mt-1.5 text-[15px] font-bold text-[#102a43]">
                  {uniqueProgramsCount}
                </p>

              </div>

              <div className="border-x border-slate-100 text-center">

                <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400">
                  Berhasil
                </p>

                <p className="mt-1.5 text-[15px] font-bold text-[#102a43]">
                  {
                    successfulDonations.length
                  }
                  x
                </p>

              </div>

              <div className="text-center">

                <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400">
                  Referral
                </p>

                <p className="mt-1.5 flex items-center justify-center gap-1 text-[15px] font-bold text-[#102a43]">

                  <Eye className="h-3 w-3 text-[#b18a3c]" />

                  {referralClicks}

                </p>

              </div>

            </div>

          </div>

          {/* GOLD ACCENT */}

          <div className="h-[3px] bg-gradient-to-r from-[#b08a3d] via-[#dfc27e] to-[#b08a3d]" />

        </section>

        {/* ================================================================== */}
        {/* TARGET SEDEKAH */}
        {/* ================================================================== */}

        <section className="w-full border border-slate-200/70 bg-white p-4 shadow-sm">

          <div className="flex items-center justify-between gap-3">

            <div className="flex min-w-0 items-center gap-3">

              {/* Icon tetap rounded */}

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f7f2e7]">

                <Target className="h-[17px] w-[17px] text-[#a37c32]" />

              </div>

              <div className="min-w-0">

                <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Personal Goal
                </p>

                <h2 className="mt-0.5 text-[12px] font-bold text-[#102a43]">
                  Target Sedekah Bulanan
                </h2>

              </div>

            </div>

            <span className="shrink-0 text-[10px] font-bold text-[#a37c32]">
              {progressPercent}%
            </span>

          </div>

          <div className="mt-5">

            <div className="mb-2 flex items-center justify-between gap-3">

              <span className="text-[9px] text-slate-400">
                Rp{" "}
                {totalAmount.toLocaleString(
                  "id-ID"
                )}
              </span>

              <span className="text-right text-[9px] font-semibold text-slate-500">
                Target Rp{" "}
                {targetBulanan.toLocaleString(
                  "id-ID"
                )}
              </span>

            </div>

            {/* Progress track boleh rounded karena elemen indikator */}

            <div className="h-2 overflow-hidden rounded-full bg-slate-100">

              <div
                className="h-full rounded-full bg-gradient-to-r from-[#a37c32] to-[#d6b96f] transition-all duration-700"
                style={{
                  width:
                    `${progressPercent}%`,
                }}
              />

            </div>

          </div>

        </section>

        {/* ================================================================== */}
        {/* WHATSAPP */}
        {/* ================================================================== */}

        <section className="w-full border border-slate-200/70 bg-white p-4 shadow-sm">

          <div className="flex items-center justify-between gap-3">

            <div className="flex min-w-0 items-center gap-3">

              {/* Icon tetap rounded */}

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f3f7f5]">

                <Phone className="h-4 w-4 text-emerald-600" />

              </div>

              <div className="min-w-0">

                <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Kontak Referral
                </p>

                <p className="mt-1 truncate text-[11px] font-bold text-[#102a43]">
                  {profile?.phone ||
                    "Belum diatur"}
                </p>

              </div>

            </div>

            <button
              type="button"
              onClick={() =>
                setIsModalOpen(
                  true
                )
              }
              className="shrink-0 border border-slate-200 px-3.5 py-2 text-[9px] font-bold uppercase tracking-wider text-[#102a43] transition hover:bg-slate-50"
            >
              Ubah
            </button>

          </div>

        </section>

        {/* ================================================================== */}
        {/* MENU */}
        {/* ================================================================== */}

        <section className="w-full overflow-hidden border border-slate-200/70 bg-white shadow-sm">

          <div className="border-b border-slate-100 px-4 pb-3 pt-4">

            <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Account Center
            </p>

            <h2 className="mt-1 text-[13px] font-bold text-[#102a43]">
              Menu Akun
            </h2>

          </div>

          <nav
            aria-label="Menu akun"
            className="divide-y divide-slate-100"
          >

            {/* ============================================================ */}
            {/* RIWAYAT DONASI */}
            {/* ============================================================ */}

            <Link
              href="/donasi-saya"
              className="group flex items-center justify-between px-4 py-3.5 transition hover:bg-[#f8f8f6]"
            >

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5f6f7] transition group-hover:bg-[#f7f2e7]">

                  <History className="h-4 w-4 text-[#102a43]" />

                </div>

                <span className="text-[11px] font-semibold text-slate-700">
                  Riwayat Donasi
                </span>

              </div>

              <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:text-[#a37c32]" />

            </Link>

            {/* ============================================================ */}
            {/* KUITANSI */}
            {/* ============================================================ */}

            <Link
              href="/kuitansi"
              className="group flex items-center justify-between px-4 py-3.5 transition hover:bg-[#f8f8f6]"
            >

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5f6f7] transition group-hover:bg-[#f7f2e7]">

                  <FileText className="h-4 w-4 text-[#102a43]" />

                </div>

                <span className="text-[11px] font-semibold text-slate-700">
                  Kuitansi & Sertifikat
                </span>

              </div>

              <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:text-[#a37c32]" />

            </Link>

            {/* ============================================================ */}
            {/* FAVORIT */}
            {/* ============================================================ */}

            <Link
              href="/favorit"
              className="group flex items-center justify-between px-4 py-3.5 transition hover:bg-[#f8f8f6]"
            >

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5f6f7] transition group-hover:bg-[#f7f2e7]">

                  <Bookmark className="h-4 w-4 text-[#102a43]" />

                </div>

                <span className="text-[11px] font-semibold text-slate-700">
                  Program Favorit
                </span>

              </div>

              <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:text-[#a37c32]" />

            </Link>

            {/* ============================================================ */}
            {/* REFERRAL */}
            {/* ============================================================ */}

            <Link
              href="/referral"
              className="group flex items-center justify-between px-4 py-3.5 transition hover:bg-[#f8f8f6]"
            >

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f7f2e7]">

                  <Sparkles className="h-4 w-4 text-[#a37c32]" />

                </div>

                <div>

                  <span className="block text-[11px] font-semibold text-slate-700">
                    Ajak Teman
                  </span>

                  <span className="text-[8px] text-slate-400">
                    Program referral & kebaikan
                  </span>

                </div>

              </div>

              <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:text-[#a37c32]" />

            </Link>

            {/* ============================================================ */}
            {/* SETTINGS */}
            {/* ============================================================ */}

            <Link
              href="/pengaturan"
              className="group flex items-center justify-between px-4 py-3.5 transition hover:bg-[#f8f8f6]"
            >

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5f6f7]">

                  <Settings className="h-4 w-4 text-[#102a43]" />

                </div>

                <span className="text-[11px] font-semibold text-slate-700">
                  Pengaturan Akun
                </span>

              </div>

              <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:text-[#a37c32]" />

            </Link>

            {/* ============================================================ */}
            {/* HELP */}
            {/* ============================================================ */}

            <Link
              href="/bantuan"
              className="group flex items-center justify-between px-4 py-3.5 transition hover:bg-[#f8f8f6]"
            >

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5f6f7]">

                  <HelpCircle className="h-4 w-4 text-[#102a43]" />

                </div>

                <span className="text-[11px] font-semibold text-slate-700">
                  Bantuan & FAQ
                </span>

              </div>

              <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:text-[#a37c32]" />

            </Link>

          </nav>

        </section>

        {/* ================================================================== */}
        {/* LOGOUT */}
        {/* ================================================================== */}

        <button
          type="button"
          onClick={
            handleLogout
          }
          className="flex w-full items-center justify-center gap-2 border border-slate-200 bg-white py-3.5 text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400 transition hover:border-rose-100 hover:bg-rose-50 hover:text-rose-600"
        >

          <LogOut className="h-3.5 w-3.5" />

          Keluar dari Akun

        </button>

        {/* ================================================================== */}
        {/* FOOT NOTE */}
        {/* ================================================================== */}

        <div className="px-3 pb-2 pt-1 text-center">

          <p className="text-[8px] leading-relaxed text-slate-300">
            Terima kasih telah menjadi bagian dari gerakan kebaikan.
          </p>

        </div>

      </div>

      {/* ==================================================================== */}
      {/* MODAL WHATSAPP */}
      {/* ==================================================================== */}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071521]/70 p-4 backdrop-blur-sm">

          {/* Modal juga tanpa rounded card */}

          <div className="relative w-full max-w-sm overflow-hidden bg-white shadow-[0_25px_70px_rgba(0,0,0,0.25)]">

            <div className="h-1 bg-gradient-to-r from-[#a37c32] via-[#dfc27e] to-[#a37c32]" />

            <div className="p-5">

              {/* ========================================================== */}
              {/* MODAL HEADER */}
              {/* ========================================================== */}

              <div className="flex items-center justify-between gap-4">

                <div>

                  <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    Account Settings
                  </p>

                  <h2 className="mt-1 text-[14px] font-bold text-[#102a43]">
                    Nomor WhatsApp
                  </h2>

                </div>

                {/* Icon button tetap bulat */}

                <button
                  type="button"
                  onClick={() =>
                    setIsModalOpen(
                      false
                    )
                  }
                  aria-label="Tutup"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >

                  <X className="h-4 w-4" />

                </button>

              </div>

              {/* ========================================================== */}
              {/* FORM */}
              {/* ========================================================== */}

              <form
                onSubmit={
                  handleUpdatePhone
                }
                className="mt-5 space-y-4"
              >

                <div>

                  <label
                    htmlFor="phone"
                    className="text-[9px] font-bold uppercase tracking-wider text-slate-400"
                  >
                    Nomor WhatsApp Baru
                  </label>

                  <input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    placeholder="Contoh: 081234567890"
                    value={
                      newPhone
                    }
                    onChange={(
                      event
                    ) =>
                      setNewPhone(
                        event
                          .target
                          .value
                      )
                    }
                    className="mt-2 w-full border border-slate-200 bg-[#f8f8f6] px-4 py-3.5 text-[12px] font-semibold text-slate-800 outline-none transition focus:border-[#a37c32] focus:bg-white"
                  />

                  <p className="mt-2 text-[8px] leading-relaxed text-slate-400">
                    Nomor ini digunakan untuk identitas referral dan komunikasi terkait akun.
                  </p>

                </div>

                <button
                  type="submit"
                  disabled={
                    savingPhone
                  }
                  className="w-full bg-[#102a43] py-3.5 text-[9px] font-bold uppercase tracking-[0.16em] text-white shadow-lg shadow-[#102a43]/10 transition hover:bg-[#173d5d] disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {savingPhone
                    ? "Menyimpan..."
                    : "Simpan Nomor Baru"}
                </button>

              </form>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}