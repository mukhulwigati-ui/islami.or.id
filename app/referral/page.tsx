// app/referral/page.tsx
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Copy, Check, Users, Wallet, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';

export default function ReferralPage() {
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  
  // State interaktif link afiliasi per program
  const [selectedSlug, setSelectedSlug] = useState('');
  const [copied, setCopied] = useState(false);

  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  useEffect(() => {
    const fetchProfileAndStats = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Ambil data profil (terutama nomor WhatsApp)
        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (prof) {
          setProfile(prof);

          // Jika nomor telepon/WhatsApp tersedia di profil, ambil data statistik fundraiser-nya secara otomatis
          if (prof.phone) {
            setStatsLoading(true);
            try {
              const res = await fetch(`/api/fundraiser/stats?phone=${prof.phone}`);
              const json = await res.json();
              if (json.success) {
                setStats(json);
              }
            } catch (err) {
              console.error('Gagal memuat statistik afiliasi:', err);
            } finally {
              setStatsLoading(false);
            }
          }
        }
      }
      setLoading(false);
    };

    fetchProfileAndStats();
  }, [supabase]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">
          <Loader2 className="w-5 h-5 animate-spin text-[#0d5c91]" /> Memuat data referral...
        </div>
      </div>
    );
  }

  const cleanPhone = profile?.phone ? profile.phone.replace(/[^0-9]/g, '') : '';
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const defaultReferralLink = cleanPhone ? `${baseUrl}/?ref=${cleanPhone}` : `${baseUrl}/r/ILHAMTV`;

  return (
    <div className="min-h-screen bg-slate-50 pb-28 pt-4 px-4">
      <div className="max-w-md mx-auto space-y-4">
        
        {/* Header Navigasi */}
        <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <Link href="/akun" className="p-2 bg-slate-100 rounded-xl hover:bg-slate-200 transition">
            <ArrowLeft className="w-4 h-4 text-slate-700" />
          </Link>
          <h1 className="font-extrabold text-base text-slate-900">Ajak Teman & Performa Afiliasi</h1>
        </div>

        {/* Banner Card */}
        <div className="bg-gradient-to-br from-[#0d5c91] to-sky-900 text-white p-5 rounded-3xl shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-sky-200 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" /> Program Kebaikan Berkelanjutan
          </div>
          <h2 className="text-lg font-extrabold">Sebarkan Link, Raih Pahala & Komisi</h2>
          <p className="text-xs text-sky-100 leading-relaxed">
            Bagikan tautan campaign atau platform ke teman dan media sosial Anda. Setiap donasi yang masuk melalui tautan Anda akan tercatat secara transparan.
          </p>
        </div>

        {/* Peringatan Jika Belum Mengisi Nomor WhatsApp */}
        {!profile?.phone && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" /> Nomor WhatsApp Belum Terhubung
            </div>
            <p className="text-xs text-amber-800">
              Mohon lengkapi nomor WhatsApp Anda di menu <Link href="/pengaturan" className="underline font-bold">Pengaturan Akun</Link> agar sistem dapat melacak statistik penghimpunan dana referral Anda secara otomatis.
            </p>
          </div>
        )}

        {/* Statistik Keuangan & Performa Afiliasi (Dari API Fundraiser) */}
        {stats && stats.profile ? (
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-[#0d5c91]" /> Statistik Penghimpunan
              </span>
              <span className="text-[10px] font-bold px-2.5 py-0.5 uppercase rounded-full text-white bg-emerald-600">
                Aktif Otomatis
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Dana Dihimpun</span>
                <p className="text-base font-extrabold text-emerald-600">Rp {stats.totalEarnings.toLocaleString('id-ID')}</p>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Transaksi</span>
                <p className="text-base font-extrabold text-slate-900">{stats.donationCount} Sukses</p>
              </div>
            </div>

            {/* Rincian Ujrah / Fee */}
            <div className="bg-sky-50/50 p-3.5 rounded-2xl border border-sky-100 space-y-2 text-xs">
              <div className="flex justify-between items-baseline">
                <span className="font-semibold text-slate-600">Total Ujrah Hak Anda (10%)</span>
                <span className="font-bold text-slate-800">Rp {Math.round(stats.totalEarnings * 0.1).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="font-semibold text-amber-700">Fee Sudah Dibayarkan</span>
                <span className="font-bold text-amber-800">-Rp {(stats.profile.feePaid || 0).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between items-baseline border-t border-sky-200/60 pt-2 font-extrabold text-[#0d5c91]">
                <span>Sisa Saldo Fee Tersedia</span>
                <span className="text-sm">Rp {Math.max(0, Math.round(stats.totalEarnings * 0.1) - (stats.profile.feePaid || 0)).toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>
        ) : statsLoading ? (
          <div className="text-center py-6 bg-white rounded-2xl border border-slate-200 text-xs text-slate-400 animate-pulse">
            Memuat statistik afiliasi...
          </div>
        ) : null}

        {/* Kotak Link Referral Utama & Per Program */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">🔗 Salin Tautan Afiliasi</h3>
          
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-500 block">Tautan Umum Platform</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={defaultReferralLink}
                className="flex-1 bg-slate-50 border border-slate-200 px-3 py-2.5 text-xs font-mono text-slate-700 rounded-xl focus:outline-none truncate"
              />
              <button
                onClick={() => handleCopy(defaultReferralLink)}
                className="bg-[#0d5c91] hover:bg-sky-900 text-white font-bold px-4 py-2.5 text-xs rounded-xl flex items-center gap-1.5 transition shrink-0 cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Tersalin' : 'Salin'}</span>
              </button>
            </div>
          </div>

          {/* Pilihan Multi-Program dari Stats */}
          {stats && stats.programs && stats.programs.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-[11px] font-bold text-[#0d5c91] block">Atau Pilih Program Spesifik:</label>
              <select
                value={selectedSlug}
                onChange={(e) => {
                  setSelectedSlug(e.target.value);
                  setCopied(false);
                }}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0d5c91]"
              >
                <option value="">-- Pilih Program Donasi --</option>
                {stats.programs.map((prog: any, index: number) => (
                  <option key={index} value={prog.slug}>
                    {prog.title}
                  </option>
                ))}
              </select>

              {selectedSlug && (() => {
                const affiliateUrl = `${baseUrl}/campaign/${selectedSlug}?ref=${cleanPhone}`;
                return (
                  <div className="border border-sky-100 bg-sky-50/40 p-3 rounded-xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Tautan Program:</span>
                      <button 
                        type="button"
                        onClick={() => handleCopy(affiliateUrl)}
                        className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-lg text-white flex items-center gap-1 ${copied ? 'bg-emerald-600' : 'bg-[#0d5c91]'}`}
                      >
                        {copied ? <><Check className="w-3 h-3" /> Tersalin</> : <><Copy className="w-3 h-3" /> Salin</>}
                      </button>
                    </div>
                    <div className="bg-white border border-slate-200 px-2.5 py-2 text-[10px] font-mono text-slate-600 rounded-lg truncate select-all">
                      {affiliateUrl}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Riwayat Dukungan Transaksi dari Referral */}
        {stats && stats.history && stats.history.length > 0 && (
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">Riwayat Dukungan Referral</h3>
            <div className="max-h-52 overflow-y-auto space-y-2 divide-y divide-slate-50">
              {stats.history.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center pt-2.5 text-xs gap-3">
                  <div className="flex-1 min-w-0 text-left space-y-0.5">
                    <span className="font-bold text-slate-800 block truncate">{item.donorName}</span>
                    <span className="text-[10px] font-semibold text-[#0d5c91] bg-sky-50 px-2 py-0.5 rounded-md inline-block truncate max-w-full">
                      {item.programTitle || 'Sedekah Umum'}
                    </span>
                  </div>
                  <span className="font-extrabold text-emerald-600 font-mono whitespace-nowrap">
                    +Rp {Number(item.amount).toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}