// app/donasi-saya/page.tsx
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { Clock, CheckCircle2, AlertCircle, ArrowRight, Wallet } from 'lucide-react';

export default function DonasiSayaPage() {
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'semua' | 'pending' | 'sukses'>('semua');

  // Menggunakan helper instance konsisten
  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data } = await supabase
          .from('donations')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (data) setDonations(data);
      }
      setLoading(false);
    };
    fetchData();
  }, [supabase]);

  // Filter data berdasarkan tab
  const filteredDonations = donations.filter((d) => {
    const status = (d.status || 'pending').toLowerCase();
    if (activeTab === 'pending') return status === 'pending' || status === 'unpaid';
    if (activeTab === 'sukses') return status === 'success' || status === 'paid' || status === 'completed';
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500 font-semibold text-sm animate-pulse">Memuat riwayat donasi...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 px-4 py-6">
      <div className="max-w-md mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Riwayat Donasi Saya</h1>
          <Wallet className="w-6 h-6 text-[#0d5c91]" />
        </div>

        {/* Tab Filter (Semua, Belum Bayar, Berhasil) */}
        <div className="flex bg-slate-200/70 p-1 rounded-xl text-xs font-bold text-slate-600">
          <button
            onClick={() => setActiveTab('semua')}
            className={`flex-1 py-2.5 rounded-lg transition cursor-pointer ${activeTab === 'semua' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}`}
          >
            Semua ({donations.length})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 py-2.5 rounded-lg transition cursor-pointer ${activeTab === 'pending' ? 'bg-white text-amber-700 shadow-xs' : 'hover:text-slate-900'}`}
          >
            Belum Bayar
          </button>
          <button
            onClick={() => setActiveTab('sukses')}
            className={`flex-1 py-2.5 rounded-lg transition cursor-pointer ${activeTab === 'sukses' ? 'bg-white text-emerald-700 shadow-xs' : 'hover:text-slate-900'}`}
          >
            Berhasil
          </button>
        </div>

        {/* List Riwayat */}
        {filteredDonations.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="w-12 h-12 bg-sky-50 text-[#0d5c91] rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-800 font-bold text-base">Belum ada riwayat donasi</p>
              <p className="text-xs text-slate-400 mt-1">Yuk, mulai sebarkan kebaikan melalui program pilihan kami.</p>
            </div>
            <Link 
              href="/" 
              className="inline-block bg-[#0d5c91] hover:bg-sky-900 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition shadow-sm"
            >
              Mulai Berdonasi
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDonations.map((d: any) => {
              const status = (d.status || 'pending').toLowerCase();
              const isPending = status === 'pending' || status === 'unpaid';

              return (
                <div key={d.id} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-extrabold text-sm text-slate-900 leading-snug">{d.program_name || d.programTitle || 'Sedekah Umum'}</p>
                    {isPending ? (
                      <span className="shrink-0 flex items-center gap-1 text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full">
                        <Clock className="w-3 h-3" /> Belum Dibayar
                      </span>
                    ) : (
                      <span className="shrink-0 flex items-center gap-1 text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Berhasil
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                    <span className="text-slate-400 font-medium">Nominal Donasi</span>
                    <span className="font-extrabold text-sm text-[#0d5c91]">Rp {Number(d.amount || 0).toLocaleString('id-ID')}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>{new Date(d.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    
                    {/* Tombol aksi jika status masih pending dan ada payment_url */}
                    {isPending && d.payment_url && (
                      <a
                        href={d.payment_url}
                        className="bg-[#e91e63] hover:bg-pink-700 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition shadow-xs"
                      >
                        Bayar Sekarang <ArrowRight className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}