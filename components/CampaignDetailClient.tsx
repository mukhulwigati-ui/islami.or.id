// components/CampaignDetailClient.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PortableText } from '@portabletext/react';
import { ArrowLeft, Share2, Copy, Check, MessageCircle } from 'lucide-react';

// ===================================================================
// 1. HEADER KHUSUS DETAIL PROGRAM
// ===================================================================
function DetailHeader({ title = 'Program Donasi', onOpenShare }: { title?: string; onOpenShare: () => void }) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 bg-[#0d5c91] text-white w-full shadow-sm">
      <div className="w-full max-w-md mx-auto px-4 h-14 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center p-2 border border-white/30 hover:bg-white/10 transition-colors"
          aria-label="Kembali"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>

        <h1 className="text-sm sm:text-base font-bold text-white tracking-tight truncate max-w-[220px] sm:max-w-[280px]">
          {title}
        </h1>

        <button
          onClick={onOpenShare}
          className="flex items-center justify-center p-2 border border-white/30 hover:bg-white/10 transition-colors"
          aria-label="Bagikan"
        >
          <Share2 className="w-5 h-5 text-white" />
        </button>
      </div>
    </header>
  );
}

// ===================================================================
// 2. IN-LINE WIDGET KALKULATOR ZAKAT
// ===================================================================
function EmbeddedZakatCalculator({ onApplyAmount }: { onApplyAmount: (val: string) => void }) {
  const [activeTab, setActiveTab] = useState<'penghasilan' | 'maal' | 'emas'>('penghasilan');
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');

  const HARGA_EMAS = 1400000; 
  const NISHAB_TAHUNAN = 85 * HARGA_EMAS;
  const NISHAB_BULANAN = Math.round(NISHAB_TAHUNAN / 12);

  const formatRupiah = (val: string) => {
    const raw = val.replace(/[^0-9]/g, '');
    return raw ? Number(raw).toLocaleString('id-ID') : '';
  };
  const getNum = (val: string) => Number(val.replace(/\./g, '')) || 0;

  let totalZakat = 0;
  let isWajib = false;

  if (activeTab === 'penghasilan') {
    const total = getNum(input1) + getNum(input2);
    isWajib = total >= NISHAB_BULANAN;
    totalZakat = isWajib ? Math.round(total * 0.025) : 0;
  } else if (activeTab === 'maal') {
    const total = getNum(input1) + getNum(input2);
    isWajib = total >= NISHAB_TAHUNAN;
    totalZakat = isWajib ? Math.round(total * 0.025) : 0;
  } else if (activeTab === 'emas') {
    const berat = Number(input1) || 0;
    isWajib = berat >= 85;
    totalZakat = isWajib ? Math.round((berat * HARGA_EMAS) * 0.025) : 0;
  }

  return (
    <div className="border border-gray-200 bg-white overflow-hidden my-4 shadow-sm">
      <div className="flex border-b border-gray-200 text-xs font-bold bg-gray-50">
        <button
          onClick={() => { setActiveTab('penghasilan'); setInput1(''); setInput2(''); }}
          className={`flex-1 py-3 text-center border-b-2 transition ${activeTab === 'penghasilan' ? 'text-[#0d5c91] border-[#0d5c91] bg-white' : 'text-slate-500 border-transparent'}`}
        >
          PENGHASILAN
        </button>
        <button
          onClick={() => { setActiveTab('maal'); setInput1(''); setInput2(''); }}
          className={`flex-1 py-3 text-center border-b-2 transition ${activeTab === 'maal' ? 'text-[#0d5c91] border-[#0d5c91] bg-white' : 'text-slate-500 border-transparent'}`}
        >
          MAAL
        </button>
        <button
          onClick={() => { setActiveTab('emas'); setInput1(''); setInput2(''); }}
          className={`flex-1 py-3 text-center border-b-2 transition ${activeTab === 'emas' ? 'text-[#0d5c91] border-[#0d5c91] bg-white' : 'text-slate-500 border-transparent'}`}
        >
          EMAS
        </button>
      </div>
      <div className="p-4 space-y-4 text-left">
        {activeTab !== 'emas' ? (
          <>
            <div>
              <label className="text-xs sm:text-sm font-medium text-slate-600 block mb-1.5">Pendapatan Utama / Tabungan Per Bulan (Rp)</label>
              <input
                type="text"
                className="w-full border border-gray-300 px-3.5 py-2.5 text-sm sm:text-base font-semibold text-slate-800 focus:outline-[#0d5c91]"
                placeholder="0"
                value={input1}
                onChange={(e) => setInput1(formatRupiah(e.target.value))}
              />
            </div>
            <div>
              <label className="text-xs sm:text-sm font-medium text-slate-600 block mb-1.5">Tunjangan / Bonus / THR (Rp)</label>
              <input
                type="text"
                className="w-full border border-gray-300 px-3.5 py-2.5 text-sm sm:text-base font-semibold text-slate-800 focus:outline-[#0d5c91]"
                placeholder="0"
                value={input2}
                onChange={(e) => setInput2(formatRupiah(e.target.value))}
              />
            </div>
          </>
        ) : (
          <div>
            <label className="text-xs sm:text-sm font-medium text-slate-600 block mb-1.5">Total Berat Emas (Gram)</label>
            <input
              type="number"
              className="w-full border border-gray-300 px-3.5 py-2.5 text-sm sm:text-base font-semibold text-slate-800 focus:outline-[#0d5c91]"
              placeholder="Contoh: 90"
              value={input1}
              onChange={(e) => setInput1(e.target.value)}
            />
          </div>
        )}
        <div className="bg-sky-50/60 border border-sky-100 p-4 text-center space-y-2">
          <span className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wide block">Estimasi Wajib Zakat Anda</span>
          <span className="text-xl sm:text-2xl font-extrabold text-[#0d5c91] block">Rp {totalZakat.toLocaleString('id-ID')}</span>
          <button
            disabled={totalZakat <= 0}
            onClick={() => onApplyAmount(totalZakat.toLocaleString('id-ID'))}
            className="w-full bg-[#0d5c91] hover:bg-sky-900 text-white text-xs sm:text-sm font-bold py-2.5 uppercase tracking-wider disabled:bg-gray-300 transition shadow-sm"
          >
            Masukkan ke Form Nominal 📥
          </button>
        </div>
        <p className="text-[11px] sm:text-xs text-slate-400 text-center">Nilai di atas adalah estimasi. Zakat wajib ditunaikan jika harta mencapai nishab dan haul.</p>
      </div>
    </div>
  );
}

