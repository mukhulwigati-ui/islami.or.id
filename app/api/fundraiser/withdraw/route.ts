// app/api/fundraiser/withdraw/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import {
  createServerClient,
} from "@supabase/ssr";

import {
  createClient,
} from "@sanity/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// ==========================================================
// KONFIGURASI
// ==========================================================

const DEFAULT_COMMISSION_RATE = 0.1; // 10%

const MINIMUM_WITHDRAWAL = Number(
  process.env.FUNDRAISER_MIN_WITHDRAWAL ||
    50000
);

const WITHDRAWAL_ENABLED =
  process.env.FUNDRAISER_WITHDRAWAL_ENABLED !==
  "false";

// ==========================================================
// SANITY
// ==========================================================

const SANITY_WRITE_TOKEN =
  process.env.SANITY_API_WRITE_TOKEN ||
  process.env.SANITY_API_TOKEN;

const sanity = createClient({
  projectId:
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
    "xqggeww8",

  dataset:
    process.env.NEXT_PUBLIC_SANITY_DATASET ||
    "production",

  apiVersion: "2024-01-01",

  useCdn: false,

  token: SANITY_WRITE_TOKEN,
});

// ==========================================================
// TYPES
// ==========================================================

type RequestBody = {
  amount?: number | string;
  note?: string;

  /**
   * Boleh masih dikirim frontend lama,
   * tetapi TIDAK digunakan sebagai identitas.
   */
  phone?: string;
};

type SanityFundraiser = {
  _id?: string;

  name?: string;
  phone?: string;
  status?: string;

  feePaid?: number;
  commissionRate?: number;

  bankName?: string;
  accountName?: string;
  accountNumber?: string;
};

type WithdrawalItem = {
  amount?: number;
  status?: string;
};

type QueryResult = {
  fundraiser?: SanityFundraiser | null;

  donations?: {
    amount?: number;
  }[];

  withdrawals?: WithdrawalItem[];

  activeWithdrawal?: {
    _id?: string;
    amount?: number;
    status?: string;
    requestedAt?: string;
  } | null;
};

// ==========================================================
// HELPERS
// ==========================================================

function normalizePhone(
  input: string
) {
  const raw =
    String(input || "").trim();

  const digits =
    raw.replace(/[^0-9]/g, "");

  let international =
    digits;

  if (
    digits.startsWith("0")
  ) {
    international =
      `62${digits.slice(1)}`;
  } else if (
    digits.startsWith("8")
  ) {
    international =
      `62${digits}`;
  }

  let local =
    digits;

  if (
    international.startsWith(
      "62"
    )
  ) {
    local =
      `0${international.slice(2)}`;
  }

  const plus =
    international
      ? `+${international}`
      : "";

  const variants =
    Array.from(
      new Set(
        [
          raw,
          digits,
          international,
          local,
          plus,
        ].filter(Boolean)
      )
    );

  return {
    raw,
    digits,
    international,
    local,
    plus,
    variants,
  };
}

// ==========================================================
// COMMISSION RATE
// ==========================================================

function normalizeCommissionRate(
  input?: number | null
) {
  const rate =
    Number(input);

  if (
    !Number.isFinite(rate) ||
    rate <= 0
  ) {
    return DEFAULT_COMMISSION_RATE;
  }

  // 10 = 10%
  if (rate > 1) {
    return Math.min(
      rate / 100,
      1
    );
  }

  // 0.1 = 10%
  return Math.min(
    rate,
    1
  );
}

// ==========================================================
// VALUE PICKERS
// ==========================================================

function pickString(
  object: Record<
    string,
    any
  > | null | undefined,

  keys: string[]
) {
  if (!object) {
    return "";
  }

  for (
    const key of keys
  ) {
    const value =
      object[key];

    if (
      typeof value ===
        "string" &&
      value.trim()
    ) {
      return value.trim();
    }
  }

  return "";
}

