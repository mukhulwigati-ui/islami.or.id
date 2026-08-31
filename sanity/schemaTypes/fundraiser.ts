// schemas/fundraiser.ts

import {
  defineField,
  defineType,
} from "sanity";

export default defineType({
  name: "fundraiser",

  title: "Fundraiser / Relawan",

  type: "document",

  fields: [
    // =========================================================================
    // IDENTITAS FUNDRAISER
    // =========================================================================

    defineField({
      name: "name",

      title: "Nama Lengkap",

      type: "string",

      description:
        "Nama lengkap fundraiser atau relawan.",

      validation: (Rule) =>
        Rule.required()
          .min(3)
          .max(100)
          .error(
            "Nama fundraiser wajib diisi."
          ),
    }),

    defineField({
      name: "phone",

      title: "Nomor WhatsApp",

      type: "string",

      description:
        "Nomor WhatsApp utama fundraiser. Nomor ini juga digunakan untuk mencocokkan transaksi referral.",

      validation: (Rule) =>
        Rule.required()
          .regex(
            /^(?:\+62|62|0)[0-9]{8,15}$/,
            {
              name: "nomor WhatsApp",
              invert: false,
            }
          )
          .error(
            "Masukkan nomor WhatsApp Indonesia yang valid."
          ),
    }),

    // =========================================================================
    // KODE REFERRAL
    // =========================================================================

    defineField({
      name: "referralCode",

      title: "Kode Referral",

      type: "string",

      description:
        "Kode unik fundraiser untuk tautan referral. Contoh: ARIS01. Jika sistem Anda masih menggunakan nomor WhatsApp sebagai referral, field ini dapat dibiarkan kosong.",

      validation: (Rule) =>
        Rule.custom((value) => {
          if (!value) {
            return true;
          }

          if (
            !/^[A-Za-z0-9_-]{3,30}$/.test(
              value
            )
          ) {
            return "Kode referral hanya boleh berisi huruf, angka, tanda - dan _.";
          }

          return true;
        }),
    }),

    // =========================================================================
    // STATUS
    // =========================================================================

    defineField({
      name: "status",

      title: "Status Fundraiser",

      type: "string",

      description:
        "Hanya fundraiser aktif yang seharusnya menerima atribusi transaksi baru.",

      options: {
        list: [
          {
            title: "Aktif",
            value: "active",
          },
          {
            title: "Nonaktif",
            value: "inactive",
          },
          {
            title: "Ditangguhkan",
            value: "suspended",
          },
        ],

        layout: "radio",
      },

      initialValue: "active",

      validation: (Rule) =>
        Rule.required(),
    }),

    // =========================================================================
    // PROGRAM YANG DIDUKUNG
    // =========================================================================

    defineField({
      name: "supportedPrograms",

      title: "Program yang Didukung",

      description:
        "Pilih program tertentu jika fundraiser hanya boleh mempromosikan program tersebut. Jika dikosongkan, fundraiser dapat digunakan untuk seluruh program.",

      type: "array",

      of: [
        {
          type: "reference",

          to: [
            {
              type: "program",
            },
          ],
        },
      ],

      validation: (Rule) =>
        Rule.unique(),
    }),

    // =========================================================================
    // PENGATURAN FEE
    // =========================================================================

    defineField({
      name: "feePercentage",

      title: "Persentase Fee (%)",

      type: "number",

      description:
        "Persentase fee fundraiser dari nominal donasi berhasil yang teratribusi kepadanya. Contoh: isi 5 untuk fee 5%. Isi 0 jika fundraiser tidak memperoleh fee.",

      initialValue: 0,

      validation: (Rule) =>
        Rule.required()
          .min(0)
          .max(100)
          .precision(2),
    }),

    // =========================================================================
    // STATISTIK OTOMATIS
    // =========================================================================

    defineField({
      name: "totalDanaDihimpun",

      title: "Total Dana Dihimpun",

      type: "number",

      description:
        "Akumulasi nominal donasi berhasil yang berasal dari fundraiser ini. Diperbarui otomatis oleh sistem.",

      readOnly: true,

      initialValue: 0,

      validation: (Rule) =>
        Rule.min(0),
    }),

    defineField({
      name: "totalTransaksiSukses",

      title: "Total Transaksi Sukses",

      type: "number",

      description:
        "Jumlah transaksi pembayaran berhasil yang teratribusi kepada fundraiser ini.",

      readOnly: true,

      initialValue: 0,

      validation: (Rule) =>
        Rule.min(0).integer(),
    }),

    defineField({
      name: "totalFee",

      title: "Total Fee Diperoleh",

      type: "number",

      description:
        "Akumulasi fee fundraiser yang dihitung dari transaksi berhasil.",

      readOnly: true,

      initialValue: 0,

      validation: (Rule) =>
        Rule.min(0),
    }),

    defineField({
      name: "sisaSaldoFee",

      title: "Sisa Saldo Fee",

      type: "number",

      description:
        "Saldo fee yang masih tersedia dan belum dibayarkan kepada fundraiser.",

      readOnly: true,

      initialValue: 0,

      validation: (Rule) =>
        Rule.min(0),
    }),

    // =========================================================================
    // PEMBAYARAN FEE OLEH ADMIN
    // =========================================================================

    defineField({
      name: "feePaid",

      title: "Total Fee Sudah Dibayarkan",

      type: "number",

      description:
        "Akumulasi fee yang sudah ditransfer kepada fundraiser. Field ini dapat diperbarui oleh admin setelah pembayaran fee dilakukan.",

      initialValue: 0,

      validation: (Rule) =>
        Rule.required()
          .min(0)
          .integer(),
    }),

    // =========================================================================
    // INFORMASI TAMBAHAN
    // =========================================================================

    defineField({
      name: "notes",

      title: "Catatan Admin",

      type: "text",

      rows: 3,

      description:
        "Catatan internal mengenai fundraiser. Tidak ditampilkan kepada publik.",
    }),

    // =========================================================================
    // TIMESTAMP SISTEM
    // =========================================================================

    defineField({
      name: "createdAt",

      title: "Tanggal Bergabung",

      type: "datetime",

      readOnly: true,

      initialValue: () =>
        new Date().toISOString(),
    }),

    defineField({
      name: "updatedAt",

      title: "Terakhir Diperbarui",

      type: "datetime",

      readOnly: true,
    }),
  ],

  // ===========================================================================
  // PREVIEW SANITY STUDIO
  // ===========================================================================

  preview: {
    select: {
      name: "name",

      phone: "phone",

      status: "status",

      totalDana:
        "totalDanaDihimpun",

      totalTransaksi:
        "totalTransaksiSukses",

      saldoFee:
        "sisaSaldoFee",
    },

    prepare({
      name,
      phone,
      status,
      totalDana,
      totalTransaksi,
      saldoFee,
    }) {
      const dana =
        Number(
          totalDana || 0
        ).toLocaleString(
          "id-ID"
        );

      const saldo =
        Number(
          saldoFee || 0
        ).toLocaleString(
          "id-ID"
        );

      const statusLabel =
        status === "active"
          ? "🟢 AKTIF"
          : status ===
              "suspended"
            ? "🟠 DITANGGUHKAN"
            : "⚫ NONAKTIF";

      return {
        title:
          name ||
          "Fundraiser Tanpa Nama",

        subtitle: [
          statusLabel,

          phone || "-",

          `${Number(
            totalTransaksi ||
              0
          )} transaksi`,

          `Rp ${dana}`,

          `Fee Rp ${saldo}`,
        ].join(" • "),
      };
    },
  },

  // ===========================================================================
  // SORTING
  // ===========================================================================

  orderings: [
    {
      title:
        "Dana Terbesar",

      name:
        "totalDanaDesc",

      by: [
        {
          field:
            "totalDanaDihimpun",

          direction:
            "desc",
        },
      ],
    },

    {
      title:
        "Transaksi Terbanyak",

      name:
        "totalTransaksiDesc",

      by: [
        {
          field:
            "totalTransaksiSukses",

          direction:
            "desc",
        },
      ],
    },

    {
      title:
        "Nama A-Z",

      name:
        "nameAsc",

      by: [
        {
          field: "name",

          direction: "asc",
        },
      ],
    },
  ],
});