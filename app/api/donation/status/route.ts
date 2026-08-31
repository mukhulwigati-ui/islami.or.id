// app/api/donation/status/route.ts

import { NextResponse } from "next/server";

import {
  createClient,
} from "@sanity/client";

import {
  createClient as createSupabaseClient,
} from "@supabase/supabase-js";

// ============================================================================
// NEXT CONFIG
// ============================================================================

export const dynamic =
  "force-dynamic";

export const runtime =
  "nodejs";

// ============================================================================
// CONSTANTS
// ============================================================================

const CASAKU_STATUS_URL =
  "https://api.casaku.id/api/generate/check-status";

// ============================================================================
// TYPES
// ============================================================================

type InternalStatus =
  | "pending"
  | "success"
  | "failed";

type CasakuStatus =
  | "pending"
  | "paid"
  | "expired"
  | "cancel";

interface DonationTransaction {
  _id: string;

  orderId?: string;

  transactionId?: string;

  donorName?: string;

  donorPhone?: string;

  donorEmail?: string;

  amount?: number;

  paymentAmount?: number;

  paidAmount?: number;

  status?: string;

  paymentProvider?: string;

  paymentMethod?: string;

  paidAt?: string | null;

  expiresAt?: string | null;

  paymentVerified?: boolean;

  campaignSlug?: string;

  programTitle?: string;
}

interface CasakuResponseData {
  transactionId?: string;

  status?: string;

  amount?: number;

  totalAmount?: number;

  paidAt?: string | null;

  expiredAt?: string | null;

  packageName?: string;

  appName?: string;

  [key: string]: unknown;
}

interface CasakuResponse {
  success?: boolean;

  message?: string;

  status?: string | number;

  data?: CasakuResponseData;

  transactionId?: string;

  amount?: number;

  totalAmount?: number;

  paidAt?: string | null;

  expiredAt?: string | null;

  [key: string]: unknown;
}

// ============================================================================
// HELPERS
// ============================================================================

function cleanText(
  value: unknown,
  maxLength = 500
): string {
  return String(
    value ?? ""
  )
    .trim()
    .slice(
      0,
      maxLength
    );
}

function normalizeCasakuStatus(
  value: unknown
): CasakuStatus {
  const status =
    cleanText(
      value,
      50
    ).toLowerCase();

  if (
    status === "paid" ||
    status === "success"
  ) {
    return "paid";
  }

  if (
    status === "expired"
  ) {
    return "expired";
  }

  if (
    status === "cancel" ||
    status === "cancelled" ||
    status === "canceled"
  ) {
    return "cancel";
  }

  return "pending";
}

function mapToInternalStatus(
  status: CasakuStatus
): InternalStatus {
  if (
    status === "paid"
  ) {
    return "success";
  }

  if (
    status === "expired" ||
    status === "cancel"
  ) {
    return "failed";
  }

  return "pending";
}

// ============================================================================
// SANITY
// ============================================================================

function getSanityClient() {
  const projectId =
    process.env
      .NEXT_PUBLIC_SANITY_PROJECT_ID
      ?.trim();

  const dataset =
    process.env
      .NEXT_PUBLIC_SANITY_DATASET
      ?.trim() ||
    "production";

  const token =
    process.env
      .SANITY_API_TOKEN
      ?.trim();

  if (!projectId) {
    throw new Error(
      "NEXT_PUBLIC_SANITY_PROJECT_ID belum dikonfigurasi."
    );
  }

  if (!token) {
    throw new Error(
      "SANITY_API_TOKEN belum dikonfigurasi."
    );
  }

  return createClient({
    projectId,

    dataset,

    apiVersion:
      "2026-08-31",

    useCdn: false,

    token,
  });
}

// ============================================================================
// SUPABASE MIRROR
// ============================================================================

async function syncSupabaseStatus({
  orderId,
  status,
}: {
  orderId?: string;

  status: InternalStatus;
}) {
  if (!orderId) {
    return;
  }

  const url =
    process.env
      .NEXT_PUBLIC_SUPABASE_URL
      ?.trim();

  const key =
    process.env
      .SUPABASE_SERVICE_ROLE_KEY
      ?.trim();

  if (
    !url ||
    !key
  ) {
    return;
  }

  try {
    const supabase =
      createSupabaseClient(
        url,
        key,
        {
          auth: {
            persistSession:
              false,

            autoRefreshToken:
              false,
          },
        }
      );

    const {
      error,
    } =
      await supabase
        .from(
          "donations"
        )
        .update({
          status,
        })
        .eq(
          "invoice_id",
          orderId
        );

    if (error) {
      console.warn(
        "Supabase status sync gagal:",
        error.message
      );
    }
  } catch (
    error
  ) {
    console.warn(
      "Supabase status sync error:",
      error
    );
  }
}

