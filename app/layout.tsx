// app/layout.tsx
'use client';

import React, { useState, useEffect } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import LayoutClientWrapper from "@/components/LayoutClientWrapper";
import BottomNav from "@/components/BottomNav"; // 🚀 Import BottomNav Global
import { Download, X } from "lucide-react";
import "./globals.css";

// Catatan: Karena menggunakan 'use client' di root layout untuk interaksi PWA, 
// Metadata SEO di-handle melalui file terpisah atau dibiarkan jika Next.js mendukung export metadata pada client wrapper.
// Jika ingin memisahkan metadata SEO, Anda bisa memindahkan layout utama ke server component dan membuat PWA Banner sebagai komponen terpisah.

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPwaModal, setShowPwaModal] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // 🚀 Munculkan popup PWA di tengah setelah 10 detik
      const timer = setTimeout(() => {
        setShowPwaModal(true);
      }, 10000);

      return () => clearTimeout(timer);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('Pengguna menerima instalasi PWA');
    } else {
      console.log('Pengguna menolak instalasi PWA');
    }

    setDeferredPrompt(null);
    setShowPwaModal(false);
  };

  return (
    <html lang="id" className="antialiased">
      <body className="min-h-screen bg-slate-100 flex flex-col text-slate-800" suppressHydrationWarning>
        
        {/* 🚀 LAYOUT CLIENT WRAPPER */}
        <LayoutClientWrapper>
          {children}
        </LayoutClientWrapper>

        {/* 🚀 GLOBAL BOTTOM NAVIGATION */}
        <BottomNav />

        {/* 🚀 POPUP PWA INSTALL PROMPT (MUNCAK DI TENGAH SETELAH 10 DETIK) */}
        {showPwaModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-white border border-slate-200 shadow-2xl p-5 space-y-4 relative text-left">
              
              {/* Tombol Tutup */}
              <button 
                onClick={() => setShowPwaModal(false)}
                className="absolute top-3 right-3 text-slate-400 hover:text-slate-700 p-1"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-2 pr-6">
                <span className="text-[10px] sm:text-xs font-bold text-sky-600 uppercase tracking-widest block">
                  APLIKASI RESMI
                </span>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  Pasang Islami.or.id
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Pasang aplikasi kami di layar utama ponsel Anda untuk akses donasi, sedekah, dan zakat yang lebih cepat, mudah, dan ringan.
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2.5">
                <button
                  onClick={handleInstallClick}
                  className="w-full bg-[#0d5c91] hover:bg-sky-900 text-white font-bold text-xs sm:text-sm uppercase tracking-wider py-3 flex items-center justify-center gap-2 transition shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Install Sekarang 🚀</span>
                </button>
                <button
                  onClick={() => setShowPwaModal(false)}
                  className="w-full border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm uppercase tracking-wider py-2.5 transition"
                >
                  Nanti Saja
                </button>
              </div>

            </div>
          </div>
        )}

      </body>
    </html>
  );
}