// ===================================================================
// 3. FORM DONASI COMPONENT (Disesuaikan untuk DOKU)
// ===================================================================
interface FormProps {
  donorName: string;
  setDonorName: (v: string) => void;
  donorPhone: string;
  setDonorPhone: (v: string) => void;
  donorEmail: string;
  setDonorEmail: (v: string) => void;
  amount: string;
  handleAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDonate: () => Promise<void>;
  submitting: boolean;
}

const DonationFormFields = ({
  donorName,
  setDonorName,
  donorPhone,
  setDonorPhone,
  donorEmail,
  setDonorEmail,
  amount,
  handleAmountChange,
  handleDonate,
  submitting,
}: FormProps) => (
  <div className="space-y-4 text-left">
    <div>
      <label className="text-xs sm:text-sm font-semibold text-slate-700 block mb-1.5">Nama Donatur</label>
      <input
        type="text"
        placeholder="Hamba Allah (Boleh Kosong)"
        className="w-full border border-gray-300 px-3.5 py-2.5 text-sm sm:text-base text-slate-800 focus:outline-[#0d5c91] font-medium"
        value={donorName}
        onChange={(e) => setDonorName(e.target.value)}
      />
    </div>
    <div>
      <label className="text-xs sm:text-sm font-semibold text-slate-700 block mb-1.5">Nomor WhatsApp</label>
      <input
        type="tel"
        placeholder="Contoh: 081234567890"
        className="w-full border border-gray-300 px-3.5 py-2.5 text-sm sm:text-base text-slate-800 focus:outline-[#0d5c91] font-medium"
        value={donorPhone}
        onChange={(e) => setDonorPhone(e.target.value)}
      />
    </div>
    <div>
      <label className="text-xs sm:text-sm font-semibold text-slate-700 block mb-1.5">Email (Opsional)</label>
      <input
        type="email"
        placeholder="email@domain.com"
        className="w-full border border-gray-300 px-3.5 py-2.5 text-sm sm:text-base text-slate-800 focus:outline-[#0d5c91] font-medium"
        value={donorEmail}
        onChange={(e) => setDonorEmail(e.target.value)}
      />
    </div>
    <div>
      <label className="text-xs sm:text-sm font-semibold text-slate-700 block mb-1.5">Nominal Infak / Zakat (Rp)</label>
      <div className="relative flex items-center">
        <span className="absolute left-3.5 text-sm sm:text-base font-bold text-slate-500">Rp</span>
        <input
          type="text"
          placeholder="Minimal 1.000"
          className="w-full border border-gray-300 pl-10 pr-3.5 py-2.5 text-sm sm:text-base font-bold text-slate-900 focus:outline-[#0d5c91]"
          value={amount}
          onChange={handleAmountChange}
        />
      </div>
      <p className="text-xs text-slate-400 mt-1">Metode pembayaran akan dipilih di halaman resmi DOKU.</p>
    </div>
    <button
      onClick={handleDonate}
      disabled={submitting}
      className="w-full bg-[#ff2e3b] hover:bg-red-600 active:scale-[0.99] text-white font-bold py-3.5 transition text-sm sm:text-base uppercase tracking-wider disabled:bg-gray-300 shadow-md flex items-center justify-center gap-2"
    >
      {submitting ? 'Memproses...' : 'Lanjut ke Pembayaran 🚀'}
    </button>
  </div>
);

