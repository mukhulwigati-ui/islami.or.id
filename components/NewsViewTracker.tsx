"use client";

import { useEffect } from "react";

type ContentType = "news" | "campaign";

interface NewsViewTrackerProps {
  type: ContentType;
  slug: string;
}

export default function NewsViewTracker({
  type,
  slug,
}: NewsViewTrackerProps) {
  useEffect(() => {
    if (!slug) return;

    const cleanSlug = slug.trim();
    if (!cleanSlug) return;

    const storageKey = `islami:view:${type}:${cleanSlug}`;

    try {
      // Sudah dihitung pada session/tab ini.
      if (sessionStorage.getItem(storageKey) === "1") {
        return;
      }

      // Tandai sebelum fetch agar React Strict Mode di development
      // tidak mengirim dua request increment secara berdekatan.
      sessionStorage.setItem(storageKey, "1");
    } catch {
      // Jika sessionStorage tidak tersedia, counter tetap dicoba.
    }

    const controller = new AbortController();

    async function incrementView() {
      try {
        const response = await fetch("/api/views", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type,
            slug: cleanSlug,
          }),
          cache: "no-store",
          keepalive: true,
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (error) {
        if (controller.signal.aborted) return;

        console.error("[VIEW TRACKER] Gagal menambah view:", error);

        // Jika request benar-benar gagal, izinkan percobaan lagi.
        try {
          sessionStorage.removeItem(storageKey);
        } catch {
          // Abaikan.
        }
      }
    }

    void incrementView();

    return () => {
      controller.abort();
    };
  }, [type, slug]);

  // Komponen ini hanya bertugas mencatat pembaca.
  // Tidak menambahkan elemen visual ke halaman.
  return null;
}
