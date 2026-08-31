// components/CampaignDetailClient.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PortableText } from "@portabletext/react";
import {
  ArrowLeft,
  Check,
  Copy,
  MessageCircle,
  Share2,
} from "lucide-react";

import { supabase } from "@/lib/supabase/client";

// ============================================================================
// MIDTRANS TYPES
// ============================================================================

interface MidtransSnapOptions {
  onSuccess?: (result: unknown) => void;
  onPending?: (result: unknown) => void;
  onError?: (result: unknown) => void;
  onClose?: () => void;
}

interface MidtransSnap {
  pay: (
    token: string,
    options?: MidtransSnapOptions
  ) => void;
}

declare global {
  interface Window {
    snap?: MidtransSnap;
  }
}

// ============================================================================
// TYPES
// ============================================================================

interface Donor {
  name?: string;
  date?: string;
  amount?: number | string;
}

interface ReportItem {
  title?: string;
  date?: string;
  content?: any;
}

interface Program {
  _id?: string;
  id?: string;

  title?: string;
  slug?: string;
  image?: string;

  category?: string;
  description?: any;

  collectedAmount?: number | string;
  targetAmount?: number | string;
  daysLeft?: number;

  donors?: Donor[];
  reports?: ReportItem[];
}

interface Profile {
  id?: string;
  name?: string;
  email?: string;
  avatar?: string;
  phone?: string;
}

interface CampaignDetailClientProps {
  slug: string;
  referral: string | null;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const BRAND_COLOR = "#0d5c91";
const CTA_COLOR = "#e91e63";

const PRESET_AMOUNTS = [
  10_000,
  15_000,
  25_000,
  50_000,
  100_000,
  250_000,
];

// ============================================================================
// HELPERS
// ============================================================================

function cleanNumber(value: unknown): number {
  return (
    Number(
      String(value ?? "").replace(/[^0-9]/g, "")
    ) || 0
  );
}

function formatRupiahInput(value: string): string {
  const raw = value.replace(/[^0-9]/g, "");

  if (!raw) {
    return "";
  }

  return Number(raw).toLocaleString("id-ID");
}

function normalizePhone(value: unknown): string {
  return String(value ?? "").replace(/[^0-9]/g, "");
}

function normalizeSlug(value: string): string {
  try {
    return decodeURIComponent(value)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
  } catch {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
  }
}

// ============================================================================
// HEADER
// ============================================================================

interface DetailHeaderProps {
  title?: string;
  onOpenShare: () => void;
}

function DetailHeader({
  title = "Program Donasi",
  onOpenShare,
}: DetailHeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0d5c91] text-white shadow-sm">
      <div className="mx-auto flex h-14 w-full max-w-md items-center justify-between px-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex cursor-pointer items-center justify-center rounded-lg border border-white/30 p-2 transition-colors hover:bg-white/10"
          aria-label="Kembali ke halaman sebelumnya"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </button>

        {/*
          Jangan gunakan H1 di header.
          H1 utama halaman berada pada judul program di konten.
        */}
        <div className="max-w-[220px] truncate text-sm font-bold tracking-tight text-white sm:max-w-[280px] sm:text-base">
          {title}
        </div>

        <button
          type="button"
          onClick={onOpenShare}
          className="flex cursor-pointer items-center justify-center rounded-lg border border-white/30 p-2 transition-colors hover:bg-white/10"
          aria-label="Bagikan program"
        >
          <Share2 className="h-5 w-5 text-white" />
        </button>
      </div>
    </header>
  );
}

// ============================================================================
// KALKULATOR ZAKAT
// ============================================================================

interface EmbeddedZakatCalculatorProps {
  onApplyAmount: (value: string) => void;
}

