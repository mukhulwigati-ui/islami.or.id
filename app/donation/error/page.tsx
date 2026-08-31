// app/donation/error/page.tsx

"use client";

import React, {
  Suspense,
} from "react";

import Link from "next/link";

import {
  useSearchParams,
} from "next/navigation";

import {
  AlertTriangle,
  Home,
  RefreshCw,
} from "lucide-react";

// ============================================================================
// CONTENT
// ============================================================================

function DonationErrorContent() {
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

  const reason =
    searchParams.get(
      "reason"
    ) ||
    searchParams.get(
      "message"
    ) ||
    "";

  return (
    <section className="w-full border border-slate-200/80 bg-white shadow-sm">
      <div className="p-6 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-600">
          <AlertTriangle className="h-8 w-8" />
        </div>

        <h1 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
          Pembayaran Belum
          Selesai
        </h1>

        <p className="mt-1 text-xs font-extrabold uppercase tracking-wider text-rose-600 sm:text-sm">
          Transaksi Tidak
          Berhasil Diproses
        </p>

        <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-slate-600">
          Pembayaran QRIS
          belum berhasil
          diselesaikan atau
          transaksi telah
          dibatalkan. Jika
          Anda masih ingin
          berdonasi, silakan
          kembali ke program
          dan buat transaksi
          QRIS baru.
        </p>

        {reason && (
          <div className="mt-4 border border-amber-200 bg-amber-50 px-4 py-3 text-left">
            <p className="text-[11px] font-bold uppercase tracking-wide text-amber-700">
              Informasi
            </p>

            <p className="mt-1 text-xs leading-relaxed text-amber-800">
              {reason}
            </p>
          </div>
        )}
      </div>

      <div className="divide-y divide-slate-100 border-t border-slate-100 px-5 sm:px-6">
        <div className="flex items-start justify-between gap-4 py-3.5">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
            No. Invoice
          </span>

          <span className="max-w-[220px] break-all text-right font-mono text-xs font-bold text-slate-900">
            {orderId || "-"}
          </span>
        </div>

        <div className="flex items-center justify-between gap-4 py-3.5">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Status
          </span>

          <span className="rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-black uppercase tracking-wider text-rose-700">
            Gagal / Dibatalkan
          </span>
        </div>

        <div className="flex items-center justify-between gap-4 py-3.5">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Metode
          </span>

          <span className="text-right text-xs font-extrabold uppercase tracking-wide text-slate-800">
            QRIS • Casaku
          </span>
        </div>
      </div>

      <div className="space-y-2.5 border-t border-slate-100 p-5 sm:p-6">
        <Link
          href="/"
          className="flex w-full items-center justify-center gap-2 bg-[#0d5c91] py-3.5 text-center text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-sky-900 sm:text-sm"
        >
          <Home className="h-4 w-4" />

          Kembali ke
          Beranda
        </Link>

        <button
          type="button"
          onClick={() => {
            if (
              typeof window !==
              "undefined"
            ) {
              window.history.back();
            }
          }}
          className="flex w-full items-center justify-center gap-2 border border-slate-200 bg-white py-3.5 text-xs font-bold uppercase tracking-wider text-slate-700 transition hover:bg-slate-50 sm:text-sm"
        >
          <RefreshCw className="h-4 w-4" />

          Coba Donasi Lagi
        </button>
      </div>
    </section>
  );
}

// ============================================================================
// PAGE
// ============================================================================

export default function DonationErrorPage() {
  return (
    <main className="min-h-screen w-full bg-slate-50 pb-28 text-slate-900">
      <div className="mx-auto flex min-h-[calc(100vh-7rem)] w-full max-w-md items-center px-3 py-6">
        <Suspense
          fallback={
            <section className="w-full border border-slate-200/80 bg-white p-8 text-center shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Memuat
                informasi
                transaksi...
              </p>
            </section>
          }
        >
          <DonationErrorContent />
        </Suspense>
      </div>
    </main>
  );
}