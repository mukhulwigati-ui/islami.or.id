// app/api/programs/route.ts

import { NextResponse } from "next/server";
import { clientPublik as client } from "@/lib/sanity";

// ============================================================================
// NEXT CONFIG
// ============================================================================

export const dynamic = "force-dynamic";
export const revalidate = 0;

// ============================================================================
// TYPES
// ============================================================================

interface ProgramDonor {
  name?: string;
  amount?: number;
  date?: string;

  orderId?: string;
  transactionId?: string;
}

interface ProgramData {
  id: string;
  slug?: string;
  title?: string;
  category?: string;
  sectionType?: string;
  image?: string;

  collectedAmount?: number;
  collectedRaw?: number;
  collected?: number;

  targetAmount?: number;
  daysLeft?: number | null;

  description?: unknown;

  donors?: ProgramDonor[];

  reports?: unknown[];
}

interface SuccessTransaction {
  _id: string;

  orderId?: string;

  transactionId?: string;

  amount?: number;

  paymentAmount?: number;

  donorName?: string;

  donorPhone?: string;

  paidAt?: string;

  createdAt?: string;

  programId?: string;

  programSlug?: string;

  programTitle?: string;
}

interface SanityResult {
  programs?: ProgramData[];

  transactions?: SuccessTransaction[];
}

// ============================================================================
// HELPERS
// ============================================================================

function safeNumber(
  value: unknown
): number {
  const number =
    Number(value ?? 0);

  if (
    !Number.isFinite(number) ||
    number < 0
  ) {
    return 0;
  }

  return number;
}

function formatRupiah(
  value: number
): string {
  return `Rp ${value.toLocaleString(
    "id-ID"
  )}`;
}

function formatDate(
  value?: string
): string {
  if (!value) {
    return "Baru Saja";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Baru Saja";
  }

  try {
    return new Intl.DateTimeFormat(
      "id-ID",
      {
        day: "numeric",

        month: "short",

        year: "numeric",

        timeZone:
          "Asia/Jakarta",
      }
    ).format(date);
  } catch {
    return "Baru Saja";
  }
}

function normalizeText(
  value: unknown
): string {
  return String(
    value ?? ""
  )
    .trim()
    .toLowerCase();
}

// ============================================================================
// GET
// ============================================================================

