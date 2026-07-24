// app/kontak/page.tsx
import React from 'react';
import type { Metadata } from 'next';

// 🚀 MASTER SEO METADATA
export const metadata: Metadata = {
  title: 'Hubungi Kami | Layanan Donatur islami.or.id',
  description: 'Memiliki pertanyaan mengenai program infak, sedekah subuh, atau cara pembayaran QRIS? Hubungi tim admin resmi islami.or.id sekarang.',
  keywords: ['kontak islami.or.id', 'nomor whatsapp islami', 'alamat islami.or.id', 'layanan donatur'],
  alternates: {
    canonical: '/kontak',
  },
};

export default function KontakPage() {
  // Nomor WA resmi tanpa spasi/minus untuk integrasi API chat langsung
  const officialWa = '6281225147373';
  const defaultText = encodeURIComponent('Assalamualaikum Admin islami.or.id, saya ingin bertanya mengenai...');
  const waChatUrl = `https://api.whatsapp.com/send?phone=${officialWa}&text=${defaultText}`;

  return (
    <div className="min-h-screen bg-white">
      
      {/* 1. SECTION BANNER */}
      <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 text-white py-14 px-4 text-center rounded-none relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-2xl mx-auto space-y-3 relative z-10">
          <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black px-3 py-1 rounded-none uppercase tracking-widest border border-emerald-500/30">
            Layanan Pusat Informasi
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Hubungi Tim Kantor Kami
          </h1>
          <p className="text-xs md:text-sm text-emerald-100/70 max-w-xl mx-auto font-medium leading-relaxed">
            Pintu komunikasi kami selalu terbuka lebar. Jangan ragu untuk mendiskusikan kebutuhan konsultasi zakat maal maupun kerja sama program kebaikan bersama kami.
          </p>
        </div>
      </div>

      {/* 2. AREA KARTU INFORMASI UTAMA */}
      <div className="max-w-4xl mx-auto py-12 px-4 md:px-16 grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        
        {/* KARTU KIRI: DETAIL KONTAK FISIK */}
        <div className="border border-gray-100 bg-gray-50/50 p-6 flex flex-col justify-between space-y-6 rounded-none shadow-sm">
          <div className="space-y-4">
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-2 w-full">
              Saluran Informasi Resmi
            </h2>
            
            <div className="space-y-4 pt-2">
              <div className="flex items-start space-x-3.5">
                <span className="text-xl shrink-0">📍</span>
                <div>
                  <h4 className="text-xs font-black text-gray-800 uppercase tracking-wide">Alamat Pusat</h4>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    Kantor Pelayanan islami.or.id <br />
                    Indonesia
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5">
                <span className="text-xl shrink-0">✉️</span>
                <div>
                  <h4 className="text-xs font-black text-gray-800 uppercase tracking-wide">Email Korespondensi</h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    support@islami.or.id
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5">
                <span className="text-xl shrink-0">⏰</span>
                <div>
                  <h4 className="text-xs font-black text-gray-800 uppercase tracking-wide">Waktu Operasional</h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Senin – Sabtu | 08.00 - 16.00 WIB
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <p className="text-[10px] text-gray-400 font-medium italic">
              *Konfirmasi data donasi manual/kendala sistem QRIS akan diproses secara instan pada jam operasional kerja.
            </p>
          </div>
        </div>

        {/* KARTU KANAN: CHAT ACTION BOX */}
        <div className="border border-emerald-100 bg-emerald-50/30 p-6 flex flex-col justify-between space-y-6 rounded-none shadow-sm text-left">
          <div className="space-y-4">
            <h2 className="text-sm font-black text-emerald-900 uppercase tracking-wider border-b border-emerald-200 pb-2 w-full">
              Konsultasi Instan WhatsApp
            </h2>
            <p className="text-xs text-emerald-800/80 leading-relaxed font-medium">
              Lebih menyukai obrolan cepat melalui aplikasi ponsel? Hubungi nomor WhatsApp resmi penanganan layanan donatur kami untuk mendapatkan panduan cepat dari tim Customer Support islami.or.id.
            </p>
            
            <div className="bg-white/80 border border-emerald-100 p-4 rounded-none">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Hotline Care</span>
              <span className="text-base font-black text-gray-700 tracking-wide block mt-0.5">+62 812-2514-7373</span>
            </div>
          </div>

          <div>
            <a
              href={waChatUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-full text-center bg-[#25D366] hover:bg-[#20ba56] text-white font-black text-xs uppercase tracking-widest py-3.5 rounded-none transition shadow-md shadow-emerald-100/50"
            >
              Mulai Chat Sekarang 💬
            </a>
          </div>
        </div>

      </div>

     {/* 3. GOOGLE MAPS EMBED SECTION */}
<div className="w-full bg-gray-100 h-64 border-t border-gray-200 rounded-none overflow-hidden">
  <iframe
    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3958.764011972125!2d108.80878867454426!3d-7.153261370176541!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e6f9d8bcc713919%3A0x7304909c6d3d6f48!2sPondok%20Pesantren%20Khoiro%20Ummah!5e0!3m2!1sid!2sid!4v1783431371414!5m2!1sid!2sid"
    className="w-full h-full border-0 rounded-none"
    allowFullScreen={true}
    loading="lazy"
    referrerPolicy="no-referrer-when-downgrade"
  ></iframe>
</div>

    </div>
  );
}