"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";

type ViewCounterProps = {
  type: "news" | "campaign";
  slug: string;
  className?: string;
};

export default function ViewCounter({
  type,
  slug,
  className = "",
}: ViewCounterProps) {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;

    async function loadViews() {
      try {
        // =================================================
        // SATU VIEW PER SESSION PER ARTIKEL/CAMPAIGN
        // =================================================

        const storageKey = `islami-viewed:${type}:${slug}`;

        const alreadyViewed =
          typeof window !== "undefined" &&
          sessionStorage.getItem(storageKey) === "1";

        // =================================================
        // SUDAH PERNAH DIBUKA DALAM SESSION INI
        // CUKUP AMBIL COUNTER
        // =================================================

        if (alreadyViewed) {
          const res = await fetch(
            `/api/views?type=${encodeURIComponent(
              type
            )}&slug=${encodeURIComponent(slug)}`,
            {
              method: "GET",
              cache: "no-store",
            }
          );

          if (!res.ok) {
            throw new Error("Gagal mengambil views");
          }

          const json = await res.json();

          if (!cancelled) {
            setViews(Number(json.views ?? 0));
          }

          return;
        }

        // =================================================
        // BELUM DIBUKA
        // TAMBAHKAN VIEW
        // =================================================

        const res = await fetch("/api/views", {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          cache: "no-store",

          body: JSON.stringify({
            type,
            slug,
          }),
        });

        if (!res.ok) {
          throw new Error("Gagal menambahkan views");
        }

        const json = await res.json();

        if (json.counted === true) {
          try {
            sessionStorage.setItem(storageKey, "1");
          } catch {
            // Abaikan apabila storage browser tidak tersedia
          }
        }

        if (!cancelled) {
          setViews(Number(json.views ?? 0));
        }
      } catch (error) {
        console.error("VIEW COUNTER ERROR:", error);

        // Jika gagal increment, coba tampilkan angka yang ada
        try {
          const res = await fetch(
            `/api/views?type=${encodeURIComponent(
              type
            )}&slug=${encodeURIComponent(slug)}`,
            {
              cache: "no-store",
            }
          );

          if (res.ok) {
            const json = await res.json();

            if (!cancelled) {
              setViews(Number(json.views ?? 0));
            }
          }
        } catch (fallbackError) {
          console.error(
            "VIEW COUNTER FALLBACK ERROR:",
            fallbackError
          );
        }
      }
    }

    loadViews();

    return () => {
      cancelled = true;
    };
  }, [type, slug]);

  if (views === null) {
    return (
      <span
        className={`inline-flex items-center gap-1 text-xs text-gray-400 ${className}`}
      >
        <Eye size={14} />
        ...
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs text-gray-500 ${className}`}
      title={`${views.toLocaleString("id-ID")} kali dibaca`}
    >
      <Eye size={14} />

      <span>
        {views.toLocaleString("id-ID")} dibaca
      </span>
    </span>
  );
}