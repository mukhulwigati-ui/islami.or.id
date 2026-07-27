// components/DonationModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { X, Heart, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  programId?: string;
  programTitle?: string;
}

const PRESET_AMOUNTS = [10000, 25000, 50000, 100000, 250000, 500000];

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function DonationModal({ isOpen, onClose, programId, programTitle }: DonationModalProps) {
  const [amount, setAmount] = useState<number>(50000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [donorName, setDonorName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // 🚀 Deteksi Sesi Login Aktif (Mendukung LocalStorage & Session API)
  useEffect(() => {
    if (isOpen) {
      async function loadUserData() {
        try {
          // 1. Coba ambil dari Supabase Auth Session API
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user) {
            const user = session.user;
            const meta = user.user_metadata || {};
            const emailVal = user.email || '';
            const nameVal = meta.full_name || meta.name || meta.user_name || (emailVal ? emailVal.split('@')[0] : '');

            setEmail(emailVal);
            setDonorName(nameVal);
            setPhone(meta.phone || meta.phone_number || '');
            return;
          }

          // 2. Fallback: Cek localStorage jika session standar kosong
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
              const val = localStorage.getItem(key);
              if (val) {
                const parsed = JSON.parse(val);
                const user = parsed?.user;
                if (user) {
                  const meta = user.user_metadata || {};
                  const emailVal = user.email || '';
                  const nameVal = meta.full_name || meta.name || meta.user_name || (emailVal ? emailVal.split('@')[0] : '');

                  setEmail(emailVal);
                  setDonorName(nameVal);
                  setPhone(meta.phone || meta.phone_number || '');
                  break;
                }
              }
            }
          }
        } catch (err) {
          console.error('Gagal mengambil data user:', err);
        }
      }
      loadUserData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePresetClick = (val: number) => {
    setAmount(val);
    setCustomAmount('');
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setCustomAmount(val);
    if (val) {
      setAmount(Number(val));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      setErrorMsg('Silakan pilih atau masukkan nominal donasi yang valid.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/donation/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donorName: donorName.trim() || 'Hamba Allah',
          amount,
          programId,
          programTitle: programTitle || 'Sedekah Umum',
          phone: phone.trim(),
          email: email.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Gagal memproses transaksi.');
      }

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        throw new Error('URL pembayaran tidak ditemukan dari server.');
      }

    } catch (err: any) {
      console.error('🔥 Error checkout donasi:', err);
      setErrorMsg(err.message || 'Terjadi kesalahan jaringan.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 p-5 space-y-4 max-h-[90vh] overflow-y-auto">
        
        {/* Tombol Tutup */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full transition cursor-pointer"
          aria-label="Tutup"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Modal */}
        <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0 shadow-inner">
            <Heart className="w-5 h-5 fill-emerald-500" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Salurkan Kebaikan</h2>
            <p className="text-sm font-extrabold text-slate-900 line-clamp-1">{programTitle || 'Sedekah & Infaq Umum'}</p>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Pilihan Nominal */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Pilih Nominal Donasi</label>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_AMOUNTS.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handlePresetClick(val)}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition cursor-pointer ${
                    amount === val && !customAmount
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Rp {val >= 1000000 ? `${val / 1000000}jt` : `${val / 1000}rb`}
                </button>
              ))}
            </div>
          </div>

          {/* Input Nominal Bebas */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Atau Masukkan Nominal Lain</label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">Rp</span>
              <input
                type="text"
                placeholder="Contoh: 75000"
                value={customAmount ? Number(customAmount).toLocaleString('id-ID') : ''}
                onChange={handleCustomChange}
                className="w-full pl-9 pr-3 py-2 text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Form Data Donatur (Otomatis Terisi Jika Login) */}
          <div className="space-y-3 pt-1 border-t border-slate-100">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 block">Nama Lengkap / Inisial</label>
              <input
                type="text"
                placeholder="Kosongkan jika ingin sebagai Hamba Allah"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                className="w-full px-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white transition"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">Nomor WhatsApp</label>
                <input
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">Email (Opsional)</label>
                <input
                  type="email"
                  placeholder="email@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                />
              </div>
            </div>
          </div>

          {/* Info Keamanan */}
          <div className="flex items-center gap-2 text-[10px] text-slate-500 bg-sky-50/50 p-2.5 rounded-xl border border-sky-100">
            <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
            <span>Transaksi aman, terverifikasi otomatis, dan didukung gateway pembayaran resmi DOKU.</span>
          </div>

          {/* Tombol Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Memproses Pembayaran...
              </>
            ) : (
              <>
                Lanjutkan Pembayaran <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

        </form>

      </div>
    </div>
  );
}