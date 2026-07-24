// components/LayoutClientWrapper.tsx
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
      // Pastikan modal lain (seperti Portal Fundraiser / Modal Donatur) TIDAK sedang terbuka di DOM
      const activeModals = document.querySelectorAll('.fixed.inset-0.z-50');
      
      // Jika tidak ada modal lain yang aktif dan user belum close, tampilkan prompt PWA
      if (activeModals.length === 0 && !hasClosedPrompt) {
        setShowPrompt(true);
      } else {
        // Jika ada modal lain, tunda pengecekan berikutnya
        setTimeout(checkAndShow, 1000);
      }
    };

    if (isIOSDevice) {
      const timer = setTimeout(() => {
        checkAndShow();
      }, 5000);
      return () => clearTimeout(timer);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      const timer = setTimeout(() => {
        checkAndShow();
      }, 5000);

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
    // Simpan ke sessionStorage agar tidak muncul lagi sebelum halaman direfresh / sesi baru
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
        <nav aria-label="Bottom Navigation" className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg">
          {/* Tempatkan elemen atau komponen bottom navigation Anda di sini */}
        </nav>
      )}

      {/* MODAL PWA PROMPT */}
      {isHomePage && !isStudioPage && showPrompt && !hasClosedPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-xs bg-white rounded-2xl shadow-2xl border border-slate-100 p-5 text-center space-y-4">
            
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full transition"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 bg-sky-50 text-[#0d5c91] rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Smartphone className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-sm font-extrabold text-slate-900">Install Aplikasi</h2>
              <p className="text-[11px] text-slate-600 leading-relaxed px-1">
                {showIOSGuide
                  ? "Ketuk ikon Share (Bagikan) di Safari, lalu pilih 'Add to Home Screen' (Tambah ke Layar Utama)."
                  : "Pasang islami.or.id di perangkat Anda untuk akses layanan yang lebih cepat, praktis, dan seperti aplikasi native."}
              </p>
            </div>

            {!showIOSGuide && (
              <button
                onClick={handleInstallClick}
                className="w-full bg-[#0d5c91] hover:bg-sky-900 text-white font-bold text-[11px] uppercase tracking-wider py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Pasang Sekarang
              </button>
            )}

          </div>
        </div>
      )}
    </>
  );
}