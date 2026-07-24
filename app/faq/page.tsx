// app/faq/page.tsx
import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';

// 🚀 MASTER SEO METADATA
export const metadata: Metadata = {
  title: 'FAQ / Pertanyaan Umum | islami.or.id',
  description: 'Temukan jawaban atas pertanyaan seputar cara berdonasi, pembayaran QRIS, penyaluran zakat, infak, dan sedekah online di islami.or.id.',
  keywords: ['faq islami.or.id', 'cara sedekah online', 'pertanyaan seputar zakat', 'bantuan donasi'],
  alternates: {
    canonical: '/faq',
  },
};

interface FaqItem {
  question: string;
  answer: string;
}

const faqList: FaqItem[] = [
  {
    question: 'Bagaimana cara melakukan donasi atau sedekah di islami.or.id?',
    answer: 'Anda cukup memilih program kebaikan atau campaign yang ingin didukung, tentukan nominal donasi, isi data diri (atau pilih opsi Hamba Allah), lalu ikuti instruksi pembayaran instan melalui QRIS atau Virtual Account yang tersedia.',
  },
  {
    question: 'Apakah transaksi donasi di islami.or.id aman dan terpercaya?',
    answer: 'Ya, seluruh transaksi dikelola secara transparan dan amanah menggunakan sistem pembayaran terstandarisasi serta terhubung langsung dengan pencatatan program sosial kemanusiaan.',
  },
  {
    question: 'Metode pembayaran apa saja yang didukung?',
    answer: 'Kami mendukung berbagai metode pembayaran instan seperti QRIS (bisa scan pakai GoPay, OVO, Dana, ShopeePay, m-Banking), serta transfer Virtual Account dari berbagai bank nasional.',
  },
  {
    question: 'Bagaimana cara mengonfirmasi donasi jika terjadi kendala?',
    answer: 'Jika Anda mengalami kendala teknis atau memiliki pertanyaan seputar konfirmasi donasi, Anda dapat langsung menghubungi tim layanan kami melalui halaman Kontak atau via WhatsApp resmi di nomor +62 812-2514-7373.',
  },
  {
    question: 'Apakah dana donasi langsung disalurkan kepada yang berhak?',
    answer: 'Tentu. Dana yang terkumpul dari setiap campaign akan dihimpun dan disalurkan secara berkala kepada para penerima manfaat yang berhak (fakir, miskin, yatim, dhuafa, serta program sosial keagamaan lainnya).',
  },
];

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-white pb-20">
      
      {/* 1. SECTION BANNER */}
      <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 text-white py-14 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-2xl mx-auto space-y-3 relative z-10">
          <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black px-3 py-1 uppercase tracking-widest border border-emerald-500/30">
            Pusat Bantuan
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Pertanyaan yang Sering Diajukan
          </h1>
          <p className="text-xs md:text-sm text-emerald-100/70 max-w-xl mx-auto font-medium leading-relaxed">
            Temukan jawaban lengkap seputar prosedur donasi, transparansi penyaluran, dan layanan platform islami.or.id di sini.
          </p>
        </div>
      </div>

      {/* 2. DAFTAR FAQ ACCORDION / LIST */}
      <div className="max-w-3xl mx-auto py-12 px-4 space-y-6">
        {faqList.map((item, index) => (
          <div 
            key={index} 
            className="border border-gray-100 bg-gray-50/50 p-6 rounded-xl shadow-xs space-y-2 hover:border-emerald-200 transition"
          >
            <h2 className="text-sm md:text-base font-black text-gray-900 flex items-start gap-3">
              <span className="text-emerald-600 font-extrabold">Q{index + 1}.</span>
              {item.question}
            </h2>
            <p className="text-xs md:text-sm text-gray-600 leading-relaxed pl-7">
              {item.answer}
            </p>
          </div>
        ))}
      </div>

      {/* 3. CALL TO ACTION BANTUAN LANJUTAN */}
      <div className="max-w-3xl mx-auto px-4 text-center pt-4">
        <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-2xl space-y-3">
          <h3 className="text-sm font-black text-emerald-900 uppercase tracking-wide">
            Masih memiliki pertanyaan lain?
          </h3>
          <p className="text-xs text-emerald-800/80 max-w-md mx-auto">
            Tim layanan donatur kami siap membantu Anda memberikan informasi secara cepat dan ramah.
          </p>
          <div className="pt-2">
            <Link
              href="/kontak"
              className="inline-block bg-[#0d5c91] hover:bg-sky-900 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition shadow-md"
            >
              Hubungi Kami 💬
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}