function EmbeddedZakatCalculator({
  onApplyAmount,
}: EmbeddedZakatCalculatorProps) {
  const [activeTab, setActiveTab] =
    useState<"penghasilan" | "maal" | "emas">(
      "penghasilan"
    );

  const [input1, setInput1] = useState("");
  const [input2, setInput2] = useState("");

  // Catatan:
  // Nilai ini adalah estimasi internal.
  // Idealnya nanti harga emas diambil dari sumber yang dapat diperbarui.
  const HARGA_EMAS = 1_400_000;

  const NISHAB_TAHUNAN =
    85 * HARGA_EMAS;

  const NISHAB_BULANAN =
    Math.round(NISHAB_TAHUNAN / 12);

  let totalZakat = 0;
  let isWajib = false;

  if (activeTab === "penghasilan") {
    const total =
      cleanNumber(input1) +
      cleanNumber(input2);

    isWajib =
      total >= NISHAB_BULANAN;

    totalZakat = isWajib
      ? Math.round(total * 0.025)
      : 0;
  }

  if (activeTab === "maal") {
    const total =
      cleanNumber(input1) +
      cleanNumber(input2);

    isWajib =
      total >= NISHAB_TAHUNAN;

    totalZakat = isWajib
      ? Math.round(total * 0.025)
      : 0;
  }

  if (activeTab === "emas") {
    const berat =
      Number(input1) || 0;

    isWajib =
      berat >= 85;

    totalZakat = isWajib
      ? Math.round(
          berat *
            HARGA_EMAS *
            0.025
        )
      : 0;
  }

  const resetInputs = () => {
    setInput1("");
    setInput2("");
  };

  return (
    <div className="my-4 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex border-b border-gray-200 bg-gray-50 text-xs font-bold">
        <button
          type="button"
          onClick={() => {
            setActiveTab("penghasilan");
            resetInputs();
          }}
          className={`flex-1 cursor-pointer border-b-2 py-3 text-center transition ${
            activeTab === "penghasilan"
              ? "border-[#0d5c91] bg-white text-[#0d5c91]"
              : "border-transparent text-slate-500"
          }`}
        >
          PENGHASILAN
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("maal");
            resetInputs();
          }}
          className={`flex-1 cursor-pointer border-b-2 py-3 text-center transition ${
            activeTab === "maal"
              ? "border-[#0d5c91] bg-white text-[#0d5c91]"
              : "border-transparent text-slate-500"
          }`}
        >
          MAAL
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("emas");
            resetInputs();
          }}
          className={`flex-1 cursor-pointer border-b-2 py-3 text-center transition ${
            activeTab === "emas"
              ? "border-[#0d5c91] bg-white text-[#0d5c91]"
              : "border-transparent text-slate-500"
          }`}
        >
          EMAS
        </button>
      </div>

      <div className="space-y-4 p-4 text-left">
        {activeTab !== "emas" ? (
          <>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600 sm:text-sm">
                {activeTab === "penghasilan"
                  ? "Pendapatan Utama Per Bulan (Rp)"
                  : "Total Harta / Tabungan (Rp)"}
              </label>

              <input
                type="text"
                inputMode="numeric"
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-[#0d5c91] sm:text-base"
                placeholder="0"
                value={input1}
                onChange={(e) =>
                  setInput1(
                    formatRupiahInput(
                      e.target.value
                    )
                  )
                }
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600 sm:text-sm">
                {activeTab === "penghasilan"
                  ? "Tunjangan / Bonus / THR (Rp)"
                  : "Harta Lain yang Dihitung (Rp)"}
              </label>

              <input
                type="text"
                inputMode="numeric"
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-[#0d5c91] sm:text-base"
                placeholder="0"
                value={input2}
                onChange={(e) =>
                  setInput2(
                    formatRupiahInput(
                      e.target.value
                    )
                  )
                }
              />
            </div>
          </>
        ) : (
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600 sm:text-sm">
              Total Berat Emas (Gram)
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-[#0d5c91] sm:text-base"
              placeholder="Contoh: 90"
              value={input1}
              onChange={(e) =>
                setInput1(e.target.value)
              }
            />
          </div>
        )}

        <div className="space-y-2 rounded-xl border border-sky-100 bg-sky-50/60 p-4 text-center">
          <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500 sm:text-sm">
            Estimasi Zakat
          </span>

          <span className="block text-xl font-extrabold text-[#0d5c91] sm:text-2xl">
            Rp{" "}
            {totalZakat.toLocaleString(
              "id-ID"
            )}
          </span>

          {input1 && (
            <p
              className={`text-xs font-semibold ${
                isWajib
                  ? "text-emerald-700"
                  : "text-slate-500"
              }`}
            >
              {isWajib
                ? "Berdasarkan estimasi, telah mencapai nishab."
                : "Berdasarkan estimasi, belum mencapai nishab."}
            </p>
          )}

          <button
            type="button"
            disabled={totalZakat <= 0}
            onClick={() =>
              onApplyAmount(
                totalZakat.toLocaleString(
                  "id-ID"
                )
              )
            }
            className="w-full cursor-pointer rounded-lg bg-[#0d5c91] py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-sky-900 disabled:cursor-not-allowed disabled:bg-gray-300 sm:text-sm"
          >
            Masukkan ke Form Nominal
          </button>
        </div>

        <p className="text-center text-[11px] leading-relaxed text-slate-400 sm:text-xs">
          Kalkulator ini hanya memberikan estimasi awal.
          Ketentuan zakat dapat berbeda sesuai jenis harta,
          nishab, dan haul.
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// DONATION FORM
// ============================================================================

interface DonationFormFieldsProps {
  profile: Profile | null;

  setProfile: React.Dispatch<
    React.SetStateAction<Profile | null>
  >;

  amount: string;

  setAmount: React.Dispatch<
    React.SetStateAction<string>
  >;

  handleDonate: () => Promise<void>;
  handleInlineSavePhone: () => Promise<void>;

  submitting: boolean;
  isLoggedIn: boolean;

  inlinePhone: string;

  setInlinePhone: React.Dispatch<
    React.SetStateAction<string>
  >;

  savingPhone: boolean;
}

function DonationFormFields({
  profile,
  setProfile,
  amount,
  setAmount,
  handleDonate,
  handleInlineSavePhone,
  submitting,
  isLoggedIn,
  inlinePhone,
  setInlinePhone,
  savingPhone,
}: DonationFormFieldsProps) {
  const cleanAmountNum =
    cleanNumber(amount);

  const hasPhone =
    Boolean(
      profile?.phone &&
        profile.phone.trim().length >= 9
    );

  return (
    <div className="space-y-4 text-left">
      <div>
        <label className="mb-2 block text-xs font-extrabold text-slate-900 sm:text-sm">
          Pilih Nominal Donasi
        </label>

        <div className="grid grid-cols-3 gap-2">
          {PRESET_AMOUNTS.map(
            (value) => (
              <button
                key={value}
                type="button"
                onClick={() =>
                  setAmount(
                    value.toLocaleString(
                      "id-ID"
                    )
                  )
                }
                className={`rounded-xl border px-2 py-3 text-xs font-bold transition ${
                  cleanAmountNum === value
                    ? "border-[#0d5c91] bg-sky-50 text-[#0d5c91] shadow-sm ring-1 ring-[#0d5c91]"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                Rp{" "}
                {value >= 1_000_000
                  ? `${value / 1_000_000}jt`
                  : `${value / 1_000}rb`}
              </button>
            )
          )}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-600">
          Masukkan Donasi Lainnya
        </label>

        <div className="relative flex items-center">
          <span className="absolute left-3.5 text-sm font-bold text-slate-400">
            Rp
          </span>

          <input
            type="text"
            inputMode="numeric"
            placeholder="Min. 1.000"
            className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-3.5 text-sm font-bold text-slate-900 outline-none focus:border-[#0d5c91] sm:text-base"
            value={amount}
            onChange={(e) =>
              setAmount(
                formatRupiahInput(
                  e.target.value
                )
              )
            }
          />
        </div>
      </div>

      <hr className="my-2 border-slate-100" />

      {isLoggedIn ? (
        hasPhone ? (
          <div className="flex items-center justify-between rounded-xl border border-emerald-200/80 bg-emerald-50 p-3.5">
            <div className="min-w-0 space-y-0.5">
              <span className="block text-[10px] font-bold uppercase tracking-wide text-emerald-800">
                Login ✓
                {profile?.name
                  ? ` • ${profile.name}`
                  : ""}
              </span>

              <p className="truncate text-xs font-extrabold text-slate-900">
                WhatsApp:{" "}
                {profile?.phone}
              </p>
            </div>

            <span className="shrink-0 rounded-full bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white">
              Siap Donasi
            </span>
          </div>
        ) : (
          <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div>
              <span className="mb-0.5 block text-xs font-bold text-amber-900">
                Halo,{" "}
                {profile?.name ||
                  "Dermawan"}
                !
              </span>

              <p className="text-[11px] leading-relaxed text-amber-700">
                Lengkapi nomor WhatsApp untuk
                pengiriman kuitansi dan informasi
                donasi.
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="tel"
                inputMode="tel"
                placeholder="Contoh: 081234567890"
                className="min-w-0 flex-1 rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-[#0d5c91]"
                value={inlinePhone}
                onChange={(e) =>
                  setInlinePhone(
                    e.target.value
                  )
                }
              />

              <button
                type="button"
                onClick={
                  handleInlineSavePhone
                }
                disabled={savingPhone}
                className="shrink-0 rounded-lg bg-amber-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-amber-700 disabled:opacity-50"
              >
                {savingPhone
                  ? "Menyimpan..."
                  : "Simpan"}
              </button>
            </div>
          </div>
        )
      ) : (
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Nama Donatur
            </label>

            <input
              type="text"
              placeholder="Hamba Allah (boleh kosong)"
              className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-[#0d5c91]"
              value={
                profile?.name || ""
              }
              onChange={(e) =>
                setProfile(
                  (prev) => ({
                    ...(prev || {}),
                    name:
                      e.target.value,
                  })
                )
              }
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Nomor WhatsApp *
            </label>

            <input
              type="tel"
              inputMode="tel"
              placeholder="Contoh: 081234567890"
              className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-[#0d5c91]"
              value={
                profile?.phone || ""
              }
              onChange={(e) =>
                setProfile(
                  (prev) => ({
                    ...(prev || {}),
                    phone:
                      e.target.value,
                  })
                )
              }
            />
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          void handleDonate();
        }}
        disabled={
          submitting ||
          (isLoggedIn &&
            !hasPhone)
        }
        className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#e91e63] py-4 text-sm font-extrabold uppercase tracking-wider text-white shadow-md transition hover:bg-pink-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-gray-300 sm:text-base"
      >
        {submitting
          ? "Memproses..."
          : "Lanjut pembayaran"}
      </button>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CampaignDetailClient({
  slug,
  referral,
}: CampaignDetailClientProps) {
  const [program, setProgram] =
    useState<Program | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [amount, setAmount] =
    useState("10.000");

  const [profile, setProfile] =
    useState<Profile | null>(
      null
    );

  const [
    isLoggedIn,
    setIsLoggedIn,
  ] = useState(false);

  const [
    inlinePhone,
    setInlinePhone,
  ] = useState("");

  const [
    savingPhone,
    setSavingPhone,
  ] = useState(false);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    isMobileFormOpen,
    setIsMobileFormOpen,
  ] = useState(false);

  const [
    isShareModalOpen,
    setIsShareModalOpen,
  ] = useState(false);

  const [copied, setCopied] =
    useState(false);

  const [
    activeTab,
    setActiveTab,
  ] = useState<
    "cerita" | "donatur" | "laporan"
  >("cerita");

  // ==========================================================================
  // PROFILE / AUTH
  // ==========================================================================

  useEffect(() => {
    let mounted = true;

    async function loadProfileFromDatabase() {
      try {
        const {
          data: { session },
        } =
          await supabase.auth.getSession();

        if (!mounted) {
          return;
        }

        if (!session) {
          setIsLoggedIn(false);
          setProfile(null);
          return;
        }

        const user = session.user;

        setIsLoggedIn(true);

        const meta =
          user.user_metadata || {};

        const { data: prof } =
          await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();

        if (!mounted) {
          return;
        }

        if (prof) {
          setProfile(prof);
          return;
        }

        setProfile({
          id: user.id,

          name:
            meta.full_name ||
            meta.name ||
            user.email?.split("@")[0] ||
            "Dermawan",

          email:
            user.email || "",

          avatar:
            meta.avatar_url ||
            meta.picture ||
            "",

          phone: "",
        });
      } catch (error) {
        console.error(
          "Gagal memuat profil:",
          error
        );

        if (mounted) {
          setIsLoggedIn(false);
        }
      }
    }

    void loadProfileFromDatabase();

    const {
      data: { subscription },
    } =
      supabase.auth.onAuthStateChange(
        () => {
          void loadProfileFromDatabase();
        }
      );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // ==========================================================================
  // LOAD PROGRAM
  // ==========================================================================

  useEffect(() => {
    const controller =
      new AbortController();

    async function loadProgram() {
      setLoading(true);

      try {
        const response =
          await fetch(
            "/api/programs",
            {
              cache: "no-store",
              signal:
                controller.signal,
            }
          );

        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status}`
          );
        }

        const json =
          await response.json();

        if (
          !json?.success ||
          !Array.isArray(
            json?.data
          )
        ) {
          setProgram(null);
          return;
        }

        const cleanParamSlug =
          normalizeSlug(slug);

        const found =
          json.data.find(
            (item: Program) => {
              const dbSlug =
                String(
                  item.slug || ""
                );

              const cleanDbSlug =
                normalizeSlug(
                  dbSlug
                );

              return (
                cleanDbSlug ===
                  cleanParamSlug ||
                dbSlug === slug ||
                item._id === slug ||
                item.id === slug
              );
            }
          ) || null;

        setProgram(found);
      } catch (error) {
        if (
          error instanceof
            DOMException &&
          error.name ===
            "AbortError"
        ) {
          return;
        }

        console.error(
          "Fetch detail campaign error:",
          error
        );

        setProgram(null);
      } finally {
        if (
          !controller.signal.aborted
        ) {
          setLoading(false);
        }
      }
    }

    void loadProgram();

    return () => {
      controller.abort();
    };
  }, [slug]);

  // ==========================================================================
  // SAVE PHONE
  // ==========================================================================

  const handleInlineSavePhone =
    async () => {
      const clean =
        normalizePhone(
          inlinePhone
        );

      if (clean.length < 9) {
        alert(
          "Masukkan nomor WhatsApp yang valid."
        );
        return;
      }

      setSavingPhone(true);

      try {
        const {
          data: { session },
        } =
          await supabase.auth.getSession();

        if (!session?.user) {
          throw new Error(
            "Sesi habis, silakan login ulang."
          );
        }

        const { error } =
          await supabase
            .from("profiles")
            .update({
              phone: clean,
              updated_at:
                new Date().toISOString(),
            })
            .eq(
              "id",
              session.user.id
            );

        if (error) {
          throw error;
        }

        setProfile(
          (prev) => ({
            ...(prev || {}),
            phone: clean,
          })
        );

        setInlinePhone("");

        alert(
          "Nomor WhatsApp berhasil disimpan. Silakan lanjutkan donasi."
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan.";

        alert(
          `Gagal menyimpan: ${message}`
        );
      } finally {
        setSavingPhone(false);
      }
    };

  // ==========================================================================
  // DONATE
  // ==========================================================================

  const handleDonate =
    async () => {
      if (submitting) {
        return;
      }

      const cleanAmount =
        cleanNumber(amount);

      if (
        !cleanAmount ||
        cleanAmount < 1000
      ) {
        alert(
          "Masukkan nominal minimal Rp 1.000."
        );
        return;
      }

      const activePhone =
        profile?.phone ||
        inlinePhone;

      const cleanPhone =
        normalizePhone(
          activePhone
        );

      if (
        cleanPhone.length < 9
      ) {
        alert(
          "Nomor WhatsApp wajib diisi dengan benar."
        );
        return;
      }

      const resolvedProgramId =
        program?._id ||
        program?.id;

      if (!resolvedProgramId) {
        alert(
          "ID program tidak ditemukan."
        );
        return;
      }

      setSubmitting(true);

      try {
        const response =
          await fetch(
            "/api/donate",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify(
                {
                  programId:
                    resolvedProgramId,

                  programTitle:
                    program?.title ||
                    "Sedekah Umum",

                  slug:
                    program?.slug ||
                    slug,

                  amount:
                    cleanAmount,

                  donorName:
                    profile?.name?.trim() ||
                    "Hamba Allah",

                  phone:
                    cleanPhone,

                  email:
                    profile?.email?.trim() ||
                    "",

                  fundraiserPhone:
                    referral,
                }
              ),
            }
          );

        const json =
          await response.json();

        if (!response.ok) {
          throw new Error(
            json?.message ||
              "Gagal membuat transaksi."
          );
        }

        if (
          json.success &&
          json.token
        ) {
          if (
            typeof window !==
              "undefined" &&
            window.snap
          ) {
            window.snap.pay(
              json.token,
              {
                onSuccess: () => {
                  window.location.href =
                    `/donation/success?orderId=${encodeURIComponent(
                      json.orderId
                    )}`;
                },

                onPending: () => {
                  window.location.href =
                    `/donation/success?orderId=${encodeURIComponent(
                      json.orderId
                    )}`;
                },

                onError: () => {
                  alert(
                    "Pembayaran gagal. Silakan coba lagi."
                  );

                  setSubmitting(
                    false
                  );
                },

                onClose: () => {
                  setSubmitting(
                    false
                  );
                },
              }
            );

            return;
          }

          if (
            json.paymentUrl &&
            typeof window !==
              "undefined"
          ) {
            window.location.href =
              json.paymentUrl;

            return;
          }

          throw new Error(
            "Midtrans Snap belum tersedia."
          );
        }

        throw new Error(
          json?.message ||
            "Gagal memproses transaksi."
        );
      } catch (error) {
        console.error(
          "Donation error:",
          error
        );

        const message =
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan koneksi.";

        alert(message);

        setSubmitting(false);
      }
    };

  // ==========================================================================
  // SHARE
  // ==========================================================================

  const shareUrl = useMemo(() => {
    if (
      typeof window ===
      "undefined"
    ) {
      return "";
    }

    return window.location.href;
  }, [
    isShareModalOpen,
    program,
  ]);

  const handleCopyLink =
    async () => {
      if (
        typeof window ===
        "undefined"
      ) {
        return;
      }

      try {
        await navigator.clipboard.writeText(
          window.location.href
        );

        setCopied(true);

        window.setTimeout(
          () =>
            setCopied(false),
          2000
        );
      } catch {
        alert(
          "Tautan gagal disalin."
        );
      }
    };

  // ==========================================================================
  // LOADING
  // ==========================================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DetailHeader
          title="Program Donasi"
          onOpenShare={() =>
            setIsShareModalOpen(
              true
            )
          }
        />

        <div
          className="py-20 text-center text-sm font-medium text-slate-500 sm:text-base"
          role="status"
        >
          Memuat detail program...
        </div>
      </div>
    );
  }

  // ==========================================================================
  // NOT FOUND
  // ==========================================================================

  if (!program) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DetailHeader
          title="Program Donasi"
          onOpenShare={() =>
            setIsShareModalOpen(
              true
            )
          }
        />

        <div className="px-4 py-20 text-center">
          <h1 className="text-lg font-bold text-slate-900">
            Program tidak ditemukan
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Program yang Anda cari
            mungkin sudah tidak tersedia
            atau alamatnya tidak tepat.
          </p>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // PROGRAM VALUES
  // ==========================================================================

  const rawTarget =
    Number(
      program.targetAmount
    ) || 50_000_000;

  const currentCollected =
    Number(
      program.collectedAmount
    ) || 0;

  const percentage =
    rawTarget > 0
      ? Math.min(
          Math.round(
            (currentCollected /
              rawTarget) *
              100
          ),
          100
        )
      : 0;

  const donors =
    Array.isArray(
      program.donors
    )
      ? program.donors
      : [];

  const reports =
    Array.isArray(
      program.reports
    )
      ? program.reports
      : [];

  // ==========================================================================
  // OUTPUT
  // ==========================================================================

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <DetailHeader
        title="Program Donasi"
        onOpenShare={() =>
          setIsShareModalOpen(
            true
          )
        }
      />

      <main className="mx-auto w-full max-w-md space-y-4 px-3 pt-4">
        <article className="space-y-4 rounded-xl border border-gray-200/90 bg-white p-4 shadow-sm sm:p-6">
          <div className="aspect-[16/10] w-full overflow-hidden rounded-xl border border-gray-100 bg-gray-100 shadow-inner">
            {program.image ? (
              <img
                src={program.image}
                alt={
                  program.title ||
                  "Program kebaikan islami.or.id"
                }
                width={800}
                height={500}
                loading="eager"
                fetchPriority="high"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                Gambar program
                belum tersedia
              </div>
            )}
          </div>

          {/* H1 UTAMA HALAMAN */}
          <h1 className="text-base font-bold leading-snug tracking-tight text-slate-900 sm:text-xl">
            {program.title ||
              "Program Kebaikan"}
          </h1>

          <div className="space-y-2 pt-1">
            <p className="text-lg font-extrabold text-[#0d5c91] sm:text-xl">
              Rp{" "}
              {currentCollected.toLocaleString(
                "id-ID"
              )}
            </p>

            <div className="flex items-center justify-between text-xs font-medium text-slate-500 sm:text-sm">
              <span>
                Terkumpul dari{" "}
                <strong className="text-slate-800">
                  Rp{" "}
                  {rawTarget.toLocaleString(
                    "id-ID"
                  )}
                </strong>
              </span>

              <span>
                {program.daysLeft
                  ? `${program.daysLeft} hari lagi`
                  : "Mendesak"}
              </span>
            </div>

            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100 shadow-inner"
              aria-label={`Progres donasi ${percentage}%`}
            >
              <div
                className="h-full bg-[#e91e63] transition-all duration-500"
                style={{
                  width: `${percentage}%`,
                }}
              />
            </div>
          </div>

          {/* ================================================================ */}
          {/* TABS */}
          {/* ================================================================ */}

          <div
            className="flex space-x-6 border-b border-gray-200 pt-2 text-xs font-bold text-slate-500 sm:text-sm"
            role="tablist"
            aria-label="Informasi program"
          >
            <button
              type="button"
              role="tab"
              aria-selected={
                activeTab ===
                "cerita"
              }
              onClick={() =>
                setActiveTab(
                  "cerita"
                )
              }
              className={`cursor-pointer border-b-2 pb-2.5 transition focus:outline-none ${
                activeTab ===
                "cerita"
                  ? "border-[#0d5c91] text-[#0d5c91]"
                  : "border-transparent"
              }`}
            >
              Cerita
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={
                activeTab ===
                "donatur"
              }
              onClick={() =>
                setActiveTab(
                  "donatur"
                )
              }
              className={`cursor-pointer border-b-2 pb-2.5 transition focus:outline-none ${
                activeTab ===
                "donatur"
                  ? "border-[#0d5c91] text-[#0d5c91]"
                  : "border-transparent"
              }`}
            >
              Donatur (
              {donors.length})
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={
                activeTab ===
                "laporan"
              }
              onClick={() =>
                setActiveTab(
                  "laporan"
                )
              }
              className={`cursor-pointer border-b-2 pb-2.5 transition focus:outline-none ${
                activeTab ===
                "laporan"
                  ? "border-[#0d5c91] text-[#0d5c91]"
                  : "border-transparent"
              }`}
            >
              Laporan (
              {reports.length})
            </button>
          </div>

          {/* ================================================================ */}
          {/* TAB CONTENT */}
          {/* ================================================================ */}

          <div className="py-2 text-left">
            {activeTab ===
              "cerita" && (
              <div className="space-y-4">
                {program.category
                  ?.trim()
                  .toUpperCase() ===
                  "ZAKAT" && (
                  <EmbeddedZakatCalculator
                    onApplyAmount={
                      setAmount
                    }
                  />
                )}

                <div className="space-y-4 text-base font-normal leading-relaxed text-slate-800 sm:text-lg">
                  {program.description ? (
                    typeof program.description ===
                    "string" ? (
                      <p>
                        {
                          program.description
                        }
                      </p>
                    ) : (
                      <PortableText
                        value={
                          program.description
                        }
                      />
                    )
                  ) : (
                    <p className="italic text-slate-400">
                      Belum ada
                      cerita detail.
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeTab ===
              "donatur" && (
              <div className="space-y-3 py-1">
                {donors.length >
                0 ? (
                  [...donors]
                    .reverse()
                    .map(
                      (
                        donor,
                        index
                      ) => (
                        <div
                          key={`${donor.name || "donor"}-${index}`}
                          className="flex items-center justify-between rounded-xl border border-gray-200/80 bg-gray-50 p-3.5"
                        >
                          <div className="flex min-w-0 items-center space-x-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-100 text-base font-bold text-[#0d5c91] shadow-inner">
                              {(
                                donor.name ||
                                "H"
                              )
                                .toUpperCase()
                                .slice(
                                  0,
                                  1
                                )}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-slate-800 sm:text-base">
                                {donor.name ||
                                  "Hamba Allah"}
                              </p>

                              <p className="text-xs font-normal text-slate-400">
                                {donor.date ||
                                  "Baru saja"}
                              </p>
                            </div>
                          </div>

                          <p className="shrink-0 text-sm font-bold text-[#0d5c91] sm:text-base">
                            +Rp{" "}
                            {Number(
                              donor.amount ||
                                0
                            ).toLocaleString(
                              "id-ID"
                            )}
                          </p>
                        </div>
                      )
                    )
                ) : (
                  <p className="py-8 text-center text-sm text-slate-400 sm:text-base">
                    Belum ada
                    donatur.
                  </p>
                )}
              </div>
            )}

            {activeTab ===
              "laporan" && (
              <div className="space-y-4 py-1">
                {reports.length >
                0 ? (
                  [...reports]
                    .reverse()
                    .map(
                      (
                        report,
                        index
                      ) => (
                        <section
                          key={`${report.title || "report"}-${index}`}
                          className="space-y-2.5 rounded-xl border border-gray-200/80 bg-gray-50 p-4"
                        >
                          <div className="flex items-center justify-between border-b border-gray-200 pb-2.5">
                            <h2 className="text-sm font-bold text-slate-800 sm:text-base">
                              {report.title ||
                                "Laporan Penyaluran"}
                            </h2>

                            <span className="text-xs font-medium text-slate-400">
                              {report.date ||
                                ""}
                            </span>
                          </div>

                          <div className="text-sm leading-relaxed text-slate-800 sm:text-base">
                            {typeof report.content ===
                            "string" ? (
                              <p>
                                {
                                  report.content
                                }
                              </p>
                            ) : report.content ? (
                              <PortableText
                                value={
                                  report.content
                                }
                              />
                            ) : null}
                          </div>
                        </section>
                      )
                    )
                ) : (
                  <p className="py-8 text-center text-sm text-slate-400 sm:text-base">
                    Belum ada
                    pembaruan
                    laporan.
                  </p>
                )}
              </div>
            )}
          </div>
        </article>
      </main>

      {/* ==================================================================== */}
      {/* BOTTOM CTA */}
      {/* ==================================================================== */}

      <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-3">
        <div className="pointer-events-auto w-[calc(100%-1.5rem)] max-w-md rounded-2xl border border-gray-200 bg-white p-3.5 shadow-xl">
          <button
            type="button"
            onClick={() =>
              setIsMobileFormOpen(
                true
              )
            }
            className="w-full cursor-pointer rounded-xl bg-[#e91e63] py-4 text-sm font-extrabold uppercase tracking-wide text-white shadow-md transition-all hover:bg-pink-700 active:scale-[0.99] sm:text-base"
          >
            Donasi sekarang
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* DONATION MODAL */}
      {/* ==================================================================== */}

      {isMobileFormOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-xs sm:items-center sm:p-3"
          role="dialog"
          aria-modal="true"
          aria-label="Form donasi"
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label="Tutup form donasi"
            onClick={() =>
              setIsMobileFormOpen(
                false
              )
            }
          />

          <div className="relative z-10 max-h-[90vh] w-full max-w-md space-y-4 overflow-y-auto rounded-t-2xl border border-gray-200 bg-white p-5 shadow-2xl sm:rounded-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-900 sm:text-base">
                Pilih Nominal
                Donasi
              </h2>

              <button
                type="button"
                onClick={() =>
                  setIsMobileFormOpen(
                    false
                  )
                }
                className="cursor-pointer p-1 text-lg font-bold text-slate-400 hover:text-slate-600"
                aria-label="Tutup"
              >
                ✕
              </button>
            </div>

            <DonationFormFields
              profile={profile}
              setProfile={
                setProfile
              }
              amount={amount}
              setAmount={
                setAmount
              }
              handleDonate={
                handleDonate
              }
              handleInlineSavePhone={
                handleInlineSavePhone
              }
              submitting={
                submitting
              }
              isLoggedIn={
                isLoggedIn
              }
              inlinePhone={
                inlinePhone
              }
              setInlinePhone={
                setInlinePhone
              }
              savingPhone={
                savingPhone
              }
            />
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SHARE MODAL */}
      {/* ==================================================================== */}

      {isShareModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-label="Bagikan program"
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label="Tutup menu berbagi"
            onClick={() =>
              setIsShareModalOpen(
                false
              )
            }
          />

          <div className="relative z-10 w-full max-w-md space-y-4 rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-900 sm:text-base">
                Bagikan Program
                Kebaikan
              </h2>

              <button
                type="button"
                onClick={() =>
                  setIsShareModalOpen(
                    false
                  )
                }
                className="cursor-pointer p-1 text-lg font-bold text-slate-400 hover:text-slate-600"
                aria-label="Tutup"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-600 sm:text-sm">
                Tautan Program
              </label>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={
                    shareUrl
                  }
                  className="min-w-0 flex-1 truncate rounded-lg border border-gray-300 bg-gray-50 px-3.5 py-2.5 font-mono text-xs text-slate-700 outline-none sm:text-sm"
                />

                <button
                  type="button"
                  onClick={() => {
                    void handleCopyLink();
                  }}
                  className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-[#0d5c91] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-sky-900 sm:text-sm"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}

                  <span>
                    {copied
                      ? "Tersalin"
                      : "Salin"}
                  </span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `Ayo bantu program kebaikan ini: ${
                    program.title ||
                    ""
                  }\n${shareUrl}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center space-y-1.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-emerald-800 transition hover:bg-emerald-100"
              >
                <MessageCircle className="h-6 w-6 text-emerald-600" />

                <span className="text-xs font-bold sm:text-sm">
                  WhatsApp
                </span>
              </a>

              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                  shareUrl
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center space-y-1.5 rounded-xl border border-blue-200 bg-blue-50 p-3.5 text-blue-800 transition hover:bg-blue-100"
              >
                <svg
                  className="h-6 w-6 fill-current text-blue-600"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>

                <span className="text-xs font-bold sm:text-sm">
                  Facebook
                </span>
              </a>

              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                  shareUrl
                )}&text=${encodeURIComponent(
                  program.title ||
                    ""
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center space-y-1.5 rounded-xl border border-gray-200 bg-gray-100 p-3.5 text-slate-800 transition hover:bg-gray-200"
              >
                <svg
                  className="mt-0.5 h-5 w-5 fill-current text-slate-900"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>

                <span className="mt-0.5 text-xs font-bold sm:text-sm">
                  Twitter/X
                </span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}