function pickNumber(
  object: Record<
    string,
    any
  > | null | undefined,

  keys: string[]
) {
  if (!object) {
    return undefined;
  }

  for (
    const key of keys
  ) {
    const value =
      Number(object[key]);

    if (
      Number.isFinite(value)
    ) {
      return value;
    }
  }

  return undefined;
}

// ==========================================================
// PARSE NOMINAL
// ==========================================================

function parseAmount(
  input: unknown
) {
  if (
    typeof input ===
    "number"
  ) {
    if (
      Number.isSafeInteger(
        input
      ) &&
      input > 0
    ) {
      return input;
    }

    return null;
  }

  const raw =
    String(input || "")
      .trim()
      .replace(/^rp\s*/i, "")
      .replace(/[.\s]/g, "");

  if (
    !/^\d+$/.test(raw)
  ) {
    return null;
  }

  const amount =
    Number(raw);

  if (
    !Number.isSafeInteger(
      amount
    ) ||
    amount <= 0
  ) {
    return null;
  }

  return amount;
}

// ==========================================================
// MASK REKENING
// ==========================================================

function maskAccountNumber(
  value?: string
) {
  if (!value) {
    return undefined;
  }

  const clean =
    String(value).replace(
      /\s+/g,
      ""
    );

  if (
    clean.length <= 4
  ) {
    return clean;
  }

  return `${"*".repeat(
    clean.length - 4
  )}${clean.slice(-4)}`;
}

// ==========================================================
// NO CACHE RESPONSE
// ==========================================================

function jsonNoStore(
  body: unknown,
  status = 200
) {
  return NextResponse.json(
    body,
    {
      status,

      headers: {
        "Cache-Control":
          "no-store, no-cache, max-age=0, must-revalidate",

        Pragma:
          "no-cache",

        Expires:
          "0",
      },
    }
  );
}

// ==========================================================
// POST
// ==========================================================