// ===================================================================
// 4. MAIN DETAIL CLIENT COMPONENT (MOBILE-FIRST)
// ===================================================================
export default function CampaignDetailClient({ slug, referral }: { slug: string; referral: string | null }) {
  const [program, setProgram] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorPhone, setDonorPhone] = useState(''); 
  const [donorEmail, setDonorEmail] = useState(''); 
  const [submitting, setSubmitting] = useState(false);
  
  const [isMobileFormOpen, setIsMobileFormOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'cerita' | 'donatur' | 'laporan'>('cerita');

  useEffect(() => {
    // 🚀 Menggunakan timestamp (?t=...) dan cache: 'no-store' agar tidak ada data cache yang tertinggal
    fetch(`/api/programs?t=${Date.now()}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          const found = json.data.find((p: any) => p.slug === slug);
          setProgram(found);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Fetch detail campaign error:', err);
        setLoading(false);
      });
  }, [slug]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    setAmount(rawValue ? Number(rawValue).toLocaleString('id-ID') : '');
  };

  const handleDonate = async () => {
    const cleanAmount = Number(String(amount || '').replace(/[^0-9]/g, ''));

    if (!cleanAmount || isNaN(cleanAmount) || cleanAmount < 1000) {
      alert('Masukkan nominal minimal Rp 1.000!');
      return;
    }

    const resolvedProgramId = program?._id || program?.id;

    if (!resolvedProgramId) {
      alert('ID Program tidak ditemukan. Silakan refresh halaman.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/donate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          programId: resolvedProgramId,
          programTitle: program?.title || 'Sedekah Umum',
          slug: program?.slug,
          amount: cleanAmount,
          donorName: donorName.trim() || 'Hamba Allah',
          phone: donorPhone.trim(),
          email: donorEmail.trim(),
          fundraiserPhone: referral,
        }),
      });

      const json = await res.json();
      if (json.success && json.paymentUrl) {
        window.location.href = json.paymentUrl;
      } else {
        alert(json.message || 'Gagal memproses tautan pembayaran.');
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi saat menghubungi server pembayaran.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <DetailHeader title="Program Donasi" onOpenShare={() => setIsShareModalOpen(true)} />
      <div className="text-center py-20 text-slate-500 font-medium text-sm sm:text-base">Memuat detail program...</div>
    </div>
  );

  if (!program) return (
    <div className="min-h-screen bg-gray-50">
      <DetailHeader title="Program Donasi" onOpenShare={() => setIsShareModalOpen(true)} />
      <div className="text-center py-20 text-red-500 font-medium text-sm sm:text-base">Program tidak ditemukan.</div>
    </div>
  );

  const rawTarget = program.targetAmount || 50000000;
  const currentCollected = Number(program.collectedAmount || 0);
  const percentage = Math.min(Math.round((currentCollected / rawTarget) * 100), 100);
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* 🚀 1. HEADER DETAIL PROGRAM */}
      <DetailHeader title="Program Donasi" onOpenShare={() => setIsShareModalOpen(true)} />

      {/* 🚀 2. KONTEN CONTAINER MOBILE (max-w-md mx-auto) */}
      <div className="w-full max-w-md mx-auto px-3 pt-4 space-y-4">
        
        {/* Card Utama Penggalangan Dana */}
        <div className="bg-white p-4 sm:p-6 shadow-sm border border-gray-200/90 space-y-4">
          
          {/* Banner Gambar */}
          <div className="overflow-hidden bg-gray-100 aspect-[16/10] w-full border border-gray-100 shadow-inner">
            <img src={program.image} alt={program.title} className="w-full h-full object-cover" />
          </div>

          {/* Judul Program */}
          <h1 className="text-base sm:text-xl font-bold text-slate-900 leading-snug tracking-tight">
            {program.title}
          </h1>

          {/* Progres Terkumpul & Target */}
          <div className="space-y-2 pt-1">
            <p className="text-lg sm:text-xl font-extrabold text-[#0d5c91]">
              Rp {currentCollected.toLocaleString('id-ID')}
            </p>
            <div className="flex justify-between items-center text-xs sm:text-sm text-slate-500 font-medium">
              <span>Terkumpul dari <strong className="text-slate-800">Rp {rawTarget.toLocaleString('id-ID')}</strong></span>
              <span>{program.daysLeft ? `${program.daysLeft} hari lagi` : 'Mendesak'}</span>
            </div>

            <div className="w-full bg-gray-100 h-2.5 overflow-hidden shadow-inner">
              <div className="bg-[#ff2e3b] h-full transition-all duration-500" style={{ width: `${percentage}%` }} />
            </div>
          </div>

          {/* Tab Menu Navigasi */}
          <div className="flex border-b border-gray-200 text-xs sm:text-sm font-bold text-slate-500 space-x-6 pt-2">
            <button
              onClick={() => setActiveTab('cerita')}
              className={`pb-2.5 transition focus:outline-none ${activeTab === 'cerita' ? 'text-[#0d5c91] border-b-2 border-[#0d5c91]' : 'border-b-2 border-transparent'}`}
            >
              Cerita
            </button>
            <button
              onClick={() => setActiveTab('donatur')}
              className={`pb-2.5 transition focus:outline-none ${activeTab === 'donatur' ? 'text-[#0d5c91] border-b-2 border-[#0d5c91]' : 'border-b-2 border-transparent'}`}
            >
              Donatur ({(program.donors || []).length})
            </button>
            <button
              onClick={() => setActiveTab('laporan')}
              className={`pb-2.5 transition focus:outline-none ${activeTab === 'laporan' ? 'text-[#0d5c91] border-b-2 border-[#0d5c91]' : 'border-b-2 border-transparent'}`}
            >
              Laporan ({(program.reports || []).length})
            </button>
          </div>

          {/* Isi Konten Sesuai Tab */}
          <div className="py-2 text-left">
            {activeTab === 'cerita' && (
              <div className="space-y-4">
                {program.category?.toUpperCase() === 'ZAKAT' && (
                  <EmbeddedZakatCalculator onApplyAmount={(val) => setAmount(val)} />
                )}

                <div className="text-slate-800 text-base sm:text-lg leading-relaxed space-y-4 font-normal">
                  {program.description ? (
                    typeof program.description === 'string' ? (
                      <p>{program.description}</p>
                    ) : (
                      <PortableText value={program.description} />
                    )
                  ) : (
                    <p className="text-slate-400 italic">Belum ada cerita detail.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'donatur' && (
              <div className="space-y-3 py-1">
                {(program.donors || []).length > 0 ? (
                  [...program.donors].reverse().map((donor: any, idx: number) => (
                    <div key={idx} className="bg-gray-50 border border-gray-200/80 p-3.5 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-sky-100 text-[#0d5c91] flex items-center justify-center font-bold text-base shadow-inner">
                          {(donor.name || 'H').toUpperCase().slice(0, 1)}
                        </div>
                        <div>
                          <p className="text-sm sm:text-base font-bold text-slate-800">{donor.name || 'Hamba Allah'}</p>
                          <p className="text-xs text-slate-400 font-normal">{donor.date || 'Baru Saja'}</p>
                        </div>
                      </div>
                      <p className="text-sm sm:text-base font-bold text-[#0d5c91]">{`+Rp ${Number(donor.amount || 0).toLocaleString('id-ID')}`}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-8 text-sm sm:text-base text-slate-400">Belum ada donatur.</p>
                )}
              </div>
            )}

            {activeTab === 'laporan' && (
              <div className="space-y-4 py-1">
                {(program.reports || []).length > 0 ? (
                  [...program.reports].reverse().map((report: any, idx: number) => (
                    <div key={idx} className="bg-gray-50 border border-gray-200/80 p-4 space-y-2.5">
                      <div className="flex items-center justify-between border-b border-gray-200 pb-2.5">
                        <h4 className="text-sm sm:text-base font-bold text-slate-800">{report.title || 'Laporan Penyaluran'}</h4>
                        <span className="text-xs text-slate-400 font-medium">{report.date}</span>
                      </div>
                      <div className="text-sm sm:text-base text-slate-800 leading-relaxed">
                        {typeof report.content === 'string' ? <p>{report.content}</p> : <PortableText value={report.content} />}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-8 text-sm sm:text-base text-slate-400">Belum ada pembaruan laporan.</p>
                )}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* 🚀 3. STICKY BOTTOM BAR FLOATING AKSI */}
      <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none flex justify-center pb-3">
        <div className="w-[calc(100%-1.5rem)] max-w-md bg-white border border-gray-200 p-3.5 shadow-xl pointer-events-auto">
          <button 
            onClick={() => setIsMobileFormOpen(true)} 
            className="w-full bg-[#ff2e3b] hover:bg-red-600 active:scale-[0.99] text-white text-sm sm:text-base font-extrabold py-3.5 shadow-md transition-all uppercase tracking-wide"
          >
            Donasi Sekarang 🚀
          </button>
        </div>
      </div>

      {/* 🚀 4. POPUP FORM DONASI MOBILE */}
      {isMobileFormOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3">
          <div className="absolute inset-0" onClick={() => setIsMobileFormOpen(false)} />
          <div className="relative w-full max-w-md bg-white p-5 space-y-4 max-h-[85vh] overflow-y-auto z-10 shadow-2xl border border-gray-200">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 uppercase tracking-wide">Form Infak / Zakat</h3>
              <button 
                onClick={() => setIsMobileFormOpen(false)} 
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>
            <DonationFormFields 
              donorName={donorName} setDonorName={setDonorName}
              donorPhone={donorPhone} setDonorPhone={setDonorPhone}
              donorEmail={donorEmail} setDonorEmail={setDonorEmail}
              amount={amount} handleAmountChange={handleAmountChange}
              handleDonate={handleDonate} submitting={submitting}
            />
          </div>
        </div>
      )}

      {/* 🚀 5. CUSTOM SHARE MODAL MOBILE-FIRST */}
      {isShareModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3">
          <div className="absolute inset-0" onClick={() => setIsShareModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white p-5 space-y-4 z-10 shadow-2xl border border-gray-200 text-left">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 uppercase tracking-wide">Bagikan Program Kebaikan</h3>
              <button 
                onClick={() => setIsShareModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Input URL & Button Copy */}
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-semibold text-slate-600 block">Tautan Program</label>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={shareUrl} 
                  className="flex-1 bg-gray-50 border border-gray-300 px-3.5 py-2.5 text-xs sm:text-sm font-mono text-slate-700 truncate focus:outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="bg-[#0d5c91] text-white px-4 py-2.5 text-xs sm:text-sm font-bold shrink-0 flex items-center gap-1.5 hover:bg-sky-900 transition shadow-sm"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Tersalin' : 'Salin'}</span>
                </button>
              </div>
            </div>

            {/* Opsi Media Sosial */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Ayo bantu program kebaikan ini: ${program?.title || ''}\n${shareUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-1.5 hover:bg-emerald-100 transition shadow-2xs"
              >
                <MessageCircle className="w-6 h-6 text-emerald-600" />
                <span className="text-xs sm:text-sm font-bold">WhatsApp</span>
              </a>

              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3.5 bg-blue-50 border border-blue-200 text-blue-800 space-y-1.5 hover:bg-blue-100 transition shadow-2xs"
              >
                <svg className="w-6 h-6 fill-current text-blue-600" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="text-xs sm:text-sm font-bold">Facebook</span>
              </a>

              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(program?.title || '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3.5 bg-gray-100 border border-gray-200 text-slate-800 space-y-1.5 hover:bg-gray-200 transition shadow-2xs"
              >
                <svg className="w-5 h-5 fill-current text-slate-900 mt-0.5" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span className="text-xs sm:text-sm font-bold mt-0.5">Twitter/X</span>
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}