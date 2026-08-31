// app/api/payments/casaku/webhook/route.ts

import { NextResponse } from "next/server";
import crypto from "crypto";

import { createClient } from "@sanity/client";

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
// SANITY
// ============================================================================

const sanityClient =
  createClient({
    projectId:
      process.env
        .NEXT_PUBLIC_SANITY_PROJECT_ID ||
      "xqggeww8",

    dataset:
      process.env
        .NEXT_PUBLIC_SANITY_DATASET ||
      "production",

    apiVersion:
      "2024-01-01",

    useCdn: false,

    token:
      process.env
        .SANITY_API_TOKEN,
  });

// ============================================================================
// TYPES
// ============================================================================

interface CasakuWebhookPayload {
  transactionId?: string;

  amount?: number;

  packageName?: string;

  appName?: string;

  status?: string;

  paidAt?: string;
}

interface SanityDonationTransaction {
  _id: string;

  orderId?: string;

  transactionId?: string;

  amount?: number;

  paymentAmount?: number;

  status?: string;

  paidAt?: string;

  paymentProvider?: string;
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

function isValidHexSignature(
  value: string
): boolean {
  // SHA-256 hexadecimal =
  // tepat 64 karakter hex.
  return /^[a-f0-9]{64}$/i.test(
    value
  );
}

function verifySignature({
  rawBody,
  receivedSignature,
  secret,
}: {
  rawBody: string;

  receivedSignature: string;

  secret: string;
}): boolean {
  if (
    !isValidHexSignature(
      receivedSignature
    )
  ) {
    return false;
  }

  const expectedSignature =
    crypto
      .createHmac(
        "sha256",
        secret
      )
      .update(
        rawBody,
        "utf8"
      )
      .digest("hex");

  const receivedBuffer =
    Buffer.from(
      receivedSignature,
      "hex"
    );

  const expectedBuffer =
    Buffer.from(
      expectedSignature,
      "hex"
    );

  if (
    receivedBuffer.length !==
    expectedBuffer.length
  ) {
    return false;
  }

  return crypto.timingSafeEqual(
    receivedBuffer,
    expectedBuffer
  );
}

// ============================================================================
// OPTIONAL SUPABASE SYNC
// ============================================================================

async function syncSupabaseSuccess(
  orderId?: string
) {
  if (!orderId) {
    return;
  }

  const supabaseUrl =
    process.env
      .NEXT_PUBLIC_SUPABASE_URL;

  const serviceRoleKey =
    process.env
      .SUPABASE_SERVICE_ROLE_KEY;

  // Supabase hanya mirror tambahan.
  // Sanity tetap sumber utama.
  if (
    !supabaseUrl ||
    !serviceRoleKey
  ) {
    return;
  }

  try {
    const supabaseAdmin =
      createSupabaseClient(
        supabaseUrl,

        serviceRoleKey,

        {
          auth: {
            autoRefreshToken:
              false,

            persistSession:
              false,
          },
        }
      );

    const {
      error,
    } =
      await supabaseAdmin
        .from(
          "donations"
        )
        .update({
          status:
            "success",
        })
        .eq(
          "invoice_id",
          orderId
        );

    if (error) {
      console.warn(
        "⚠️ Gagal sinkron status Supabase:",
        error.message
      );
    }
  } catch (error) {
    console.warn(
      "⚠️ Sinkronisasi Supabase dilewati:",
      error
    );
  }
}

// ============================================================================
// POST WEBHOOK
// ============================================================================

export async function POST(
  request: Request
) {
  try {
    // ------------------------------------------------------------------------
    // 1. VALIDASI ENVIRONMENT
    // ------------------------------------------------------------------------

    const webhookSecret =
      process.env
        .CASAKU_WEBHOOK_SECRET
        ?.trim();

    const sanityToken =
      process.env
        .SANITY_API_TOKEN
        ?.trim();

    if (!webhookSecret) {
      console.error(
        "❌ CASAKU_WEBHOOK_SECRET belum dikonfigurasi."
      );

      return NextResponse.json(
        {
          success: false,

          message:
            "Server configuration error.",
        },
        {
          status: 500,
        }
      );
    }

    if (!sanityToken) {
      console.error(
        "❌ SANITY_API_TOKEN belum dikonfigurasi."
      );

      return NextResponse.json(
        {
          success: false,

          message:
            "Server configuration error.",
        },
        {
          status: 500,
        }
      );
    }

    // ------------------------------------------------------------------------
    // 2. AMBIL SIGNATURE
    // ------------------------------------------------------------------------

    const receivedSignature =
      request.headers
        .get(
          "x-casaku-signature"
        )
        ?.trim() ||
      "";

    if (
      !receivedSignature
    ) {
      console.warn(
        "⚠️ Webhook Casaku tanpa signature."
      );

      return NextResponse.json(
        {
          success: false,

          message:
            "Missing signature.",
        },
        {
          status: 401,
        }
      );
    }

    // ------------------------------------------------------------------------
    // 3. AMBIL RAW BODY
    //
    // PENTING:
    // JANGAN request.json() sebelum signature diverifikasi.
    // ------------------------------------------------------------------------

    const rawBody =
      await request.text();

    if (!rawBody) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Empty webhook payload.",
        },
        {
          status: 400,
        }
      );
    }

    // ------------------------------------------------------------------------
    // 4. VALIDASI HMAC SHA256
    // ------------------------------------------------------------------------

    const signatureValid =
      verifySignature({
        rawBody,

        receivedSignature,

        secret:
          webhookSecret,
      });

    if (!signatureValid) {
      console.warn(
        "⚠️ Signature webhook Casaku tidak valid."
      );

      return NextResponse.json(
        {
          success: false,

          message:
            "Invalid signature.",
        },
        {
          status: 401,
        }
      );
    }

    // ------------------------------------------------------------------------
    // 5. BARU PARSE JSON
    // ------------------------------------------------------------------------

    let payload:
      CasakuWebhookPayload;

    try {
      payload =
        JSON.parse(
          rawBody
        ) as CasakuWebhookPayload;
    } catch {
      return NextResponse.json(
        {
          success: false,

          message:
            "Invalid JSON payload.",
        },
        {
          status: 400,
        }
      );
    }

    // ------------------------------------------------------------------------
    // 6. VALIDASI PAYLOAD
    // ------------------------------------------------------------------------

    const transactionId =
      cleanText(
        payload.transactionId,
        250
      );

    const webhookStatus =
      cleanText(
        payload.status,
        30
      ).toLowerCase();

    const webhookAmount =
      Number(
        payload.amount ||
          0
      );

    const packageName =
      cleanText(
        payload.packageName,
        150
      );

    const appName =
      cleanText(
        payload.appName,
        150
      );

    const paidAt =
      cleanText(
        payload.paidAt,
        100
      );

    if (!transactionId) {
      return NextResponse.json(
        {
          success: false,

          message:
            "transactionId tidak ditemukan.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      webhookStatus !==
      "paid"
    ) {
      // Dokumentasi Casaku saat ini
      // mengirim webhook ketika transaksi paid.
      //
      // Kalau suatu hari status lain dikirim,
      // jangan otomatis menandainya berhasil.
      console.warn(
        "⚠️ Webhook Casaku dengan status bukan paid:",
        {
          transactionId,

          status:
            webhookStatus,
        }
      );

      return NextResponse.json(
        {
          success: true,

          message:
            "Webhook diterima, tidak ada perubahan status.",
        },
        {
          status: 200,
        }
      );
    }

    if (
      !Number.isFinite(
        webhookAmount
      ) ||
      webhookAmount <=
        0
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Nominal webhook tidak valid.",
        },
        {
          status: 400,
        }
      );
    }

    // ------------------------------------------------------------------------
    // 7. CARI TRANSAKSI SANITY BERDASARKAN CASAKU transactionId
    // ------------------------------------------------------------------------

    const transaction =
      await sanityClient.fetch<SanityDonationTransaction | null>(
        `*[
          _type == "donationTransaction" &&
          transactionId == $transactionId
        ][0]{
          _id,
          orderId,
          transactionId,
          amount,
          paymentAmount,
          status,
          paidAt,
          paymentProvider
        }`,
        {
          transactionId,
        }
      );

    if (!transaction) {
      // Jangan balas 200.
      // Kalau transaksi belum tersimpan karena race condition,
      // biarkan Casaku retry.
      console.error(
        "❌ Transaksi webhook tidak ditemukan di Sanity:",
        transactionId
      );

      return NextResponse.json(
        {
          success: false,

          message:
            "Transaction not found.",
        },
        {
          status: 404,
        }
      );
    }

    // ------------------------------------------------------------------------
    // 8. VERIFIKASI NOMINAL
    // ------------------------------------------------------------------------

    // paymentAmount = nominal setelah unique code.
    //
    // amount = nominal donasi asli.
    //
    // Transaksi Casaku baru seharusnya memiliki paymentAmount.
    const expectedAmount =
      Number(
        transaction.paymentAmount ??
          transaction.amount ??
          0
      );

    if (
      !expectedAmount ||
      expectedAmount !==
        webhookAmount
    ) {
      console.error(
        "❌ NOMINAL WEBHOOK CASAKU TIDAK COCOK:",
        {
          transactionId,

          expectedAmount,

          webhookAmount,
        }
      );

      return NextResponse.json(
        {
          success: false,

          message:
            "Payment amount mismatch.",
        },
        {
          status: 409,
        }
      );
    }

    // ------------------------------------------------------------------------
    // 9. IDEMPOTENCY
    //
    // Casaku dapat retry webhook.
    // Kalau transaksi sudah success, jangan proses ulang.
    // ------------------------------------------------------------------------

    if (
      transaction.status ===
      "success"
    ) {
      console.log(
        "ℹ️ Webhook duplikat diabaikan:",
        transactionId
      );

      // Tetap pastikan mirror Supabase ikut success.
      await syncSupabaseSuccess(
        transaction.orderId
      );

      return NextResponse.json(
        {
          success: true,

          duplicate:
            true,

          message:
            "Transaction already processed.",
        },
        {
          status: 200,
        }
      );
    }

    // ------------------------------------------------------------------------
    // 10. UPDATE SANITY
    // ------------------------------------------------------------------------

    const verifiedPaidAt =
      paidAt ||
      new Date().toISOString();

    await sanityClient
      .patch(
        transaction._id
      )
      .set({
        status:
          "success",

        paymentProvider:
          "casaku",

        paymentMethod:
          "qris",

        paymentVerified:
          true,

        paidAt:
          verifiedPaidAt,

        paidAmount:
          webhookAmount,

        paymentPackageName:
          packageName,

        paymentAppName:
          appName,

        updatedAt:
          new Date().toISOString(),
      })
      .commit();

    // ------------------------------------------------------------------------
    // 11. MIRROR SUPABASE
    // ------------------------------------------------------------------------

    await syncSupabaseSuccess(
      transaction.orderId
    );

    // ------------------------------------------------------------------------
    // 12. SUCCESS
    // ------------------------------------------------------------------------

    console.log(
      "✅ Pembayaran Casaku berhasil diverifikasi:",
      {
        transactionId,

        orderId:
          transaction.orderId,

        amount:
          webhookAmount,
      }
    );

    return NextResponse.json(
      {
        success: true,

        message:
          "Webhook processed.",

        transactionId,

        orderId:
          transaction.orderId ||
          null,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "🔥 Error webhook Casaku:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Internal server error.";

    // 500 sengaja agar Casaku melakukan retry.
    return NextResponse.json(
      {
        success: false,

        message,
      },
      {
        status: 500,
      }
    );
  }
}