export async function POST(
  request: Request
) {
  try {
    // ======================================================
    // 1. CEK FITUR WITHDRAWAL
    // ======================================================

    if (
      !WITHDRAWAL_ENABLED
    ) {
      return jsonNoStore(
        {
          success: false,

          message:
            "Pengajuan penarikan komisi sedang dinonaktifkan.",
        },
        403
      );
    }

    // ======================================================
    // 2. CEK ENV
    // ======================================================

    if (
      !process.env
        .NEXT_PUBLIC_SUPABASE_URL ||
      !process.env
        .NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      console.error(
        "🔥 Konfigurasi Supabase belum lengkap."
      );

      return jsonNoStore(
        {
          success: false,

          message:
            "Konfigurasi autentikasi server belum lengkap.",
        },
        500
      );
    }

    if (
      !SANITY_WRITE_TOKEN
    ) {
      console.error(
        "🔥 SANITY_API_WRITE_TOKEN / SANITY_API_TOKEN belum tersedia."
      );

      return jsonNoStore(
        {
          success: false,

          message:
            "Konfigurasi pencairan komisi belum lengkap.",
        },
        500
      );
    }

    // ======================================================
    // 3. SUPABASE SERVER CLIENT
    // ======================================================

    const cookieStore =
      await cookies();

    const supabase =
      createServerClient(
        process.env
          .NEXT_PUBLIC_SUPABASE_URL,

        process.env
          .NEXT_PUBLIC_SUPABASE_ANON_KEY,

        {
          cookies: {
            getAll() {
              return cookieStore.getAll();
            },

            setAll(
              cookiesToSet
            ) {
              try {
                cookiesToSet.forEach(
                  ({
                    name,
                    value,
                    options,
                  }) => {
                    cookieStore.set(
                      name,
                      value,
                      options
                    );
                  }
                );
              } catch {
                /**
                 * Aman diabaikan jika cookie
                 * tidak bisa di-set pada context
                 * tertentu.
                 */
              }
            },
          },
        }
      );

    // ======================================================
    // 4. VERIFIKASI USER LOGIN
    // ======================================================

    const {
      data: {
        user,
      },

      error:
        authError,
    } =
      await supabase.auth.getUser();

    if (
      authError ||
      !user
    ) {
      return jsonNoStore(
        {
          success: false,

          message:
            "Silakan login terlebih dahulu untuk mengajukan penarikan.",
        },
        401
      );
    }

    // ======================================================
    // 5. AMBIL PROFILE SUPABASE
    // ======================================================

    const {
      data:
        supabaseProfile,

      error:
        profileError,
    } =
      await supabase
        .from("profiles")
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
        "🔥 Fundraiser profile error:",
        profileError
      );

      return jsonNoStore(
        {
          success: false,

          message:
            "Profil pengguna tidak berhasil dibaca.",
        },
        500
      );
    }

    if (
      !supabaseProfile
    ) {
      return jsonNoStore(
        {
          success: false,

          message:
            "Profil pengguna tidak ditemukan.",
        },
        404
      );
    }

    // ======================================================
    // 6. NOMOR WA DIAMBIL DARI DATABASE
    // ======================================================

    const profilePhone =
      pickString(
        supabaseProfile,
        [
          "phone",
          "whatsapp",
          "whatsapp_number",
          "phone_number",
        ]
      );

    if (
      !profilePhone
    ) {
      return jsonNoStore(
        {
          success: false,

          message:
            "Nomor WhatsApp belum tersedia di profil Anda.",
        },
        400
      );
    }

    const normalized =
      normalizePhone(
        profilePhone
      );

    if (
      !normalized.digits ||
      normalized.digits
        .length < 8
    ) {
      return jsonNoStore(
        {
          success: false,

          message:
            "Nomor WhatsApp pada profil tidak valid.",
        },
        400
      );
    }

    // ======================================================
    // 7. PARSE REQUEST
    // ======================================================

    let body:
      RequestBody;

    try {
      body =
        await request.json();
    } catch {
      return jsonNoStore(
        {
          success: false,

          message:
            "Format permintaan tidak valid.",
        },
        400
      );
    }

    const amount =
      parseAmount(
        body.amount
      );

    if (!amount) {
      return jsonNoStore(
        {
          success: false,

          message:
            "Nominal penarikan tidak valid.",
        },
        400
      );
    }

    if (
      amount <
      MINIMUM_WITHDRAWAL
    ) {
      return jsonNoStore(
        {
          success: false,

          message:
            `Minimal penarikan adalah Rp ${MINIMUM_WITHDRAWAL.toLocaleString(
              "id-ID"
            )}.`,
        },
        400
      );
    }

    const cleanNote =
      String(
        body.note || ""
      )
        .trim()
        .slice(
          0,
          500
        );

    // ======================================================
    // 8. QUERY SALDO SERVER-SIDE
    // ======================================================

    const query = `
      {
        "fundraiser": *[
          _type == "fundraiser" &&
          !(_id in path("drafts.**")) &&
          phone in $phones
        ][0] {
          _id,
          name,
          phone,
          status,

          feePaid,
          commissionRate,

          bankName,
          accountName,
          accountNumber
        },

        "donations": *[
          (
            _type == "donationStatus" ||
            _type == "donationTransaction"
          ) &&

          (
            status == "success" ||
            status == "paid" ||
            status == "settlement" ||
            status == "capture"
          ) &&

          fundraiserPhone in $phones
        ] {
          amount
        },

        "withdrawals": *[
          _type == "fundraiserWithdrawal" &&
          !(_id in path("drafts.**")) &&

          (
            fundraiserPhone in $phones ||
            fundraiser->phone in $phones
          )
        ] {
          amount,
          status
        },

        "activeWithdrawal": *[
          _type == "fundraiserWithdrawal" &&
          !(_id in path("drafts.**")) &&

          (
            fundraiserPhone in $phones ||
            fundraiser->phone in $phones
          ) &&

          (
            status == "pending" ||
            status == "approved"
          )
        ]
        | order(
            coalesce(
              requestedAt,
              _createdAt
            ) desc
          )[0] {

          _id,
          amount,
          status,

          "requestedAt":
            coalesce(
              requestedAt,
              _createdAt
            )
        }
      }
    `;

    const data =
      await sanity.fetch<QueryResult>(
        query,

        {
          phones:
            normalized.variants,
        }
      );

    // ======================================================
    // 9. SATU WITHDRAWAL AKTIF SAJA
    // ======================================================
    //
    // Lebih aman untuk sistem transfer manual:
    //
    // pending / approved harus diselesaikan dahulu.
    //
    // ======================================================

    if (
      data?.activeWithdrawal
    ) {
      const activeAmount =
        Number(
          data
            .activeWithdrawal
            .amount || 0
        );

      return jsonNoStore(
        {
          success: false,

          message:
            `Masih ada pengajuan penarikan ${activeAmount > 0
              ? `sebesar Rp ${activeAmount.toLocaleString(
                  "id-ID"
                )} `
              : ""
            }yang belum selesai. Tunggu sampai pembayaran selesai atau pengajuan ditolak.`,

          activeWithdrawal:
            data.activeWithdrawal,
        },
        409
      );
    }

    // ======================================================
    // 10. CEK STATUS FUNDRAISER SANITY
    // ======================================================

    const sanityFundraiser =
      data?.fundraiser;

    const sanityStatus =
      String(
        sanityFundraiser
          ?.status || ""
      ).toLowerCase();

    if (
      [
        "rejected",
        "blocked",
        "inactive",
        "suspended",
      ].includes(
        sanityStatus
      )
    ) {
      return jsonNoStore(
        {
          success: false,

          message:
            "Akun fundraiser sedang tidak aktif.",
        },
        403
      );
    }

    // ======================================================
    // 11. HITUNG TOTAL DONASI
    // ======================================================

    const donations =
      Array.isArray(
        data?.donations
      )
        ? data.donations
        : [];

    const totalEarnings =
      donations.reduce(
        (
          total,
          item
        ) => {
          const value =
            Number(
              item.amount ||
                0
            );

          if (
            !Number.isFinite(
              value
            ) ||
            value <= 0
          ) {
            return total;
          }

          return (
            total +
            value
          );
        },
        0
      );

    // ======================================================
    // 12. COMMISSION RATE
    // ======================================================

    const supabaseRate =
      pickNumber(
        supabaseProfile,
        [
          "commission_rate",
          "commissionRate",
          "fundraiser_commission",
          "fundraiser_commission_rate",
        ]
      );

    const commissionRate =
      normalizeCommissionRate(
        sanityFundraiser
          ?.commissionRate ??
          supabaseRate
      );

    const totalCommission =
      Math.max(
        0,

        Math.round(
          totalEarnings *
            commissionRate
        )
      );

    // ======================================================
    // 13. WITHDRAWAL HISTORY
    // ======================================================

    const withdrawals =
      Array.isArray(
        data?.withdrawals
      )
        ? data.withdrawals
        : [];

    let paidFromHistory =
      0;

    let pendingWithdrawal =
      0;

    for (
      const item of withdrawals
    ) {
      const value =
        Number(
          item.amount || 0
        );

      if (
        !Number.isFinite(
          value
        ) ||
        value <= 0
      ) {
        continue;
      }

      const status =
        String(
          item.status ||
            ""
        ).toLowerCase();

      if (
        status ===
          "paid" ||
        status ===
          "completed"
      ) {
        paidFromHistory +=
          value;
      }

      if (
        status ===
          "pending" ||
        status ===
          "approved"
      ) {
        pendingWithdrawal +=
          value;
      }
    }

    // ======================================================
    // 14. LEGACY feePaid
    // ======================================================

    const supabaseFeePaid =
      pickNumber(
        supabaseProfile,
        [
          "fee_paid",
          "feePaid",
        ]
      );

    const legacyFeePaid =
      Math.max(
        0,

        Number(
          sanityFundraiser
            ?.feePaid ??
            supabaseFeePaid ??
            0
        )
      );

    /**
     * Jangan dijumlahkan supaya tidak double-count.
     */
    const totalWithdrawn =
      Math.max(
        legacyFeePaid,
        paidFromHistory
      );

    // ======================================================
    // 15. SALDO TERSEDIA
    // ======================================================

    const availableCommission =
      Math.max(
        0,

        totalCommission -
          totalWithdrawn -
          pendingWithdrawal
      );

    if (
      availableCommission <=
      0
    ) {
      return jsonNoStore(
        {
          success: false,

          message:
            "Belum ada saldo komisi yang tersedia untuk dicairkan.",

          availableCommission,
        },
        400
      );
    }

    if (
      amount >
      availableCommission
    ) {
      return jsonNoStore(
        {
          success: false,

          message:
            `Nominal penarikan melebihi saldo tersedia. Saldo saat ini Rp ${availableCommission.toLocaleString(
              "id-ID"
            )}.`,

          availableCommission,
        },
        400
      );
    }

    // ======================================================
    // 16. DATA REKENING
    // ======================================================
    //
    // Utamakan data profil Supabase karena user login
    // mengelola akun islami.or.id dari sana.
    //
    // Fallback ke Sanity fundraiser.
    //
    // ======================================================

    const bankName =
      pickString(
        supabaseProfile,
        [
          "bank_name",
          "bankName",
          "bank",
        ]
      ) ||
      sanityFundraiser
        ?.bankName ||
      "";

    const accountNumber =
      pickString(
        supabaseProfile,
        [
          "account_number",
          "accountNumber",
          "bank_account_number",
          "rekening",
          "nomor_rekening",
        ]
      ) ||
      sanityFundraiser
        ?.accountNumber ||
      "";

    const accountName =
      pickString(
        supabaseProfile,
        [
          "account_name",
          "accountName",
          "bank_account_name",
          "nama_rekening",
        ]
      ) ||
      sanityFundraiser
        ?.accountName ||
      "";

    if (
      !bankName ||
      !accountNumber ||
      !accountName
    ) {
      return jsonNoStore(
        {
          success: false,

          message:
            "Data rekening pencairan belum lengkap. Lengkapi nama bank, nomor rekening, dan nama pemilik rekening terlebih dahulu.",
        },
        400
      );
    }

    // ======================================================
    // 17. NAMA FUNDRAISER
    // ======================================================

    const fundraiserName =
      pickString(
        supabaseProfile,
        [
          "full_name",
          "name",
          "display_name",
          "username",
        ]
      ) ||
      sanityFundraiser
        ?.name ||
      user.email ||
      "Fundraiser";

    // ======================================================
    // 18. LOCK UNTUK MENCEGAH REQUEST BERSAMAAN
    // ======================================================
    //
    // Ini dokumen internal Sanity.
    //
    // Tidak perlu ditampilkan di Studio.
    //
    // Dua request yang masuk bersamaan akan memakai
    // revision lock yang sama. Hanya satu yang berhasil.
    //
    // ======================================================

    const lockId =
      `fundraiserWithdrawalLock-${user.id}`;

    const now =
      new Date().toISOString();

    await sanity.createIfNotExists({
      _id: lockId,

      _type:
        "fundraiserWithdrawalLock",

      userId:
        user.id,

      fundraiserPhone:
        normalized.international,

      createdAt:
        now,

      updatedAt:
        now,
    });

    const lock =
      await sanity.fetch<{
        _rev?: string;
      } | null>(
        `*[_id == $lockId][0]{_rev}`,
        {
          lockId,
        }
      );

    if (
      !lock?._rev
    ) {
      throw new Error(
        "Withdrawal lock tidak ditemukan."
      );
    }

    // ======================================================
    // 19. DOKUMEN WITHDRAWAL
    // ======================================================

    const withdrawalDocument:
      Record<
        string,
        any
      > = {
      _type:
        "fundraiserWithdrawal",

      // ===============================================
      // IDENTITAS USER
      // ===============================================

      userId:
        user.id,

      fundraiserName,

      fundraiserPhone:
        normalized.international,

      // ===============================================
      // REFERENCE SANITY
      // Jika profil fundraiser Sanity tersedia
      // ===============================================

      ...(sanityFundraiser
        ? {
            fundraiser: {
              _type:
                "reference",

              _ref:
                sanityFundraiser._id,
            },
          }
        : {}),

      // ===============================================
      // PENARIKAN
      // ===============================================

      amount,

      status:
        "pending",

      requestedAt:
        now,

      // ===============================================
      // SNAPSHOT REKENING
      // ===============================================

      bankName,

      accountNumber,

      accountName,

      // ===============================================
      // CATATAN
      // ===============================================

      ...(cleanNote
        ? {
            note:
              cleanNote,
          }
        : {}),

      // ===============================================
      // AUDIT SALDO
      // ===============================================

      commissionSnapshot: {
        totalEarnings,

        commissionRate,

        totalCommission,

        totalWithdrawn,

        pendingBefore:
          pendingWithdrawal,

        availableBefore:
          availableCommission,

        requestedAmount:
          amount,

        availableAfter:
          Math.max(
            0,

            availableCommission -
              amount
          ),
      },
    };

    // ======================================================
    // 20. TRANSACTION
    // ======================================================
    //
    // Create withdrawal + update lock dalam satu transaksi.
    //
    // ======================================================

    const transaction =
      sanity.transaction();

    transaction.create(
      withdrawalDocument
    );

    transaction.patch(
      lockId,

      (patch) =>
        patch
          .ifRevisionId(
            lock._rev!
          )
          .set({
            updatedAt:
              now,

            lastRequestAt:
              now,

            lastWithdrawalAmount:
              amount,
          })
    );

    const result =
      await transaction.commit({
        visibility:
          "sync",
      });

    // ======================================================
    // 21. ID DOKUMEN BARU
    // ======================================================

    const created =
      result.results?.find(
        (
          item: any
        ) =>
          item.operation ===
          "create"
      );

    // ======================================================
    // 22. SUCCESS
    // ======================================================

    return jsonNoStore(
      {
        success: true,

        message:
          "Pengajuan penarikan berhasil dikirim. Admin akan memeriksa dan memproses pembayaran Anda.",

        withdrawal: {
          _id:
            created?.id ||
            null,

          amount,

          status:
            "pending",

          requestedAt:
            now,

          bankName,

          accountName,

          accountNumber:
            maskAccountNumber(
              accountNumber
            ),
        },

        balances: {
          totalEarnings,

          commissionRate,

          totalCommission,

          totalWithdrawn,

          pendingWithdrawal:
            pendingWithdrawal +
            amount,

          availableCommission:
            Math.max(
              0,

              availableCommission -
                amount
            ),
        },
      },
      201
    );
  } catch (
    error: any
  ) {
    console.error(
      "🔥 Fundraiser Withdrawal API Error:",
      error
    );

    const message =
      String(
        error?.message ||
          ""
      ).toLowerCase();

    // ======================================================
    // REVISION CONFLICT / DOUBLE REQUEST
    // ======================================================

    if (
      message.includes(
        "revision"
      ) ||
      message.includes(
        "conflict"
      )
    ) {
      return jsonNoStore(
        {
          success: false,

          message:
            "Saldo baru saja berubah atau pengajuan lain sedang diproses. Silakan refresh halaman lalu coba kembali.",
        },
        409
      );
    }

    return jsonNoStore(
      {
        success: false,

        message:
          "Terjadi kesalahan saat mengajukan penarikan komisi.",
      },
      500
    );
  }
}