export async function GET() {
  try {
    // =========================================================================
    // QUERY
    //
    // PENTING:
    // programName adalah reference ke dokumen "program".
    //
    // Kita resolve langsung di GROQ menjadi:
    //
    // programId
    // programSlug
    // programTitle
    //
    // Jadi tidak perlu lagi menebak-nebak object reference di JavaScript.
    // =========================================================================

    const query = `
      {
        "programs":
          *[
            _type in [
              "program",
              "campaign"
            ]
          ]
          | order(
              _createdAt desc
            )
          {
            "id": _id,

            "slug":
              slug.current,

            title,

            category,

            sectionType,

            "image":
              coalesce(
                image.asset->url,
                mainImage.asset->url,
                thumbnail.asset->url,
                banner.asset->url
              ),

            collectedAmount,

            collectedRaw,

            collected,

            targetAmount,

            daysLeft,

            description,

            donors[] {
              name,
              amount,
              date,
              orderId,
              transactionId
            },

            reports
          },

        "transactions":
          *[
            _type ==
              "donationTransaction"
            &&
            status ==
              "success"
          ]
          | order(
              coalesce(
                paidAt,
                _createdAt
              ) desc
            )
          {
            _id,

            orderId,

            transactionId,

            amount,

            paymentAmount,

            donorName,

            donorPhone,

            paidAt,

            "createdAt":
              _createdAt,

            "programId":
              programName->_id,

            "programSlug":
              programName->slug.current,

            "programTitle":
              programName->title
          }
      }
    `;

    const result =
      await client.fetch<SanityResult>(
        query
      );

    const sanityPrograms =
      Array.isArray(
        result?.programs
      )
        ? result.programs
        : [];

    const successTransactions =
      Array.isArray(
        result?.transactions
      )
        ? result.transactions
        : [];

    // =========================================================================
    // FORMAT PROGRAM
    // =========================================================================

    const formattedData =
      sanityPrograms.map(
        (
          program
        ) => {
          // ===================================================================
          // 1. CARI TRANSAKSI SUKSES MILIK PROGRAM INI
          // ===================================================================

          const matchingTransactions =
            successTransactions.filter(
              (tx) => {
                // -------------------------------------------------------------
                // Prioritas #1:
                // Reference Sanity
                // -------------------------------------------------------------

                if (
                  tx.programId &&
                  tx.programId ===
                    program.id
                ) {
                  return true;
                }

                // -------------------------------------------------------------
                // Prioritas #2:
                // slug hasil dereference
                // -------------------------------------------------------------

                if (
                  tx.programSlug &&
                  program.slug &&
                  normalizeText(
                    tx.programSlug
                  ) ===
                    normalizeText(
                      program.slug
                    )
                ) {
                  return true;
                }

                // -------------------------------------------------------------
                // Legacy fallback:
                // judul program
                //
                // Hanya untuk transaksi lama yang mungkin belum mempunyai
                // reference dengan benar.
                // -------------------------------------------------------------

                if (
                  tx.programTitle &&
                  program.title &&
                  normalizeText(
                    tx.programTitle
                  ) ===
                    normalizeText(
                      program.title
                    )
                ) {
                  return true;
                }

                return false;
              }
            );

          // ===================================================================
          // 2. HITUNG TOTAL DARI TRANSAKSI SUKSES
          //
          // Gunakan amount, BUKAN paymentAmount.
          //
          // paymentAmount dapat mengandung kode unik.
          // amount adalah nominal donasi sebenarnya.
          // ===================================================================

          const transactionTotal =
            matchingTransactions.reduce(
              (
                total,
                tx
              ) =>
                total +
                safeNumber(
                  tx.amount
                ),
              0
            );

          // ===================================================================
          // 3. NILAI LEGACY DARI PROGRAM
          // ===================================================================

          const storedCollectedAmount =
            safeNumber(
              program.collectedAmount
            );

          const storedCollectedRaw =
            safeNumber(
              program.collectedRaw
            );

          const storedCollected =
            safeNumber(
              program.collected
            );

          // ===================================================================
          // 4. TOTAL FINAL
          //
          // PRIORITAS:
          //
          // A. Ada transaksi success:
          //    hitung langsung dari donationTransaction.
          //
          // B. Belum ada transaksi:
          //    fallback ke nilai terbesar legacy.
          //
          // Math.max juga memperbaiki bug:
          //
          // collectedAmount = 0
          // collectedRaw    = 2000
          //
          // menjadi 2000.
          // ===================================================================

          const legacyAmount =
            Math.max(
              storedCollectedAmount,
              storedCollectedRaw,
              storedCollected
            );

          const rawAmount =
            matchingTransactions.length >
            0
              ? transactionTotal
              : legacyAmount;

          // ===================================================================
          // 5. DONATUR DARI TRANSAKSI SUKSES
          // ===================================================================

          const transactionDonors: ProgramDonor[] =
            matchingTransactions.map(
              (
                tx
              ) => ({
                name:
                  tx.donorName?.trim() ||
                  "Hamba Allah",

                amount:
                  safeNumber(
                    tx.amount
                  ),

                date:
                  formatDate(
                    tx.paidAt ||
                      tx.createdAt
                  ),

                orderId:
                  tx.orderId,

                transactionId:
                  tx.transactionId,
              })
            );

          // ===================================================================
          // 6. DONATUR MANUAL / LEGACY
          // ===================================================================

          const manualDonors =
            Array.isArray(
              program.donors
            )
              ? program.donors
              : [];

          // ===================================================================
          // 7. ANTI DUPLIKAT DONATUR
          //
          // Webhook baru dapat memasukkan transaksi ke program.donors.
          // donationTransaction juga sudah menyimpan transaksi yang sama.
          //
          // Jadi jangan tampilkan dua kali.
          // ===================================================================

          const transactionIds =
            new Set(
              transactionDonors
                .map(
                  (donor) =>
                    donor.transactionId
                )
                .filter(
                  (
                    value
                  ): value is string =>
                    Boolean(
                      value
                    )
                )
            );

          const orderIds =
            new Set(
              transactionDonors
                .map(
                  (donor) =>
                    donor.orderId
                )
                .filter(
                  (
                    value
                  ): value is string =>
                    Boolean(
                      value
                    )
                )
            );

          const filteredManualDonors =
            manualDonors.filter(
              (
                donor
              ) => {
                if (
                  donor.transactionId &&
                  transactionIds.has(
                    donor.transactionId
                  )
                ) {
                  return false;
                }

                if (
                  donor.orderId &&
                  orderIds.has(
                    donor.orderId
                  )
                ) {
                  return false;
                }

                return true;
              }
            );

          // ===================================================================
          // 8. GABUNGKAN
          //
          // Transaksi asli ditampilkan terlebih dahulu.
          // ===================================================================

          const combinedDonors =
            [
              ...transactionDonors,

              ...filteredManualDonors,
            ];

          // ===================================================================
          // 9. JUMLAH DONATUR
          // ===================================================================

          let totalDonorsCount =
            combinedDonors.length;

          // Legacy fallback.
          //
          // Jangan dipakai jika sudah mempunyai transaction/donor asli.

          if (
            totalDonorsCount ===
              0 &&
            rawAmount > 0
          ) {
            totalDonorsCount =
              Math.max(
                1,
                Math.floor(
                  rawAmount /
                    50_000
                )
              );
          }

          // ===================================================================
          // 10. TARGET
          // ===================================================================

          const targetAmount =
            safeNumber(
              program.targetAmount
            ) ||
            50_000_000;

          // ===================================================================
          // RESPONSE PROGRAM
          // ===================================================================

          return {
            id:
              program.id,

            _id:
              program.id,

            slug:
              program.slug ||
              "",

            title:
              program.title ||
              "Program Donasi",

            category:
              program.category ||
              "Kemanusiaan",

            sectionType:
              program.sectionType ||
              "pilihan",

            image:
              program.image ||
              "",

            // ---------------------------------------------------------------
            // TOTAL
            // ---------------------------------------------------------------

            collected:
              formatRupiah(
                rawAmount
              ),

            collectedRaw:
              rawAmount,

            collectedAmount:
              rawAmount,

            // ---------------------------------------------------------------
            // DEBUG/SINKRONISASI
            //
            // Bisa membantu kita mengetahui sumber total.
            // Tidak mengganggu frontend.
            // ---------------------------------------------------------------

            transactionCollectedAmount:
              transactionTotal,

            storedCollectedAmount,

            storedCollectedRaw,

            // ---------------------------------------------------------------
            // TARGET
            // ---------------------------------------------------------------

            target:
              formatRupiah(
                targetAmount
              ),

            targetAmount,

            // ---------------------------------------------------------------
            // DATA PROGRAM
            // ---------------------------------------------------------------

            daysLeft:
              program.daysLeft ??
              null,

            description:
              program.description ??
              null,

            // ---------------------------------------------------------------
            // DONATUR
            // ---------------------------------------------------------------

            donors:
              combinedDonors,

            donorsCount:
              totalDonorsCount,

            // ---------------------------------------------------------------
            // REPORT
            // ---------------------------------------------------------------

            reports:
              Array.isArray(
                program.reports
              )
                ? program.reports
                : [],
          };
        }
      );

    // =========================================================================
    // RESPONSE
    // =========================================================================

    return NextResponse.json(
      {
        success: true,

        data:
          formattedData,
      },
      {
        status: 200,

        headers: {
          "Content-Type":
            "application/json; charset=utf-8",

          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",

          Pragma:
            "no-cache",

          Expires:
            "0",
        },
      }
    );
  } catch (
    error: unknown
  ) {
    console.error(
      "🔥 Sanity Programs Fetch Error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Gagal mengambil data program.";

    return NextResponse.json(
      {
        success: false,

        error:
          message,

        data: [],
      },
      {
        status: 500,

        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      }
    );
  }
}