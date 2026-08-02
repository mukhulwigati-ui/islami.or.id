// app/components/LayoutClientWrapper.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Header from "@/components/Header";
import { X, Download, Smartphone } from 'lucide-react';

interface LayoutClientWrapperProps {
  children: React.ReactNode;
}

export default function LayoutClientWrapper({ children }: LayoutClientWrapperProps) {
  const pathname = usePathname();

  const isStudioPage = pathname?.startsWith('/studio');
  const isHomePage = pathname === '/';

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  
  // Melacak apakah user sudah menutup prompt pada sesi ini
  const [hasClosedPrompt, setHasClosedPrompt] = useState(false);

  useEffect(() => {
    // Cek apakah di sesi ini user sudah pernah menutup PWA prompt
    const closedInSession = sessionStorage.getItem('pwa_prompt_closed');
    if (closedInSession === 'true') {
      setHasClosedPrompt(true);
      return;
    }

    if (!isHomePage || isStudioPage || hasClosedPrompt) {
      setShowPrompt(false);
      return;
    }

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    const checkAndShow = () => {
      // Pastikan modal lain TIDAK sedang terbuka di DOM
      const activeModals = document.querySelectorAll('.fixed.inset-0.z-50');
      
      // Jika tidak ada modal lain yang aktif dan user belum close, tampilkan prompt PWA
      if (activeModals.length === 0 && !hasClosedPrompt) {
        setShowPrompt(true);
      } else {
        // Jika ada modal lain, tunda pengecekan berikutnya
        setTimeout(checkAndShow, 1000);
      }
    };

    // 🚀 Ditunda selama 10 detik agar tidak langsung muncul mengganggu pengunjung baru
    if (isIOSDevice) {
      const timer = setTimeout(() => {
        checkAndShow();
      }, 10000);
      return () => clearTimeout(timer);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      const timer = setTimeout(() => {
        checkAndShow();
      }, 10000);

      return () => clearTimeout(timer);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isHomePage, isStudioPage, hasClosedPrompt]);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('PWA installed successfully');
    }
    setDeferredPrompt(null);
    setShowPrompt(false);
    setHasClosedPrompt(true);
    sessionStorage.setItem('pwa_prompt_closed', 'true');
  };

  const handleClose = () => {
    setShowPrompt(false);
    setShowIOSGuide(false);
    setHasClosedPrompt(true);
    sessionStorage.setItem('pwa_prompt_closed', 'true');
  };

  return (
    <>
      {!isStudioPage && (
        <Header />
      )}
      
      <main className="flex-grow">
        {children}
      </main>

      {/* 🚀 BOTTOM NAVIGATION / MENU BAWAH: Di-hidden secara mutlak jika berada di halaman Sanity Studio */}
      {!isStudioPage && (
        <nav aria-label="Bottom Navigation" className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-lg">
          {/* Tempatkan elemen atau komponen bottom navigation Anda di sini */}
        </nav>
      )}

      {/* MODAL PWA PROMPT (DITENGAHKAN, ROUNDED PROPORSIONAL / TIDAK KELEBAREN) */}
      {isHomePage && !isStudioPage && showPrompt && !hasClosedPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-white border border-slate-200 shadow-2xl p-5 text-left space-y-4 rounded-xl">
            
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-1.5 transition rounded-lg"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 bg-sky-50 text-[#0d5c91] border border-sky-100 flex items-center justify-center shadow-inner rounded-lg">
              <Smartphone className="w-6 h-6" />
            </div>

            <div className="space-y-1.5 pr-4">
              <span className="text-[10px] font-bold text-sky-600 uppercase tracking-widest block">
                APLIKASI RESMI
              </span>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                Install Aplikasi Islami.or.id
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {showIOSGuide
                  ? "Ketuk ikon Share (Bagikan) di Safari, lalu pilih 'Add to Home Screen' (Tambah ke Layar Utama)."
                  : "Pasang aplikasi islami.or.id di perangkat Anda untuk akses layanan donasi, infaq, dan zakat yang lebih cepat, praktis, serta optimal."}
              </p>
            </div>

            {!showIOSGuide && (
              <button
                onClick={handleInstallClick}
                className="w-full bg-[#0d5c91] hover:bg-sky-900 text-white font-bold text-xs sm:text-sm uppercase tracking-wider py-3.5 transition shadow-sm flex items-center justify-center gap-2 rounded-lg"
              >
                <Download className="w-4 h-4" /> Install Sekarang 🚀
              </button>
            )}

          </div>
        </div>
      )}
    </>
  );
}