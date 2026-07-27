// app/referral/page.tsx
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Copy, Check, Share2, Users, Wallet } from 'lucide-react';

export default function ReferralPage() {
  const [profile, setProfile] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
        if (data) setProfile(data);
      }
      setLoading(false);
    };
    fetchUser();
  }, [supabase]);

  // Generate kode referral berbasis UUID user atau nama
  const referralCode = profile?.id ? `ILHAM${profile.id.slice(0, 5).toUpperCase()}` : 'ILHAMTV';
  const referralLink = typeof window !== 'undefined' ? `${window.location.origin}/r/${referralCode}` : `https://islami.or.id/r/${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs font-bold text-slate-500 animate-pulse">Memuat referral...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-28 pt-4 px-4">
      <div className="max-w-md mx-auto space-y-4">
        
        {/* Header */}
        <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <Link href="/akun" className="p-2 bg-slate-100 rounded-xl hover:bg-slate-200 transition">
            <ArrowLeft className="w-4 h-4 text-slate-700" />
          </Link>
          <h1 className="font-extrabold text-base text-slate-900">Ajak Teman (Referral)</h1>
        </div>

        {/* Banner Card */}
        <div className="bg-gradient-to-br from-[#0d5c91] to-sky-900 text-white p-5 rounded-3xl shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-sky-200 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" /> Program Kebaikan Berkelanjutan
          </div>
          <h2 className="text-lg font-extrabold">Sebarkan Link, Raih Pahala & Komisi</h2>
          <p className="text-xs text-sky-100 leading-relaxed">Bagikan tautan campaign ke teman atau media sosial Anda. Setiap donasi yang masuk melalui tautan Anda akan tercatat secara transparan.</p>
        </div>

        {/* Kotak Link Referral */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <label className="text-xs font-bold text-slate-700 block">Tautan Referral Anda</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={referralLink}
              className="flex-1 bg-slate-50 border border-slate-200 px-3 py-2.5 text-xs font-mono text-slate-700 rounded-xl focus:outline-none truncate"
            />
            <button
              onClick={handleCopy}
              className="bg-[#0d5c91] hover:bg-sky-900 text-white font-bold px-4 py-2.5 text-xs rounded-xl flex items-center gap-1.5 transition shrink-0 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Tersalin' : 'Salin'}</span>
            </button>
          </div>
        </div>

        {/* Statistik Referral */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-[#0d5c91]" /> Total Referral
            </span>
            <p className="text-lg font-extrabold text-slate-900">0 Orang</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Wallet className="w-3.5 h-3.5 text-[#0d5c91]" /> Total Komisi
            </span>
            <p className="text-lg font-extrabold text-emerald-700">Rp 0</p>
          </div>
        </div>

      </div>
    </div>
  );
}