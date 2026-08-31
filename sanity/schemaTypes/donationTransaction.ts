// schemas/donationTransaction.ts

import {
  defineField,
  defineType,
} from "sanity";

export default defineType({
  name: "donationTransaction",

  title:
    "Transaksi Donasi",

  type: "document",

  fields: [
    // =========================================================================
    // IDENTITAS TRANSAKSI
    // =========================================================================

    defineField({
      name: "orderId",

      title:
        "Order ID / Nomor Invoice",

      type: "string",

      description:
        "ID transaksi internal islami.or.id.",

      readOnly: true,

      validation: (
        Rule
      ) =>
        Rule.required(),
    }),

    defineField({
      name: "transactionId",

      title:
        "Transaction ID Casaku",

      type: "string",

      description:
        "ID transaksi yang diberikan oleh Casaku.",

      readOnly: true,
    }),

    defineField({
      name: "paymentProvider",

      title:
        "Provider Pembayaran",

      type: "string",

      readOnly: true,

      options: {
        list: [
          {
            title:
              "Casaku",
            value:
              "casaku",
          },
        ],
      },
    }),

    defineField({
      name: "paymentMethod",

      title:
        "Metode Pembayaran",

      type: "string",

      readOnly: true,

      options: {
        list: [
          {
            title:
              "QRIS",
            value:
              "qris",
          },
        ],
      },
    }),

    // =========================================================================
    // DATA DONATUR
    // =========================================================================

    defineField({
      name: "donorName",

      title:
        "Nama Donatur",

      type: "string",
    }),

    defineField({
      name: "donorPhone",

      title:
        "Nomor WhatsApp Donatur",

      type: "string",
    }),

    defineField({
      name: "donorEmail",

      title:
        "Email Donatur",

      type: "string",
    }),

    // =========================================================================
    // PROGRAM
    // =========================================================================

    defineField({
      name: "programName",

      title:
        "Program / Kampanye",

      type: "reference",

      to: [
        {
          type: "program",
        },
      ],
    }),

    defineField({
      name: "campaignSlug",

      title:
        "Slug Program",

      type: "string",

      description:
        "Slug program saat transaksi dibuat.",

      readOnly: true,
    }),

    defineField({
      name: "fundraiserPhone",

      title:
        "Nomor WhatsApp Fundraiser",

      type: "string",

      description:
        "Nomor referral/fundraiser jika transaksi berasal dari tautan fundraiser.",

      readOnly: true,
    }),

    // =========================================================================
    // NOMINAL
    // =========================================================================

    defineField({
      name: "amount",

      title:
        "Nominal Donasi",

      type: "number",

      description:
        "Nominal donasi asli sebelum kode unik.",

      readOnly: true,

      validation: (
        Rule
      ) =>
        Rule.min(0),
    }),

    defineField({
      name: "paymentAmount",

      title:
        "Total Pembayaran QRIS",

      type: "number",

      description:
        "Nominal aktual yang harus dibayar. Dapat berbeda dari nominal donasi karena kode unik Casaku.",

      readOnly: true,

      validation: (
        Rule
      ) =>
        Rule.min(0),
    }),

    defineField({
      name: "paidAmount",

      title:
        "Nominal Terverifikasi",

      type: "number",

      description:
        "Nominal pembayaran yang diterima dari webhook Casaku.",

      readOnly: true,

      validation: (
        Rule
      ) =>
        Rule.min(0),
    }),

    // =========================================================================
    // STATUS
    // =========================================================================

    defineField({
      name: "status",

      title:
        "Status Pembayaran",

      type: "string",

      readOnly: true,

      options: {
        list: [
          {
            title:
              "Pending",
            value:
              "pending",
          },

          {
            title:
              "Berhasil",
            value:
              "success",
          },

          {
            title:
              "Gagal / Kedaluwarsa",
            value:
              "failed",
          },
        ],

        layout:
          "radio",
      },

      initialValue:
        "pending",
    }),

    defineField({
      name: "paymentVerified",

      title:
        "Pembayaran Terverifikasi",

      type: "boolean",

      description:
        "Bernilai true jika pembayaran telah terverifikasi oleh sistem.",

      readOnly: true,

      initialValue:
        false,
    }),

    // =========================================================================
    // QRIS CASAKU
    // =========================================================================

    defineField({
      name: "qrString",

      title:
        "QRIS Payload",

      type: "text",

      description:
        "Payload QRIS dinamis dari Casaku. Bukan gambar QR.",

      readOnly: true,

      rows: 4,
    }),

    defineField({
      name: "paymentUrl",

      title:
        "URL Pembayaran",

      type: "url",

      description:
        "Disediakan untuk kompatibilitas transaksi lama. Casaku QRIS saat ini tidak memerlukan payment URL.",

      readOnly: true,
    }),

    // =========================================================================
    // INFORMASI APLIKASI PEMBAYARAN
    // =========================================================================

    defineField({
      name: "paymentPackageName",

      title:
        "Package Aplikasi Pembayaran",

      type: "string",

      description:
        "Package aplikasi yang terdeteksi oleh Casaku, misalnya id.dana.",

      readOnly: true,
    }),

    defineField({
      name: "paymentAppName",

      title:
        "Nama Aplikasi Pembayaran",

      type: "string",

      description:
        "Nama aplikasi pembayaran yang terdeteksi dari webhook Casaku.",

      readOnly: true,
    }),

    // =========================================================================
    // WAKTU
    // =========================================================================

    defineField({
      name: "createdAt",

      title:
        "Waktu Transaksi Dibuat",

      type: "datetime",

      readOnly: true,
    }),

    defineField({
      name: "expiresAt",

      title:
        "Batas Waktu Pembayaran",

      type: "datetime",

      readOnly: true,
    }),

    defineField({
      name: "paidAt",

      title:
        "Waktu Pembayaran",

      type: "datetime",

      readOnly: true,
    }),

    defineField({
      name: "updatedAt",

      title:
        "Terakhir Diperbarui",

      type: "datetime",

      readOnly: true,
    }),
  ],

  // ===========================================================================
  // PREVIEW DI SANITY STUDIO
  // ===========================================================================

  preview: {
    select: {
      donorName:
        "donorName",

      orderId:
        "orderId",

      amount:
        "amount",

      paymentAmount:
        "paymentAmount",

      status:
        "status",

      paymentProvider:
        "paymentProvider",

      programTitle:
        "programName.title",
    },

    prepare({
      donorName,
      orderId,
      amount,
      paymentAmount,
      status,
      paymentProvider,
      programTitle,
    }) {
      const nominal =
        Number(
          paymentAmount ||
            amount ||
            0
        ).toLocaleString(
          "id-ID"
        );

      const statusLabel =
        status ===
        "success"
          ? "✅ BERHASIL"
          : status ===
              "failed"
            ? "❌ GAGAL"
            : "⏳ PENDING";

      const provider =
        paymentProvider
          ? paymentProvider.toUpperCase()
          : "QRIS";

      return {
        title:
          donorName ||
          "Hamba Allah",

        subtitle: [
          statusLabel,

          `Rp ${nominal}`,

          programTitle ||
            "Program Donasi",

          provider,

          orderId ||
            "",
        ]
          .filter(
            Boolean
          )
          .join(
            " • "
          ),
      };
    },
  },

  // ===========================================================================
  // URUTAN FIELD DI SANITY STUDIO
  // ===========================================================================

  orderings: [
    {
      title:
        "Transaksi Terbaru",

      name:
        "createdAtDesc",

      by: [
        {
          field:
            "createdAt",

          direction:
            "desc",
        },
      ],
    },

    {
      title:
        "Nominal Terbesar",

      name:
        "amountDesc",

      by: [
        {
          field:
            "paymentAmount",

          direction:
            "desc",
        },
      ],
    },

    {
      title:
        "Status",

      name:
        "statusAsc",

      by: [
        {
          field:
            "status",

          direction:
            "asc",
        },
      ],
    },
  ],
});