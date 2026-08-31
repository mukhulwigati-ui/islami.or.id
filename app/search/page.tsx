// app/search/page.tsx
"use client";

import React, {
  Suspense,
  useEffect,
  useState,
} from "react";

import {
  useSearchParams,
} from "next/navigation";

import Link from "next/link";

import {
  Loader2,
  Globe,
  Search,
  FileSearch,
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

interface SearchResultItem {
  id: string;
  type: "news" | "campaign";
  slug: string;
  title: string;
  category?: string;
}

// ============================================================================
// SEARCH CONTENT
// ============================================================================

function SearchResultsContent() {
  const searchParams =
    useSearchParams();

  const queryParam =
    (
      searchParams.get("q") ||
      ""
    ).trim();

  const [
    results,
    setResults,
  ] =
    useState<
      SearchResultItem[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  // ==========================================================================
  // FETCH SEARCH RESULT
  // ==========================================================================

  useEffect(() => {
    let active =
      true;

    const fetchResults =
      async () => {
        // ====================================================================
        // EMPTY QUERY
        // ====================================================================

        if (
          !queryParam
        ) {
          setResults(
            []
          );

          setError(
            ""
          );

          setLoading(
            false
          );

          return;
        }

        // ====================================================================
        // START
        // ====================================================================

        setLoading(
          true
        );

        setError(
          ""
        );

        setResults(
          []
        );

        try {
          const response =
            await fetch(
              `/api/search?q=${encodeURIComponent(
                queryParam
              )}`,
              {
                method:
                  "GET",
              }
            );

          if (
            !response.ok
          ) {
            throw new Error(
              `Search request failed: ${response.status}`
            );
          }

          const json =
            await response.json();

          if (
            !active
          ) {
            return;
          }

          if (
            json.success &&
            Array.isArray(
              json.data
            )
          ) {
            setResults(
              json.data
            );
          } else {
            setResults(
              []
            );
          }
        } catch (
          err
        ) {
          console.error(
            "Search error:",
            err
          );

          if (
            active
          ) {
            setResults(
              []
            );

            setError(
              "Pencarian sedang mengalami kendala. Silakan coba kembali."
            );
          }
        } finally {
          if (
            active
          ) {
            setLoading(
              false
            );
          }
        }
      };

    fetchResults();

    return () => {
      active = false;
    };
  }, [
    queryParam,
  ]);

  // ==========================================================================
  // OUTPUT
  // ==========================================================================

  return (
    <main className="min-h-screen w-full bg-gray-50 pb-28 text-slate-900">

      {/* ==================================================================== */}
      {/* MOBILE-FIRST WRAPPER */}
      {/* ==================================================================== */}

      <div className="mx-auto w-full max-w-md px-3 pt-3">

        {/* ================================================================== */}
        {/* HEADER */}
        {/* ================================================================== */}

        <header className="w-full border border-gray-200/90 bg-white px-4 py-5 shadow-sm">

          <div className="flex items-start gap-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-50">

              <Search className="h-[18px] w-[18px] text-[#0d5c91]" />

            </div>

            <div className="min-w-0 flex-1">

              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#0d5c91]">
                Pencarian
              </p>

              <h1 className="mt-1 text-[21px] font-extrabold leading-tight tracking-tight text-slate-950">
                Hasil Penelusuran
              </h1>

              {queryParam ? (
                <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
                  Menampilkan hasil untuk{" "}
                  <strong className="font-bold text-slate-700">
                    &quot;{queryParam}&quot;
                  </strong>
                </p>
              ) : (
                <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
                  Masukkan kata kunci melalui kolom pencarian untuk menemukan artikel atau program kebaikan.
                </p>
              )}

            </div>

          </div>

        </header>

        {/* ================================================================== */}
        {/* RESULT STATUS */}
        {/* ================================================================== */}

        {queryParam && (
          <div className="mt-3 border border-gray-200/90 bg-white px-4 py-3 shadow-sm">

            {loading ? (

              <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-500">

                <Loader2 className="h-4 w-4 animate-spin text-[#0d5c91]" />

                <span>
                  Mencari konten...
                </span>

              </div>

            ) : (

              <p className="text-[10px] font-medium text-slate-500">

                Ditemukan{" "}
                <strong className="font-bold text-slate-800">
                  {results.length}
                </strong>{" "}
                hasil untuk{" "}
                <strong className="font-bold text-slate-800">
                  &quot;{queryParam}&quot;
                </strong>

              </p>

            )}

          </div>
        )}

        {/* ================================================================== */}
        {/* ERROR */}
        {/* ================================================================== */}

        {!loading &&
          error && (

            <section className="mt-3 w-full border border-red-100 bg-white px-4 py-5 shadow-sm">

              <p className="text-[12px] font-bold text-slate-800">
                Pencarian belum dapat diproses
              </p>

              <p className="mt-2 text-[11px] leading-[1.7] text-slate-500">
                {error}
              </p>

            </section>

          )}

        {/* ================================================================== */}
        {/* SEARCH RESULTS */}
        {/* ================================================================== */}

        {!loading &&
          !error &&
          results.length >
            0 && (

            <section className="mt-3 w-full overflow-hidden border border-gray-200/90 bg-white shadow-sm">

              <div className="divide-y divide-gray-100">

                {results.map(
                  (
                    item
                  ) => {
                    const targetUrl =
                      item.type ===
                      "news"
                        ? `/news/${item.slug}`
                        : `/campaign/${item.slug}`;

                    const displayUrl =
                      item.type ===
                      "news"
                        ? `islami.or.id › news › ${item.slug}`
                        : `islami.or.id › campaign › ${item.slug}`;

                    const description =
                      item.type ===
                      "news"
                        ? `Baca artikel dan informasi terbaru di islami.or.id mengenai ${item.title}.`
                        : `Program kebaikan islami.or.id${item.category ? ` dalam kategori ${item.category}` : ""}. Lihat informasi lengkap dan cara berpartisipasi.`;

                    return (
                      <article
                        key={
                          item.id
                        }
                        className="group px-4 py-5 transition-colors hover:bg-gray-50/70"
                      >

                        {/* ================================================== */}
                        {/* URL */}
                        {/* ================================================== */}

                        <div className="flex min-w-0 items-center gap-2">

                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-sky-100 bg-sky-50">

                            <Globe className="h-3.5 w-3.5 text-[#0d5c91]" />

                          </div>

                          <p className="min-w-0 truncate text-[9px] font-medium text-gray-400">
                            {displayUrl}
                          </p>

                        </div>

                        {/* ================================================== */}
                        {/* TITLE */}
                        {/* ================================================== */}

                        <Link
                          href={
                            targetUrl
                          }
                          className="mt-2 block text-[14px] font-bold leading-[1.45] tracking-tight text-[#0d5c91] transition group-hover:underline sm:text-[15px]"
                        >
                          {item.title}
                        </Link>

                        {/* ================================================== */}
                        {/* DESCRIPTION */}
                        {/* ================================================== */}

                        <p className="mt-2 line-clamp-2 text-[11px] leading-[1.75] text-gray-600 sm:text-[12px]">
                          {description}
                        </p>

                        {/* ================================================== */}
                        {/* TYPE */}
                        {/* ================================================== */}

                        <div className="mt-3">

                          <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[8px] font-bold uppercase tracking-wider text-slate-500">

                            {item.type ===
                            "news"
                              ? "Artikel"
                              : "Program"}

                          </span>

                        </div>

                      </article>
                    );
                  }
                )}

              </div>

            </section>

          )}

        {/* ================================================================== */}
        {/* EMPTY RESULT */}
        {/* ================================================================== */}

        {!loading &&
          !error &&
          queryParam &&
          results.length ===
            0 && (

            <section className="mt-3 w-full border border-gray-200/90 bg-white px-4 py-6 shadow-sm">

              <div className="flex items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-50">

                  <FileSearch className="h-[18px] w-[18px] text-slate-400" />

                </div>

                <div className="min-w-0 flex-1">

                  <h2 className="text-[13px] font-bold text-slate-900">
                    Hasil tidak ditemukan
                  </h2>

                  <p className="mt-2 text-[11px] leading-[1.7] text-slate-500">
                    Kami belum menemukan artikel atau program yang cocok dengan{" "}
                    <strong className="font-bold text-slate-700">
                      &quot;{queryParam}&quot;
                    </strong>
                    .
                  </p>

                </div>

              </div>

              <div className="mt-5 border-t border-slate-100 pt-4">

                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
                  Coba cara berikut
                </p>

                <ul className="mt-3 list-disc space-y-2 pl-5 text-[11px] leading-[1.7] text-slate-600">

                  <li>
                    Pastikan ejaan kata kunci sudah benar.
                  </li>

                  <li>
                    Gunakan kata kunci yang lebih pendek atau umum.
                  </li>

                  <li>
                    Coba kata seperti Zakat, Santri, Sedekah, Wakaf, atau Yatim.
                  </li>

                </ul>

              </div>

              <Link
                href="/"
                className="mt-5 flex w-full items-center justify-center bg-[#0d5c91] py-3 text-[10px] font-bold uppercase tracking-wider text-white transition hover:bg-sky-900"
              >
                Kembali ke Beranda
              </Link>

            </section>

          )}

        {/* ================================================================== */}
        {/* EMPTY QUERY */}
        {/* ================================================================== */}

        {!queryParam &&
          !loading && (

            <section className="mt-3 w-full border border-gray-200/90 bg-white px-4 py-7 text-center shadow-sm">

              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-sky-50">

                <Search className="h-5 w-5 text-[#0d5c91]" />

              </div>

              <h2 className="mt-4 text-[13px] font-bold text-slate-900">
                Belum ada kata kunci
              </h2>

              <p className="mx-auto mt-2 max-w-[290px] text-[11px] leading-[1.7] text-slate-500">
                Gunakan kolom pencarian pada situs untuk menemukan artikel Islam dan program kebaikan yang Anda butuhkan.
              </p>

              <Link
                href="/news"
                className="mt-5 flex w-full items-center justify-center border border-slate-300 bg-white py-3 text-[10px] font-bold uppercase tracking-wider text-slate-700 transition hover:bg-slate-100"
              >
                Lihat Artikel Terbaru
              </Link>

            </section>

          )}

      </div>

    </main>
  );
}

// ============================================================================
// PAGE
// ============================================================================

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen w-full bg-gray-50">

          <div className="mx-auto flex min-h-[60vh] w-full max-w-md items-center justify-center px-3">

            <div className="flex flex-col items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#102a43]">

                <Loader2 className="h-4 w-4 animate-spin text-white" />

              </div>

              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-gray-400">
                Menyiapkan pencarian
              </p>

            </div>

          </div>

        </main>
      }
    >
      <SearchResultsContent />
    </Suspense>
  );
}