// ============================================================================
// CASAKU CHECK STATUS
// ============================================================================

async function checkCasaku(
  transactionId: string
): Promise<{
  status: CasakuStatus;

  amount: number;

  paidAt: string | null;

  expiredAt: string | null;

  packageName: string;

  appName: string;
}> {
  const licenseKey =
    process.env
      .CASAKU_LICENSE_KEY
      ?.trim();

  if (!licenseKey) {
    throw new Error(
      "CASAKU_LICENSE_KEY belum dikonfigurasi."
    );
  }

  const controller =
    new AbortController();

  const timeout =
    setTimeout(
      () =>
        controller.abort(),
      12_000
    );

  try {
    const response =
      await fetch(
        CASAKU_STATUS_URL,
        {
          method:
            "POST",

          headers: {
            "Content-Type":
              "application/json",

            Accept:
              "application/json",

            "x-license-key":
              licenseKey,
          },

          body:
            JSON.stringify({
              transactionId,
            }),

          cache:
            "no-store",

          signal:
            controller.signal,
        }
      );

    const contentType =
      response.headers.get(
        "content-type"
      ) || "";

    const raw =
      await response.text();

    if (
      !contentType.includes(
        "application/json"
      )
    ) {
      console.error(
        "Casaku mengembalikan non-JSON:",
        {
          status:
            response.status,

          contentType,

          preview:
            raw.slice(
              0,
              150
            ),
        }
      );

      throw new Error(
        "Respons status Casaku tidak valid."
      );
    }

    let json:
      | CasakuResponse
      | null = null;

    try {
      json =
        JSON.parse(
          raw
        ) as CasakuResponse;
    } catch {
      throw new Error(
        "Respons JSON Casaku tidak dapat dibaca."
      );
    }

    if (
      !response.ok
    ) {
      throw new Error(
        cleanText(
          json?.message
        ) ||
          `Casaku HTTP ${response.status}`
      );
    }

    const data =
      json?.data &&
      typeof json.data ===
        "object"
        ? json.data
        : (json as CasakuResponseData);

    const returnedTransactionId =
      cleanText(
        data?.transactionId
      );

    if (
      returnedTransactionId &&
      returnedTransactionId !==
        transactionId
    ) {
      throw new Error(
        "Transaction ID Casaku tidak cocok."
      );
    }

    const amount =
      Number(
        data?.totalAmount ??
          data?.amount ??
          0
      );

    return {
      status:
        normalizeCasakuStatus(
          data?.status
        ),

      amount:
        Number.isFinite(
          amount
        )
          ? amount
          : 0,

      paidAt:
        cleanText(
          data?.paidAt,
          100
        ) || null,

      expiredAt:
        cleanText(
          data?.expiredAt,
          100
        ) || null,

      packageName:
        cleanText(
          data?.packageName,
          200
        ),

      appName:
        cleanText(
          data?.appName,
          200
        ),
    };
  } finally {
    clearTimeout(
      timeout
    );
  }
}

// ============================================================================
// GET
// ============================================================================

