// sanity.config.ts

import React from 'react';

import {
  buildLegacyTheme,
  defineConfig,
} from 'sanity';

import {
  structureTool,
} from 'sanity/structure';

import {
  schemaTypes,
} from './sanity/schemaTypes';

// =========================================================
// THEME
// =========================================================

const emeraldTheme =
  buildLegacyTheme({
    '--black': '#1f2937',

    '--white': '#ffffff',

    '--brand-primary':
      '#10b981',

    '--component-bg':
      '#ffffff',

    '--component-text-color':
      '#1f2937',

    '--focus-color':
      '#fbbf24',
  });

// =========================================================
// SANITY CONFIG
// =========================================================

export default defineConfig([
  {
    // =====================================================
    // WORKSPACE
    // =====================================================

    name:
      'Yayasan-Wasilah-Hidayah-Nusantara',

    title:
      'islami.or.id',

    projectId:
      process.env
        .NEXT_PUBLIC_SANITY_PROJECT_ID ||
      'ID_PROJECT_ANDA',

    dataset:
      process.env
        .NEXT_PUBLIC_SANITY_DATASET ||
      'production',

    basePath:
      '/studio',

    // =====================================================
    // PLUGINS
    // =====================================================

    plugins: [
      structureTool({
        structure: (S) => {
          // =================================================
          // Semua schema existing tetap muncul otomatis.
          //
          // fundraiserWithdrawal tidak ditampilkan sebagai
          // menu default karena kita buatkan menu khusus
          // Penarikan Komisi di bawah.
          // =================================================

          const defaultItems =
            S.documentTypeListItems().filter(
              (item) =>
                item.getId() !==
                'fundraiserWithdrawal'
            );

          return S.list()
            .title(
              'Manajemen Konten'
            )
            .items([
              // =============================================
              // SCHEMA DEFAULT
              // =============================================

              ...defaultItems,

              // =============================================
              // PEMBATAS FUNDRAISER
              // =============================================

              S.divider(),

              // =============================================
              // PENARIKAN KOMISI
              // =============================================

              S.listItem()
                .title(
                  '💰 Penarikan Komisi'
                )
                .child(
                  S.list()
                    .title(
                      'Penarikan Komisi Fundraiser'
                    )
                    .items([
                      // =====================================
                      // MENUNGGU
                      // =====================================

                      S.listItem()
                        .title(
                          '⏳ Menunggu'
                        )
                        .child(
                          S.documentList()
                            .title(
                              'Menunggu Persetujuan'
                            )
                            .schemaType(
                              'fundraiserWithdrawal'
                            )
                            .filter(
                              `_type == "fundraiserWithdrawal" && status == "pending"`
                            )
                            .defaultOrdering([
                              {
                                field:
                                  'requestedAt',

                                direction:
                                  'desc',
                              },
                            ])
                        ),

                      // =====================================
                      // DISETUJUI
                      // =====================================

                      S.listItem()
                        .title(
                          '✅ Disetujui'
                        )
                        .child(
                          S.documentList()
                            .title(
                              'Penarikan Disetujui'
                            )
                            .schemaType(
                              'fundraiserWithdrawal'
                            )
                            .filter(
                              `_type == "fundraiserWithdrawal" && status == "approved"`
                            )
                            .defaultOrdering([
                              {
                                field:
                                  'requestedAt',

                                direction:
                                  'desc',
                              },
                            ])
                        ),

                      // =====================================
                      // SUDAH DIBAYAR
                      // =====================================

                      S.listItem()
                        .title(
                          '💸 Sudah Dibayar'
                        )
                        .child(
                          S.documentList()
                            .title(
                              'Komisi Sudah Dibayar'
                            )
                            .schemaType(
                              'fundraiserWithdrawal'
                            )
                            .filter(
                              `_type == "fundraiserWithdrawal" && status == "paid"`
                            )
                            .defaultOrdering([
                              {
                                field:
                                  'paidAt',

                                direction:
                                  'desc',
                              },
                            ])
                        ),

                      // =====================================
                      // DITOLAK
                      // =====================================

                      S.listItem()
                        .title(
                          '❌ Ditolak'
                        )
                        .child(
                          S.documentList()
                            .title(
                              'Penarikan Ditolak'
                            )
                            .schemaType(
                              'fundraiserWithdrawal'
                            )
                            .filter(
                              `_type == "fundraiserWithdrawal" && status == "rejected"`
                            )
                            .defaultOrdering([
                              {
                                field:
                                  'requestedAt',

                                direction:
                                  'desc',
                              },
                            ])
                        ),

                      // =====================================
                      // DIBATALKAN
                      // =====================================

                      S.listItem()
                        .title(
                          '🚫 Dibatalkan'
                        )
                        .child(
                          S.documentList()
                            .title(
                              'Penarikan Dibatalkan'
                            )
                            .schemaType(
                              'fundraiserWithdrawal'
                            )
                            .filter(
                              `_type == "fundraiserWithdrawal" && status == "cancelled"`
                            )
                            .defaultOrdering([
                              {
                                field:
                                  'requestedAt',

                                direction:
                                  'desc',
                              },
                            ])
                        ),

                      // =====================================
                      // PEMBATAS
                      // =====================================

                      S.divider(),

                      // =====================================
                      // SEMUA PENARIKAN
                      // =====================================

                      S.listItem()
                        .title(
                          '📋 Semua Penarikan'
                        )
                        .child(
                          S.documentList()
                            .title(
                              'Semua Riwayat Penarikan'
                            )
                            .schemaType(
                              'fundraiserWithdrawal'
                            )
                            .filter(
                              `_type == "fundraiserWithdrawal"`
                            )
                            .defaultOrdering([
                              {
                                field:
                                  'requestedAt',

                                direction:
                                  'desc',
                              },
                            ])
                        ),
                    ])
                ),
            ]);
        },
      }),
    ],

    // =====================================================
    // SCHEMA
    // =====================================================

    schema: {
      types:
        schemaTypes,
    },

    // =====================================================
    // THEME
    // =====================================================

    theme:
      emeraldTheme,

    // =====================================================
    // CUSTOM STUDIO HEADER
    // =====================================================

    studio: {
      components: {
        navbar: (
          props
        ) => {
          return React.createElement(
            'div',

            {
              style: {
                display:
                  'flex',

                flexDirection:
                  'column',
              },
            },

            // ===============================================
            // HEADER LOGO
            // ===============================================

            React.createElement(
              'div',

              {
                style: {
                  background:
                    '#e6f7f0',

                  padding:
                    '16px 24px',

                  display:
                    'flex',

                  alignItems:
                    'center',

                  borderBottom:
                    '1px solid #c2ebd9',

                  boxShadow:
                    '0 1px 2px rgba(0,0,0,0.02)',
                },
              },

              React.createElement(
                'img',
                {
                  src:
                    '/images/logo-islami.png',

                  alt:
                    'Logo islami.or.id',

                  style: {
                    height:
                      '52px',

                    width:
                      'auto',

                    objectFit:
                      'contain',

                    display:
                      'block',
                  },
                }
              )
            ),

            // ===============================================
            // NAVBAR DEFAULT SANITY
            // ===============================================

            props.renderDefault(
              props
            )
          );
        },
      },
    },
  },
]);