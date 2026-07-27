// app/akun/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { User, Phone, LogOut, CheckCircle2, Loader2 } from 'lucide-react';

export default function AkunPage() {
  const [user, setUser] = useState<any>(null);
  const [whatsapp, setWhatsapp] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      } else {
        setUser(user);
        // Ambil data phone/whatsapp yang tersimpan di metadata jika ada
        const meta = user.user_metadata || {};
        setWhatsapp(meta.phone || meta.whatsapp || '');
      }
    };
    checkUser();
  }, [router, supabase]);

  const handleSaveWhatsapp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const cleanPhone = whatsapp.replace(/[^0-9]/g, '');
      if (cleanPhone.length < 9) {
        alert('Masukkan Nomor WhatsApp yang valid (minimal 9 digit)!');
        setSaving(false);
        return;
      }

      // Update user_metadata di Supabase Auth
      const { data, error } = await supabase.auth.updateUser({
        data: { phone: cleanPhone }
      });

      if (error) throw error;

      if (data?.user) {
        setUser(data.user);
      }
      setMessage('Nomor WhatsApp berhasil disimpan! 🎉');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      alert('Gagal menyimpan nomor WhatsApp: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-widest">
          <Loader2 className="w-5 h-5 animate-spin text-[#0d5c91]" /> Memuat profil...
        </div>
      </div>
    );
  }

  const userMeta = user.user_metadata || {};
  const fullName = userMeta.full_name || userMeta.name || user.email?.split('@')[0] || 'Dermawan';

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-md mx-auto space-y-5">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Profil Saya</h1>
        
        {/* Card Info Akun Google */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="w-10 h-10 bg-sky-50 text-[#0d5c91] rounded-full flex items-center justify-center font-bold text-base border border-sky-100">
              {fullName.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-900 truncate">{fullName}</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Email Terdaftar</label>
            <p className="text-slate-800 text-sm font-semibold bg-slate-50 p-2.5 rounded-xl border border-slate-100">{user.email}</p>
          </div>
        </div>

        {/* Card Form Update Nomor WhatsApp */}
        <form onSubmit={handleSaveWhatsapp} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div>
            <label className="text-xs font-extrabold text-slate-800 block mb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#0d5c91]" /> Nomor WhatsApp Utama
            </label>
            <p className="text-[11px] text-slate-400 mb-2">Digunakan untuk otomatisasi form donasi dan pengiriman kuitansi/laporan.</p>
            <input
              type="tel"
              placeholder="Contoh: 081234567890"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full border border-slate-300 px-3.5 py-2.5 text-sm font-semibold text-slate-900 rounded-xl focus:outline-[#0d5c91] bg-white"
            />
          </div>

          {message && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> {message}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-[#0d5c91] hover:bg-sky-900 active:scale-[0.99] text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition shadow-sm cursor-pointer disabled:bg-slate-300"
          >
            {saving ? 'Menyimpan...' : 'Simpan Nomor WhatsApp'}
          </button>
        </form>

        {/* Tombol Logout */}
        <button
          onClick={handleLogout}
          className="w-full bg-rose-50 hover:bg-rose-100 active:scale-[0.99] text-rose-600 border border-rose-200 font-bold py-3 rounded-xl transition text-xs sm:text-sm uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" /> Keluar (Logout)
        </button>
      </div>
    </div>
  );
}