export async function GET(
  request: Request
) {
  try {
    const url =
      new URL(
        request.url
      );

    const orderId =
      cleanText(
        url.searchParams.get(
          "orderId"
        ),
        250
      );

    if (!orderId) {
      return NextResponse.json(
        {
          success: false,

          message:
            "orderId wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    const sanity =
      getSanityClient();

    // ------------------------------------------------------------------------
    // 1. AMBIL TRANSAKSI DARI SANITY
    // ------------------------------------------------------------------------

    let transaction =
      await sanity.fetch<DonationTransaction | null>(
        `*[
          _type == "donationTransaction" &&
          orderId == $orderId
        ][0]{
          _id,
          orderId,
          transactionId,
          donorName,
          donorPhone,
          donorEmail,
          amount,
          paymentAmount,
          paidAmount,
          status,
          paymentProvider,
          paymentMethod,
          paidAt,
          expiresAt,
          paymentVerified,
          campaignSlug,
          "programTitle": programName->title
        }`,
        {
          orderId,
        }
      );

    if (!transaction) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Transaksi tidak ditemukan.",

          transaction:
            null,
        },
        {
          status: 404,
        }
      );
    }

    // ------------------------------------------------------------------------
    // 2. JIKA SUDAH SUCCESS, TIDAK PERLU HUBUNGI CASAKU
    // ------------------------------------------------------------------------

    if (
      transaction.status ===
      "success"
    ) {
      return NextResponse.json(
        {
          success: true,

          transaction,
        },
        {
          status: 200,
        }
      );
    }

    // ------------------------------------------------------------------------
    // 3. JIKA TRANSAKSI CASAKU MASIH PENDING, CEK CASAKU
    // ------------------------------------------------------------------------

    const transactionId =
      cleanText(
        transaction.transactionId,
        250
      );

    const provider =
      cleanText(
        transaction.paymentProvider,
        50
      ).toLowerCase();

    if (
      transactionId &&
      (
        provider ===
          "casaku" ||
        transactionId.startsWith(
          "ISLAMI-"
        ) ||
        transactionId.startsWith(
          "CSK-"
        )
      )
    ) {
      try {
        const casaku =
          await checkCasaku(
            transactionId
          );

        const internalStatus =
          mapToInternalStatus(
            casaku.status
          );

        const expectedAmount =
          Number(
            transaction.paymentAmount ??
              transaction.amount ??
              0
          );

        // --------------------------------------------------------------------
        // 4. JIKA CASAKU MEMBERIKAN NOMINAL, WAJIB COCOK
        // --------------------------------------------------------------------

        if (
          casaku.amount >
            0 &&
          expectedAmount >
            0 &&
          casaku.amount !==
            expectedAmount
        ) {
          console.error(
            "Nominal Casaku tidak cocok:",
            {
              orderId,

              transactionId,

              expectedAmount,

              casakuAmount:
                casaku.amount,
            }
          );

          return NextResponse.json(
            {
              success: false,

              message:
                "Nominal pembayaran tidak cocok.",

              transaction,
            },
            {
              status: 409,
            }
          );
        }

        // --------------------------------------------------------------------
        // 5. UPDATE SANITY JIKA STATUS BERUBAH
        // --------------------------------------------------------------------

        if (
          internalStatus !==
          transaction.status
        ) {
          const patch: Record<
            string,
            unknown
          > = {
            status:
              internalStatus,

            paymentProvider:
              "casaku",

            paymentMethod:
              "qris",

            updatedAt:
              new Date().toISOString(),
          };

          if (
            internalStatus ===
            "success"
          ) {
            patch.paymentVerified =
              true;

            patch.paidAt =
              casaku.paidAt ||
              new Date().toISOString();

            patch.paidAmount =
              expectedAmount;

            if (
              casaku.packageName
            ) {
              patch.paymentPackageName =
                casaku.packageName;
            }

            if (
              casaku.appName
            ) {
              patch.paymentAppName =
                casaku.appName;
            }
          }

          if (
            casaku.expiredAt
          ) {
            patch.expiresAt =
              casaku.expiredAt;
          }

          await sanity
            .patch(
              transaction._id
            )
            .set(
              patch
            )
            .commit();

          await syncSupabaseStatus({
            orderId,

            status:
              internalStatus,
          });

          // Ambil ulang agar response berisi data terbaru.
          transaction =
            await sanity.fetch<DonationTransaction | null>(
              `*[
                _type == "donationTransaction" &&
                orderId == $orderId
              ][0]{
                _id,
                orderId,
                transactionId,
                donorName,
                donorPhone,
                donorEmail,
                amount,
                paymentAmount,
                paidAmount,
                status,
                paymentProvider,
                paymentMethod,
                paidAt,
                expiresAt,
                paymentVerified,
                campaignSlug,
                "programTitle": programName->title
              }`,
              {
                orderId,
              }
            );
        }
      } catch (
        casakuError
      ) {
        // Jangan membuat seluruh halaman error jika Casaku
        // sedang timeout. Kita masih bisa mengembalikan
        // status terakhir dari Sanity.
        console.warn(
          "Casaku status check gagal:",
          casakuError
        );
      }
    }

    // ------------------------------------------------------------------------
    // 6. RESPONSE SELALU JSON
    // ------------------------------------------------------------------------

    return NextResponse.json(
      {
        success: true,

        transaction,
      },
      {
        status: 200,

        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  } catch (
    error
  ) {
    console.error(
      "Donation status route error:",
      error
    );

    const message =
      error instanceof
      Error
        ? error.message
        : "Terjadi kesalahan sistem.";

    // PENTING:
    // route API harus tetap mengembalikan JSON,
    // jangan sampai halaman HTML error Next.js bocor ke frontend.
    return NextResponse.json(
      {
        success: false,

        message,

        transaction:
          null,
      },
      {
        status: 500,
      }
    );
  }
}