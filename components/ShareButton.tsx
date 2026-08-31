// components/ShareButton.tsx

"use client";

import React, {
  useState,
} from "react";

interface ShareButtonProps {
  title: string;
}

export default function ShareButton({
  title,
}: ShareButtonProps) {
  const [
    copied,
    setCopied,
  ] = useState(false);

  async function handleShare() {
    const url =
      window.location.href;

    try {
      if (
        typeof navigator.share ===
        "function"
      ) {
        await navigator.share({
          title,
          text: title,
          url,
        });

        return;
      }

      if (
        navigator.clipboard
      ) {
        await navigator.clipboard.writeText(
          url
        );

        setCopied(true);

        window.setTimeout(
          () => {
            setCopied(false);
          },
          2000
        );

        return;
      }

      // Fallback browser lama
      const textarea =
        document.createElement(
          "textarea"
        );

      textarea.value =
        url;

      textarea.style.position =
        "fixed";

      textarea.style.opacity =
        "0";

      document.body.appendChild(
        textarea
      );

      textarea.select();

      document.execCommand(
        "copy"
      );

      document.body.removeChild(
        textarea
      );

      setCopied(true);

      window.setTimeout(
        () => {
          setCopied(false);
        },
        2000
      );
    } catch (error) {
      if (
        error instanceof DOMException &&
        error.name ===
          "AbortError"
      ) {
        return;
      }

      console.error(
        "Gagal membagikan artikel:",
        error
      );
    }
  }

  return (
    <button
      type="button"
      onClick={() => {
        void handleShare();
      }}
      aria-label={`Bagikan artikel ${title}`}
      className="border border-sky-100 bg-sky-50 px-4 py-2.5 text-xs font-bold text-[#0d5c91] shadow-sm transition hover:bg-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-200 sm:text-sm"
    >
      {copied
        ? "✓ Tautan Tersalin"
        : "🔗 Bagikan"}
    </button>
  );
}