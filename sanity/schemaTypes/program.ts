// schemas/program.ts

import {
  defineField,
  defineType,
} from "sanity";

export default defineType({
  name: "program",

  title: "Program Donasi",

  type: "document",

  fields: [
    // =========================================================================
    // INFORMASI UTAMA PROGRAM
    // =========================================================================

    defineField({
      name: "title",

      title: "Judul Program",

      type: "string",

      description:
        "Judul utama program yang akan tampil di website islami.or.id.",

      validation: (Rule) =>
        Rule.required()
          .min(5)
          .max(150)
          .error(
            "Judul program wajib diisi."
          ),
    }),

    defineField({
      name: "slug",

      title: "Slug / URL Program",

      type: "slug",

      options: {
        source: "title",

        maxLength: 96,
      },

      description:
        "Alamat unik program, misalnya: sedekah-beras-untuk-santri.",

      validation: (Rule) =>
        Rule.required().error(
          "Slug wajib dibuat."
        ),
    }),

    // =========================================================================
    // KATEGORI
    // =========================================================================

    defineField({
      name: "category",

      title: "Kategori Program",

      type: "string",

      options: {
        list: [
          {
            title: "Kemanusiaan",
            value: "Kemanusiaan",
          },

          {
            title: "Pendidikan",
            value: "Pendidikan",
          },

          {
            title: "Kesehatan",
            value: "Kesehatan",
          },

          {
            title: "Infrastruktur",
            value: "Infrastruktur",
          },

          {
            title: "Zakat",
            value: "Zakat",
          },

          {
            title:
              "Infak / Sedekah",

            value: "Infak",
          },

          {
            title: "Wakaf",
            value: "Wakaf",
          },
        ],
      },

      initialValue:
        "Kemanusiaan",

      validation: (Rule) =>
        Rule.required(),
    }),

    // =========================================================================
    // PENEMPATAN DI HOMEPAGE
    // =========================================================================

    defineField({
      name: "sectionType",

      title:
        "Penempatan Program",

      type: "string",

      description:
        "Menentukan posisi program pada halaman utama islami.or.id.",

      options: {
        list: [
          {
            title:
              "Penggalangan Dana Mendesak",

            value:
              "mendesak",
          },

          {
            title:
              "Program Unggulan",

            value:
              "unggulan",
          },

          {
            title:
              "Program Pilihan",

            value:
              "pilihan",
          },
        ],

        layout:
          "radio",
      },

      initialValue:
        "pilihan",

      validation: (Rule) =>
        Rule.required(),
    }),

    // =========================================================================
    // GAMBAR
    // =========================================================================

    defineField({
      name: "image",

      title:
        "Foto / Cover Program",

      type: "image",

      options: {
        hotspot: true,
      },

      description:
        "Gambar utama program yang tampil pada halaman program dan daftar campaign.",

      validation: (Rule) =>
        Rule.required().error(
          "Foto program wajib diunggah."
        ),
    }),

    // =========================================================================
    // TARGET & TOTAL DONASI
    // =========================================================================

    defineField({
      name:
        "collectedAmount",

      title:
        "Total Donasi Terkumpul",

      type: "number",

      initialValue: 0,

      readOnly: true,

      description:
        "Total nominal donasi terverifikasi. Field ini dikelola oleh sistem pembayaran dan tidak diedit manual.",

      validation: (Rule) =>
        Rule.min(0),
    }),

    // -------------------------------------------------------------------------
    // FIELD LEGACY / KOMPATIBILITAS
    // -------------------------------------------------------------------------

    defineField({
      name:
        "collectedRaw",

      title:
        "Total Mentah Sistem",

      type: "number",

      initialValue: 0,

      readOnly: true,

      description:
        "Field internal untuk kompatibilitas dan perhitungan sistem. Tidak perlu diedit manual.",

      validation: (Rule) =>
        Rule.min(0),
    }),

    defineField({
      name:
        "targetAmount",

      title:
        "Target Donasi",

      type: "number",

      initialValue:
        50_000_000,

      description:
        "Target dana dalam Rupiah. Contoh: 50000000 untuk Rp50 juta.",

      validation: (Rule) =>
        Rule.required()
          .min(1000)
          .error(
            "Target donasi minimal Rp1.000."
          ),
    }),

    // =========================================================================
    // DURASI PROGRAM
    // =========================================================================

    defineField({
      name: "daysLeft",

      title:
        "Sisa Hari",

      type: "number",

      description:
        "Opsional. Jumlah hari yang ingin ditampilkan sebagai sisa waktu program.",

      validation: (Rule) =>
        Rule.min(0)
          .integer(),
    }),

    // =========================================================================
    // CERITA PROGRAM
    // =========================================================================

    defineField({
      name:
        "description",

      title:
        "Cerita / Deskripsi Program",

      type: "array",

      of: [
        {
          type: "block",
        },
      ],

      description:
        "Narasi lengkap mengenai tujuan, latar belakang, kebutuhan, dan manfaat program.",
    }),

    // =========================================================================
    // DONATUR TERVERIFIKASI
    // =========================================================================

    defineField({
      name: "donors",

      title:
        "Donatur Terverifikasi",

      type: "array",

      readOnly: true,

      description:
        "Daftar donatur yang pembayarannya telah terverifikasi oleh sistem.",

      of: [
        {
          type: "object",

          name:
            "verifiedDonor",

          title:
            "Donatur",

          fields: [
            defineField({
              name: "name",

              title:
                "Nama Donatur",

              type: "string",
            }),

            defineField({
              name: "amount",

              title:
                "Nominal Donasi",

              type: "number",

              validation: (
                Rule
              ) =>
                Rule.min(
                  0
                ),
            }),

            defineField({
              name: "date",

              title:
                "Tanggal Donasi",

              type: "string",

              description:
                "Tanggal yang ditampilkan pada halaman program.",
            }),

            defineField({
              name:
                "transactionId",

              title:
                "Transaction ID",

              type: "string",

              readOnly: true,

              description:
                "ID transaksi Casaku untuk mencegah donatur tercatat dua kali.",
            }),

            defineField({
              name:
                "orderId",

              title:
                "Order ID",

              type: "string",

              readOnly: true,

              description:
                "Nomor transaksi internal islami.or.id.",
            }),
          ],

          preview: {
            select: {
              name:
                "name",

              amount:
                "amount",

              date:
                "date",
            },

            prepare({
              name,
              amount,
              date,
            }) {
              const nominal =
                Number(
                  amount ||
                    0
                ).toLocaleString(
                  "id-ID"
                );

              return {
                title:
                  name ||
                  "Hamba Allah",

                subtitle:
                  `Rp ${nominal}${
                    date
                      ? ` • ${date}`
                      : ""
                  }`,
              };
            },
          },
        },
      ],
    }),

    // =========================================================================
    // LAPORAN / UPDATE PROGRAM
    // =========================================================================
    //
    // CampaignDetailClient Anda membaca program.reports.
    // Schema lama belum mempunyai field ini.
    // =========================================================================

    defineField({
      name: "reports",

      title:
        "Laporan / Update Program",

      type: "array",

      description:
        "Pembaruan perkembangan, kegiatan, atau laporan penyaluran program.",

      of: [
        {
          type: "object",

          name:
            "programReport",

          title:
            "Laporan Program",

          fields: [
            defineField({
              name:
                "title",

              title:
                "Judul Laporan",

              type:
                "string",

              validation: (
                Rule
              ) =>
                Rule.required(),
            }),

            defineField({
              name:
                "date",

              title:
                "Tanggal",

              type:
                "date",

              options: {
                dateFormat:
                  "DD-MM-YYYY",
              },
            }),

            defineField({
              name:
                "content",

              title:
                "Isi Laporan",

              type:
                "array",

              of: [
                {
                  type:
                    "block",
                },
              ],
            }),
          ],

          preview: {
            select: {
              title:
                "title",

              date:
                "date",
            },

            prepare({
              title,
              date,
            }) {
              return {
                title:
                  title ||
                  "Laporan Program",

                subtitle:
                  date ||
                  "Belum ada tanggal",
              };
            },
          },
        },
      ],
    }),
  ],

  // ===========================================================================
  // PREVIEW DOCUMENT
  // ===========================================================================

  preview: {
    select: {
      title:
        "title",

      category:
        "category",

      collectedAmount:
        "collectedAmount",

      targetAmount:
        "targetAmount",

      sectionType:
        "sectionType",

      media:
        "image",
    },

    prepare({
      title,
      category,
      collectedAmount,
      targetAmount,
      sectionType,
      media,
    }) {
      const collected =
        Number(
          collectedAmount ||
            0
        ).toLocaleString(
          "id-ID"
        );

      const target =
        Number(
          targetAmount ||
            0
        ).toLocaleString(
          "id-ID"
        );

      const sectionLabels:
        Record<
          string,
          string
        > = {
        mendesak:
          "Mendesak",

        unggulan:
          "Unggulan",

        pilihan:
          "Pilihan",
      };

      return {
        title:
          title ||
          "Program Tanpa Judul",

        subtitle: [
          category ||
            "Tanpa kategori",

          sectionLabels[
            sectionType
          ] ||
            sectionType,

          `Rp ${collected} / Rp ${target}`,
        ]
          .filter(
            Boolean
          )
          .join(
            " • "
          ),

        media,
      };
    },
  },

  // ===========================================================================
  // SORTING SANITY STUDIO
  // ===========================================================================

  orderings: [
    {
      title:
        "Dana Terkumpul Terbesar",

      name:
        "collectedDesc",

      by: [
        {
          field:
            "collectedAmount",

          direction:
            "desc",
        },
      ],
    },

    {
      title:
        "Target Terbesar",

      name:
        "targetDesc",

      by: [
        {
          field:
            "targetAmount",

          direction:
            "desc",
        },
      ],
    },

    {
      title:
        "Judul A-Z",

      name:
        "titleAsc",

      by: [
        {
          field:
            "title",

          direction:
            "asc",
        },
      ],
    },
  ],
});