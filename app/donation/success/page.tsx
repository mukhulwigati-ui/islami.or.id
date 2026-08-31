// app/donation/success/page.tsx

"use client";

import React, {
  Suspense,
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  useSearchParams,
} from "next/navigation";

import {
  CheckCircle2,
  Clock3,
  Loader2,
  RefreshCw,
  XCircle,
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

type PageStatus =
  | "loading"
  | "success"
  | "pending"
  | "failed";

interface DonationTransaction {
  orderId?: string;

  transactionId?: string;

  status?: string;

  amount?: number;

  paymentAmount?: number;

  paymentProvider?: string;

  paymentMethod?: string;

  donorName?: string;

  programTitle?: string;

  paidAt?: string | null;

  expiresAt?: string | null;
}

interface DonationStatusResponse {
  success?: boolean;

  message?: string;

  transaction?:
    DonationTransaction | null;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const POLL_INTERVAL_MS =
  3000;

// ============================================================================
// HELPERS
// ============================================================================

function formatRupiah(
  value: number
): string {
  return `Rp ${Number(
    value || 0
  ).toLocaleString(
    "id-ID"
  )}`;
}

function normalizeStatus(
  value: unknown
): PageStatus {
  const status =
    String(
      value || ""
    )
      .trim()
      .toLowerCase();

  if (
    status === "success" ||
    status === "paid"
  ) {
    return "success";
  }

  if (
    status === "failed" ||
    status === "expired" ||
    status === "cancel" ||
    status === "cancelled" ||
    status === "canceled"
  ) {
    return "failed";
  }

  return "pending";
}

function formatPaidAt(
  value?: string | null
): string {
  if (!value) {
    return "-";
  }

  const date =
    new Date(
      value
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "-";
  }

  return new Intl.DateTimeFormat(
    "id-ID",
    {
      dateStyle:
        "medium",

      timeStyle:
        "short",

      timeZone:
        "Asia/Jakarta",
    }
  ).format(date);
}

// ============================================================================
// CONTENT
// ============================================================================

function DonationSuccessContent() {
  const searchParams =
    useSearchParams();

  const orderId =
    searchParams.get(
      "orderId"
    ) ||
    searchParams.get(
      "order_id"
    ) ||
    searchParams.get(
      "id"
    ) ||
    "";

  const [
    status,
    setStatus,
  ] =
    useState<PageStatus>(
      "loading"
    );

  const [
    transaction,
    setTransaction,
  ] =
    useState<
      DonationTransaction | null
    >(null);

  const [
    checking,
    setChecking,
  ] =
    useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState("");

  // ==========================================================================
  // CHECK STATUS
  // ==========================================================================

  const verifyTransaction =
    async (
      silent = false
    ) => {
      if (!orderId) {
        setStatus(
          "pending"
        );

        setErrorMessage(
          "Nomor transaksi tidak ditemukan."
        );

        return;
      }

      if (!silent) {
        setChecking(
          true
        );
      }

      try {
        const response =
          await fetch(
            `/api/donation/status?orderId=${encodeURIComponent(
              orderId
            )}`,
            {
              method:
                "GET",

              cache:
                "no-store",

              headers: {
                Accept:
                  "application/json",
              },
            }
          );

        const json =
          (await response.json()) as DonationStatusResponse;

        if (
          !response.ok
        ) {
          throw new Error(
            json?.message ||
              "Gagal memeriksa status transaksi."
          );
        }

        if (
          !json.success ||
          !json.transaction
        ) {
          setStatus(
            "pending"
          );

          setTransaction(
            null
          );

          return;
        }

        const trx =
          json.transaction;

        setTransaction(
          trx
        );

        setStatus(
          normalizeStatus(
            trx.status
          )
        );

        setErrorMessage(
          ""
        );
      } catch (
        error
      ) {
        console.error(
          "Gagal memverifikasi transaksi:",
          error
        );

        if (
          status ===
          "loading"
        ) {
          setStatus(
            "pending"
          );
        }

        if (!silent) {
          const message =
            error instanceof
            Error
              ? error.message
              : "Gagal memeriksa status pembayaran.";

          setErrorMessage(
            message
          );
        }
      } finally {
        if (!silent) {
          setChecking(
            false
          );
        }
      }
    };

  // ==========================================================================
  // INITIAL CHECK
  // ==========================================================================

  useEffect(() => {
    void verifyTransaction(
      false
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  // ==========================================================================
  // AUTO POLLING WHILE PENDING
  // ==========================================================================

  useEffect(() => {
    if (
      !orderId ||
      status !==
        "pending"
    ) {
      return;
    }

    const interval =
      window.setInterval(
        () => {
          void verifyTransaction(
            true
          );
        },
        POLL_INTERVAL_MS
      );

    return () => {
      window.clearInterval(
        interval
      );
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    orderId,
    status,
  ]);

  // ==========================================================================
  // LOADING
  // ==========================================================================

  if (
    status ===
    "loading"
  ) {
    return (
      <section className="w-full border border-slate-200/80 bg-white p-8 text-center shadow-sm">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#0d5c91]" />

          <div>
            <p className="text-sm font-extrabold text-slate-900">
              Memverifikasi
              Pembayaran
            </p>

            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Sistem sedang
              memeriksa status
              transaksi Anda.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // ==========================================================================
  // VALUES
  // ==========================================================================

  const paymentAmount =
    Number(
      transaction
        ?.paymentAmount ||
        transaction
          ?.amount ||
        0
    );

  const donationAmount =
    Number(
      transaction
        ?.amount ||
        0
    );

  const provider =
    String(
      transaction
        ?.paymentProvider ||
        "casaku"
    ).toLowerCase();

  const paymentMethod =
    String(
      transaction
        ?.paymentMethod ||
        "qris"
    ).toLowerCase();

  const isCasaku =
    provider ===
    "casaku";

  // ==========================================================================
  // SUCCESS
  // ==========================================================================

  if (
    status ===
    "success"
  ) {
    return (
      <section className="w-full border border-slate-200/80 bg-white shadow-sm">
        <div className="p-5 text-center sm:p-6">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <h1 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
            Alhamdulillah!
          </h1>

          <p className="mt-1 text-xs font-extrabold uppercase tracking-wider text-emerald-600 sm:text-sm">
            Donasi Berhasil
            Terverifikasi
          </p>

          <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-slate-600">
            Pembayaran Anda
            telah diterima dan
            diverifikasi oleh
            sistem{" "}
            <strong className="font-semibold text-slate-900">
              islami.or.id
            </strong>
            . Terima kasih atas
            kepercayaan dan
            partisipasi Anda
            dalam program
            kebaikan ini.
          </p>
        </div>

        <div className="border-t border-slate-100">
          <div className="divide-y divide-slate-100 px-5 sm:px-6">
            <div className="flex items-start justify-between gap-4 py-3.5">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                No. Invoice
              </span>

              <span className="break-all text-right font-mono text-xs font-bold text-slate-900">
                {orderId ||
                  "-"}
              </span>
            </div>

            {transaction
              ?.transactionId && (
              <div className="flex items-start justify-between gap-4 py-3.5">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  ID Pembayaran
                </span>

                <span className="max-w-[230px] break-all text-right font-mono text-[11px] font-semibold text-slate-700">
                  {
                    transaction.transactionId
                  }
                </span>
              </div>
            )}

            <div className="flex items-center justify-between gap-4 py-3.5">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Status Dana
              </span>

              <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-black uppercase tracking-wider text-emerald-700">
                Paid / Success
              </span>
            </div>

            {donationAmount >
              0 && (
              <div className="flex items-center justify-between gap-4 py-3.5">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Nominal Donasi
                </span>

                <span className="text-sm font-extrabold text-slate-900">
                  {formatRupiah(
                    donationAmount
                  )}
                </span>
              </div>
            )}

            {paymentAmount >
              0 && (
              <div className="flex items-center justify-between gap-4 py-3.5">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Total Dibayar
                </span>

                <span className="text-sm font-extrabold text-[#0d5c91]">
                  {formatRupiah(
                    paymentAmount
                  )}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between gap-4 py-3.5">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Metode
                Pembayaran
              </span>

              <span className="text-right text-xs font-extrabold uppercase tracking-wide text-slate-800">
                {paymentMethod ===
                "qris"
                  ? "QRIS"
                  : paymentMethod.toUpperCase()}
                {isCasaku
                  ? " • Casaku"
                  : ""}
              </span>
            </div>

            {transaction
              ?.paidAt && (
              <div className="flex items-center justify-between gap-4 py-3.5">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Waktu
                  Pembayaran
                </span>

                <span className="text-right text-xs font-semibold text-slate-700">
                  {formatPaidAt(
                    transaction.paidAt
                  )}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-slate-100 p-5 sm:p-6">
          <Link
            href="/"
            className="block w-full bg-[#0d5c91] py-3.5 text-center text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-sky-900 sm:text-sm"
          >
            Kembali ke
            Beranda
          </Link>

          <Link
            href="/donasi-saya"
            className="mt-2.5 block w-full border border-slate-200 bg-white py-3.5 text-center text-xs font-bold uppercase tracking-wider text-slate-700 transition hover:bg-slate-50 sm:text-sm"
          >
            Lihat Donasi Saya
          </Link>
        </div>
      </section>
    );
  }

  // ==========================================================================
  // FAILED
  // ==========================================================================

  if (
    status ===
    "failed"
  ) {
    return (
      <section className="w-full border border-slate-200/80 bg-white shadow-sm">
        <div className="p-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-600">
            <XCircle className="h-8 w-8" />
          </div>

          <h1 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
            Transaksi Tidak
            Berhasil
          </h1>

          <p className="mt-1 text-xs font-extrabold uppercase tracking-wider text-red-600 sm:text-sm">
            Pembayaran Gagal
            atau Kedaluwarsa
          </p>

          <p className="mt-4 text-sm leading-relaxed text-slate-600">
            Transaksi ini tidak
            dapat diselesaikan.
            Anda dapat kembali
            ke program dan
            membuat pembayaran
            QRIS baru.
          </p>
        </div>

        <div className="divide-y divide-slate-100 border-t border-slate-100 px-5 sm:px-6">
          <div className="flex items-start justify-between gap-4 py-3.5">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              No. Invoice
            </span>

            <span className="break-all text-right font-mono text-xs font-bold text-slate-900">
              {orderId ||
                "-"}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 py-3.5">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Status Dana
            </span>

            <span className="rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-black uppercase tracking-wider text-red-700">
              Failed
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 py-3.5">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Metode
            </span>

            <span className="text-xs font-extrabold uppercase tracking-wide text-slate-800">
              QRIS • Casaku
            </span>
          </div>
        </div>

        <div className="border-t border-slate-100 p-5 sm:p-6">
          <Link
            href="/"
            className="block w-full bg-[#0d5c91] py-3.5 text-center text-xs font-bold uppercase tracking-wider text-white transition hover:bg-sky-900 sm:text-sm"
          >
            Kembali ke
            Beranda
          </Link>
        </div>
      </section>
    );
  }

  // ==========================================================================
  // PENDING
  // ==========================================================================

  return (
    <section className="w-full border border-slate-200/80 bg-white shadow-sm">
      <div className="p-5 text-center sm:p-6">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-amber-600">
          <Clock3 className="h-8 w-8" />
        </div>

        <h1 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
          Menunggu
          Pembayaran
        </h1>

        <p className="mt-1 text-xs font-extrabold uppercase tracking-wider text-amber-600 sm:text-sm">
          Status Belum
          Terverifikasi
        </p>

        <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-slate-600">
          Sistem sedang
          menunggu konfirmasi
          pembayaran QRIS.
          Jika Anda sudah
          membayar, halaman ini
          akan memperbarui
          status secara
          otomatis setelah
          pembayaran
          terdeteksi.
        </p>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-[#0d5c91]">
          <Loader2 className="h-4 w-4 animate-spin" />

          Memantau pembayaran
          secara otomatis...
        </div>
      </div>

      <div className="divide-y divide-slate-100 border-t border-slate-100 px-5 sm:px-6">
        <div className="flex items-start justify-between gap-4 py-3.5">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
            No. Invoice
          </span>

          <span className="break-all text-right font-mono text-xs font-bold text-slate-900">
            {orderId ||
              "-"}
          </span>
        </div>

        {transaction
          ?.transactionId && (
          <div className="flex items-start justify-between gap-4 py-3.5">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              ID Pembayaran
            </span>

            <span className="max-w-[230px] break-all text-right font-mono text-[11px] font-semibold text-slate-700">
              {
                transaction.transactionId
              }
            </span>
          </div>
        )}

        <div className="flex items-center justify-between gap-4 py-3.5">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Status Dana
          </span>

          <span className="rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-black uppercase tracking-wider text-amber-700">
            Pending
          </span>
        </div>

        {paymentAmount >
          0 && (
          <div className="flex items-center justify-between gap-4 py-3.5">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Total
              Pembayaran
            </span>

            <span className="text-sm font-extrabold text-[#0d5c91]">
              {formatRupiah(
                paymentAmount
              )}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between gap-4 py-3.5">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Metode
            Pembayaran
          </span>

          <span className="text-xs font-extrabold uppercase tracking-wide text-slate-800">
            QRIS • Casaku
          </span>
        </div>
      </div>

      <div className="space-y-2.5 border-t border-slate-100 p-5 sm:p-6">
        {errorMessage && (
          <div className="border border-amber-200 bg-amber-50 px-3.5 py-3 text-left text-xs leading-relaxed text-amber-800">
            {
              errorMessage
            }
          </div>
        )}

        <button
          type="button"
          disabled={
            checking
          }
          onClick={() => {
            void verifyTransaction(
              false
            );
          }}
          className="flex w-full items-center justify-center gap-2 border border-slate-200 bg-white py-3.5 text-xs font-bold uppercase tracking-wider text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              checking
                ? "animate-spin"
                : ""
            }`}
          />

          {checking
            ? "Memeriksa..."
            : "Cek Status Sekarang"}
        </button>

        <Link
          href="/"
          className="block w-full bg-[#0d5c91] py-3.5 text-center text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-sky-900 sm:text-sm"
        >
          Kembali ke
          Beranda
        </Link>
      </div>
    </section>
  );
}

// ============================================================================
// PAGE
// ============================================================================

export default function DonationSuccessPage() {
  return (
    <main className="min-h-screen w-full bg-slate-50 pb-28 text-slate-900">
      <div className="mx-auto w-full max-w-md px-3 pt-5">
        <Suspense
          fallback={
            <section className="w-full border border-slate-200/80 bg-white p-8 text-center shadow-sm">
              <div className="flex flex-col items-center justify-center gap-3">
                <Loader2 className="h-9 w-9 animate-spin text-[#0d5c91]" />

                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Memuat Status
                  Transaksi...
                </p>
              </div>
            </section>
          }
        >
          <DonationSuccessContent />
        </Suspense>
      </div>
    </main>
  );
}