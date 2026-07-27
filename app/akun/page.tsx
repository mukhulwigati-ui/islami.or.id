// app/akun/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { Phone, LogOut, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function AkunPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [whatsapp, setWhatsapp] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user }, error: userErr } = await supabase.auth.getUser();
        if (userErr || !user) {
          router.push('/login');
          return;
        }
        setUser(user);

        const meta = user.user_metadata || {};
        const defaultName = meta.full_name || meta.name || user.email?.split('@')[0] || 'Dermawan';
        const defaultAvatar = meta.avatar_url || meta.picture || '';

        // Coba ambil dari tabel profiles
        let { data: prof, error: profErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (!prof) {
          // Jika belum ada barisnya, buat secara otomatis
          const newProf = {
            id: user.id,
            email: user.email,
            name: defaultName,
            avatar: defaultAvatar,
            phone: ''
          };
          await supabase.from('profiles').upsert(newProf);
          prof = newProf;
        }

        setProfile(prof);
        setWhatsapp(prof.phone || '');
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
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

      const { error } = await supabase
        .from('profiles')
        .update({ phone: cleanPhone, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) throw error;

      setProfile((prev: any) => ({ ...prev, phone: cleanPhone }));
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">
          Memuat profil...
        </div>
      </div>
    );
  }

  const displayName = profile?.name || user?.email?.split('@')[0] || 'Dermawan';
  const displayEmail = profile?.email || user?.email || '';
  const displayAvatar = profile?.avatar || '';

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-md mx-auto space-y-5">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Profil Saya</h1>
        
        {/* Card Info Akun */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            {displayAvatar ? (
              <img src={displayAvatar} alt={displayName} className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0" />
            ) : (
              <div className="w-12 h-12 bg-sky-50 text-[#0d5c91] rounded-full flex items-center justify-center font-bold text-base border border-sky-100 shrink-0">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-900 truncate">{displayName}</p>
              <p className="text-xs text-slate-400 truncate">{displayEmail}</p>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Status Keanggotaan</label>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Terhubung dengan Google Auth
            </div>
          </div>
        </div>

        {/* Card Form Update Nomor WhatsApp */}
        <form onSubmit={handleSaveWhatsapp} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div>
            <label className="text-xs font-extrabold text-slate-800 block mb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#0d5c91]" /> Nomor WhatsApp Utama
            </label>
            <p className="text-[11px] text-slate-400 mb-2">Digunakan untuk otomatisasi form donasi dan kuitansi instan.</p>
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
            className="w-full bg-[#0d5c91] hover:bg-sky-900 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer disabled:bg-slate-300"
          >
            {saving ? 'Menyimpan...' : 'Simpan Nomor WhatsApp'}
          </button>
        </form>

        {/* Tombol Logout */}
        <button
          onClick={handleLogout}
          className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold py-3 rounded-xl transition text-xs uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" /> Keluar (Logout)
        </button>
      </div>
    </div>
  );
}